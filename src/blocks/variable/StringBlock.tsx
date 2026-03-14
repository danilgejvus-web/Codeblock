import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class StringBlock implements ExecutableBlock {
    private storage: string;

    constructor(initValue: string = '') {
        this.storage = initValue;
    }

    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        if (inputs['set'] !== undefined && inputs['setName'] !== undefined) {
            this.storage = inputs['set'];
            context.setVariable(inputs['setName'], this.storage);
        }

        return { value: this.storage }
    }
}
