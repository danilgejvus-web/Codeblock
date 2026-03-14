import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class WhileBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const subGraph = context.getSubGraph();
        if (!subGraph) {
            throw new Error('Блок While не содержит подграф.');
        }

        const inState = inputs['in'];
        const subContext = context.newSubContext();

        const inputSocketID = subGraph.in.get('in');
        if (!inputSocketID) {
            throw new Error('Тело While не имеет указанного сокета in.')
        }

        const outBlockID = subGraph.out.get('out');
        const continueBlockID = subGraph.out.get('continue');
        if (!outBlockID || ! continueBlockID) {
            throw new Error('Тело While не имеет указанных выходных сокетов out и continue.');
        }

        const iterate = (state: any, context: ExecutionContext): any => {
            const subInputs = new Map<string, any>();
            subInputs.set(inputSocketID, state);

            const subOuts = context.executeSubGraph(subGraph, subInputs, context);

            const outOutput = subOuts.get(outBlockID);
            const continueOutput = subOuts.get(continueBlockID);
            if (!outOutput || !continueOutput) {
                throw new Error('Тело While не содержит соответствующих блоков выхода.');
            }

            const nextState = outOutput['out'];
            const shouldContinue = continueOutput['out'];

            return shouldContinue ? iterate(nextState, context) : nextState;
        };

        const outState = iterate(inState, subContext);
        return { out: outState };
    }
}
