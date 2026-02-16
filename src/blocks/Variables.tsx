import type { IValue } from './BlockClasses';

export class IntegerVar implements IValue {
    name: string;
    value: number;

    constructor(name: string, value: number) {
        this.name = name;
        this.value = value;
    }

    getValue(): number | boolean {
        return this.value;
    }

    AddNew(): void {
    }
}

export class Boolean implements IValue {
    name: string;
    value: boolean;

    constructor(name: string, value: boolean) {
        this.name = name;
        this.value = value;
    }

    getValue(): number | boolean {
        return this.value;
    }

    AddNew(): void {
    }
}
