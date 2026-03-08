import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class EqualBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        const a = inputs['in1'] || 0;
        const b = inputs['in2'] || 0;

        return { out: a === b }
    }
}
