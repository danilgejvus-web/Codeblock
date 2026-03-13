import type { SubGraph, Block } from "../BlockMetadata";
import type { Connection } from "../ExecutableBlock";
import type { ExecutableBlock, ExecutionContext, ExecutionInput, ExecutionOutput } from "../ExecutableBlock";

type Token = { type: 'number'; value: number; }
| { type: 'variable'; name: string}
| { type: 'operator'; operation: string}
| { type: 'parenthesis'; side: '(' | ')'};

export class ExpressionBlock implements ExecutableBlock {
    private expression: string = '';

    execute(inputs: ExecutionInput, context: ExecutionContext): ExecutionOutput {
        const subGraph = context.getSubGraph();
        const input = inputs['in'];

        const stateInputID = subGraph.in.get('in');
        const nextStateOutputID = subGraph.out.get('out');

        const subInputs = new Map<string, any>();
        subInputs.set(stateInputID!, input);

        const subOuts = context.executeSubGraph(subGraph, subInputs, context);
        const result = subOuts.get(nextStateOutputID!);

        return { out: result };
    }

    build(): SubGraph {
        if (!this.expression.trim()) {
            return {blocks: [], connections: [], in: new Map<string, string>(), out: new Map<string, string>()};
        }

        try {
            return this.toGraph(this.toRPN(this.tokenize(this.expression)));
        } catch(error) {
            return {blocks: [], connections: [], in: new Map<string, string>(), out: new Map<string, string>()};
        }
    }

    setExpression(newExpression: string = '') {
        this.expression = newExpression;
    }

    public getExpression(): string {
        return this.expression;
    }

    private tokenize(expression: string): Token[] {
        const regex = /\s*([0-9]+\.?[0-9]*|[a-zA-Z_][a-zA-Z0-9_]*|[+-/*%()])\s*/g
        const tokens: Token[] = [];

        let match;
        while ((match = regex.exec(expression)) !== null) {
            const token = match[1];
            if (/^[0-9]/.test(token)) {
                tokens.push({ type: 'number', value: parseFloat(token) });
            } else if (/^[a-zA-Z_]/.test(token)) {
                tokens.push({ type: 'variable', name: token });
            } else if (/^[+-/*%]$/.test(token)) {
                tokens.push({ type: 'operator', operation: token });
            } else if (/^[\(\)]$/.test(token)) {
                tokens.push({ type: 'parenthesis', side: token as '(' | ')' });
            }
        }

        return tokens;
    }

    private toRPN(tokens: Token[]): (Token & { type: 'number' | 'variable' | 'operator' })[] {
        const precedence: Record<string, number> = { '+': 1, '-': 1, '/': 2, '*': 2, '%': 2};

        const output: (Token & { type: 'number' | 'variable' | 'operator' })[] = [];
        const stack: (Token & { type: 'operator' | 'parenthesis', side?: '(' | ')' })[] = [];

        for (const token of tokens) {
            if (token.type === 'number' || token.type === 'variable') 
            {
                output.push(token);
            } 
            else if (token.type === 'operator') 
            {
                const operation1 = token;

                while (stack.length) {
                    const nextOperation = stack[stack.length - 1];
                    if (nextOperation.type !== 'operator') {
                        break;
                    }
                    const operation2 = nextOperation;

                    if ((precedence[operation1.operation] < precedence[operation2.operation]) || (precedence[operation1.operation] == precedence[operation2.operation])) {
                        output.push(stack.pop()! as Token & { type: 'operator' });
                    } else {
                        break;
                    }
                }
                stack.push(operation1);
            }
            else if (token.type === 'parenthesis') 
            {
                if (token.side === '(')
                {
                    stack.push(token);
                }
                else
                {
                    while (stack.length && stack[stack.length - 1].side !== '(')
                    {
                        output.push(stack.pop()! as Token & { type: 'operator' });
                    }
                    stack.pop();
                }
            }
        }

        while (stack.length)
        {
            output.push(stack.pop()! as Token & { type: 'operator' });
        }

        return output;
    }

    private toGraph(rpn: (Token & { type: 'number' | 'variable' | 'operator' })[]): SubGraph {
        const createBlock = (name: string, type: string, value?: any): Block => ({
            id: Date.now().toString(),
            type: type,
            name: name,
            x: 0,
            y: 0
        });

        const createConnection = (fromBlockID: string, fromSocketID: string, toBlockID: string, toSocketID: string): Connection => ({
            id: `conn_${Date.now()}_${Math.random()}`,
            fromBlockID: fromBlockID,
            fromSocketID: fromSocketID,
            toBlockID: toBlockID,
            toSocketID: toSocketID
        });

        const blocks: Block[] = [];
        const connections: Connection[] = [];
        const stack: string[] = [];
        const inputBlocks: Map<string, string> = new Map();

        for (const token of rpn)
        {
            if (token.type === 'number')
            {
                const constantBlock = createBlock('Constant', 'Constant', { value: token.value });
                blocks.push(constantBlock);
                stack.push(constantBlock.id);
            }
            else if (token.type === 'variable')
            {
                let inputID = inputBlocks.get(token.name);
                if (!inputID) {
                    const readBlock = createBlock('Read', 'Read', { variableName: token.name });
                    blocks.push(readBlock);
                    inputID = readBlock.id;
                    inputBlocks.set(token.name, inputID);
                }
                stack.push(inputID);
            }
            else if (token.type === 'operator')
            {
                const rightID = stack.pop();
                const leftID = stack.pop();
                if (!rightID || !leftID) break;

                let operationType: string;
                switch (token.operation)
                {
                    case '+': operationType = 'Sum'; break;
                    case '-': operationType = 'Sub'; break;
                    case '/': operationType = 'Div'; break;
                    case '*': operationType = 'Mul'; break;
                    case '%': operationType = 'Mod'; break;
                    default: operationType = 'Sum'; break;
                }

                const operationBlock = createBlock(operationType, operationType);
                blocks.push(operationBlock);

                const operationID = operationBlock.id;
                connections.push(
                    createConnection(leftID, 'out', operationID, 'A'),
                    createConnection(rightID, 'out', operationID, 'B')
                );

                stack.push(operationID);
            }
        }

        const lastBlock = blocks.find((bl => bl.id === stack[0]));
        return { blocks: blocks, connections: connections, in: inputBlocks, out: new Map([[lastBlock!.name, lastBlock!.id]]) }
    }

    constructor(expression: string = '') {
        this.expression = expression;
    }
}
