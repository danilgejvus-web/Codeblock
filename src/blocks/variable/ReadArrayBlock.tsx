import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class ReadArrayBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const outputs: ExecutionOutput = {};
        
        if (inputs['getName'] !== undefined && inputs['getIndex'] !== undefined) {
            const name = inputs['getName'];
            const index = inputs['getIndex'];
            
            const array = context.getVariable(name);
            if (!array || !Array.isArray(array)) {
                throw new Error('ReadArray был вызван для несуществующего массива.');
            }
            
            if (array && Array.isArray(array) && index >= 0 && index < array.length) {
                outputs['value'] = array[index];
            }
        }
        
        return outputs;
    }
}
