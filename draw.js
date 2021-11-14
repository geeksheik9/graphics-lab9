
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

function perspective(left, right, bottom, top, near, far){
		return mat4(
		vec4(2*near/(right-left),0,0,-near*(right+left)/(right-left)),
		vec4(0,2*near/(top-bottom),0,-near*(top+bottom)/(top-bottom)),
		vec4(0,0,-(far+near)/(far-near), 2*far*near/(near-far)),
		vec4(0,0,-1,0)
	)
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

function translate3d (tx, ty, tz) {
	return mat4( 	
		vec4(1, 0, 0, tx),
		vec4(0, 1, 0, ty),
		vec4(0, 0, 1, tz),
		vec4(0, 0, 0, 1)
	);
}

function createFrustum(left, right, bottom, top, near, far) {
    midx = (left + right) * 0.5;
    midy = (bottom + top) * 0.5;
    frustumMatrix = mat4(vec4(1, 0, 0, -midx),
                         vec4(0, 1, 0, -midy),
                         vec4(0, 0, 1, 0),
                         vec4(0, 0, 0, 1)
                         );
	return frustumMatrix;
}

function createPerspective(left, right, bottom, top, near, far) {
	frustumMatrix = createFrustum(-1,1,-1,1,0,0);
    perspectiveMatrix = mat4(vec4(near, 0, 0, 0),
                             vec4(0, near, 0, 0),
                             vec4(0, 0, 1, 0),
                             vec4(0, 0, -1, 0)
                             );
    scaleMatrix = mat4(vec4(2/(right-left), 0, 0, 0),
                       vec4(0, 2/(top-bottom), 0, 0),
                       vec4(0, 0, 1, 0),
                       vec4(0, 0, 0, 1)
                       );
    var c1 = (2*far*near)/(near-far);
    var c2 = (far + near)/(far-near);

    mappingDepth = mat4(vec4(1, 0, 0, 0),
                        vec4(0, 1, 0, 0),
                        vec4(0, 0, -c2, c1),
                        vec4(0, 0, -1, 0 )
                        );
    return mult(scaleMatrix, mult(perspectiveMatrix, mult(mappingDepth, frustumMatrix)));
}

function render() {
	// this is render loop
	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	width = parseFloat(document.getElementById('width').value);
	height = parseFloat(document.getElementById('height').value);
	near = parseFloat(document.getElementById('near').value);
	far = parseFloat(document.getElementById('far').value);

	width = parseFloat(width);
	height = parseFloat(height);
	near = parseFloat(near);
	far = parseFloat(far);
	
	gl.uniformMatrix4fv(mvmLoc, false, flatten(lookAt(eye, at, up)));
	gl.uniformMatrix4fv(perspectiveLoc, false, flatten(createPerspective(-width, width, -height, height, 100, near)));
    gl.drawElements(gl.TRIANGLES, teapot_indices.length, gl.UNSIGNED_SHORT, 0);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}