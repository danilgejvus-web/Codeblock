import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class WhileBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const subGraph = context.getSubGraph();

        const input = inputs['in'];
        let currentState = input;

        const subContext = context.newSubContext();

        const stateInputID = subGraph.in.get('in');
        const nextStateOutputID = subGraph.out.get('out');

        while (inputs['condition']) {
            const subInputs = new Map<string, any>();
            subInputs.set(stateInputID!, currentState);

            const subOuts = context.executeSubGraph(subGraph, subInputs, subContext);

            const nextState = subOuts.get(nextStateOutputID!);
            if (nextState !== undefined) {
                currentState = nextState;
            }
        }

        return { outputs: currentState };
    }
}
