import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class BooleanConstantBlock implements ExecutableBlock {
    private booleanValue: boolean;

    constructor(initValue: boolean = false) {
        this.booleanValue = initValue;
    }

    execute(_inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        return { 
            value: this.booleanValue 
        };
    }

    public setValue(value: boolean): void {
        this.booleanValue = value;
    }

    public getValue(): boolean {
        return this.booleanValue;
    }
}