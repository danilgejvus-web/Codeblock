import type { ExecutableBlock } from "./ExecutableBlock";

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
}

export interface BlockInfo {
    name: string;
    class: new () => ExecutableBlock;
    sockets: Socket[];
}
