import type { ExecutionInput, ExecutionOutput, Connection } from "./blocks/ExecutableBlock";
import type { Block } from './blocks/BlockMetadata';

export function execute(blocks: Block[], connections: Connection[], context: { getVariable: any; setVariable: any; }): Map<string, ExecutionOutput> {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const inputSources = new Map<string, Map<string, { fromBlockID: string, fromSocketID: string }>>();

    blocks.forEach(b => {
        graph.set(b.id, []);
        inDegree.set(b.id, 0);
        inputSources.set(b.id, new Map());
    });

    connections.forEach(c => {
        const from = c.fromBlockID;
        const to = c.toBlockID;

        graph.get(from)!.push(to);
        inDegree.set(to, (inDegree.get(to) || 0) + 1)

        const targetMap = inputSources.get(to);
        targetMap!.set(c.toSocketID, { fromBlockID: from, fromSocketID: c.fromSocketID });
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) { queue.push(id); };
    });

    const sequence: string[] = [];
    while (queue.length != 0) {
        const current = queue.shift()!;
        sequence.push(current);

        graph.get(current)?.forEach(next => {
            inDegree.set(next, inDegree.get(next)! - 1);
            if (inDegree.get(next) === 0) { queue.push(next); };
        });
    }

    const outputs = new Map<string, ExecutionOutput>();
    sequence.forEach(blockID => {
        const block = blocks.find(b => b.id === blockID)!;
        const instance = block.instance;
        const inputs: ExecutionInput = {};
        const sourceMap = inputSources.get(blockID)!;
        
        sourceMap.forEach((sourceInfo, toSocketID) => {
            const sourceOutput = outputs.get(sourceInfo.fromBlockID);
            if (sourceOutput && sourceOutput[sourceInfo.fromSocketID] !== undefined) {
                inputs[toSocketID] = sourceOutput[sourceInfo.fromSocketID];
            }
        });

        const output = instance!.execute(inputs, context);
        outputs.set(blockID, output);
    });

    return outputs;
}
