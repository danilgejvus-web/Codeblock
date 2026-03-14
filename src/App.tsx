import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import type { Block, SubGraph } from './blocks/BlockMetadata';
import type { Connection } from './blocks/ExecutableBlock';
import { blockRegistry } from './blocks/blockRegistry';
import { execute } from './interpreter';
import { StringConstantBlock } from './blocks/variable/StringConstantBlock';
import { NumberConstantBlock } from './blocks/variable/NumberConstantBlock';
import { validateProgram, type ValidationResult } from './Validation';
import { NumDeclarationBlock } from './blocks/variable/NumDeclarationBlock';
import { BooleanConstantBlock } from './blocks/variable/BooleanConstantBlock';
import { EditDialog } from './components/EditDialog';
import { ExpressionBlock } from './blocks/arithmetic/ExpressionBlock';
import { BoolDeclarationBlock } from './blocks/variable/BoolDeclarationBlock';
import { StringDeclarationBlock } from './blocks/variable/StringDeclarationBlock';
import { NumArrayBlock } from './blocks/variable/NumArrayBlock';
import { ReadArrayBlock } from './blocks/variable/ReadArrayBlock';
import { WriteArrayBlock } from './blocks/variable/WriteArrayBlock';
import { LocalExecutionContext } from './storages/LocalExecutionContext';
import { WhileBlock } from './blocks/logic/WhileBlock';
import { ForBlock } from './blocks/logic/ForBlock';
import { FunctionBlock } from './blocks/function/FunctionBlock';
import { SelfBlock } from './blocks/function/SelfBlock';
import { CallBlock } from './blocks/function/CallBlock';
import { StringCastBlock } from './blocks/typecasting/StringCastBlock';
import { NumCastBlock } from './blocks/typecasting/NumCastBlock';
import { BooleanCastBlock } from './blocks/typecasting/BooleanCastBlock';
import { ArrayCastBlock } from './blocks/typecasting/ArrayCastBlock';
import { ForEachBlock } from './blocks/logic/ForEachBlock';

//TO DO
// *добавить логику Read в инпуты, которым нужно значение. То есть они будут принимать либо константу, либо название переменной и брать по нему значение
// *можно ещё блок вывода сделать, чтобы потом не весь результат выводить
// -баг у текста output в блоке NumConstant: маленький текст
// сделать канву подвижной
// *сделать надписи у призраков по центру
// *оверлей вокруг диалога
// *для ...declaration создать отдельный интерфейс вместо any в Validator
// ещё нам нужно более тщательно отслеживать невыполнимые операции, я так понимаю?

// Дебаггер это реализация задержек между выполнением блоков, системы шагов
//и вывода всего контекста последнего выполненного блока
// Сделай визуал для While и массивов
// добавить в expression логические выражения
// адаптивность при >= 450px
// Использовать псевдоэлементы и псевдоселекторы (если ещё не было) просто чтобы были
// Добавить задержку на исполнение блоков
// Итерировать массивы и объекты отдельным for
// приведение типов
// нужно будет в валидаторе проверять, что While содержит в себе ввод, вывод и continue,
//а ещё как-то подтянуть проверку на глубину цикла
// рефактор апп
// передвижение канвы

interface Point {
    x: number;
    y: number;
}

interface SocketPoint {
    blockId: string;
    socketId: string;
    type: 'input' | 'output';
    name?: string;
    position: Point;
}

function App() {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [draggedBlock, setDraggedBlock] = useState<{ type: string; name: string; blockType: string; instance?: any, subGraph?: SubGraph} | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [draggingConnection, setDraggingConnection] = useState<{ fromBlockId: string; fromSocketId: string; fromPoint: Point; } | null>(null);
    const [executionResult, setExecutionResult] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [searchType, setSearchType] = useState('');
    const [searchName, setSearchName] = useState('');
    const [hoveredSocket, setHoveredSocket] = useState<SocketPoint | null>(null);
    const [variables, setVariables] = useState<Record<string, any>>({});
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationResult>({ errors: [], warnings: [] });
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<Point | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<Point | null>(null);
    const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());
    const [editingSubGraph, setEditingSubGraph] = useState<{rootID: string, blocks: Block[], connections: Connection[], in: Map<string, string>, out: Map<string, string>} | null>(null);
    const [mappingTarget, setMappingTarget] = useState<'in' | 'out' | 'continue' | null>(null);

    const blockTypes = [
        { id: 'Array', name: 'Array' },
        { id: 'Arithmetic', name: 'Arithmetic' },
        { id: 'Constant', name: 'Constant' },
        { id: 'Variable', name: 'Variable' },
        { id: 'Logic', name: 'Logic' },
        { id: 'Loop', name: 'Loop' },
        { id: 'Function', name: 'Function' },
        { id: 'Cast', name: 'Cast' },
    ];

    const compositeTypes = [
        'While',
        'For',
        'ForEach',
        'Function',
    ];

    const blockNames = Object.entries(blockRegistry).map(([id, info]) => ({
        id: id,
        name: info.name,
        typeId: getBlockType(info.name),
        sockets: info.sockets
    }));

    function getBlockType(blockName: string): string {
        if (['NumArray', 'ReadArray', 'WriteArray'].includes(blockName)) return 'Array';
        if (['Sum', 'Sub', 'Mul', 'Div', 'Mod', 'Expression'].includes(blockName)) return 'Arithmetic';
        if (['String', 'Number', 'Boolean'].includes(blockName)) return 'Constant';
        if (['NumVar', 'StringVar', 'BoolVar', 'Read', 'Write', 'NumDecl',
            'BoolDecl', 'StringDecl'].includes(blockName)) return 'Variable';
        if (['If', 'EndIf', 'Not', 'Or', 'And', 'Greater', 'GreaterEqual',
            'Less', 'LessEqual', 'Equal', 'NotEqual'].includes(blockName)) return 'Logic';
        if (['While', 'For', 'ForEach'].includes(blockName)) return 'Loop';
        if (['Function', 'Self', 'Call'].includes(blockName)) return 'Function';
        if (['StringCast', 'NumCast', 'BooleanCast', 'ArrayCast'].includes(blockName)) return 'Cast';
        return 'Variable';
    }

    const filteredBlockNames = blockNames
        .filter(block => !selectedType || block.typeId === selectedType)
        .filter(block => block.name.toLowerCase().includes(searchName.toLowerCase()));

    const getBlockSockets = (block: Block): SocketPoint[] => {
        const blockInfo = blockRegistry[block.type as keyof typeof blockRegistry];
        if (!blockInfo) return [];

        let sockets = blockInfo.sockets;

        if (block.type === 'DeclarationNum' || block.type === 'BoolDeclaration' || block.type === 'StringDeclaration') {

            let instance;
            if (block.type === 'DeclarationNum') {
                instance = block.instance as NumDeclarationBlock;
            } else if (block.type === 'BoolDeclaration') {
                instance = block.instance as BoolDeclarationBlock;
            } else {
                instance = block.instance as StringDeclarationBlock;
            }

            const names = instance?.getNames() || [];

            if (names.length === 0) {
                return [];
            }
            
            sockets = Array.from({ length: names.length }, (_, i) => ({
                id: `out${i + 1}`,
                type: "output" as const,
                name: names[i] || `var${i + 1}`
            }));

            return sockets.map(socket => ({
                blockId: block.id,
                socketId: socket.id,
                type: socket.type,
                name: socket.name || socket.id,
                position: {
                    x: block.x + 120,
                    y: block.y + 20 + (sockets.filter(s => s.type === socket.type).indexOf(socket) * 20)
                }
            }));
        }

        return blockInfo.sockets.map(socket => ({
            blockId: block.id,
            socketId: socket.id,
            type: socket.type,
            name: socket.name || socket.id,
            position: {
                x: block.x + (socket.type === 'input' ? 0 : 120),
                y: block.y + 20 + (blockInfo.sockets.filter(s => s.type === socket.type).indexOf(socket) * 20)
            }
        }));
    };

    const findSocketAtPosition = (x: number, y: number): SocketPoint | null => {
        const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
        for (const block of currentBlocks) {
            const sockets = getBlockSockets(block);
            for (const socket of sockets) {
                const distance = Math.sqrt(Math.pow(x - socket.position.x, 2) + Math.pow(y - socket.position.y, 2));
                if (distance < 10) {
                    return socket;
                }
            }
        }
        return null;
    };

    const findBlockAtPosition = (x: number, y: number): Block | null => {
        const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
        for (const block of currentBlocks) {
            if (x >= block.x && x <= block.x + 120 && y >= block.y && y <= block.y + 60) {
                return block;
            }
        }
        return null;
    };

    const validateCurrentProgram = useCallback(() => {
        const result = validateProgram(blocks, connections, variables);
        setValidationErrors(result);
    }, [blocks, connections, variables]);

    useEffect(() => {
        validateCurrentProgram();
    }, [blocks, connections, variables, validateCurrentProgram]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setMousePos({ x, y });
            const socket = findSocketAtPosition(x, y);
            setHoveredSocket(socket);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [blocks, editingSubGraph]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              setDraggedBlock(null);
              setDraggingConnection(null);
              setDraggedBlockId(null);
              setSelectedBlockIds(new Set());
              setIsSelecting(false);
            }

            if (e.key === 'Delete' && selectedBlockIds.size > 0) {
                const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
                const currentConnections = editingSubGraph ? editingSubGraph.connections : connections;
                
               const newConnections = currentConnections.filter(conn => 
                !selectedBlockIds.has(conn.fromBlockID) && 
                !selectedBlockIds.has(conn.toBlockID)
                );
                const newBlocks = currentBlocks.filter(b => !selectedBlockIds.has(b.id));
              
                if (editingSubGraph) {
                    setEditingSubGraph({
                        ...editingSubGraph,
                        blocks: newBlocks,
                        connections: newConnections
                    });
                } else {
                    setConnections(newConnections);
                    setBlocks(newBlocks);
                }
                setSelectedBlockIds(new Set())
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedBlockIds]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }

        const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
        const currentConnections = editingSubGraph ? editingSubGraph.connections : connections;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.5;
            const gridSize = 20;

            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            ctx.lineWidth = 2;
            currentConnections.forEach(conn => {
                const fromBlock = currentBlocks.find(b => b.id === conn.fromBlockID);
                const toBlock = currentBlocks.find(b => b.id === conn.toBlockID);

                if (!fromBlock || !toBlock) return;

                const fromSockets = getBlockSockets(fromBlock);
                const toSockets = getBlockSockets(toBlock);

                const fromSocket = fromSockets.find(s => s.socketId === conn.fromSocketID);
                const toSocket = toSockets.find(s => s.socketId === conn.toSocketID);

                if (!fromSocket || !toSocket) return;

                ctx.beginPath();
                ctx.strokeStyle = '#D6413E';
                ctx.moveTo(fromSocket.position.x, fromSocket.position.y);
                ctx.lineTo(toSocket.position.x, toSocket.position.y);
                ctx.stroke();
            });

            if (draggingConnection) {
                ctx.beginPath();
                ctx.strokeStyle = '#D6413E';
                ctx.setLineDash([5, 5]);
                ctx.moveTo(draggingConnection.fromPoint.x, draggingConnection.fromPoint.y);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            if (isSelecting && selectionStart && selectionEnd) {
                ctx.strokeStyle = '#D6413E';
                ctx.fillStyle = 'rgba(214, 65, 62, 0.1)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                
                const width = selectionEnd.x - selectionStart.x;
                const height = selectionEnd.y - selectionStart.y;
                
                ctx.strokeRect(selectionStart.x, selectionStart.y, width, height);
                ctx.fillRect(selectionStart.x, selectionStart.y, width, height);
                
                ctx.setLineDash([]);
            }
            currentBlocks.forEach(block => {
                if (selectedBlockIds.has(block.id)) {
                    ctx.shadowColor = '#D6413E';
                    ctx.shadowBlur = 15;
                    ctx.shadowOffsetY = 0;
                } else {
                    ctx.shadowColor = 'rgba(214, 65, 62, 0.3)';
                    ctx.shadowBlur = 8;
                    ctx.shadowOffsetY = 2;
                }

                ctx.fillStyle = '#2D2D2D';
                ctx.fillRect(block.x, block.y, 120, 60);

                const blockErrors = validationErrors.errors.filter(e => e.blockId === block.id);
                const blockWarnings = validationErrors.warnings.filter(w => w.blockId === block.id);

                if (blockErrors.length > 0) {
                    ctx.shadowColor = '#FF4444';
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetY = 0;
                } else if (blockWarnings.length > 0) {
                    ctx.shadowColor = '#FFC107';
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetY = 0;
                }

                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
                ctx.strokeStyle = selectedBlockIds.has(block.id) ? '#FFC107' : '#D6413E';;
                ctx.lineWidth = 2;
                ctx.strokeRect(block.x, block.y, 120, 60);

                if (block.type === 'String') {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    ctx.fillStyle = '#D4D4D4';
                    ctx.font = 'bold 14px Helvetica';
                    ctx.fillText('String', block.x + 60, block.y + 15);
                    
                    ctx.font = '12px Helvetica';
                    ctx.fillStyle = '#D6413E';
                    const instance = block.instance as StringConstantBlock;
                    const name = instance ? instance.getName() : 'String';
                    ctx.fillText(`"${name}"`, block.x + 60, block.y + 35);

                    ctx.font = '8px Helvetica';
                    ctx.fillStyle = '#868686';
                    ctx.fillText('double-click to edit', block.x + 60, block.y + 50);

                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                } else if (block.type === 'NumberConstant') {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    ctx.fillStyle = '#D4D4D4';
                    ctx.font = 'bold 14px Helvetica';
                    ctx.fillText('Number', block.x + 60, block.y + 15);
                    
                    ctx.font = '12px Helvetica';
                    ctx.fillStyle = '#D6413E';
                    const numInstance = block.instance as NumberConstantBlock;
                    const value = numInstance ? numInstance.getValue() : 0;
                    ctx.fillText(`${value}`, block.x + 60, block.y + 35);
                    
                    ctx.font = '8px Helvetica';
                    ctx.fillStyle = '#868686';
                    ctx.fillText('double-click to edit', block.x + 60, block.y + 50);
                    
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                } else if (block.type === 'BooleanConstant') {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    ctx.fillStyle = '#D4D4D4';
                    ctx.font = 'bold 14px Helvetica';
                    ctx.fillText('Boolean', block.x + 60, block.y + 15);
                    
                    ctx.font = '12px Helvetica';
                    ctx.fillStyle = '#D6413E';
                    const boolInstance = block.instance as BooleanConstantBlock;
                    const value = boolInstance ? boolInstance.getValue() : false;
                    ctx.fillText(value ? 'true' : 'false', block.x + 60, block.y + 35);
                    
                    ctx.font = '8px Helvetica';
                    ctx.fillStyle = '#868686';
                    ctx.fillText('double-click to edit', block.x + 60, block.y + 50);
                    
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                } else if (block.type === 'DeclarationNum' || block.type === 'BoolDeclaration' || block.type === 'StringDeclaration') {
                    let instance;
                    let blockTitle;
                    let displayColor = '#D6413E';
                    
                    if (block.type === 'DeclarationNum') {
                        instance = block.instance as NumDeclarationBlock;
                        blockTitle = 'Declare Num';
                    } else if (block.type === 'BoolDeclaration') {
                        instance = block.instance as BoolDeclarationBlock;
                        blockTitle = 'Declare Bool';
                        displayColor = '#4CAF50';
                    } else {
                        instance = block.instance as StringDeclarationBlock;
                        blockTitle = 'Declare String';
                        displayColor = '#2196F3';
                    }
                    
                    const names = instance?.getNames() || [];
                    const count = names.length;
                    
                    const blockHeight = count === 0 ? 60 : 60 + (count - 1) * 20;
                    
                    ctx.fillStyle = '#2D2D2D';
                    ctx.fillRect(block.x, block.y, 120, blockHeight);
                    ctx.strokeStyle = selectedBlockIds.has(block.id) ? '#FFC107' : '#D6413E';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(block.x, block.y, 120, blockHeight);
                    
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    ctx.fillStyle = '#D4D4D4';
                    ctx.font = 'bold 14px Helvetica';
                    ctx.fillText(blockTitle, block.x + 60, block.y + 20);
                    
                    if (count > 0) {
                        ctx.font = '10px Helvetica';
                        ctx.fillStyle = displayColor;
                        
                        const displayNames = names.slice(0, 3).join(', ');
                        if (names.length > 3) {
                            ctx.fillText(`${displayNames}...`, block.x + 60, block.y + 40);
                        } else {
                            ctx.fillText(displayNames, block.x + 60, block.y + 40);
                        }
                    }
                    
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                } else if (block.type === 'Expression') {
                    const instance = block.instance as ExpressionBlock;
                    const expr = instance.getExpression ? instance.getExpression() : '';
                    
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    ctx.fillStyle = '#D4D4D4';
                    ctx.font = 'bold 14px Helvetica';
                    ctx.fillText('Expression', block.x + 60, block.y + 15);
                    
                    ctx.font = '10px Helvetica';
                    ctx.fillStyle = '#D6413E';
                    
                    let displayExpr = expr;
                    if (displayExpr.length > 12) {
                        displayExpr = displayExpr.substring(0, 10) + '...';
                    }
                    ctx.fillText(displayExpr || 'x + y', block.x + 60, block.y + 35);
                    
                    ctx.font = '8px Helvetica';
                    ctx.fillStyle = '#868686';
                    ctx.fillText('double-click to edit', block.x + 60, block.y + 50);
                    
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                } else {
                    ctx.fillStyle = '#D4D4D4';
                    ctx.font = '14px Helvetica';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(block.name, block.x + 60, block.y + 30);
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                }

                if (blockErrors.length > 0) {
                    ctx.shadowBlur = 0;
                    ctx.font = '16px Helvetica';
                    ctx.fillStyle = '#FF4444';
                    ctx.fillText('⚠', block.x + 100, block.y + 25);
                } else if (blockWarnings.length > 0) {
                    ctx.shadowBlur = 0;
                    ctx.font = '16px Helvetica';
                    ctx.fillStyle = '#FFC107';
                    ctx.fillText('⚠', block.x + 100, block.y + 25);
                }

                const sockets = getBlockSockets(block);
                sockets.forEach(socket => {
                    ctx.beginPath();

                    if (socket.type === 'input') {
                        const hasConnection = currentConnections.some(conn => 
                            conn.toBlockID === socket.blockId && conn.toSocketID === socket.socketId
                        );
                        
                        if (hasConnection) {
                            ctx.fillStyle = '#4ba14e';
                        } else {
                            ctx.fillStyle = '#8d9c8d';
                        }
                    } else {
                        ctx.fillStyle = '#2587d8';
                    }

                    if (hoveredSocket?.blockId === socket.blockId &&
                        hoveredSocket?.socketId === socket.socketId) {
                        
                        ctx.fillStyle = '#FFC107';
                    }
                    ctx.arc(socket.position.x, socket.position.y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    let displayName = socket.name || '';
                    if (displayName.length > 10) {
                        displayName = displayName.substring(0, 8) + '..';
                    }

                    const textWidth = ctx.measureText(displayName).width;

                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';

                    if (socket.type === 'input') {
                        const textX = socket.position.x - textWidth - 8;
                        ctx.fillText(displayName, textX, socket.position.y + 4);
                    } else {
                        ctx.fillText(displayName, socket.position.x + 8, socket.position.y + 4);
                    }
                });
            });

            if (draggedBlock) {
                ctx.fillStyle = 'rgba(214, 65, 62, 0.3)';
                ctx.fillRect(mousePos.x - 60, mousePos.y - 30, 120, 60);
                ctx.strokeStyle = '#D6413E';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(mousePos.x - 60, mousePos.y - 30, 120, 60);
                ctx.setLineDash([]);

                ctx.fillStyle = '#D4D4D4';
                ctx.font = '14px Helvetica';
                ctx.fillText(draggedBlock.name, mousePos.x - 50, mousePos.y);
            }
        };

        draw();

        const handleResize = () => {
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                draw();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [blocks, draggedBlock, mousePos, connections, draggingConnection, hoveredSocket, selectedBlockIds]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleDoubleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;

            for (const block of currentBlocks) {
                if (x >= block.x && x <= block.x + 120 && y >= block.y && y <= block.y + 60) {

                    setSelectedBlockIds(new Set([block.id]));

                    if (compositeTypes.includes(block.type) && block.subGraph) {
                        setEditingSubGraph({
                            rootID: block.id,
                            blocks: block.subGraph.blocks,
                            connections: block.subGraph.connections,
                            in: new Map(block.subGraph.in),
                            out: new Map(block.subGraph.out)
                        });
                        return;
                    }

                    if (block.type === 'String') {
                        const instance = block.instance as StringConstantBlock;
                        setEditingBlockId(block.id);
                        setEditValue(instance.getName());
                        break;
                    }

                    if (block.type === 'NumberConstant') {
                        const instance = block.instance as NumberConstantBlock;
                        setEditingBlockId(block.id);
                        setEditValue(instance.getValue().toString());
                        break;
                    }

                    if (block.type === 'BooleanConstant') {
                        const instance = block.instance as BooleanConstantBlock;
                        setEditingBlockId(block.id);
                        setEditValue(instance.getValue() ? 'true' : 'false');
                        break;
                    }

                    if (block.type === 'DeclarationNum' || block.type === 'BoolDeclaration' || block.type === 'StringDeclaration') {
                        let instance;

                        if (block.type === 'DeclarationNum') {
                            instance = block.instance as NumDeclarationBlock;
                        } else if (block.type === 'BoolDeclaration') {
                            instance = block.instance as BoolDeclarationBlock;
                        } else {
                            instance = block.instance as StringDeclarationBlock;
                        }

                        setEditingBlockId(block.id);
                        setEditValue(instance.getNamesString());
                        break;
                    }

                    if (block.type === 'Expression') {
                        const instance = block.instance as ExpressionBlock;
                        setEditingBlockId(block.id);
                        setEditValue(instance.getExpression ? instance.getExpression() : '');
                        break;
                    }
                }
            }
        };

        canvas.addEventListener('dblclick', handleDoubleClick);
        return () => canvas.removeEventListener('dblclick', handleDoubleClick);
    }, [blocks, editingSubGraph]);

    const handleBlockClick = (block: typeof blockNames[0]) => {
        const blockInfo = blockRegistry[block.id as keyof typeof blockRegistry];
        const defaultSubGraph = { blocks: [], connections: [], in: new Map(), out: new Map() };

        if (block.id === 'String') {
          const instance = new StringConstantBlock('var');
          setDraggedBlock({
              type: block.typeId,
              name: block.name,
              blockType: block.id,
              instance: instance
          });
        } else if (block.id === 'NumberConstant') {
          console.log('Creating NumberConstantBlock');
          const instance = new NumberConstantBlock(0);
          setDraggedBlock({
              type: block.typeId,
              name: block.name,
              blockType: block.id,
              instance: instance
          });
        } else if (block.id === 'BooleanConstant') {
            console.log('Creating BooleanConstantBlock');
            const instance = new BooleanConstantBlock(false);
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'DeclarationNum') {
            console.log('Creating DeclarationBlock');
            const instance = new NumDeclarationBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'BoolDeclaration') {
            const instance = new BoolDeclarationBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'StringDeclaration') {
            const instance = new StringDeclarationBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'Expression') {
            const instance = new ExpressionBlock('');
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'NumArray') {
            console.log('Creating NumArrayBlock');
            const instance = new NumArrayBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'ReadArray') {
            const instance = new ReadArrayBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'WriteArray') {
            const instance = new WriteArrayBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'While') {
            const instance = new WhileBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
                subGraph: defaultSubGraph
            });
        } else if (block.id === 'For') {
            const instance = new ForBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
                subGraph: defaultSubGraph
            });
        } else if (block.id === 'ForEach') {
            const instance = new ForEachBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
                subGraph: defaultSubGraph
            });
        } else if (block.id === 'Function') {
            const instance = new FunctionBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
                subGraph: defaultSubGraph
            });
        } else if (block.id === 'Self') {
            const instance = new SelfBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
            });
        } else if (block.id === 'Call') {
            const instance = new CallBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
            });
        } else if (block.id === 'StringCast') {
            const instance = new StringCastBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance,
            });
        } else if (block.id === 'NumCast') {
            const instance = new NumCastBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'BooleanCast') {
            const instance = new BooleanCastBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else if (block.id === 'ArrayCast') {
            const instance = new ArrayCastBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        }
        else {
            const instance = new blockInfo.class();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        }
      };

const handleCanvasClick = () => {
        if (!draggedBlock) return;

        const x = Math.round((mousePos.x - 60) / 20) * 20;
        const y = Math.round((mousePos.y - 30) / 20) * 20;

        if (x >= 0 && y >= 0 && x + 120 <= canvasRef.current!.width && y + 60 <= canvasRef.current!.height) {
            const newBlock: Block = {
                id: Date.now().toString(),
                type: draggedBlock.blockType,
                name: draggedBlock.name,
                x,
                y,
                instance: draggedBlock.instance
            };

            const defaultSubGraph = { blocks: [], connections: [], in: new Map(), out: new Map() };

            if (compositeTypes.includes(draggedBlock.blockType)) {
                newBlock.subGraph = defaultSubGraph;
            }

            if (editingSubGraph) {
                setEditingSubGraph({
                    ...editingSubGraph,
                    blocks: [...editingSubGraph.blocks, newBlock]
                });
            } else {
                setBlocks([...blocks, newBlock]);
            }
        }
        setDraggedBlock(null);
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (draggedBlock) return;

        const socket = findSocketAtPosition(mousePos.x, mousePos.y);

        if (socket && socket.type === 'output') {
            if (mappingTarget) return;
            setDraggingConnection({
                fromBlockId: socket.blockId,
                fromSocketId: socket.socketId,
                fromPoint: socket.position
            });
            return;
        }

        if (socket && socket.type === 'input') {
            if (mappingTarget === 'in') {
                setEditingSubGraph(prev => ({
                    ...prev!,
                    in: new Map(prev!.in).set('in', socket!.socketId)
                }));
                setMappingTarget(null);
                return;
            }
        }

        const block = findBlockAtPosition(mousePos.x, mousePos.y);
        if (block) {
            if (mappingTarget === 'out' || mappingTarget === 'continue') {
                setEditingSubGraph(prev => ({
                    ...prev!,
                    out: new Map(prev!.out).set(mappingTarget, block.id)
                }));
                setMappingTarget(null);
                return;
            }
        }

        if (socket && socket.type === 'input') {
            const currentConnections = editingSubGraph ? editingSubGraph.connections : connections;
            const connectionToRemove = currentConnections.find(conn => 
                conn.toBlockID === socket.blockId && conn.toSocketID === socket.socketId
            );

            if (connectionToRemove) {
                console.log('Удаляем соединение:', connectionToRemove);
                if (editingSubGraph) {
                    setEditingSubGraph({
                        ...editingSubGraph,
                        connections: editingSubGraph.connections.filter(c => c.id !== connectionToRemove.id)
                    });
                } else {
                    setConnections(prev => prev.filter(conn => conn.id !== connectionToRemove.id));
                }
            }
            return;
        }

        const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
        let blockFound = false;
        for (const block of currentBlocks) {
          if (mousePos.x >= block.x && mousePos.x <= block.x + 120 &&
              mousePos.y >= block.y && mousePos.y <= block.y + 60) {
                if (e.shiftKey) {
                    setSelectedBlockIds(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(block.id)) {
                            newSet.delete(block.id);
                        } else {
                            newSet.add(block.id);
                        }
                        return newSet;
                    });
                } 
                else {
                    if (!selectedBlockIds.has(block.id)) {
                        setSelectedBlockIds(new Set([block.id]));
                    }
                }
              
              setDragOffset({
                  x: mousePos.x - block.x,
                  y: mousePos.y - block.y
              });
              
              setDraggedBlockId(block.id);;
              blockFound = true;
              break;
          }
        }
        if (!blockFound) {
            if (!e.shiftKey) {
                setSelectedBlockIds(new Set());
            }
            setIsSelecting(true);
            setSelectionStart({ x: mousePos.x, y: mousePos.y });
            setSelectionEnd({ x: mousePos.x, y: mousePos.y });
        }
    };

    const handleCanvasMouseUp = (_: React.MouseEvent) => {
        if (isSelecting && selectionStart && selectionEnd) {
                const rect = {
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    right: Math.max(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    bottom: Math.max(selectionStart.y, selectionEnd.y)
                };
            
            const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
            const blocksInRect = currentBlocks.filter(block => {
                const blockLeft = block.x;
                const blockRight = block.x + 120;
                const blockTop = block.y;
                const blockBottom = block.y + 60;
                
                return !(blockRight < rect.left || 
                    blockLeft > rect.right || 
                    blockBottom < rect.top || 
                    blockTop > rect.bottom);
            });
            
            setSelectedBlockIds(prev => {
                const newSet = new Set(prev);
                blocksInRect.forEach(block => newSet.add(block.id));
                return newSet;
            });
        }
        
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        if (draggingConnection) {
            const targetSocket = hoveredSocket;

            if (targetSocket && targetSocket.type === 'input' &&
                targetSocket.blockId !== draggingConnection.fromBlockId) {

                const newConnection: Connection = {
                    id: `conn_${Date.now()}_${Math.random()}`,
                    fromBlockID: draggingConnection.fromBlockId,
                    fromSocketID: draggingConnection.fromSocketId,
                    toBlockID: targetSocket.blockId,
                    toSocketID: targetSocket.socketId
                };

                const currentConnections = editingSubGraph ? editingSubGraph.connections : connections;

                const filteredConnections = currentConnections.filter(conn => 
                    !(conn.toBlockID === targetSocket.blockId && 
                    conn.toSocketID === targetSocket.socketId)
                );

                console.log('Заменяем соединение на:', newConnection);
                if (editingSubGraph) {
                    setEditingSubGraph({
                        ...editingSubGraph,
                        connections: [...filteredConnections, newConnection]
                    });
                } else {
                    setConnections([...filteredConnections, newConnection]);
                }
            }

            setDraggingConnection(null);
        }

        if (draggedBlockId) {
          setDraggedBlockId(null);
          setDragOffset(null);
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePos({ x, y });

      if (isSelecting && selectionStart) {
        setSelectionEnd({ x, y });
        }
      if (draggedBlockId && dragOffset) {
          let newX = x - dragOffset.x;
          let newY = y - dragOffset.y;
          
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
          
          newX = Math.max(0, Math.min(newX, canvasRef.current.width - 120));
          newY = Math.max(0, Math.min(newY, canvasRef.current.height - 60));

          const currentBlocks = editingSubGraph ? editingSubGraph.blocks : blocks;
          const currentBlock = currentBlocks.find(b => b.id === draggedBlockId);
          if (currentBlock) {
            const dx = newX - currentBlock.x;
            const dy = newY - currentBlock.y;

        const updateBlocks = (prevBlocks: Block[]) =>
            prevBlocks.map(block =>
                selectedBlockIds.has(block.id) || block.id === draggedBlockId
                ? { ...block, x: block.x + dx, y: block.y + dy }
                : block
            );

            if (editingSubGraph) {
                setEditingSubGraph({
                    ...editingSubGraph,
                    blocks: updateBlocks(editingSubGraph.blocks)
                });
            } else {
                setBlocks(updateBlocks);
            }
        }
    }
      
      const socket = findSocketAtPosition(x, y);
      setHoveredSocket(socket);
    };

    const handleRunCode = () => {
        try {
            const blockMap = new Map(blocks.map(b => [b.id, b.instance!]));
            const context = new LocalExecutionContext(blockMap);

            console.log('Запуск интерпретатора...');
            console.log('Блоков:', blocks.length);
            console.log('Соединений:', connections.length);

            const results = execute(blocks, connections, context);

            console.log('Результаты:', results);

            if (results.size === 0) {
                setExecutionResult('Программа выполнена. Нет выходных данных.');
            } else {
                let resultText = 'Результаты:\n\n';
                results.forEach((output, blockId) => {
                    const block = blocks.find(b => b.id === blockId);
                    resultText += `${block?.name}:\n`;
                    resultText += `${JSON.stringify(output, null, 2)}\n`;
                    resultText += '─'.repeat(30) + '\n';
                });
                setExecutionResult(resultText);
            }

        } catch (error) {
            console.error('Ошибка:', error);
            setExecutionResult(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleClearCanvas = () => {
        setBlocks([]);
        setConnections([]);
        setVariables({});
        setExecutionResult('');
        setEditingSubGraph(null);
    };

    const handleReturn = () => {
        if (!editingSubGraph) return;

        setBlocks(prevBlocks => 
            prevBlocks.map(b =>
                b.id === editingSubGraph.rootID
                ? {
                    ...b,
                    subGraph: {
                        blocks: editingSubGraph.blocks,
                        connections: editingSubGraph.connections,
                        in: editingSubGraph.in,
                        out: editingSubGraph.out
                    }
                } : b
            )
        );

        setEditingSubGraph(null);
    };

    return (
        <div id="root">
            <header>
                <div className="contrainerHeader">
                    <h1>CODE BLOCK</h1>
                    <img className="logo" src="/source/logo.svg" alt="logo" />
                </div>
            </header>

            <main>
                <div className="toolbar">
                    <button onClick={handleRunCode} className="run-btn">Запустить</button>
                    <button onClick={handleClearCanvas} className="clear-btn">Очистить</button>
                    { editingSubGraph && (
                        <button onClick={handleReturn} className="back-btn">Назад</button>
                    )}
                    { editingSubGraph && (
                        <div className="mapping-controls">
                            <button
                                onClick={() => setMappingTarget('in')}
                                className={mappingTarget === 'in' ? 'active' : ''}
                            >
                                Set 'in' socket
                            </button>
                            <button
                                onClick={() => setMappingTarget('out')}
                                className={mappingTarget === 'out' ? 'active' : ''}
                            >
                                Set 'out' block
                            </button>
                            <button
                                onClick={() => setMappingTarget('continue')}
                                className={mappingTarget === 'continue' ? 'active' : ''}
                            >
                                Set 'continue' block
                            </button>
                            <div className="current-mappings">
                                <div>in socket: {editingSubGraph.in.get('in') || 'not set'}</div>
                                <div>out block: {editingSubGraph.out.get('out') || 'not set'}</div>
                                <div>continue block: {editingSubGraph.out.get('continue') || 'not set'}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="table">
                    <div className="tableDisplay">
                        <canvas
                            ref={canvasRef}
                            className="canvas"
                            onClick={handleCanvasClick}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={() => {
                                setDraggedBlockId(null);
                                setDragOffset(null);
                                setDraggingConnection(null);
                                setIsSelecting(false);
                                setSelectionStart(null);
                                setSelectionEnd(null);
                            }}
                        />
                    </div>
                </div>

                <EditDialog
                    editingBlockId={editingBlockId}
                    blocks={blocks}
                    editValue={editValue}
                    onEditValueChange={setEditValue}
                    onSave={() => {
                        const block = editingSubGraph
                        ? editingSubGraph.blocks.find(b => b.id === editingBlockId)
                        : blocks.find(b => b.id === editingBlockId);
                        if (!block) return;

                        if (block.instance instanceof NumDeclarationBlock ||
                            block.instance instanceof BoolDeclarationBlock ||
                            block.instance instanceof StringDeclarationBlock)
                        {
                            block.instance.setNames(editValue);
                        } else if (block.instance instanceof StringConstantBlock) {
                            block.instance.setName(editValue);
                        } else if (block.instance instanceof NumberConstantBlock) {
                            const numValue = parseFloat(editValue) || 0;
                            block.instance.setValue(numValue);
                        } else if (block.instance instanceof BooleanConstantBlock) {
                            block.instance.setValue(editValue === 'true');
                        } else if (block.instance instanceof ExpressionBlock) {
                            block.instance.setExpression(editValue);
                        }

                        if (editingSubGraph) {
                            setEditingSubGraph({
                                ...editingSubGraph,
                                blocks: editingSubGraph.blocks.map(b => b.id === block.id ? block : b)
                            });
                        } else {
                            setBlocks([...blocks]);
                        }

                        setEditingBlockId(null);
                    }}
                    onClose={() => setEditingBlockId(null)}
                />

                <div className="containerCreateBlock">
                    <div className="typeBlock">
                        <ul className="typeBlockUl">
                            <li className="searchForm">
                                <input
                                    className="searchForm__txt"
                                    type="text"
                                    placeholder="Поиск..."
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                />
                                <button className="searchForm__btn">
                                    <img className="searchForm__img" src="/source/find_icon.svg" alt="search" />
                                </button>
                            </li>
                            {blockTypes
                                .filter(type => type.name.toLowerCase().includes(searchType.toLowerCase()))
                                .map(type => (
                                    <li key={type.id}>
                                        <button
                                            className={`btn-type ${selectedType === type.id ? 'active' : ''}`}
                                            onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                                        >
                                            {type.name}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    <div className="nameBlock">
                        <ul className="nameBlockUL">
                            <li className="searchForm">
                                <input
                                    className="searchForm__txt"
                                    type="text"
                                    placeholder="Поиск..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                                <button className="searchForm__btn">
                                    <img className="searchForm__img" src="/source/find_icon.svg" alt="search" />
                                </button>
                            </li>
                            {filteredBlockNames.map(block => (
                                <li key={block.id}>
                                    <button
                                        className="btn-name"
                                        onClick={() => handleBlockClick(block)}
                                    >
                                        {block.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="imgContainerBlock">
                        <div className="execution-result">
                            <h3>Результат:</h3>
                            <pre>{executionResult || 'Нажмите "Запустить" для выполнения'}</pre>

                            {(validationErrors.errors.length > 0 || validationErrors.warnings.length > 0) && (
                                <>
                                    <h3 style={{ color: '#FF4444', marginTop: '10px' }}>Проблемы:</h3>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {validationErrors.errors.map((err, idx) => (
                                            <div key={idx} style={{ 
                                                color: '#FF4444', 
                                                fontSize: '12px',
                                                padding: '4px',
                                                borderBottom: '1px solid #FF4444'
                                            }}>
                                                ⚠ {err.message}
                                            </div>
                                        ))}
                                        {validationErrors.warnings.map((warn, idx) => (
                                            <div key={idx} style={{ 
                                                color: '#FFC107', 
                                                fontSize: '12px',
                                                padding: '4px',
                                                borderBottom: '1px solid #FFC107'
                                            }}>
                                                ⚠ {warn.message}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {Object.keys(variables).length > 0 && (
                                <>
                                    <h3>Переменные:</h3>
                                    <pre>{JSON.stringify(variables, null, 2)}</pre>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <ul className="developers">
                    <div>Developers:</div>
                    <li>Барков Данил</li>
                    <li>Гейвус Данил</li>
                    <li>Стариченко Иван</li>
                </ul>
            </footer>
        </div>
    );
}

export default App;