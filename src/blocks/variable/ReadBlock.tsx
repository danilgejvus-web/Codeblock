import type { ExecutableBlock, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ReadBlock implements ExecutableBlock {
    private variableName: string;

    constructor(name: string = 'var') {
        this.variableName = name;
    }

    execute(_inputs: ExecutionInput, context: { getVariable: (name: string) => any }): ExecutionOutput {
        const value = context.getVariable(this.variableName);
        return { value: value };
    }
}
