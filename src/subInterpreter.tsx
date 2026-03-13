import type { SubGraph, Block } from "./blocks/BlockMetadata";
import { blockRegistry } from "./blocks/blockRegistry";
import type { ExecutionContext } from "./blocks/ExecutableBlock";
import { ShadowConstantBlock } from "./blocks/variable/ShadowConstantBlock";
import { execute } from "./interpreter";


export function executeSubGraphWithShadow(
    subGraph: SubGraph,
    inputs: Map<string, any>,
    context: ExecutionContext
): Map<string, any>
{
    const blocks: Block[] = subGraph.blocks.map(b => {
        const instance = b.instance ?? createBlockInstance(b.type);
        return { ...b, instance };
    });
    const connections = [...subGraph.connections];

    const fromSocketID = new Map<String, string>();
    for (const block of blocks)
    {
        for (const socket of blockRegistry[block.type].sockets)
        {
            fromSocketID.set(socket.id, block.id);
        }
    }

    let shadowCount = 0;
    for (const [toSocketID, value] of inputs.entries())
    {
        const toBlockID = fromSocketID.get(toSocketID);
        if (!toBlockID) {
            throw new Error(`Сокет ${toSocketID} не существует.`)
        }

        const shadowBlockID = `__shadow_${shadowCount}`;
        const shadowOutSocketID = `__shadow_out_${shadowCount++}`

        const shadowBlock: Block = {
            id: shadowBlockID,
            type: 'ShadowConstant',
            name: 'ShadowConstantBlock',
            x: 0,
            y: 0,
            instance: new ShadowConstantBlock(value, shadowOutSocketID)
        }
        blocks.push(shadowBlock);

        connections.push({
            id: `__conn_${shadowCount}`,
            fromBlockID: shadowBlockID,
            fromSocketID: shadowOutSocketID,
            toBlockID: toBlockID,
            toSocketID: toSocketID
        });
    }

    const outputs = execute(blocks, connections, context);

    return outputs;
}

function createBlockInstance(type: string) {
    const data = blockRegistry[type];
    return new data.class();
}