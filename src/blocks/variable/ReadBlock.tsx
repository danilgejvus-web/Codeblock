import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ReadBlock implements ExecutableBlock {
    private variableName: string;

    constructor(name: string = 'var') {
        this.variableName = name;
    }

    execute(inputs: ExecutionInput, context: ExecutionContext ): ExecutionOutput {
        if (inputs['in1'] !== undefined) {
            this.variableName = inputs['in1'];
            const value = context.getVariable(this.variableName);
            return { value: value, completed: true };
        }

        return { completed: true };
    }
}
