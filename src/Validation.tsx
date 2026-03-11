import type { Block } from "./blocks/BlockMetadata";
import { blockRegistry } from "./blocks/blockRegistry";
import type { Connection } from "./blocks/ExecutableBlock";
import type { NameBlock } from "./blocks/variable/NameBlock";

export interface BlockError {
    blockId: string;
    type: 'error' | 'warning';
    message: string;
    socketId?: string;
}

export type ValidationResult = {
    errors: BlockError[];
    warnings: BlockError[];
};

const checkNumericInputs = (
    block: Block, 
    connections: Connection[], 
    blocks: Block[],
    errors: BlockError[],
    warnings: BlockError[]
) => {
    ['in1', 'in2'].forEach(inputId => {
        const conn = connections.find(c => c.toBlockID === block.id && c.toSocketID === inputId);
        if (!conn) return;

        const sourceBlock = blocks.find(b => b.id === conn.fromBlockID);
        if (!sourceBlock) return;

        const sourceIsNumber = 
            sourceBlock.type === 'NumberConstant' || 
            sourceBlock.type === 'Num' ||
            sourceBlock.type === 'Read';

        if (!sourceIsNumber) {
            warnings.push({
                blockId: block.id,
                type: 'warning',
                message: `Вход "${inputId}" ожидает число, но подключен блок типа ${sourceBlock.type}`,
                socketId: inputId
            });
        }
    });
};

const checkBooleanInput = (
    block: Block,
    socketId: string,
    connections: Connection[],
    blocks: Block[],
    errors: BlockError[],
    warnings: BlockError[]
) => {
    const conn = connections.find(c => c.toBlockID === block.id && c.toSocketID === socketId);
    if (!conn) return;

    const sourceBlock = blocks.find(b => b.id === conn.fromBlockID);
    if (!sourceBlock) return;

    const sourceIsBoolean = 
        sourceBlock.type === 'Bool' ||
        sourceBlock.type === 'And' ||
        sourceBlock.type === 'Or' ||
        sourceBlock.type === 'Not' ||
        sourceBlock.type === 'Equal' ||
        sourceBlock.type === 'Greater' ||
        sourceBlock.type === 'Less' ||
        sourceBlock.type === 'LessEqual' ||
        sourceBlock.type === 'GreaterEqual' ||
        sourceBlock.type === 'NotEqual';

    if (!sourceIsBoolean) {
        warnings.push({
            blockId: block.id,
            type: 'warning',
            message: `Вход "${socketId}" ожидает булево значение`,
            socketId: socketId
        });
    }
};

const checkForCycles = (blocks: Block[], connections: Connection[]): BlockError | null => {
    const graph = new Map<string, string[]>();
    blocks.forEach(b => graph.set(b.id, []));
    
    connections.forEach(c => {
        graph.get(c.fromBlockID)?.push(c.toBlockID);
    });

    const visited = new Set<string>();
    const stack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
        if (stack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        stack.add(nodeId);

        for (const neighbor of graph.get(nodeId) || []) {
            if (hasCycle(neighbor)) return true;
        }

        stack.delete(nodeId);
        return false;
    };

    for (const block of blocks) {
        if (hasCycle(block.id)) {
            return {
                blockId: block.id,
                type: 'error',
                message: 'Обнаружена циклическая зависимость'
            };
        }
    }

    return null;
};

const checkVariableExists = (
    block: Block,
    connections: Connection[],
    blocks: Block[],
    variables: Record<string, any>,
    errors: BlockError[],
    warnings: BlockError[]
) => {
    const nameConn = connections.find(c => 
        c.toBlockID === block.id && c.toSocketID === 'in1'
    );
    
    if (!nameConn) return;

    const nameBlock = blocks.find(b => b.id === nameConn.fromBlockID);
    if (!nameBlock) return;

    if (nameBlock.type === 'Name') {
        const instance = nameBlock.instance as NameBlock;
        const varName = instance?.getName();
        
        if (varName && variables[varName] === undefined) {
            warnings.push({
                blockId: block.id,
                type: 'warning',
                message: `Переменная "${varName}" не инициализирована`,
                socketId: 'in1'
            });
        }
    }
};

export const validateProgram = (
    blocks: Block[], 
    connections: Connection[],
    variables: Record<string, any>
): ValidationResult => {
    const errors: BlockError[] = [];
    const warnings: BlockError[] = [];

    blocks.forEach(block => {
        const blockInfo = blockRegistry[block.type as keyof typeof blockRegistry];
        if (!blockInfo) return;

        blockInfo.sockets
            .filter(socket => socket.type === 'input')
            .forEach(socket => {
                const hasConnection = connections.some(conn => 
                    conn.toBlockID === block.id && conn.toSocketID === socket.id
                );

                const isRequired = ['set', 'setName', 'in1', 'in2', 'condition', 'bool'].includes(socket.id);
                
                if (isRequired && !hasConnection) {
                    errors.push({
                        blockId: block.id,
                        type: 'error',
                        message: `Обязательный вход "${socket.name || socket.id}" не подключен`,
                        socketId: socket.id
                    });
                }
            });

        switch (block.type) {
            case 'Sum':
            case 'Sub':
            case 'Mul':
            case 'Div':
            case 'Mod':
                checkNumericInputs(block, connections, blocks, errors, warnings);
                break;
                
            case 'If':
                checkBooleanInput(block, 'bool', connections, blocks, errors, warnings);
                break;
                
            case 'Write':
                const nameConn = connections.find(c => 
                    c.toBlockID === block.id && c.toSocketID === 'setName'
                );
                if (!nameConn) {
                    errors.push({
                        blockId: block.id,
                        type: 'error',
                        message: 'Write блок должен иметь имя переменной',
                        socketId: 'setName'
                    });
                }
                break;
                
            case 'Read':
                checkVariableExists(block, connections, blocks, variables, errors, warnings);
                break;
        }
    });

    const cycleError = checkForCycles(blocks, connections);
    if (cycleError) {
        errors.push(cycleError);
    }

    connections.forEach(conn => {
        const fromBlock = blocks.find(b => b.id === conn.fromBlockID);
        const toBlock = blocks.find(b => b.id === conn.toBlockID);
        
        if (!fromBlock || !toBlock) {
            errors.push({
                blockId: conn.fromBlockID || conn.toBlockID,
                type: 'error',
                message: 'Соединение ссылается на несуществующий блок'
            });
        }
    });

    return { errors, warnings };
};