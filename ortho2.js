"use strict";

var canvas;
var gl;

var numVertices = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0), // cyan
    vec4(1.0, 1.0, 1.0, 1.0), // white
];

// CHANGED near & far to -2 and 2 so it will show everything
var near = -2;
var far = 2;
var radius = 1;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var id_x = 1;
var id_y = 2;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const angle_idx = [
    [
        [-Math.PI / 4, -Math.PI / 4],
        [-Math.PI / 2, 0.0],
        [-Math.PI / 4, Math.PI / 4],
        [-Math.PI / 2, Math.PI / 2],
        [-Math.PI / 4, 3 * Math.PI / 4],
        [-Math.PI / 2, Math.PI],
        [-Math.PI / 4, -3 * Math.PI / 4],
        [-Math.PI / 2, -Math.PI / 2]
    ],
    [
        [-Math.PI / 4, -Math.PI / 4],
        [-Math.PI / 2, 0.0],
        [-Math.PI / 4, Math.PI / 4],
        [-Math.PI / 2, Math.PI / 2],
        [-Math.PI / 4, 3 * Math.PI / 4],
        [-Math.PI / 2, Math.PI],
        [-Math.PI / 4, -3 * Math.PI / 4],
        [-Math.PI / 2, -Math.PI / 2]
    ],
    [
        [Math.PI, -Math.PI / 4],
        [Math.PI, 0.0],
        [Math.PI, Math.PI / 4],
        [Math.PI, Math.PI / 2],
        [Math.PI, 3 * Math.PI / 4],
        [Math.PI, Math.PI],
        [Math.PI, -3 * Math.PI / 4],
        [Math.PI, -Math.PI / 2]
    ],
    [
        [Math.PI / 4, -Math.PI / 4],
        [Math.PI / 2, 0.0],
        [Math.PI / 4, Math.PI / 4],
        [Math.PI / 2, Math.PI / 2],
        [Math.PI / 4, 3 * Math.PI / 4],
        [Math.PI / 2, Math.PI],
        [Math.PI / 4, -3 * Math.PI / 4],
        [Math.PI / 2, -Math.PI / 2],
    ],
    [
        [Math.PI / 4, -Math.PI / 4],
        [Math.PI / 2, 0.0],
        [Math.PI / 4, Math.PI / 4],
        [Math.PI / 2, Math.PI / 2],
        [Math.PI / 4, 3 * Math.PI / 4],
        [Math.PI / 2, Math.PI],
        [Math.PI / 4, -3 * Math.PI / 4],
        [Math.PI / 2, -Math.PI / 2],
    ],
];

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
}


function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function changeCameraAngle(t, p) {
    theta = t;
    phi = p;
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    $(document).keydown(function (e) {
        if (e.keyCode == 37) {
            // left
            changeIndex("x", "-");
        } else if (e.keyCode == 39) {
            // right
            changeIndex("x", "+");
        } else if (e.keyCode == 38) {
            // up
            changeIndex("y", "+");
        } else if (e.keyCode == 40) {
            // down
            changeIndex("y", "-");
        } else if (e.keyCode == 65) {
            // down
            changeCameraAngle(Math.PI, 0.0);
        }
    });

    render();
}

function changeIndex(idx, sign) {
    console.log(sign);
    if (idx == "y") {
        if ((id_y == 0 && sign == "-") || (id_y == 4 && sign == "+")) {
            id_y = id_y;
        } else {
            if (sign == "+") {
                id_y += 1;
            } else if (sign == "-") {
                id_y -= 1;
            }
        }
    } else if (idx == "x") {
        if (id_x == 7 && sign == "+") {
            id_x = 0;
        } else if (id_x == 0 && sign == "-") {
            id_x = 7;
        } else if (sign == "+") {
            id_x += 1;
        } else if (sign == "-") {
            id_x -= 1;
        }
    }
    console.log(id_x, id_y)
    console.log(angle_idx[id_y][id_x][0], angle_idx[id_y][id_x][1]);
    changeCameraAngle(angle_idx[id_y][id_x][0], angle_idx[id_y][id_x][1]);

}


var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta),
        radius * Math.cos(phi));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimFrame(render);
}