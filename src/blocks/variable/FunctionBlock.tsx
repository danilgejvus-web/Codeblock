import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class FunctionBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const subGraph = context.getSubGraph();
        if (subGraph === undefined) {
            throw new Error('Блок функции не содержит подграф.');
        }

        const input = inputs['in'];
        const subContext = context.newSubContext();
        const subOuts = context.executeSubGraph(subGraph, input, subContext);

        const subOutputID = subGraph.out.get('out');
        const subOutput = subOuts.get(subOutputID!);

        return { out: subOutput };
    }
}
