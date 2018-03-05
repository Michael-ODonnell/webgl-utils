// this is a pretty simple camera class
class WebGLCamera {
  constructor() {
    // Projection matrix values
    this._near = 0.1;
    this._far = 1000.0;
    this._fovY = 0.785398;

    // View matrix values
    this._eye = vec3.fromValues(0, 0, 20);
    this._lookAtPoint = vec3.fromValues(0, 0, 0);
    this._up = vec3.fromValues(0, 1, 0);
    vec3.normalize(this._up, this._up);

    // input
    this._movementSpeed = 0.02;
    this._lookAtInput = vec3.fromValues(0, 0, 0);
    this._movementInput = vec3.fromValues(0, 0, 0);

    this._viewMatrix = mat4.create();

    // finally get our key events from javascript
    this._registerKeyPressEvents();
  }
  
  static createSimpleMVPMatrix(gl, modelMatrix)
  {
    const eye = vec3.fromValues(0.0, 0.0, 7.5);
    const center = vec3.fromValues(0.0, 0.0, 0.0);
    const up = vec3.fromValues(0, 1, 0);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, eye, center, up);
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 1000.0;
    const fovY = 0.785398;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fovY, aspectRatio, near, far);

    const vpMatrix = mat4.create();
    mat4.multiply(vpMatrix, projectionMatrix, viewMatrix);
    const mvpMatrix  = mat4.create();
    mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
    return mvpMatrix;
  }

  // we recalculate this each frame because 
  // a/ the camera may have moved, changing the view matrix and
  // b/ the canvas may have resized, changing the projection matrix  
  getViewProjectionMatrix(gl) {
    mat4.lookAt(this._viewMatrix, this._eye, this._lookAtPoint, this._up);
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, this._fovY, aspectRatio, this._near, this._far);

    const vpMatrix = mat4.create();
    mat4.multiply(vpMatrix, projectionMatrix, this._viewMatrix);
    return vpMatrix;
  }

  // we use the time differential so that movement speed is consistent regardless of framerate
  move(delta) {
    // this helper function converts from input space to camera space
    const lookAtMovement = this._convertToCameraSpace(this._lookAtInput);
    vec3.scaleAndAdd(this._lookAtPoint, this._lookAtPoint, lookAtMovement, delta * this._movementSpeed);
    // just so we keep the objects in view
    this._constrain(this._lookAtPoint, 4, 4, 0);

    let eyeMovement = this._convertToCameraSpace(this._movementInput);
    vec3.scaleAndAdd(this._eye, this._eye, eyeMovement, delta * this._movementSpeed);
    // keeps the user within a reasonable distance of the objects
    this._constrain(this._eye, 20, 0, 20);
  }

  _convertToCameraSpace(input) {
    // it feels more natural to move in your own space, so let's get the relevant vectors
    // these are conveniently stored in our view matrix
    // we remove the y component to prevent flight
    const forward = vec3.fromValues(this._viewMatrix[2], 0, this._viewMatrix[10]);
    const right = vec3.fromValues(this._viewMatrix[0], 0, this._viewMatrix[8]);

    // up is always up, so we can just set it
    let movement = vec3.fromValues(0, input[1], 0);

    let movementForward = vec3.fromValues(0, 0, 0);
    vec3.scale(movementForward, forward, -input[2]);
    vec3.add(movement, movement, movementForward);

    let movementRight = vec3.fromValues(0, 0, 0);
    vec3.scale(movementRight, right, input[0]);
    vec3.add(movement, movement, movementRight);

    return movement;
  }

  _constrain(constrainedVector, constraintX, constraintY, constraintZ) {
    let constraint = vec3.fromValues(constraintX, constraintY, constraintZ);
    vec3.min(constrainedVector, constrainedVector, constraint);
    vec3.negate(constraint, constraint);
    vec3.max(constrainedVector, constrainedVector, constraint);
  }

  // update our input on key down/up events
  _registerKeyPressEvents() {
    window.addEventListener("keydown", ((event) => {
      const increase = 1;
      this._handleKeyEvent(event.keyCode, increase);
    }));
    window.addEventListener("keyup", ((event) => {
      const increase = -1;
      this._handleKeyEvent(event.keyCode, increase);
    }));
  }

  _handleKeyEvent(keyCode, increase) {
      let modication = vec3.fromValues(0, 0, 0);
      if (event.keyCode == 37) {      modication[0] = -1*increase; }// left
      else if (event.keyCode == 38) { modication[1] =  1*increase; }// up
      else if (event.keyCode == 39) { modication[0] =  1*increase; }// right
      else if (event.keyCode == 40) { modication[1] = -1*increase; }// down 
      else if (event.keyCode == 87) { modication[2] =  1*increase; }// w
      else if (event.keyCode == 65) { modication[0] = -1*increase; }// a
      else if (event.keyCode == 83) { modication[2] = -1*increase; }// s 
      else if (event.keyCode == 68) { modication[0] =  1*increase; }// d 
      
      if(event.keyCode < 41) this._updateInput(this._lookAtInput, modication);
      else this._updateInput(this._movementInput, modication);
  }

  // update our input values
  _updateInput(inputVector, modification) {
    vec3.add(inputVector, inputVector, modification);
    vec3.min(inputVector, inputVector, vec3.fromValues(1, 1, 1));
    vec3.max(inputVector, inputVector, vec3.fromValues(-1, -1, -1));
  }
}