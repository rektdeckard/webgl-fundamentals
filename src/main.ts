import hljs from "highlight.js/lib/core";
import glsl from "highlight.js/lib/languages/glsl";
import "highlight.js/styles/a11y-dark.css";

import {
  createShader,
  createProgram,
  resizeCanvasToDisplaySize,
} from "./utils";
import { Example, Section } from "./types";
import exercises from "./exercises";
import "./main.css";

let pendingAnimation: number;
let pendingTimeout: NodeJS.Timeout;

main();

function main() {
  hljs.registerLanguage("glsl", glsl);

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl");

  if (!gl) {
    throw new Error("Could not find canvas");
  }

  const list = document.getElementById("toc") as HTMLOListElement;
  createIndex(list, exercises, gl, canvas);

  selectExample(gl, canvas, exercises[0].sections![0].examples![0]);

  window.addEventListener("resize", () =>
    resizeCanvasToDisplaySize(gl, canvas)
  );
}

function selectExample(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  example: Example
) {
  const title = document.getElementById("title") as HTMLHeadingElement;
  title.innerText = example.title;

  const vSource = document.getElementById("vsource") as HTMLPreElement;
  vSource.innerHTML = hljs.highlight(example.vertexSource, {
    language: "glsl",
  }).value;

  const fSource = document.getElementById("fsource") as HTMLPreElement;
  fSource.innerHTML = hljs.highlight(example.fragmentSource, {
    language: "glsl",
  }).value;

  createTweaks(example);
  runExample(gl, canvas, example);
}

function runExample(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  example: Example
) {
  cancelAnimationFrame(pendingAnimation);
  clearTimeout(pendingTimeout);

  resizeCanvasToDisplaySize(gl, canvas);

  const vs = createShader(gl, gl.VERTEX_SHADER, example.vertexSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, example.fragmentSource);
  const program = createProgram(gl, vs, fs);

  const data = example.setup?.(gl, program);

  if (example.loop) {
    (function iter() {
      resizeCanvasToDisplaySize(gl, canvas);
      const delay = example.loop!(gl, program, data);

      if (delay && (delay as number) > 0) {
        pendingTimeout = setTimeout(iter, delay as number);
      } else {
        pendingAnimation = requestAnimationFrame(iter);
      }
    })();
  }
}

function createTweaks(example: Example) {
  const pane = document.getElementById("tweaks") as HTMLDivElement;
  pane.textContent = "";

  if (!example.tweaks) {
    pane.style.display = "none";
    return;
  }

  pane.style.display = "grid";

  for (const [name, attrs] of Object.entries(example.tweaks!)) {
    const label = document.createElement("label");
    label.innerText = name;
    label.htmlFor = name;
    pane.appendChild(label);

    const input = document.createElement("input");
    const { onInput, ...rest } = attrs;

    for (const [prop, val] of Object.entries(rest)) {
      if (!val) continue;
      input.setAttribute(prop, val as string);
    }

    pane.appendChild(input);

    const val = document.createElement("code");
    if (attrs.type === "range") {
      val.innerText = input.value;
      input.addEventListener("input", (e) => {
        val.innerText = (e.target as HTMLInputElement).value;
        attrs.onInput(e);
      });
      pane.appendChild(val);
    } else {
      input.addEventListener("input", attrs.onInput);
    }
  }
}

function createIndex(
  list: HTMLOListElement,
  sections: Section[],
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
) {
  for (const section of sections) {
    const title = document.createElement("li");
    title.innerText = section.title;
    list.appendChild(title);

    if (section.examples) {
      const sublist = document.createElement("ol");

      for (const example of section.examples) {
        const item = document.createElement("li");
        const btn = document.createElement("button");

        btn.innerText = example.title;
        btn.addEventListener("click", () => selectExample(gl, canvas, example));

        item.appendChild(btn);
        sublist.appendChild(item);
      }

      list.appendChild(sublist);
    }

    if (section.sections) {
      const sublist = document.createElement("ol");
      createIndex(sublist, section.sections, gl, canvas);
      list.append(sublist);
    }
  }
}
