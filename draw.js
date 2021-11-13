
// some globals
var gl;

var delay = 100;
var iBuffer;
var vBuffer;
var colorBuffer;
var program;

var vertexColors = [];

var eye = vec3(0,0,1);
var at = vec3(0,0,-1);
var up = vec3(0,1,0);

var fovy = 100;
var aspect = 1;



window.onload = function init() {

	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
	// initialize webgl
    gl = WebGLUtils.setupWebGL(canvas);
	// check for errors
    if ( !gl ) { 
		alert("WebGL isn't available"); 
	}

    // set up a viewing surface to display your image
    gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders -- all work done in init_shaders.js
    program = initShaders(gl, "vertex-shader", "fragment-shader");

	// make this the current shader program
    gl.useProgram(program);

	// Get a handle to theta  - this is a uniform variable defined 
	// by the user in the vertex shader, the second parameter should match
	// exactly the name of the shader variable
	colorLoc = gl.getUniformLocation(program, "vertColor");
	mvmLoc = gl.getUniformLocation(program, 'mvm');
	perspectiveLoc = gl.getUniformLocation(program, 'perspective')

	iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapot_indices), gl.STATIC_DRAW);

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot_vertices), gl.STATIC_DRAW);
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

    addColors();

	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW)
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
	gl.enableVertexAttribArray(vColor)

	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

    render();
};

function addColors(){
    for(let i = 0; i < teapot_vertices.length; i++){
        vertexColors.push([Math.random(), Math.random(), Math.random(), 1])
    }
}

function frustrum(left, right, bottom, top, near, far){
	return mat4()
}

function perspectiveMat(fovy, aspect, near, far){
	return mat4(
		vec4(1/Math.tan(radians(fovy)/aspect),0,0,0),
		vec4(0,1/Math.tan(radians(fovy)),0,0),
		vec4(0,0,-(far+near)/(far-near),-(2*far*near)/(far-near)),
		vec4(0,0,-1,0)
	);
}

function lookAt(eye, at, up){
	n = normalize(subtract(at , eye));
    u = cross(n , normalize(up));
    v = cross(u , n);
    cam = mat4(
		vec4(u[0], u[1], u[2], 0),
        vec4(v[0], v[1], v[2], 0),
        vec4(n[0], n[1], n[2], 0),
        vec4(0 , 0 , 0 , 1)
		);
	
    return mult(cam, translate3d(-eye[0], -eye[1], -eye[2]));
}

function render() {
	// this is render loop
	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	x = document.getElementById('xSlide').value;
	y = document.getElementById('ySlide').value;
	posZ = document.getElementById('+ZSlide').value;
	negZ = document.getElementById('-ZSlide').value;

	document.getElementById('xValue').innerHTML = "Width (0.1-30): " + x; //actually increasing width for aspect ratio
	document.getElementById('yValue').innerHTML = "Height (0.1-30): " + y; //actually increasing height for asepct ratio
	document.getElementById('+ZValue').innerHTML = "Near (0.1-200): " + posZ; //actually increasing fovY
	document.getElementById('-ZValue').innerHTML = "Far (0.1-300):  " + negZ; //actually brings near closer to you

	aspect = x/y
	gl.uniformMatrix4fv(mvmLoc, false, flatten(lookAt(eye, at, up)));
	gl.uniformMatrix4fv(perspectiveLoc, false, flatten(perspectiveMat(posZ, aspect, 0.1 , negZ)));

    gl.drawElements(gl.TRIANGLES, teapot_indices.length, gl.UNSIGNED_SHORT, 0);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

function translate3d (tx, ty, tz) {
	return mat4( 	
		vec4(1, 0, 0, tx),
		vec4(0, 1, 0, ty),
		vec4(0, 0, 1, tz),
		vec4(0, 0, 0, 1)
	);
}

function scale3d (sx, sy, sz) {
	return mat4(
		vec4(sx, 0, 0, 0),
		vec4(0, sy, 0, 0),
		vec4(0, 0, sz, 0),
		vec4(0, 0, 0, 1)
	)
}