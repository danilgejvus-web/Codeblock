import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ForEachBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const subGraph = context.getSubGraph();
        const subContext = context.newSubContext();

        const arrayName = inputs['arrayName'];
        if (typeof arrayName !== 'string') {
            throw new Error('Имя массива для ForEach не является строкой.');
        }

        const array = context.getVariable(arrayName);
        if (!Array.isArray(array)) {
            throw new Error(`Переменная ${arrayName} не является массивом.`);
        }
        const length = array.length;

        const inState = inputs['in'];

        const inputID = subGraph?.in.get('in');
        const arrayNameInputID = subGraph?.in.get('arrayName');
        const indexInputID = subGraph?.in.get('index');
        const outputID = subGraph?.out.get('out');

        if (!inputID || !arrayNameInputID || !indexInputID || !outputID) {
            throw new Error('Тело ForEach должно иметь вводы in, arrayName, index и вывод out.');
        }

        const iterate = (state: any, index: number, context: ExecutionContext): any => {
            if (index >= length) {
                return state;
            }

            const subInputs = new Map<string, any>();
            subInputs.set(inputID, state);
            subInputs.set(arrayNameInputID, arrayName);
            subInputs.set(indexInputID, index);

            const subOutputs = context.executeSubGraph(subGraph!, subInputs, context);
            const nextState = subOutputs.get(outputID);

            return iterate(nextState, index + 1, context);
        }

        const outState = iterate(0, inState, subContext);
        return { out: outState };
    }
}
