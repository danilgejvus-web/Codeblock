import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class AndBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        const a = inputs['in1'] || false;
        const b = inputs['in2'] || false;

        return { out: a && b }
    }
}
