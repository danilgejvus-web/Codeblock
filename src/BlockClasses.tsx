export class BlockVisual {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class BlockExecutable {
    id: number;
    next: BlockExecutable;

    constructor(id: number, next: BlockExecutable) {
        this.id = id;
        this.next = next;
    }

    Execute(): void {
        return this.next.Execute();
    }
}
