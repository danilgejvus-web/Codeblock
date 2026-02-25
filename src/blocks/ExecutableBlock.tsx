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

export interface ExecutableBlock {
    execute(inputs: ExecutionInput): ExecutionOutput;
}
