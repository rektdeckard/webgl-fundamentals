import { Random } from "kdim";
import { Example } from "@/types";
import { glsl } from "@/utils";

let shapeCount = 50;
let frameDelay = 400;

// Fills the buffer with the values that define a rectangle.
function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

export default new Example({
  title: "Summary",
  ref: "https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html",
  tweaks: {
    count: {
      name: "count",
      type: "range",
      min: (1).toString(),
      max: (100).toString(),
      value: shapeCount.toString(),
      onInput: (e) => {
        shapeCount = (e.target as HTMLInputElement).valueAsNumber;
      },
    },
    interval: {
      name: "interval",
      type: "range",
      min: (10).toString(),
      max: (1000).toString(),
      value: frameDelay.toString(),
      onInput: (e) => {
        frameDelay = (e.target as HTMLInputElement).valueAsNumber;
      },
    },
  },
  vertexSource: glsl`\
    attribute vec2 a_position;
    uniform vec2 u_resolution;
  
    void main() {
      // convert the position from pixels to 0.0 to 1.0
      vec2 zeroToOne = a_position / u_resolution;
  
      // convert from 0->1 to 0->2
      vec2 zeroToTwo = zeroToOne * 2.0;
  
      // convert from 0->2 to -1->+1 (clip space)
      vec2 clipSpace = zeroToTwo - 1.0;
  
      // NOTE: we flip the clip space y coordinate here
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
  `,
  fragmentSource: glsl`\
    precision mediump float;
    uniform vec4 u_color;
  
    void main() {
      // NOTE: our colors are now settable by a uniform
      gl_FragColor = u_color;
    }\
  `,
  setup: (gl, program) => {
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    return { colorUniformLocation };
  },
  loop: (gl, _program, { colorUniformLocation }) => {
    for (let i = 0; i < shapeCount; i++) {
      const width = Random.natural(400);
      const height = Random.natural(300);

      // Setup a random rectangle
      // This will write to positionBuffer because
      // its the last thing we bound on the ARRAY_BUFFER
      // bind point
      setRectangle(
        gl,
        Random.integer({ min: 0, max: Math.max(0, gl.canvas.width - width) }),
        Random.integer({ min: 0, max: Math.max(0, gl.canvas.height - height) }),
        width,
        height
      );

      // Set a random color.
      gl.uniform4f(
        colorUniformLocation,
        Math.random(),
        Math.random(),
        Math.random(),
        1
      );

      // Draw the rectangle.
      const primitiveType = gl.TRIANGLES;
      const count = 6;
      gl.drawArrays(primitiveType, 0, count);
    }

    return frameDelay;
  },
});
