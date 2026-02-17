import type { IValue } from './BlockClasses';

export class IntegerVar implements IValue {
    name: string;
    private value: number;

    constructor(name: string, value: number = 0) {
        this.name = name;
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    setValue(value: number): void {
        this.value = value;
    }

    AddNew(): void {}
}

export class Boolean implements IValue {
    name: string;
    value: boolean;

    constructor(name: string, value: boolean = false) {
        this.name = name;
        this.value = value;
    }

    getValue(): boolean {
        return this.value;
    }

    setValue(value: boolean): void {
        this.value = value;
    }

    AddNew(): void {
    }
}
