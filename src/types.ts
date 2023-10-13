export type Section = {
  title: string;
  examples?: Example[];
  sections?: Section[];
};

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type Tweak = Partial<Writeable<HTMLInputElement>> & {
  onInput: (e: HTMLElementEventMap["change"]) => void;
};

export type Args<Data> = {
  title: string;
  ref: string;
  vertexSource: string;
  fragmentSource: string;
  setup: (gl: WebGLRenderingContext, program: WebGLProgram) => Data;
  loop?: (
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    data: Data
  ) => number | void;
  tweaks?: {
    [name: string]: Tweak;
  };
};

export class Example<Data = any> {
  title: string;
  ref: string;
  vertexSource: string;
  fragmentSource: string;
  setup: (gl: WebGLRenderingContext, program: WebGLProgram) => Data;
  loop?: (
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    data: Data
  ) => number | void;
  tweaks?: {
    [name: string]: Tweak;
  };

  constructor(args: Args<Data>) {
    this.title = args.title;
    this.ref = args.ref;
    this.vertexSource = args.vertexSource;
    this.fragmentSource = args.fragmentSource;
    this.setup = args.setup;
    this.loop = args.loop;
    this.tweaks = args.tweaks;
  }
}
