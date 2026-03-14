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
import { BoolBlock } from "./variable/BoolVarBlock";
import { NumArrayBlock } from "./variable/NumArrayBlock";
import { NumBlock } from "./variable/NumBlock";
import { ReadArrayBlock } from "./variable/ReadArrayBlock";
import { ReadBlock } from "./variable/ReadBlock";
import { WriteArrayBlock } from "./variable/WriteArrayBlock";
import { WriteBlock } from "./variable/WriteBlock";
import { StringConstantBlock } from "./variable/StringConstantBlock";
import { NumberConstantBlock } from "./variable/NumberConstantBlock";
import { StringBlock } from "./variable/StringBlock";
import { NumDeclarationBlock } from "./variable/NumDeclarationBlock";
import { BooleanConstantBlock } from "./variable/BooleanConstantBlock";
import { BoolDeclarationBlock } from "./variable/BoolDeclarationBlock";
import { StringDeclarationBlock } from "./variable/StringDeclarationBlock";
import { ForBlock } from "./logic/ForBlock";
import { ForEachBlock } from "./logic/ForEachBlock";
import { FunctionBlock } from "./function/FunctionBlock";
import { SelfBlock } from "./function/SelfBlock";
import { CallBlock } from "./function/CallBlock";
import { StringCastBlock } from "./typecasting/StringCastBlock";
import { NumCastBlock } from "./typecasting/NumCastBlock";
import { BooleanCastBlock } from "./typecasting/BooleanCastBlock";
import { ArrayCastBlock } from "./typecasting/ArrayCastBlock";

export const blockRegistry: Record<string, BlockInfo> = {
    DeclarationNum: {
        name: "NumDecl",
        class: NumDeclarationBlock,
        sockets: []
    },
    BoolDeclaration: {
        name: "BoolDecl",
        class: BoolDeclarationBlock,
        sockets: []
    },
    StringDeclaration: {
        name: "StringDecl",
        class: StringDeclarationBlock,
        sockets: []
    },
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
        name: "NumVar",
        class: NumBlock,
        sockets: [
            {id: "set", type: "input", name: "setVal"},
            {id: "setName", type: "input", name: "setName"},
            {id: "out", type: "output", name: "val"}
        ]
    },
    Read: {
        name: "Read",
        class: ReadBlock,
        sockets: [
            {id: "in1", type: "input", name: "VariableName"},
            {id: "dependency", type: "input", name: "Dependency"},
            {id: "out", type: "output", name: "value"},
            {id: "completed", type: "output", name: "Completed"}
        ]
    },
    Write: {
        name: "Write",
        class: WriteBlock,
        sockets: [
            {id: "set", type: "input", name: "SetValue"},
            {id: "setName", type: "input", name: "VariableName"},
            {id: "dependency", type: "input", name: "Dependency"},
            {id: "out", type: "output", name: "value"},
            {id: "completed", type: "output", name: "Completed"}
        ]
    },
    String: {
        name: "String",
        class: StringConstantBlock,
        sockets: [
            {id: "value", type: "output", name: "str" }
        ]
    },
    NumberConstant: {
        name: "Number",
        class: NumberConstantBlock,
        sockets: [
            {id: "value", type: "output", name: "val" }
        ]
    },
    BooleanConstant: {
        name: "Boolean",
        class: BooleanConstantBlock,
        sockets: [
            {id: "value", type: "output", name: "val" }
        ]
    },
    If: {
        name: "If",
        class: IfBlock,
        sockets: [
            {id: "bool", type: "input", name: "con"},
            {id: "passInput", type: "input", name: "passInput"},
            {id: "true", type: "output", name: "true"},
            {id: "false", type: "output", name: "false"}
        ]
    },
    EndIf: {
        name: "EndIf",
        class: EndIfBlock,
        sockets: [
            {id: "in1", type: "input", name: "branchA"},
            {id: "in2", type: "input", name: "branchB"},
            {id: "out", type: "output", name: "merge"},
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
        name: "BoolVar",
        class: BoolBlock,
        sockets: [
            {id: "set", type: "input", name: "setVal"},
            {id: "setName", type: "input", name: "setName"},
            {id: "out", type: "output", name: "val"}
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
            {id: "in", type: "input", name: "in"},
            {id: "continue", type: "output", name: "(internal)Continue"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    NumArray: {
        name: "NumArray",
        class: NumArrayBlock,
        sockets: [
            {id: "setName", type: "input", name: "name" },
            {id: "setLength", type: "input", name: "len" },
            {id: "value", type: "output", name: "array" },
            {id: "name", type: "output", name: "arrayName" }
        ]
    },
    ReadArray: {
        name: "ReadArray",
        class: ReadArrayBlock,
        sockets: [
            {id: "getName", type: "input", name: "name" },
            {id: "getIndex", type: "input", name: "index" },
            {id: "value", type: "output", name: "value" }
        ]
    },
    WriteArray: {
        name: "WriteArray",
        class: WriteArrayBlock,
        sockets: [
            {id: "setName", type: "input", name: "name" },
            {id: "setIndex", type: "input", name: "index" },
            {id: "setValue", type: "input", name: "value" },
            {id: "value", type: "output", name: "written" },
            {id: "array", type: "output", name: "name" }
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
        name: "StringVar",
        class: StringBlock,
        sockets: [
            {id: "set", type: "input", name: "setVal"},
            {id: "setName", type: "input", name: "setName"},
            {id: "out", type: "output", name: "val"}
        ]
    },
    For: {
        name: "For",
        class: ForBlock,
        sockets: [
            {id: "in", type: "input", name: "in"},
            {id: "out", type: "output", name: "out"},
            {id: "continue", type: "output", name: "(internal)Continue"}
        ]
    },
    ForEach: {
        name: "ForEach",
        class: ForEachBlock,
        sockets: [
            {id: "arrayName", type: "input", name: "ArrayName"},
            {id: "in", type: "input", name: "in"},
            {id: "index", type: "input", name: "(internal)Index"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    FunctionCreation: {
        name: "Function",
        class: FunctionBlock,
        sockets: [
            {id: "id", type: "output", name: "ID"}
        ]
    },
    Self: {
        name: "Self",
        class: SelfBlock,
        sockets: [
            {id: "id", type: "output", name: "ID"}
        ]
    },
    Call: {
        name: "Call",
        class: CallBlock,
        sockets: [
            {id: "to", type: "input", name: "To"},
            {id: "args", type: "input", name: "Args"},
            {id: "out", type: "output", name: "Out"}
        ]
    },
    StringCast: {
        name: "StringCast",
        class: StringCastBlock,
        sockets: [
            {id: "in", type: "input", name: "in"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    NumCast: {
        name: "NumCast",
        class: NumCastBlock,
        sockets: [
            {id: "in", type: "input", name: "in"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    BooleanCast: {
        name: "BooleanCast",
        class: BooleanCastBlock,
        sockets: [
            {id: "in", type: "input", name: "in"},
            {id: "out", type: "output", name: "out"}
        ]
    },
    ArrayCast: {
        name: "ArrayCast",
        class: ArrayCastBlock,
        sockets: [
            {id: "in", type: "input", name: "in"},
            {id: "out", type: "output", name: "out"}
        ]
    }
}
