import type { IValue } from "./BlockClasses";
import { ArithmeticOperation } from "./ArithmeticOperation";
import { IntegerVariableStorage } from "./IntegerVariableStorage";
import { Number } from "./Variables";

export class AddOperation extends ArithmeticOperation{
    left: IValue | string;
    right: IValue | string;

    constructor(name: string, left: IValue | string, right: IValue | string) {
        super(name);
        this.left = left;
        this.right = right;
    }

    Calculate(storage: IntegerVariableStorage): number {
        const leftVal = this.getValue(this.left, storage);
        const rightVal = this.getValue(this.right, storage);
        const result = leftVal + rightVal;
        
        console.log("Вычисление ${this.name}: ${leftVal} + ${rightVal} = ${result}");
        return result;
    }

    private getValue(source: IValue | string, storage: IntegerVariableStorage): number {
        if (typeof source === 'string') {
            return storage.getVariable(source);
        } else if (source instanceof Number) {
            return source.value;
        }
        return 0;
    }
}
