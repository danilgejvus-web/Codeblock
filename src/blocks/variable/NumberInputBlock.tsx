import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class NumberInputBlock implements ExecutableBlock {
    private numberValue: number;

    constructor(initValue: number = 0) {
        this.numberValue = initValue;
    }

    execute(_inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        return { 
            value: this.numberValue 
        };
    }

    public setValue(value: number): void {
        this.numberValue = value;
    }

    public getValue(): number {
        return this.numberValue;
    }
}