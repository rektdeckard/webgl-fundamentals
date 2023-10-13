import { Example } from "@/types";
import { glsl } from "@/utils";

export default new Example({
  title: "Basic",
  ref: "https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html",
  vertexSource: glsl`\
    // an attribute will receive data from a buffer
    attribute vec4 a_position;
    
    // all shaders have a main function
    void main() {
      // gl_Position is a special variable a vertex shader
      // is responsible for setting
      gl_Position = a_position;
    }\
  `,
  fragmentSource: glsl`\
    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision mediump float;
  
    void main() {
      // gl_FragColor is a special variable a fragment shader
      // is responsible for setting
      gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
    }\
  `,
  setup: (gl, program) => {
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [0, 0, 0, 0.5, 0.7, 0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return { positionAttributeLocation, positionBuffer };
  },
  loop: (gl, program, { positionBuffer, positionAttributeLocation }) => {
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
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

    const primitiveType = gl.TRIANGLES;
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);
  },
});
