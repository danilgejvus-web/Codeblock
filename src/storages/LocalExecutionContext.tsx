import type { ExecutionContext } from "../blocks/ExecutableBlock";
import type { SubGraph } from "../blocks/BlockMetadata";
import { executeSubGraphWithShadow } from "../subInterpreter";

export class LocalExecutionContext implements ExecutionContext {
    private variables: Map<string, any> = new Map();
    private global?: LocalExecutionContext;
    private subGraph?: SubGraph;

    constructor (global?: LocalExecutionContext, subGraph?: SubGraph) {
        this.global = global;
        this.subGraph = subGraph;
    }

    getVariable(name: string): any {
        if (this.variables.has(name)) return this.variables.get(name);
        return this.global?.getVariable(name);
    }

    setVariable(name: string, value: any): void;
    setVariable(name: string, index: number, value: any): void;
    setVariable(name: string, index?: number, value?: any): void {
        if (index !== undefined) {
            let array = this.getVariable(name);
            if (!Array.isArray(array))
            {
                array = [];
                this.setVariable(name, array);
            }
            array[index] = value;
        } else {
            this.variables.set(name, value);
        }
    }

    getSubGraph(): SubGraph | undefined {
        return this.subGraph;
    }

    newSubContext(subGraph?: SubGraph): ExecutionContext {
        return new LocalExecutionContext(this, subGraph);
    }

    executeSubGraph(subGraph: SubGraph, inputs: Map<string, any>, newContext: LocalExecutionContext): Map<string, any> {
        return executeSubGraphWithShadow(subGraph, inputs, newContext);
    }
}
