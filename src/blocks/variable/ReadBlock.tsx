import type { ExecutableBlock, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ReadBlock implements ExecutableBlock {
    private variableName: string;

    constructor(name: string = 'var') {
        this.variableName = name;
    }

    execute(inputs: ExecutionInput, context: { getVariable: (name: string) => any }): ExecutionOutput {
        if (inputs['in1'] !== undefined) {
            this.variableName = inputs['in1'];
            const value = context.getVariable(this.variableName);
            return { value: value, completed: true };
        }

        return { completed: true };
    }
}
