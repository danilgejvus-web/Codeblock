export class BlockVisual {
    name: string;
    executable: BlockExecutable;

    constructor(name: string, executable: BlockExecutable) {
        this.name = name;
        this.executable = executable;
    }
}

export class BlockExecutable {
    next: BlockExecutable;

    constructor(next: BlockExecutable) {
        this.next = next;
    }

    Execute(): void {
        this.next.Execute();
    }
}

export interface IValue {
    AddNew(): void;
}
