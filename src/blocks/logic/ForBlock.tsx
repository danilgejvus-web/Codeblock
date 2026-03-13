import { ExpressionBlock } from "../arithmetic/ExpressionBlock";
import type { SubGraph } from "../BlockMetadata";
import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ForBlock implements ExecutableBlock {
    private conditionSubGraph: SubGraph | undefined = undefined;
    private subGraph: SubGraph | undefined = undefined;

    constructor(conditionExpression: string = '', expression: string = '') {
        this.updateExpressions(conditionExpression, expression)
    }

    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const inState = inputs['in'];

        const conditionInputID = this.conditionSubGraph?.in.get('in')!;
        const conditionOutputID = this.conditionSubGraph?.out.get('out')!;
        const inputID = this.subGraph?.in.get('in')!;
        const outputID = this.subGraph?.out.get('out')!;

        const subContext = context.newSubContext();

        const iterate = (state: any, context: ExecutionContext): any => {
            const conditionInputs = new Map<string, any>();
            conditionInputs.set(conditionInputID, state);

            const conditionOutputs = context.executeSubGraph(this.conditionSubGraph!, conditionInputs, context);
            const shouldContinue = conditionOutputs.get(conditionOutputID);

            if (!shouldContinue) {
                return state;
            }

            const inputs = new Map<string, any>();
            inputs.set(inputID, state);

            const outputs = context.executeSubGraph(this.subGraph!, inputs, context);
            const nextState = outputs.get(outputID);

            return iterate(nextState, context);
        }

        const outState = iterate(inState, subContext);
        return { out: outState };
    }

    updateExpressions(conditionExpression: string, expression: string): void {
        const expressionBlock = new ExpressionBlock();

        expressionBlock.setExpression(conditionExpression);
        this.conditionSubGraph = expressionBlock.build();

        expressionBlock.setExpression(expression);
        this.subGraph = expressionBlock.build();

        if (!this.conditionSubGraph.in.has('in') || ! this.conditionSubGraph.out.has('out')) {
            throw new Error('Условие цикла должно реализовывать переменную цикла и выход.');
        }
        if (!this.subGraph.in.has('in') || ! this.subGraph.out.has('out')) {
            throw new Error('Тело цикла должно реализовывать переменную цикла и выход.');
        }
    }
}
