import type { SubGraph } from "./BlockMetadata";

export interface Connection {
    id: string;
    fromBlockID: string;
    fromSocketID: string;
    toBlockID: string;
    toSocketID: string;
}

export interface ExecutionInput {
    [socketID: string]: any;
}

export interface ExecutionOutput {
    [socketID: string]: any;
}

export interface ExecutionContext {
    getVariable(name: string): any;
    setVariable(name: string, value: any): void;
    setVariable(name: string, index: number, value: any): void;
    getSubGraph(): SubGraph;
    newSubContext(): ExecutionContext;
    executeSubGraph(subGraph: SubGraph, inputs: Map<string, any>, newContext: ExecutionContext): Map<string, any>;
}

export interface ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput;
}
