import type { ExecutableBlock, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class WriteBlock implements ExecutableBlock {
    private variableName: string;

    constructor(name: string = 'var') {
        this.variableName = name;
    }

    execute(inputs: ExecutionInput, context: { setVariable: (name: string, value: any) => void }): ExecutionOutput {
        if (inputs['set'] !== undefined) {
            context.setVariable(this.variableName, inputs['set']);
            return { value: inputs['set'] };
        }

        return {};
    }
}
