import type { IValue } from './BlockClasses';

export class Number implements IValue {
    name: string;
    value: number;

    constructor(name: string, value: number) {
        this.name = name;
        this.value = value;
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

    AddNew(): void {

    }
}
