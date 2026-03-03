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
}

export interface ExecutableBlock {
    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput;
}
