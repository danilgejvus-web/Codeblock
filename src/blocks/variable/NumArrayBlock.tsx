import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class NumArrayBlock implements ExecutableBlock {
    private storage: Array<number>;
    private length: number;

    constructor(length: number = 2) {
        this.length = length;
        this.storage = new Array<number>(length);
    }

    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        if (inputs['setName'] !== undefined) {
            this.length = inputs['setLength'];

            this.storage = new Array<number>(this.length);
            this.storage.fill(0);
            
            context.setVariable(inputs['setName'], this.storage);
        }

        return { value: this.storage }
    }
}
