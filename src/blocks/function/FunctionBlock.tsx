import type { SubGraph } from "../BlockMetadata";
import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class FunctionBlock implements ExecutableBlock {
    public subGraph?: SubGraph = undefined;

    constructor (subGraph?: SubGraph) {
        this.subGraph = subGraph;
    }

    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        if (this.subGraph === undefined) {
            throw new Error('Блок функции не содержит подграф.');
        }

        const input = inputs['in'];
        const subContext = context.newSubContext();
        const subOutput = context.executeSubGraph(this.subGraph, input, subContext);

        const subOutputID = this.subGraph.out.get('out');
        const output = subOutput.get(subOutputID!);

        return { out: output };
    }
}
