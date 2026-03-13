import React from 'react';
import type { Block } from '../blocks/BlockMetadata';

interface EditDialogProps {
    editingBlockId: string | null;
    blocks: Block[];
    editValue: string;
    onEditValueChange: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export const EditDialog: React.FC<EditDialogProps> = ({
    editingBlockId,
    blocks,
    editValue,
    onEditValueChange,
    onSave,
    onClose
}) => {
    if (!editingBlockId) return null;

    const block = blocks.find(b => b.id === editingBlockId);
    if (!block) return null;

    const getTitle = () => {
        switch (block.type) {
            case 'DeclarationNum':
                return 'Объявление переменных';
            case 'NumberConstant':
                return 'Введите число';
            case 'BooleanConstant':
                return 'Выберите значение';
            default:
                return 'Введите строку';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSave();
        }
    };

    const renderContent = () => {
        switch (block.type) {
            case 'DeclarationNum':
                return (
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ color: '#D4D4D4', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                            Имена переменных (через запятую):
                        </label>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => onEditValueChange(e.target.value)}
                            onKeyDown={handleKeyDown}
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
                );

            case 'BooleanConstant':
                return (
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ color: '#D4D4D4', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                            Выберите значение:
                        </label>
                        <select
                            value={editValue}
                            onChange={(e) => onEditValueChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                background: '#1E1E1E',
                                color: '#D4D4D4',
                                border: '1px solid #D6413E',
                                padding: '8px',
                                width: '100%',
                                cursor: 'pointer',
                            }}
                            autoFocus
                        >
                            <option value="true">true</option>
                            <option value="false">false</option>
                        </select>
                    </div>
                );

            case 'Expression':
                return (
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ color: '#D4D4D4', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                            Введите арифметическое выражение:
                        </label>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => onEditValueChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                background: '#1E1E1E',
                                color: '#D4D4D4',
                                border: '1px solid #D6413E',
                                padding: '8px',
                                width: '100%',
                                fontFamily: 'monospace',
                            }}
                            placeholder="x + y * 2"
                            autoFocus
                        />
                        <div style={{ 
                            color: '#868686', 
                            fontSize: '10px', 
                            marginTop: '5px' 
                        }}>
                            Поддерживаются: + - * / % ( ) и переменные
                        </div>
                    </div>
                );

            default:
                return (
                    <input
                        type={block.type === 'NumberConstant' ? 'number' : 'text'}
                        value={editValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onKeyDown={handleKeyDown}
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
                );
        }
    };

    const dialogStyle: React.CSSProperties = {
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
    };

    const buttonStyle = {
        background: '#D6413E',
        color: 'white',
        padding: '5px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    const cancelButtonStyle = {
        background: '#D4D4D4',
        color: '#1E1E1E',
        padding: '5px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    return (
        <div style={dialogStyle}>
            <h3 style={{ color: '#D4D4D4', marginBottom: '10px' }}>
                {getTitle()}
            </h3>

            {renderContent()}
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={onSave} style={buttonStyle}>
                    OK
                </button>
                <button onClick={onClose} style={cancelButtonStyle}>
                    Отмена
                </button>
            </div>
        </div>
    );
};