import type { BlockInfo } from "./BlockMetadata";
import { DivBlock } from "./arithmetic/DivBlock";
import { MulBlock } from "./arithmetic/MulBlock";
import { SubBlock } from "./arithmetic/SubBlock";
import { SumBlock } from "./arithmetic/SumBlock";
import { EndIfBlock } from "./logic/EndIfBlock";
import { IfBlock } from "./logic/IfBlock";
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
            {id: "true", type: "output", name: "ConditionalBranch1"},
            {id: "false", type: "output", name: "ConditionalBranch2"}
        ]
    },
    EndIf: {
        name: "EndIf",
        class: EndIfBlock,
        sockets: [
            {id: "in1", type: "input", name: "Branch1"},
            {id: "in2", type: "input", name: "Branch2"},
            {id: "out", type: "output", name: "Merged"},
        ]
    }
}
