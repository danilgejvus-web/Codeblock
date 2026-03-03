import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class IfBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        const bool = inputs['bool'];
        const passValue = inputs['passInput'];

        if (bool == true) {
            return { true: passValue };
        } else {
            return { false: passValue };
        }
    }
}
