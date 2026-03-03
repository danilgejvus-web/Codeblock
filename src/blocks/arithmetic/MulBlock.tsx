import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class MulBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const a = inputs['in1'] || 0;
        const b = inputs['in2'] || 0;

        return { out: a / b }
    }
}
