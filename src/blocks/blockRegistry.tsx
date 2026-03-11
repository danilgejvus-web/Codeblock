import type { BlockInfo } from "./BlockMetadata";
import { DivBlock } from "./arithmetic/DivBlock";
import { ExpressionBlock } from "./arithmetic/ExpressionBlock";
import { ModBlock } from "./arithmetic/ModBlock";
import { MulBlock } from "./arithmetic/MulBlock";
import { SubBlock } from "./arithmetic/SubBlock";
import { SumBlock } from "./arithmetic/SumBlock";
import { AndBlock } from "./logic/AndBlock";
import { EndIfBlock } from "./logic/EndIfBlock";
import { EqualBlock } from "./logic/EqualBlock";
import { GreaterBlock } from "./logic/GreaterBlock";
import { GreaterEqualBlock } from "./logic/GreaterEqualBlock";
import { IfBlock } from "./logic/IfBlock";
import { LessBlock } from "./logic/LessBlock";
import { LessEqualBlock } from "./logic/LessEqualBlock";
import { NotBlock } from "./logic/NotBlock";
import { NotEqualBlock } from "./logic/NotEqualBlock";
import { OrBlock } from "./logic/OrBlock";
import { WhileBlock } from "./logic/WhileBlock";
import { BoolBlock } from "./variable/BoolBlock";
import { NumArrayBlock } from "./variable/NumArrayBlock";
import { NumBlock } from "./variable/NumBlock";
import { ReadArrayBlock } from "./variable/ReadArrayBlock";
import { ReadBlock } from "./variable/ReadBlock";
import { WriteArrayBlock } from "./variable/WriteArrayBlock";
import { WriteBlock } from "./variable/WriteBlock";
import { NameBlock } from "./variable/NameBlock";
import { NumberConstantBlock } from "./variable/NumberConstantBlock";
import { StringBlock } from "./variable/StringBlock";

export const blockRegistry: Record<string, BlockInfo> = {
    Sum: {
        name: "Sum",
        class: SumBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Sub: {
        name: "Sub",
        class: SubBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Mul: {
        name: "Mul",
        class: MulBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Div: {
        name: "Div",
        class: DivBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Mod: {
        name: "Mod",
        class: ModBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Num: {
        name: "Num",
        class: NumBlock,
        sockets: [
            {id: "set", type: "input", name: "SetValue"},
            {id: "setName", type: "input", name: "SetName"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    Read: {
        name: "Read",
        class: ReadBlock,
        sockets: [
            {id: "in1", type: "input", name: "VariableName"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    Write: {
        name: "Write",
        class: WriteBlock,
        sockets: [
            {id: "set", type: "input", name: "SetValue"},
            {id: "setName", type: "input", name: "VariableName"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    Name: {
        name: "Name",
        class: NameBlock,
        sockets: [
            { id: "value", type: "output", name: "Name" }
        ]
    },
    NumberConstant: {
        name: "NumberConstant",
        class: NumberConstantBlock,
        sockets: [
            { id: "value", type: "output", name: "Value" }
        ]
    },
    If: {
        name: "If",
        class: IfBlock,
        sockets: [
            {id: "bool", type: "input", name: "Condition"},
            {id: "passInput", type: "input", name: "PassInput"},
            {id: "true", type: "output", name: "True"},
            {id: "false", type: "output", name: "False"}
        ]
    },
    EndIf: {
        name: "EndIf",
        class: EndIfBlock,
        sockets: [
            {id: "in1", type: "input", name: "BranchA"},
            {id: "in2", type: "input", name: "BranchB"},
            {id: "out", type: "output", name: "Merged"},
        ]
    },
    Equal: {
        name: "Equal",
        class: EqualBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Less: {
        name: "Less",
        class: LessBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Greater: {
        name: "Greater",
        class: GreaterBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    LessEqual: {
        name: "LessEqual",
        class: LessEqualBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    GreaterEqual: {
        name: "GreaterEqual",
        class: GreaterEqualBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    NotEqual: {
        name: "NotEqual",
        class: NotEqualBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Bool: {
        name: "Bool",
        class: BoolBlock,
        sockets: [
            {id: "set", type: "input", name: "SetValue"},
            {id: "setName", type: "input", name: "SetName"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    And: {
        name: "And",
        class: AndBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Or: {
        name: "Or",
        class: OrBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    Not: {
        name: "Not",
        class: NotBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    While: {
        name: "While",
        class: WhileBlock,
        sockets: [
            {id: "in", type: "input", name: "In"},
            {id: "condition", type: "input", name: "Condition"},
            {id: "out", type: "output", name: "Out"}
        ]
    },
    NumArray: {
    name: "NumArray",
        class: NumArrayBlock,
        sockets: [
            {id: "setName", type: "input", name: "SetName"},
            {id: "setLength", type: "input", name: "SetLength"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    ReadArray: {
        name: "ReadArray",
        class: ReadArrayBlock,
        sockets: [
            {id: "in1", type: "input", name: "ArrayName"},
            {id: "in2", type: "input", name: "ArrayIndex"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    WriteArray: {
        name: "WriteArray",
        class: WriteArrayBlock,
        sockets: [
            {id: "setName", type: "input", name: "ArrayName"},
            {id: "setLength", type: "input", name: "ArrayLength"},
            {id: "out", type: "output", name: "value"}
        ]
    },
    Expression: {
        name: "Expression",
        class: ExpressionBlock,
        sockets: [
            {id: "out", type: "output", name: "out"}
        ]
    },
    Str: {
        name: "String",
        class: StringBlock,
        sockets: [
            {id: "set", type: "input", name: "SetValue"},
            {id: "setName", type: "input", name: "SetName"},
            {id: "out", type: "output", name: "value"}
        ]
    }
}
