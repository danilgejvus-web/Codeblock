import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class NumArrayBlock implements ExecutableBlock {
    private arrayName: string = '';
    private arrayLength: number = 2;

    constructor(name: string = '', length: number = 2) {
        this.arrayName = name;
        this.arrayLength = length;
    }

    public setArrayName(name: string): void {
        this.arrayName = name;
    }

    public getArrayName(): string {
        return this.arrayName;
    }

    public setLength(length: number): void {
        this.arrayLength = length;
    }

    public getLength(): number {
        return this.arrayLength;
    }

    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const outputs: ExecutionOutput = {};
        
        const name = inputs['setName'] !== undefined ? inputs['setName'] : this.arrayName;
        const length = inputs['setLength'] !== undefined ? inputs['setLength'] : this.arrayLength;
        
        if (name && length > 0) {
            const array = new Array(length).fill(0);
            
            context.setVariable(name, array);
            
            outputs['value'] = array;
            outputs['name'] = name;
            
            this.arrayName = name;
            this.arrayLength = length;
        }
        
        return outputs;
    }
}