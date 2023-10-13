export function glsl(shader: TemplateStringsArray) {
  return shader[0];
}

export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(`Could not create shader`);
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = Error(
      gl.getShaderInfoLog(shader) || "Could not compile shader"
    );
    gl.deleteShader(shader);
    throw error;
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Could not create program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = Error(
      gl.getProgramInfoLog(program) || "Could not compile shader"
    );
    gl.deleteProgram(program);
    throw error;
  }

  return program;
}

export function resizeCanvasToDisplaySize(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  return needResize;
}
