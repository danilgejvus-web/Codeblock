import type { ExecutableBlock, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class WriteArrayBlock implements ExecutableBlock {
    private variableName: string;
    private index: number;

    constructor(name: string = 'var', index: number = 0) {
        this.variableName = name;
        this.index = index;
    }

    execute(inputs: ExecutionInput, context: { setVariable: (name: string, index: number, value: any) => void }): ExecutionOutput {
        if (inputs['set'] !== undefined && inputs['setName'] !== undefined) {
            this.variableName = inputs['setName'];
            this.index = inputs['index'];
            context.setVariable(this.variableName, this.index, inputs['set']);
        }

        return { value: inputs['set'], completed: true };
    }
}
