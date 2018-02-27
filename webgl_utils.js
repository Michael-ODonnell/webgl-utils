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
}