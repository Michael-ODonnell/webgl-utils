class WebGLRenderUtils {
  static resize(gl) {
    // Lookup the size the browser is displaying the canvas.
    const displayWidth = gl.canvas.clientWidth;
    const displayHeight = gl.canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (gl.canvas.width != displayWidth ||
      gl.canvas.height != displayHeight) {

      // Make the canvas the same size
      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  static prepareToDraw(gl) {
    WebGLRenderUtils.resize(gl);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  static bindFloatAttribute(gl, program, attributeName, attributeData, dimension) {
    // get a location that will refer to our attribute
    const attributeLocation = gl.getAttribLocation(program, attributeName);

    // create a new buffer for our data
    const buffer = gl.createBuffer();

    // this binds the buffer to a point in the gl.ARRAY_BUFFER
    // the gl.ARRAY_BUFFER is specifically for storing vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // writes date to the GPU's ARRAY_BUFFER
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributeData), gl.STATIC_DRAW);

    // this turns the attribute on for use when we call gl.drawArrays
    gl.enableVertexAttribArray(attributeLocation);

    // Tell the attribute how to get data out of its ARRAY_BUFFER (positionBuffer)
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward dimension * sizeof(type) each iteration to get the next position
    const bufferOffset = 0; // start at the beginning of the buffer

    // This binds our attribute to the current bound ARRAY_BUFFER item (positionBuffer) 
    // and specifies it's layout
    gl.vertexAttribPointer(
      attributeLocation, dimension, type, normalize, stride, bufferOffset);
  }

  static bindIndices(gl, program, indices) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  static drawTriangle(gl, program, animationPhase) {
    const positions = [
      0, 0.5, 
      -0.5 * animationPhase, -0.5,
      0.5 * animationPhase, -0.5,
    ];

    // it's not just positions we can animate
    const whiteFactor = 1 - Math.abs(animationPhase);

    const colors = [
      1, whiteFactor, whiteFactor,
      whiteFactor, 1, whiteFactor,
      whiteFactor, whiteFactor, 1
    ];

    const vertexDimension = 2;
    const colorDimension = 3;

    // This helper wraps the binding code from lesson 2 for our values
    WebGLRenderUtils.bindFloatAttribute(gl, program, "a_position", positions, vertexDimension);
    // we'll provide the colors ourselves now so they make more sense
    WebGLRenderUtils.bindFloatAttribute(gl, program, "a_color", colors, colorDimension);

    // our draw call.
    const primitiveType = gl.TRIANGLES;
    const primitiveOffset = 0;
    const primitiveCount = positions.length / vertexDimension;
    gl.drawArrays(primitiveType, primitiveOffset, primitiveCount);
  }

  static drawTetrahedron(gl, program) {

    const vertices = [
       1, 1, 1,
       1,-1,-1, 
      -1, 1,-1,
      -1,-1, 1
    ];

    const colors = [
      1, 1, 1, // white
      1, 0, 0, // red
      0, 1, 0, // green
      0, 0, 1  // blue
    ];

    // an index buffer is a way to save memory by only storing each vertex once.
    // instead of passing the same vertices repeatedly for each triangle,  
    // resulting in numCoordinatesInVertex*numVerticesInTriangle*numTrianges, or 3*3*4 = 36
    // we say here's an array of all points and here's the ones to draw each time,
    // giving us (numCoordinatesInVertex*totalVertices) + (numVerticesInTriangle*numTriangles)
    // or (3*4) + (3*4) = 24 - a 33% saving.  It saves even more when you have more
    // complex meshes that reuse more ofthe same points.
    const indices = [
      1, 2, 3,
      2, 3, 0,
      3, 0, 1,
      0, 1, 2
    ];

    const vertexDimension = 3;
    const colorDimension = 3;

    WebGLRenderUtils.bindFloatAttribute(gl, program, "a_position", vertices, vertexDimension);
    WebGLRenderUtils.bindFloatAttribute(gl, program, "a_color", vertices, colorDimension);
    WebGLRenderUtils.bindIndices(gl, program, indices);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  static drawSquare(gl, program) {

    const vertices = [
      -0.5, 0.5, 0,
      -0.5,-0.5, 0, 
       0.5, 0.5, 0,
       0.5,-0.5, 0
    ];

    const vertexDimension = 3;

    WebGLRenderUtils.bindFloatAttribute(gl, program, "a_position", vertices, vertexDimension);

    const primitiveType = gl.TRIANGLE_STRIP;
    const primitiveOffset = 0;
    const primitiveCount = 4;
    gl.drawArrays(primitiveType, primitiveOffset, primitiveCount);
  }
}

class WebGLBuilder {

  static getContext(canvasId) {
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
      alert("Could not find canvas " + canvasId);
      return false;
    }
    var gl = canvas.getContext("webgl");

    if (!gl) {
      alert("WebGL is not supported");
      return false;
    }

    gl.clearColor(0.180, 0.545, 0.341, 1.0);
    gl.enable(gl.DEPTH_TEST);

    return gl;
  }

  // boilerplate code for creating a webGL shader
  static createShader(gl, type, elementId) {
    let source = document.getElementById(elementId).text;
    if (!source) {
      alert("Could not find shader source element " + elementId);
      return false;
    }
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    alert("Could not build " + type);
    gl.deleteShader(shader);
  }

  static createShaderProgram(gl, vertexShaderElementId, fragmentShaderElementId) {
    // create our vertex and fragment shaders from the document sources
    let vertexShader = WebGLBuilder.createShader(gl, gl.VERTEX_SHADER, vertexShaderElementId);
    let fragmentShader = WebGLBuilder.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderElementId);

    if (!vertexShader) return false;
    if (!fragmentShader) return false;

    // create a shader program and link our shaders to it
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let programLinkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!programLinkSuccess) {
      gl.deleteProgram(program);
      alert("Could not find create shader program");
      return false;
    }

    return program;
  }
}
