class WebGLRenderUtils {
  static resize(gl) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = gl.canvas.clientWidth;
    var displayHeight = gl.canvas.clientHeight;

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
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  static bindFloatAttribute(gl, program, attributeName, attributeData, size) {
    // get a location that will refer to our attribute
    let attributeLocation = gl.getAttribLocation(program, attributeName);

    // create a new buffer for our data
    let buffer = gl.createBuffer();

    // this binds the buffer to a point in the gl.ARRAY_BUFFER
    // the gl.ARRAY_BUFFER is specifically for storing vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // writes date to the GPU's ARRAY_BUFFER
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributeData), gl.STATIC_DRAW);

    // this turns the attribute on for use when we call gl.drawArrays
    gl.enableVertexAttribArray(attributeLocation);

    // Tell the attribute how to get data out of its ARRAY_BUFFER (positionBuffer)
    let type = gl.FLOAT; // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    let bufferOffset = 0; // start at the beginning of the buffer

    // This binds our attribute to the current bound ARRAY_BUFFER item (positionBuffer) 
    // and specifies it's layout
    gl.vertexAttribPointer(
      attributeLocation, size, type, normalize, stride, bufferOffset);
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
      alert("Could not create shader program");
      return false;
    }

    return program;
  }
}