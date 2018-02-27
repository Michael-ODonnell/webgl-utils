class WebGLRenderUtils {			
	static resize (gl) {
		// Lookup the size the browser is displaying the canvas.
		var displayWidth  = gl.canvas.clientWidth;
		var displayHeight = gl.canvas.clientHeight;

		// Check if the canvas is not the same size.
		if (gl.canvas.width  != displayWidth ||
			gl.canvas.height != displayHeight) {

			// Make the canvas the same size
			gl.canvas.width  = displayWidth;
			gl.canvas.height = displayHeight;
		}
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	}
}

class WebGLBuilder {			
	static getContext(canvas)
	{
		var gl = canvas.getContext("webgl");
		if (!gl) {
			// webGL is not supported
			alert("WebGL is not supported");
			return false;
		}
		
		WebGLRenderUtils.resize(gl);
		gl.clearColor(0.180, 0.545, 0.341, 1.0);
		
		return gl;
	}

	// boilerplate code for creating a webGL shader
	static createShader(gl, type, source) {
	  var shader = gl.createShader(type);
	  gl.shaderSource(shader, source);
	  gl.compileShader(shader);
	  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	  if (success) {
		return shader;
	  }

	  gl.deleteShader(shader);
	}
	
	static createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource)
	{
	  // create our vertex and fragment shaders from the document sources
	  let vertexShader = WebGLBuilder.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	  let fragmentShader = WebGLBuilder.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

	  // create a shader program and link our shaders to it
	  let program = gl.createProgram();
	  gl.attachShader(program, vertexShader);
	  gl.attachShader(program, fragmentShader);
	  gl.linkProgram(program);
	  let programLinkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
	  if (!programLinkSuccess) {
		gl.deleteProgram(program);
		return false;
	  }

	  return program;
	}
}