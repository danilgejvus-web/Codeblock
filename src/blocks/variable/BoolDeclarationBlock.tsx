import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

export class BoolDeclarationBlock implements ExecutableBlock {
    private variableNames: string[] = [];
    private defaultValue: boolean = false;

    constructor(names: string = '') {
        this.setVariableNames(names);
    }

    private setVariableNames(names: string) {
        this.variableNames = names
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }

    public setNames(names: string): void {
        this.setVariableNames(names);
    }

    public getNames(): string[] {
        return this.variableNames;
    }

    public getNamesString(): string {
        return this.variableNames.join(', ');
    }

    execute(_inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const outputs: ExecutionOutput = {};
        
        this.variableNames.forEach((name, index) => {
            const varName = name.trim();
            if (varName) {
                context.setVariable(varName, this.defaultValue);
                outputs[`out${index + 1}`] = varName;
            }
        });

        return outputs;
    }

    public getVariableCount(): number {
        return this.variableNames.length;
    }
}