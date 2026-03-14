import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class CallBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const toID = inputs['to'];
        const args = inputs['args'];

        const toBlock = context.getBlock(toID);
        if (!toBlock) {
            throw new Error('Блок функции не найден.')
        }

        const subContext = context.newSubContext();

        if ('setSelfFunctionID' in subContext) {
            (subContext as any).setSelfFunctionID(toID);
        }

        const output = toBlock.execute(args, subContext);
        return { out: output };
    }
}
