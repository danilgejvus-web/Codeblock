import type { Connection, ExecutableBlock } from "./ExecutableBlock";

export interface Socket {
    id: string;
    type: "input" | "output";
    name?: string;
}

export interface Block {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  instance?: ExecutableBlock;
  subGraph?: SubGraph;
}

export interface BlockInfo {
    name: string;
    class: new () => ExecutableBlock;
    sockets: Socket[];
}

export interface SubGraph {
    blocks: Block[];
    connections: Connection[];
    in: Map<string, string>;
    out: Map<string, string>;
}
