import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class StringConstantBlock implements ExecutableBlock {
    private variableName: string;

    constructor(name: string = 'var') {
        this.variableName = name;
    }

    execute(_inputs: ExecutionInput, _context: ExecutionContext): ExecutionOutput {
        return { 
            value: this.variableName 
        };
    }

    public setName(name: string): void {
        this.variableName = name;
    }

    public getName(): string {
        return this.variableName;
    }
}