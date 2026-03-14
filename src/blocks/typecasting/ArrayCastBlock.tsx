import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ArrayCastBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        const value = inputs['in'];
        const splitter = inputs['split'] ?? '';

        if (Array.isArray(value))
        {
            return { out: value };
        }
        if (typeof value === 'string')
        {
            return { out: value.split(splitter) };
        }
        if (value === null || value === undefined)
        {
            return { out: [] };
        }

        return { out: [value] };
    }
}
