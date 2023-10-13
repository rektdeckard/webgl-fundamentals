import { Example } from "@/types";
import { glsl } from "@/utils";

export default new Example({
  title: "Web coordinate space",
  ref: "https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html",
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
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
      positionAttributeLocation,
      positionBuffer,
      resolutionUniformLocation,
    };
  },
  loop: (
    gl,
    program,
    { positionBuffer, positionAttributeLocation, resolutionUniformLocation }
  ) => {
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

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
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
  },
});
