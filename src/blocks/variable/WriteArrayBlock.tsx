import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class WriteArrayBlock implements ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const outputs: ExecutionOutput = {};
        
        if (inputs['setName'] !== undefined && 
            inputs['setIndex'] !== undefined && 
            inputs['setValue'] !== undefined) {
            
            const name = inputs['setName'];
            const index = inputs['setIndex'];
            const value = inputs['setValue'];
            
            const array = context.getVariable(name);
            
            if (array && Array.isArray(array) && index >= 0 && index < array.length) {
                array[index] = value;
                
                context.setVariable(name, array);
                
                outputs['value'] = value;
                outputs['array'] = array;
            }
        }
        
        return outputs;
    }
}
