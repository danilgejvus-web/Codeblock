import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class WhileBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const subGraph = context.getSubGraph();
        if (subGraph === undefined) {
            throw new Error('Блок While не содержит подграф.');
        }

        const inState = inputs['in'];
        const subContext = context.newSubContext();

        const iterate = (state: any, context: ExecutionContext): any => {
            const subInputs = new Map<string, any>();
            subInputs.set(subGraph.in.get('in')!, state);

            const subOuts = context.executeSubGraph(subGraph, subInputs, context);

            const nextState = subOuts.get(subGraph.out.get('out')!);
            const shouldContinue = subOuts.get(subGraph.out.get('continue')!);

            if (shouldContinue)
            {
                return iterate(nextState, context);
            }
            else
            {
                return nextState;
            }
        };

        const outState = iterate(inState, subContext);
        return { out: outState };
    }
}
