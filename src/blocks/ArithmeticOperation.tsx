import type { IValue } from './BlockClasses';
import { IntegerVariableStorage } from './IntegerVariableStorage';

export abstract class ArithmeticOperation implements IValue {
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    abstract Calculate(storage: IntegerVariableStorage): number;
    
    AddNew(): void {}
}
