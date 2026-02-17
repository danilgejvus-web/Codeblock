import type { IValue } from "./BlockClasses";

export class IntegerNumber implements IValue {
    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    AddNew(): void {}
}