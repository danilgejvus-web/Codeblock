import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class SelfBlock implements ExecutableBlock {
    execute(_inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const selfID = context.getSelfFunctionID();
        return { out: selfID };
    }
}
