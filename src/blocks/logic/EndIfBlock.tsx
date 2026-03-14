import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class EndIfBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        if (inputs['in1'] !== undefined) {
            return { out: inputs['in1'] };
        } else if (inputs['in2'] !== undefined) {
            return { out: inputs['in2'] };
        }
        
        return {};
    }
}
