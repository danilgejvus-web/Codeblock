import { useState, useEffect, useRef } from 'react';
import './App.css';

interface Block {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
}

function App() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<{ type: string; name: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const blockTypes = [
    { id: 'var', name: 'var' },
    { id: 'arithmetic', name: 'arithmetic' },
    { id: 'con', name: 'con and loop' },
  ];

  const blockNames = [
    { id: 'int', name: 'int', typeId: 'var', longText: false },
    { id: 'string', name: 'string', typeId: 'var', longText: false },

    { id: 'if', name: 'if', typeId: 'con', longText: false },
    { id: 'for', name: 'for', typeId: 'con', longText: false },

    { id: 'add', name: 'add', typeId: 'arithmetic', longText: false },
    { id: 'subtract', name: 'subtract', typeId: 'arithmetic', longText: false },
    { id: 'multiply', name: 'multiply', typeId: 'arithmetic', longText: false },
    { id: 'longname', name: 'Длинное название блока очень', typeId: 'var', longText: true },
  ];

  const filteredBlockNames = selectedType ? blockNames.filter(b => b.typeId === selectedType): [];

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
        ctx.strokeStyle = '#333';
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = '#333';
        ctx.stroke();
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
  }, [blocks, draggedBlock, mousePos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !draggedBlock) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    if (draggedBlock) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [draggedBlock]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraggedBlock(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBlockClick = (block: typeof blockNames[0]) => {
    setSelectedBlock(block.id);
    setDraggedBlock({ type: block.typeId, name: block.name });
  };

  const handleCanvasClick = () => {
    if (!draggedBlock) return;

    const x = Math.round((mousePos.x - 60) / 20) * 20;
    const y = Math.round((mousePos.y - 30) / 20) * 20;

    if (x >= 0 && y >= 0 && x + 120 <= canvasRef.current!.width && y + 60 <= canvasRef.current!.height) {
      
      setBlocks([...blocks, {
        id: Date.now().toString(),
        type: draggedBlock.type,
        name: draggedBlock.name,
        x,
        y
      }]);
    }
    setDraggedBlock(null);
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
        <div className="table">
          <div className="tableDisplay">
            <canvas
              ref={canvasRef}
              className="canvas"
              onClick={handleCanvasClick}
            />
          </div>
        </div>
        
        <div className="containerCreateBlock">
          <div className="typeBlock">
            <ul className="typeBlockUl">
              <li className="searchForm">
                <input className="searchForm__txt" type="text" placeholder="Поиск..." />
                <button className="searchForm__btn">
                  <img className="searchForm__img" src="/source/find_icon.svg" alt="search" />
                </button>
              </li>
              {blockTypes.map(type => (
                <li key={type.id}>
                  <button 
                    className={`btn-type ${selectedType === type.id ? 'active' : ''}`}
                    onClick={() => setSelectedType(type.id)}
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
                <input className="searchForm__txt" type="text" placeholder="Поиск..." />
                <button className="searchForm__btn">
                  <img className="searchForm__img" src="/source/find_icon.svg" alt="search" />
                </button>
              </li>
              
              {filteredBlockNames.map(block => (
                <li key={block.id}>
                  <button 
                    className={`btn-name ${selectedBlock === block.id ? 'active' : ''}`}
                    data-long={block.longText}
                    onClick={() => handleBlockClick(block)}
                  >
                    {block.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="imgContainerBlock">
            {selectedBlock ? (
              <div className="block-preview">
                <div style={{ textAlign: 'center' }}>
                  <div>Блок {selectedBlock}</div>
                </div>
              </div>
            ) : (
              <div className="block-preview">
                Выберите блок для отображения
              </div>
            )}
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