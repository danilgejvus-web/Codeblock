import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class NumCastBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        const value = inputs['in'];
        const num = Number(value);
        return { out: num };
    }
}
