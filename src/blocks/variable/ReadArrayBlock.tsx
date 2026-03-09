import type { ExecutableBlock, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ReadArrayBlock implements ExecutableBlock {
    private variableName: string;
    private index: number;

    constructor(name: string = 'var', index: number = 0) {
        this.variableName = name;
        this.index = index;
    }

    execute(inputs: ExecutionInput, context: { getVariable: (name: string) => any }): ExecutionOutput {
        if (inputs['in1'] !== undefined) {
            this.variableName = inputs['in1'];
            this.index = inputs['in2'];
            const value = context.getVariable(this.variableName)[this.index];
            return { value: value };
        }

        return {};
    }
}
