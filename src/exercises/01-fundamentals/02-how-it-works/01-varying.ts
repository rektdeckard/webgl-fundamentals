import { Example } from "@/types";
import { glsl } from "@/utils";

let angleInRadians = 0;
const translation = [100, 150];
const scale = [1, 1];
const color = [Math.random(), Math.random(), Math.random(), 1];

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, -100, 150, 125, -175, 100]),
    gl.STATIC_DRAW
  );
}

const m3 = {
  projection: function (width: number, height: number) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
  },

  identity: function () {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  },

  translation: function (tx: number, ty: number) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  rotation: function (angleInRadians: number) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  },

  scaling: function (sx: number, sy: number) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  multiply: function (a: number[], b: number[]) {
    const a00 = a[0 * 3 + 0];
    const a01 = a[0 * 3 + 1];
    const a02 = a[0 * 3 + 2];
    const a10 = a[1 * 3 + 0];
    const a11 = a[1 * 3 + 1];
    const a12 = a[1 * 3 + 2];
    const a20 = a[2 * 3 + 0];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0 * 3 + 0];
    const b01 = b[0 * 3 + 1];
    const b02 = b[0 * 3 + 2];
    const b10 = b[1 * 3 + 0];
    const b11 = b[1 * 3 + 1];
    const b12 = b[1 * 3 + 2];
    const b20 = b[2 * 3 + 0];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },

  translate: function (m: number[], tx: number, ty: number) {
    return m3.multiply(m, m3.translation(tx, ty));
  },

  rotate: function (m: number[], angleInRadians: number) {
    return m3.multiply(m, m3.rotation(angleInRadians));
  },

  scale: function (m: number[], sx: number, sy: number) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },
};

export default new Example({
  title: "Varying",
  ref: "https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html",
  tweaks: {
    x: {
      name: "x",
      type: "range",
      value: translation[0].toString(),
      min: (0).toString(),
      max: (500).toString(),
      onInput: (e) => {
        translation[0] = (e.target as HTMLInputElement).valueAsNumber;
      },
    },
    y: {
      name: "y",
      type: "range",
      value: translation[1].toString(),
      min: (0).toString(),
      max: (500).toString(),
      onInput: (e) => {
        translation[1] = (e.target as HTMLInputElement).valueAsNumber;
      },
    },
    angle: {
      name: "angle",
      type: "range",
      value: angleInRadians.toString(),
      min: (0).toString(),
      max: (360).toString(),
      onInput: (e) => {
        angleInRadians =
          ((360 - (e.target as HTMLInputElement).valueAsNumber) * Math.PI) /
          180;
      },
    },
    scaleX: {
      name: "scaleX",
      type: "range",
      value: scale[0].toString(),
      min: (-5).toString(),
      max: (5).toString(),
      step: (0.1).toString(),
      onInput: (e) => {
        scale[0] = (e.target as HTMLInputElement).valueAsNumber;
      },
    },
    scaleY: {
      name: "scaleY",
      type: "range",
      value: scale[1].toString(),
      min: (-5).toString(),
      max: (5).toString(),
      step: (0.1).toString(),
      onInput: (e) => {
        scale[1] = (e.target as HTMLInputElement).valueAsNumber;
      },
    },
  },
  vertexSource: glsl`\
    attribute vec2 a_position;
    uniform mat3 u_matrix;
    varying vec4 v_color;

    void main() {
      // Multiply the position by the matrix.
      gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        
      // Convert from clip space to color space.
      // Clip space goes -1.0 to +1.0
      // Color space goes from 0.0 to 1.0
      v_color = gl_Position * 0.5 + 0.5;
    }\
  `,
  fragmentSource: glsl`\
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }\
  `,
  setup: (gl, program) => {
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer to put positions in
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put geometry data into buffer
    setGeometry(gl);

    return { positionBuffer, positionLocation, colorLocation, matrixLocation };
  },
  loop: (
    gl,
    program,
    { positionBuffer, positionLocation, colorLocation, matrixLocation }
  ) => {
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Compute the matrices
    let matrix = m3.projection(
      (gl.canvas as HTMLCanvasElement).clientWidth,
      (gl.canvas as HTMLCanvasElement).clientHeight
    );
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);
  },
});
