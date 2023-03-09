let canvas;
let gl;
let program;

let projectionMatrix;
let viewMatrix;
let worldMatrixLocation;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let cameraPosition = [0, 0, 5];
let cameraDirection = [0, 0, -1];
let cameraUp = [0, 1, 0];
let cameraYaw = 270;
let cameraPitch = 0;
let mouseX = 0;
let mouseY = 0;
let mouseDragging = false;

let playbackSpeed = 1.0;
let previousPlayBackSpeed = [0, 0, 0];
let isPaused = false;

let pickingEnabled = false;
let nearPoint;
let farPoint;

let rectangle = [];
let goblin = [];
let cat = [];

/**
 * @description This function is called when the page has loaded. It sets up the WebGL context, assigns the event
 * listeners, creates a reference of objects to be drawn, and starts the rendering loop.
 * @author Haydon Zinner
 */
window.onload = function () {
	// Get A WebGL context
	canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }

	//Bind listeners
	window.addEventListener("keydown", keydown);
	window.addEventListener("keyup", keyup);
	canvas.addEventListener("mousemove", mousemoveCallback);
	canvas.addEventListener("mousedown", mouseDownClickCallback);
	canvas.addEventListener("mouseup", mouseUpClickCallback);

	//////////////////////////////////////////////////////////////////////////////
	//  WebGl Setup
	//////////////////////////////////////////////////////////////////////////////
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(2.0, 1.0, 0.0, 0.2);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	projectionMatrix = perspective(45, canvas.width / canvas.height, 0.001, 10000.0);

	//////////////////////////////////////////////////////////////////////////////
	//  Initialize Shaders & Program
	//////////////////////////////////////////////////////////////////////////////
	program = initShaders(gl, "Shaders/VertexShader.fs", "Shaders/FragmentShader.fs");
	gl.useProgram(program);

	worldMatrixLocation = gl.getUniformLocation(program, "mWorldMatrix");
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

	//////////////////////////////////////////////////////////////////////////////
	//  Initialize Models
	//////////////////////////////////////////////////////////////////////////////
	rectangle.push(new AnimatedObject("Assets/meshes/AnimatedRectanglev2.dae", "Assets/textures/AnimatedRectangle.tga", 1, 0.5, 1, translate(0, 0, 1), rotate(90, [1, 0, 0]),"rectangle1"));
	rectangle.push(new AnimatedObject("Assets/meshes/AnimatedRectanglev2.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.5, translate(.75, 0.5, 1), rotate(90, [-1, 1, 0]),"rectangle2"));
	rectangle.push(new AnimatedObject("Assets/meshes/AnimatedRectanglev2.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.5, translate(-.5, 0, 1), rotate(90, [1, 0, 0]),"rectangle3"));
	rectangle.push(new AnimatedObject("Assets/meshes/AnimatedRectanglev2.dae", "Assets/textures/AnimatedRectangle.tga", 1, 0.5, 5, translate(6, 0, -15), rotate(90, [1, 0, 0]),"rectangle4"));
	rectangle.push(new AnimatedObject("Assets/meshes/AnimatedRectanglev2.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 2.5, translate(10, 2.5, -15), rotate(90, [-1, 1, 0]),"rectangle5"));
	rectangle.push(new AnimatedObject("Assets/meshes/AnimatedRectanglev2.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 2.5, translate(3.5, 0, -15), rotate(90, [1, 0, 0]),"rectangle6"));
	goblin.push(new AnimatedObject("Assets/meshes/goblin.dae", "Assets/textures/goblintexture.tga", 1, 0.1, 0.08, translate(-1, -1, 1), mult(rotate(-90, [1, 0, 0]), rotate(90, [0, 0, 1])), "goblin1"));
	goblin.push(new AnimatedObject("Assets/meshes/goblin.dae", "Assets/textures/goblintexture.tga", 1, 0.1, 0.08, translate(1, -1, 1), mult(rotate(-90, [1, 0, 0]), rotate(-90, [0, 0, 1])), "goblin2"));
	goblin.push(new AnimatedObject("Assets/meshes/goblin.dae", "Assets/textures/goblintexture.tga", 2, 0.1, 0.04, translate(0, -0.8, 2), mult(rotate(-90, [1, 0, 0]), rotate(0, [1, 0, 0])), "goblin3"));
	goblin.push(new AnimatedObject("Assets/meshes/goblin.dae", "Assets/textures/goblintexture.tga", 0, 0.1, 1, translate(0, 0, -50), mult(rotate(-90, [1, 0, 0]), rotate(0, [1, 0, 0])), "goblin4"));
	goblin.push(new AnimatedObject("Assets/meshes/goblin.dae", "Assets/textures/goblintexture.tga", 0, 0.1, 1, translate(-25, 0, -50), mult(rotate(-90, [1, 0, 0]), rotate(30, [0, 0, 1])), "goblin5"));
	goblin.push(new AnimatedObject("Assets/meshes/goblin.dae", "Assets/textures/goblintexture.tga", 0, 0.1, 1, translate(25, 0, -50), mult(rotate(-90, [1, 0, 0]), rotate(-30, [0, 0, 1])), "goblin6"));
	cat.push(new AnimatedObject("Assets/meshes/cat.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.00005, translate(0, -1, 3), mult(rotate(180, [1, 0, 0]), rotate(0, [0, 0, 1])), "cat1"));
	cat.push(new AnimatedObject("Assets/meshes/cat.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.000025, translate(0.5, -1, 3), mult(rotate(180, [1, 0, 0]), rotate(45, [0, 1, 0])), "cat2"));
	cat.push(new AnimatedObject("Assets/meshes/cat.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.000025, translate(-0.5, -1, 3), mult(rotate(180, [1, 0, 0]), rotate(-45, [0, 1, 0])), "cat3"));
	cat.push(new AnimatedObject("Assets/meshes/cat.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.005, translate(-100, -1, 3), mult(rotate(180, [1, 0, 0]), rotate(-90, [0, 1, 0])), "cat4"));
	cat.push(new AnimatedObject("Assets/meshes/cat.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.005, translate(100, -1, 3), mult(rotate(180, [1, 0, 0]), rotate(90, [0, 1, 0])), "cat5"));
	cat.push(new AnimatedObject("Assets/meshes/cat.dae", "Assets/textures/AnimatedRectangle.tga", 0, 0.5, 0.005, translate(0, -1, 100), mult(rotate(180, [1, 0, 0]), rotate(180, [0, 1, 0])), "cat6"));

	//////////////////////////////////////////////////////////////////////////////
	//  Render
	//////////////////////////////////////////////////////////////////////////////
	setInterval(render, 10);
};

/**
 * @description The rendering loop that calls the draw function.
 * @author Haydon Zinner
 */
function render() {
	//Update the camera depending on the user input
	update();
	viewMatrix = lookAt(cameraPosition, add(cameraPosition, cameraDirection), cameraUp);

	//Clear the screen
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.activeTexture(gl.TEXTURE0);

	//Render all the objects
	rectangle.forEach(function (rectangle) {
		rectangle.draw();
	});
	goblin.forEach(function (rectangle) {
		rectangle.draw();
	});
	cat.forEach(function (rectangle) {
		rectangle.draw();
	});

}

/**
 * @description The callback function for key down events.
 */
function keydown() {

	if (event.keyCode === 85)  // 'u'
		moveForward = true;
	if (event.keyCode === 72)  // 'h'
		moveLeft = true;
	if (event.keyCode === 74)  // 'j'
		moveBackward = true;
	if (event.keyCode === 75)  // 'k'
		moveRight = true;
	if (event.keyCode === 83) {  // 's'
		//slow playback
		if (playbackSpeed > 0.125) { // x1/8 playback speed
			rectangle.forEach(function (rectangle) {
				rectangle.frameSpeed /= 2;
			});
			goblin.forEach(function (goblin) {
				goblin.frameSpeed /= 2;
			});
			cat.forEach(function (cat) {
				cat.frameSpeed /= 2;
			});
			playbackSpeed /= 2;
		}
	}
	if (event.keyCode === 88) {  // 'x'
		//slow playback
		if (playbackSpeed < 8) { //x8
			rectangle.forEach(function (rectangle) {
				rectangle.frameSpeed *= 2;
			});
			goblin.forEach(function (goblin) {
				goblin.frameSpeed *= 2;
			});
			cat.forEach(function (cat) {
				cat.frameSpeed *= 2;
			});
			playbackSpeed *= 2;
		}
	}
	if (event.keyCode === 90) { //Z
		//pause and unpause the animation
		if (isPaused) {
			isPaused = false;
			rectangle.forEach(function (rectangle) {
				rectangle.frameSpeed = previousPlayBackSpeed[0];
			});
			goblin.forEach(function (goblin) {
				goblin.frameSpeed = previousPlayBackSpeed[1];
			});
			cat.forEach(function (cat) {
				cat.frameSpeed = previousPlayBackSpeed[2];
			});
		} else {
			isPaused = true;
			//Sample the play speed from one of each type of object as each type uses the same speed
			previousPlayBackSpeed[0] = rectangle[0].frameSpeed;
			previousPlayBackSpeed[1] = goblin[0].frameSpeed;
			previousPlayBackSpeed[2] = cat[0].frameSpeed;

			rectangle.forEach(function (rectangle) {
				rectangle.frameSpeed = 0;
			});
			goblin.forEach(function (goblin) {
				goblin.frameSpeed = 0;
			});
			cat.forEach(function (cat) {
				cat.frameSpeed = 0;
			});
		}
	}
	if (event.keyCode === 78) { //N
		//play next animation track
		rectangle.forEach(function (rectangle) {
			let trackLimit = 2;
			let currentTrack = rectangle.trackId;
			rectangle.trackId = Math.abs((currentTrack + 1) % trackLimit);
		});
		goblin.forEach(function (goblin) {
			let trackLimit = 3;
			let currentTrack = goblin.trackId;
			goblin.trackId = Math.abs((currentTrack + 1) % trackLimit);
		});
	}
	if (event.keyCode === 80) { //P
		//play previous animation track
		rectangle.forEach(function (rectangle) {
			let trackLimit = 2;
			let currentTrack = rectangle.trackId;
			rectangle.trackId = Math.abs((currentTrack - 1) % trackLimit);
		});
		goblin.forEach(function (goblin) {
			let trackLimit = 3;
			let currentTrack = goblin.trackId - 1;
			if (currentTrack < 0) {
				currentTrack = trackLimit - 1;
			}
			goblin.trackId = currentTrack;
		});
	}
	if (event.keyCode === 49) { //1
		//Enable Picking
		if (pickingEnabled) {
			pickingEnabled = false;
			console.log("Picking Disabled");
		} else {
			pickingEnabled = true;
			console.log("Picking Enabled");
		}
	}
	if (event.keyCode === 50) { //2
		//Birdeye view
		cameraPosition = [0, 100, 0];
		cameraDirection = [0, -5, -1];
		cameraUp = [0, 1, 0];
		cameraPitch = -80;
	}
	if (event.keyCode === 51) { //3
		//Reset View
		cameraPosition = [0, 0, 5];
		cameraDirection = [0, 0, -1];
		cameraUp = [0, 1, 0];
		cameraPitch = 0;
	}
	if (event.keyCode === 66) { //B
		//Used for debugging
		rectangle.forEach(function (rectangle) {
			console.log("ID: " + rectangle.id + "\nCenter: " + rectangle.model.center);
		});
	}
}

/**
 * @description The callback function for key up events.
 */
function keyup() {

	if (event.keyCode == 85)  // 'u'
		moveForward = false;
	if (event.keyCode == 72)  // 'h'
		moveLeft = false;
	if (event.keyCode == 74)  // 'j'
		moveBackward = false;
	if (event.keyCode == 75)  // 'k'
		moveRight = false;
}

/**
 * @description The update function to adjust the camera's view.
 */
function update() {
	let speed = 0.1;
	if (moveForward) cameraPosition = add(cameraPosition, scale(speed, cameraDirection));

	if (moveBackward) cameraPosition = subtract(cameraPosition, scale(speed, cameraDirection));

	if (moveRight) cameraPosition = add(cameraPosition, scale(speed, normalize(cross(cameraDirection, cameraUp))));

	if (moveLeft) cameraPosition = subtract(cameraPosition, scale(speed, normalize(cross(cameraDirection, cameraUp))));
}

/**
 * @description The callback function for mouse move events.
 */
function mousemoveCallback() {
	if (mouseDragging) {
		let rotationSpeed = 0.1;
		cameraYaw += (event.clientX - mouseX) * rotationSpeed;
		cameraPitch += (mouseY - event.clientY) * rotationSpeed;
		if (cameraPitch > 89.0) cameraPitch = 89.0;
		if (cameraPitch < -89.0) cameraPitch = -89.0;

		mouseX = event.clientX;
		mouseY = event.clientY;

		let yawInRadians = (cameraYaw / 180.0 * 3.141592654);
		let pitchInRadians = (cameraPitch / 180.0 * 3.141592654);

		cameraDirection[0] = Math.cos(pitchInRadians) * Math.cos(yawInRadians);
		cameraDirection[1] = Math.sin(pitchInRadians);
		cameraDirection[2] = Math.cos(pitchInRadians) * Math.sin(yawInRadians);
	}

	if (pickingEnabled) {
		nearPoint = unproject(event.clientX, event.clientY, 0, mult(projectionMatrix, viewMatrix), [0, 0, canvas.width, canvas.height]);
		farPoint = unproject(event.clientX, event.clientY, 1, mult(projectionMatrix, viewMatrix), [0, 0, canvas.width, canvas.height]);

	}

}

/**
 * @description The callback function for mouse down events.
 */
function mouseDownClickCallback() {
	mouseDragging = true;
	mouseX = event.clientX;
	mouseY = event.clientY;
}

/**
 * @description The callback function for mouse up events.
 */
function mouseUpClickCallback() {
	mouseDragging = false;
}




