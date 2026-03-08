import type { BlockInfo } from "./BlockMetadata";
import { DivBlock } from "./arithmetic/DivBlock";
import { MulBlock } from "./arithmetic/MulBlock";
import { SubBlock } from "./arithmetic/SubBlock";
import { SumBlock } from "./arithmetic/SumBlock";
import { EndIfBlock } from "./logic/EndIfBlock";
import { EqualBlock } from "./logic/EqualBlock";
import { GreaterBlock } from "./logic/GreaterBlock";
import { GreaterEqualBlock } from "./logic/GreaterEqualBlock";
import { IfBlock } from "./logic/IfBlock";
import { LessBlock } from "./logic/LessBlock";
import { LessEqualBlock } from "./logic/LessEqualBlock";
import { BoolBlock } from "./variable/BoolBlock";
import { NumBlock } from "./variable/NumBlock";
import { ReadBlock } from "./variable/ReadBlock";
import { WriteBlock } from "./variable/WriteBlock";

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
    Bool: {
        name: "Bool",
        class: BoolBlock,
        sockets: [
            {id: "set", type: "input", name: "SetValue"},
            {id: "setName", type: "input", name: "SetName"},
            {id: "out", type: "output", name: "value"}
        ]
    }
}
