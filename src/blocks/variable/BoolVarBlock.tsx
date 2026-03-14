import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class BoolBlock implements ExecutableBlock {
    private storage: boolean;

    constructor(initValue: boolean = false) {
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
