import type { BlockInfo } from "./BlockMetadata";
import { SumBlock } from "./arithmetic/SumBlock";

export const blockRegistry: Record<string, BlockInfo> = {
    Sum: {
        name: "Sum",
        class: SumBlock,
        sockets: [
            {id: "in1", type: "input", name: "A"},
            {id: "in2", type: "input", name: "B"},
            {id: "out", type: "output", name: "out"}
        ]
    }
}
