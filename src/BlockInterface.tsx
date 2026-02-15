export interface IBlockVisual {
    id: number;
    name: string;
    inputField: boolean;
    inputNode: boolean;
    outputField: boolean;
    outputNode: boolean;
}

export interface IBlockExecutable {
    id: number;
    method: Function;
    next: IBlockExecutable;
}
