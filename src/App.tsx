import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import type { Block } from './blocks/BlockMetadata';
import type { Connection } from './blocks/ExecutableBlock';
import { blockRegistry } from './blocks/blockRegistry';
import { execute } from './interpreter';
import { StringConstantBlock } from './blocks/variable/StringConstantBlock';
import { NumberConstantBlock } from './blocks/variable/NumberConstantBlock';
import { validateProgram, type BlockError, type ValidationResult } from './Validation';
import { DeclarationBlock } from './blocks/variable/DeclarationBlock';

//TO DO
// *добавить логику Read в инпуты, которым нужно значение. То есть они будут принимать либо константу, либо название переменной и брать по нему значение
// *избавиться от блока Read и сразу передавать имя, а доставать значение по нему в нужных пинах
// *можно ещё блок вывода сделать, чтобы потом не весь результат выводить
// -баг у текста output в блоке NumConstant: маленький текст
// сделать канву подвижной
// сделать надписи у призраков по центру

// сделать блоки декларации для bool и string
// сделать bool константу
// Сделай визуал для ExpressionBlock, While и массивов

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
    const [draggedBlock, setDraggedBlock] = useState<{ type: string; name: string; blockType: string; instance?: any} | null>(null);
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

    const blockTypes = [
        { id: 'Array', name: 'Array' },
        { id: 'Arithmetic', name: 'Arithmetic' },
        { id: 'Constant', name: 'Constant' },
        { id: 'Variable', name: 'Variable' },
        { id: 'Logic', name: 'Logic' },
        { id: 'Loop', name: 'Loop' },
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
        if (['String', 'Number'].includes(blockName)) return 'Constant';
        if (['NumVar', 'StringVar', 'BoolVar', 'Read', 'Write', 'DeclarationNum'].includes(blockName)) return 'Variable';
        if (['If', 'EndIf', 'Not', 'Or', 'And', 'Greater', 'GreaterEqual', 'Less', 'LessEqual', 'Equal', 'NotEqual'].includes(blockName)) return 'Logic';
        if (['While'].includes(blockName)) return 'Loop';
        return 'Variable';
    }

    const filteredBlockNames = blockNames
        .filter(block => !selectedType || block.typeId === selectedType)
        .filter(block => block.name.toLowerCase().includes(searchName.toLowerCase()));

    const getBlockSockets = (block: Block): SocketPoint[] => {
        const blockInfo = blockRegistry[block.type as keyof typeof blockRegistry];
        if (!blockInfo) return [];

        let sockets = blockInfo.sockets;

        if (block.type === 'DeclarationNum') {
            const instance = block.instance as DeclarationBlock;
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
        for (const block of blocks) {
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
    }, [blocks]);

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
               setConnections(prev => prev.filter(conn => 
                !selectedBlockIds.has(conn.fromBlockID) && 
                !selectedBlockIds.has(conn.toBlockID)
              ));
              
              setBlocks(prev => prev.filter(block => !selectedBlockIds.has(block.id)));
            setSelectedBlockIds(new Set());
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
            connections.forEach(conn => {
                const fromBlock = blocks.find(b => b.id === conn.fromBlockID);
                const toBlock = blocks.find(b => b.id === conn.toBlockID);

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
            blocks.forEach(block => {
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
                } else if (block.type === 'DeclarationNum') {
                    const instance = block.instance as DeclarationBlock;
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
                    ctx.fillText('Declaration', block.x + 60, block.y + 20);
                    
                    ctx.font = '10px Helvetica';
                    ctx.fillStyle = '#D6413E';
                    
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                    
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
                        const hasConnection = connections.some(conn => 
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

            for (const block of blocks) {
                if (x >= block.x && x <= block.x + 120 && y >= block.y && y <= block.y + 60) {

                    setSelectedBlockIds(new Set([block.id]));

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

                    if (block.type === 'DeclarationNum') {
                        const instance = block.instance as DeclarationBlock;
                        setEditingBlockId(block.id);
                        setEditValue(instance.getNamesString());
                        break;
                    }
                }
            }
        };

        canvas.addEventListener('dblclick', handleDoubleClick);
        return () => canvas.removeEventListener('dblclick', handleDoubleClick);
    }, [blocks]);

    const handleBlockClick = (block: typeof blockNames[0]) => {
        const blockInfo = blockRegistry[block.id as keyof typeof blockRegistry];

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
        } else if (block.id === 'DeclarationNum') {
            console.log('Creating DeclarationBlock');
            const instance = new DeclarationBlock();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id,
                instance: instance
            });
        } else {
            new blockInfo.class();
            setDraggedBlock({
                type: block.typeId,
                name: block.name,
                blockType: block.id
            });
        }
      };

const handleCanvasClick = () => {
        if (!draggedBlock) return;

        const x = Math.round((mousePos.x - 60) / 20) * 20;
        const y = Math.round((mousePos.y - 30) / 20) * 20;

        if (x >= 0 && y >= 0 && x + 120 <= canvasRef.current!.width && y + 60 <= canvasRef.current!.height) {
            const blockInfo = blockRegistry[draggedBlock.blockType as keyof typeof blockRegistry];

            let instance;
            if ((draggedBlock.blockType === 'String' ||
                draggedBlock.blockType === 'NumberConstant' ||
                draggedBlock.blockType === 'DeclarationNum')
                && draggedBlock.instance) {
                instance = draggedBlock.instance;
            } else {
                instance = draggedBlock.instance;
            }

            setBlocks([...blocks, {
                id: Date.now().toString(),
                type: draggedBlock.blockType,
                name: draggedBlock.name,
                x,
                y,
                instance
            }]);
        }
        setDraggedBlock(null);
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (draggedBlock) return;

        const socket = findSocketAtPosition(mousePos.x, mousePos.y);

        if (socket && socket.type === 'output') {
            setDraggingConnection({
                fromBlockId: socket.blockId,
                fromSocketId: socket.socketId,
                fromPoint: socket.position
            });
            return;
        }

        if (socket && socket.type === 'input') {
            const connectionToRemove = connections.find(conn => 
                conn.toBlockID === socket.blockId && conn.toSocketID === socket.socketId
            );
            
            if (connectionToRemove) {
                console.log('Удаляем соединение:', connectionToRemove);
                setConnections(prev => prev.filter(conn => conn.id !== connectionToRemove.id));
            }
            return;
        }

        let blockFound = false;
        for (const block of blocks) {
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

    const handleCanvasMouseUp = (e: React.MouseEvent) => {

            if (isSelecting && selectionStart && selectionEnd) {
                const rect = {
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    right: Math.max(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    bottom: Math.max(selectionStart.y, selectionEnd.y)
                };
            
            const blocksInRect = blocks.filter(block => {
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

                const filteredConnections = connections.filter(conn => 
                    !(conn.toBlockID === targetSocket.blockId && 
                    conn.toSocketID === targetSocket.socketId)
                );

                console.log('Заменяем соединение на:', newConnection);
                setConnections([...filteredConnections, newConnection]);
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
          const currentBlock = blocks.find(b => b.id === draggedBlockId);
          if (currentBlock) {
            const dx = newX - currentBlock.x;
            const dy = newY - currentBlock.y;

         setBlocks(prevBlocks => 
            prevBlocks.map(block => 
                selectedBlockIds.has(block.id) || block.id === draggedBlockId
                    ? { ...block, x: block.x + dx, y: block.y + dy }
                    : block
                )
            );
        }
    }
      
      const socket = findSocketAtPosition(x, y);
      setHoveredSocket(socket);
    };

    const handleRunCode = () => {
        try {
            const context = {
                getVariable: (name: string) => {
                    console.log(`Чтение переменной "${name}":`, variables[name]);
                    return variables[name];
                },
                setVariable: (name: string, value: any) => {
                    console.log(`Запись переменной "${name}" =`, value);
                    setVariables(prev => ({ ...prev, [name]: value }));
                }
            };

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
    };

    const handleDeleteConnection = () => {
        if (hoveredSocket) {
            setConnections(connections.filter(conn =>
                !(conn.toBlockID === hoveredSocket.blockId &&
                    conn.toSocketID === hoveredSocket.socketId) &&
                !(conn.fromBlockID === hoveredSocket.blockId &&
                    conn.fromSocketID === hoveredSocket.socketId)
            ));
        }
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

                {editingBlockId && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#2D2D2D',
                    padding: '20px',
                    border: '2px solid #D6413E',
                    borderRadius: '8px',
                    zIndex: 1000,
                    width: '300px',
                }}>
                    <h3 style={{ color: '#D4D4D4', marginBottom: '10px' }}>
                        {blocks.find(b => b.id === editingBlockId)?.type === 'DeclarationNum'
                            ? 'Объявление переменных'
                            : blocks.find(b => b.id === editingBlockId)?.type === 'NumberConstant'
                                ? 'Введите число'
                                : 'Введите имя переменной'}
                    </h3>

                    {blocks.find(b => b.id === editingBlockId)?.type === 'DeclarationNum' ? (
                        <>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ color: '#D4D4D4', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                                    Имена переменных (через запятую):
                                </label>
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const block = blocks.find(b => b.id === editingBlockId);
                                            if (block && block.instance instanceof DeclarationBlock) {
                                                block.instance.setNames(editValue);
                                                setBlocks([...blocks]);
                                                setEditingBlockId(null);
                                            }
                                        }
                                    }}
                                    style={{
                                        background: '#1E1E1E',
                                        color: '#D4D4D4',
                                        border: '1px solid #D6413E',
                                        padding: '8px',
                                        width: '100%',
                                    }}
                                    placeholder="x, y, z"
                                    autoFocus
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                type={blocks.find(b => b.id === editingBlockId)?.type === 'NumberConstant'
                                    ? 'number'
                                    : 'text'}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const block = blocks.find(b => b.id === editingBlockId);
                                        if (block) {
                                            if (block.instance instanceof StringConstantBlock) {
                                                block.instance.setName(editValue);
                                            } else if (block.instance instanceof NumberConstantBlock) {
                                                const numValue = parseFloat(editValue) || 0;
                                                block.instance.setValue(numValue);
                                            }
                                            setBlocks([...blocks]);
                                        }
                                        setEditingBlockId(null);
                                    }
                                }}
                                style={{
                                    background: '#1E1E1E',
                                    color: '#D4D4D4',
                                    border: '1px solid #D6413E',
                                    padding: '8px',
                                    width: '100%',
                                    marginBottom: '10px',
                                }}
                                autoFocus
                            />
                        </>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => {
                                const block = blocks.find(b => b.id === editingBlockId);
                                if (block) {
                                    if (block.instance instanceof DeclarationBlock) {
                                        block.instance.setNames(editValue);
                                        setBlocks([...blocks]);
                                    } else if (block.instance instanceof StringConstantBlock) {
                                        block.instance.setName(editValue);
                                    } else if (block.instance instanceof NumberConstantBlock) {
                                        const numValue = parseFloat(editValue) || 0;
                                        block.instance.setValue(numValue);
                                    }
                                    setBlocks([...blocks]);
                                }
                                setEditingBlockId(null);
                            }}
                            style={{
                                background: '#D6413E',
                                color: 'white',
                                padding: '5px 15px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            OK
                        </button>
                        <button
                            onClick={() => setEditingBlockId(null)}
                            style={{
                                background: '#D4D4D4',
                                color: '#1E1E1E',
                                padding: '5px 15px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

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