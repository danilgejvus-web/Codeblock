import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { Block } from './blocks/BlockMetadata';
import type { Connection } from './blocks/ExecutableBlock';
import { blockRegistry } from './blocks/blockRegistry';
import { execute } from './interpreter';

interface Point {
    x: number;
    y: number;
}

interface SocketPoint {
    blockId: string;
    socketId: string;
    type: 'input' | 'output';
    position: Point;
}

function App() {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [draggedBlock, setDraggedBlock] = useState<{ type: string; name: string; blockType: string; } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [draggingConnection, setDraggingConnection] = useState<{ fromBlockId: string; fromSocketId: string; fromPoint: Point; } | null>(null);
    const [executionResult, setExecutionResult] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [searchType, setSearchType] = useState('');
    const [searchName, setSearchName] = useState('');
    const [hoveredSocket, setHoveredSocket] = useState<SocketPoint | null>(null);
    const [variables, setVariables] = useState<Record<string, any>>({});

    const blockTypes = [
        { id: 'var', name: 'var' },
        { id: 'arithmetic', name: 'arithmetic' },
        { id: 'logic', name: 'logic' },
    ];

    const blockNames = Object.entries(blockRegistry).map(([id, info]) => ({
        id: id,
        name: info.name,
        typeId: getBlockType(info.name),
        sockets: info.sockets
    }));

    function getBlockType(blockName: string): string {
        if (['Num', 'Read', 'Write'].includes(blockName)) return 'var';
        if (['Sum', 'Sub', 'Mul', 'Div'].includes(blockName)) return 'arithmetic';
        if (['If', 'EndIf'].includes(blockName)) return 'logic';
        return 'var';
    }

    const filteredBlockNames = blockNames
        .filter(block => !selectedType || block.typeId === selectedType)
        .filter(block => block.name.toLowerCase().includes(searchName.toLowerCase()));

    const getBlockSockets = (block: Block): SocketPoint[] => {
        const blockInfo = blockRegistry[block.type as keyof typeof blockRegistry];
        if (!blockInfo) return [];
        return blockInfo.sockets.map(socket => ({
            blockId: block.id,
            socketId: socket.id,
            type: socket.type,
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
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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

            blocks.forEach(block => {
                ctx.shadowColor = 'rgba(214, 65, 62, 0.3)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 2;

                ctx.fillStyle = '#2D2D2D';
                ctx.fillRect(block.x, block.y, 120, 60);

                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#D6413E';
                ctx.lineWidth = 2;
                ctx.strokeRect(block.x, block.y, 120, 60);

                ctx.fillStyle = '#D4D4D4';
                ctx.font = '14px Helvetica';
                ctx.fillText(block.name, block.x + 10, block.y + 35);

                const sockets = getBlockSockets(block);
                sockets.forEach(socket => {
                    ctx.beginPath();
                    ctx.fillStyle = socket.type === 'input' ? '#4CAF50' : '#2196F3';
                    if (hoveredSocket?.blockId === socket.blockId &&
                        hoveredSocket?.socketId === socket.socketId) {
                        ctx.fillStyle = '#FFC107';
                    }
                    ctx.arc(socket.position.x, socket.position.y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.stroke();
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

    }, [blocks, draggedBlock, mousePos, connections, draggingConnection, hoveredSocket]);

    const handleBlockClick = (block: typeof blockNames[0]) => {
        const blockInfo = blockRegistry[block.id as keyof typeof blockRegistry];
        new blockInfo.class();
        setDraggedBlock({
            type: block.typeId,
            name: block.name,
            blockType: block.id
        });
    };

const handleCanvasClick = () => {
        if (!draggedBlock) return;

        const x = Math.round((mousePos.x - 60) / 20) * 20;
        const y = Math.round((mousePos.y - 30) / 20) * 20;

        if (x >= 0 && y >= 0 && x + 120 <= canvasRef.current!.width && y + 60 <= canvasRef.current!.height) {
            const blockInfo = blockRegistry[draggedBlock.blockType as keyof typeof blockRegistry];
            const instance = new blockInfo.class();

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
        }
    };

    const handleCanvasMouseUp = (e: React.MouseEvent) => {
        if (draggingConnection) {
            const targetSocket = hoveredSocket;

            if (targetSocket && targetSocket.type === 'input' &&
                targetSocket.blockId !== draggingConnection.fromBlockId) {

                const exists = connections.some(conn =>
                    conn.toBlockID === targetSocket.blockId &&
                    conn.toSocketID === targetSocket.socketId
                );

                if (!exists) {
                    const newConnection: Connection = {
                        id: `conn_${Date.now()}_${Math.random()}`,
                        fromBlockID: draggingConnection.fromBlockId,
                        fromSocketID: draggingConnection.fromSocketId,
                        toBlockID: targetSocket.blockId,
                        toSocketID: targetSocket.socketId
                    };

                    setConnections([...connections, newConnection]);
                }
            }

            setDraggingConnection(null);
        }
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
                            onMouseUp={handleCanvasMouseUp}
                        />
                    </div>
                </div>

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