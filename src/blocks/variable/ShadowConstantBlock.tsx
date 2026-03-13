import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ShadowConstantBlock implements ExecutableBlock {
    private value: any;
    private outputSocketID: string = '';

    constructor (value: any, outputSocketID: string) {
        this.value = value;
        this.outputSocketID = outputSocketID;
    }

    execute(_inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        return { [this.outputSocketID]: this.value }
    }
}
