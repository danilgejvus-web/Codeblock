export class BlockVisual {
    id: number;
    name: string;
    inputField: boolean;
    inputNode: boolean;
    outputField: boolean;
    outputNode: boolean;

    constructor(id: number, name: string, inputField: boolean, inputNode: boolean, outputField: boolean, outputNode: boolean) {
        this.id = id;
        this.name = name;
        this.inputField = inputField;
        this.inputNode = inputNode;
        this.outputField = outputField;
        this.outputNode = outputNode;
    }
}

export class BlockExecutable {
    id: number;
    next: BlockExecutable;

    constructor(id: number, next: BlockExecutable) {
        this.id = id;
        this.next = next;
    }

    function Execute(): void {
        this.next.Execute();
    }
}
