import type { ExecutableBlock, ExecutionContext } from "../blocks/ExecutableBlock";
import type { SubGraph } from "../blocks/BlockMetadata";
import { executeSubGraphWithShadow } from "../subInterpreter";

export class LocalExecutionContext implements ExecutionContext {
    private variables: Map<string, any> = new Map();
    private global?: LocalExecutionContext;
    private subGraph?: SubGraph;
    private blockMap: Map<string ,ExecutableBlock>;
    private functionID?: string;

    constructor (blockMap: Map<string, ExecutableBlock>, global?: LocalExecutionContext, subGraph?: SubGraph, functionID?: string) {
        this.blockMap = blockMap;
        this.global = global;
        this.subGraph = subGraph;
        this.functionID = functionID;
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

    getBlock(blockID: string): ExecutableBlock {
        const block = this.blockMap.get(blockID);
        if (!block) {
            throw new Error(`Block with ID ${blockID} not found`);
        }
        return block;
    }

    setSelfFunctionID(id: string): void {
        this.functionID = id;
    }

    getSelfFunctionID(): string {
        if (this.functionID) {
            return this.functionID;
        }
        if (this.global) {
            return this.global.getSelfFunctionID();
        }
        throw new Error('Нет функции в области видимости.');
    }

    getSubGraph(): SubGraph | undefined {
        return this.subGraph;
    }

    newSubContext(subGraph?: SubGraph, functionID?: string): ExecutionContext {
        return new LocalExecutionContext(this.blockMap, this, subGraph, functionID);
    }

    executeSubGraph(subGraph: SubGraph, inputs: Map<string, any>, newContext: LocalExecutionContext): Map<string, any> {
        return executeSubGraphWithShadow(subGraph, inputs, newContext);
    }
}
