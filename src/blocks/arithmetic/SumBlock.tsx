import type { ExecutableBlock, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class SumBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput): ExecutionOutput {
        const a = inputs['in1'] || 0;
        const b = inputs['in2'] || 0;

        return { out: a + b }
    }
}
