export class IntegerVariableStorage {
    private storage: Map<string, number> = new Map();
    
    pushVariable(name: string, value: number): void {
        this.storage.set(name, value);
        console.log(`[${name} = ${value}]`);
    }
    
    getVariable(name: string): number {
        return this.storage.get(name) || 0;
    }
    
    has(name: string): boolean {
        return this.storage.has(name);
    }
}
