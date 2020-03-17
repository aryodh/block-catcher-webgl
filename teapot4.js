"use strict";

var numDivisions = 3;

var index = 0;

var points = [];
var normals = [];

var modelViewMatrix;
var projectionMatrix;

var normalMatrix, normalMatrixLoc;

var axis = 0;

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = [0, 0, 0];
var dTheta = 5.0;
var fovy = 45.0;
var aspect;
var xTranslation = 0.0;
var yTranslation = 0.0;
var zTranslation = 0.0;

var flag = true;

var program;
var canvas, render, gl;

var bezier = function(u) {
  var b = new Array(4);
  var a = 1 - u;
  b[3] = a * a * a;
  b[2] = 3 * a * a * u;
  b[1] = 3 * a * u * u;
  b[0] = u * u * u;
  return b;
};

var nbezier = function(u) {
  var b = [];
  b.push(3 * u * u);
  b.push(3 * u * (2 - 3 * u));
  b.push(3 * (1 - 4 * u + 3 * u * u));
  b.push(-3 * (1 - u) * (1 - u));
  return b;
};
// CHANGED near & far to -2 and 2 so it will show everything
var near = -2;
var far = 2;
var radius = 1;
var theta = 0.0;
var phi = 0.0;
var dr = (5.0 * Math.PI) / 180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var id_x = 1;
var id_y = 2;

var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const angle_idx = [
  [
    [-Math.PI / 4, -Math.PI / 4],
    [-Math.PI / 2, 0.0],
    [-Math.PI / 4, Math.PI / 4],
    [-Math.PI / 2, Math.PI / 2],
    [-Math.PI / 4, (3 * Math.PI) / 4],
    [-Math.PI / 2, Math.PI],
    [-Math.PI / 4, (-3 * Math.PI) / 4],
    [-Math.PI / 2, -Math.PI / 2]
  ],
  [
    [-Math.PI / 4, -Math.PI / 4],
    [-Math.PI / 2, 0.0],
    [-Math.PI / 4, Math.PI / 4],
    [-Math.PI / 2, Math.PI / 2],
    [-Math.PI / 4, (3 * Math.PI) / 4],
    [-Math.PI / 2, Math.PI],
    [-Math.PI / 4, (-3 * Math.PI) / 4],
    [-Math.PI / 2, -Math.PI / 2]
  ],
  [
    [Math.PI, -Math.PI / 4],
    [Math.PI, 0.0],
    [Math.PI, Math.PI / 4],
    [Math.PI, Math.PI / 2],
    [Math.PI, (3 * Math.PI) / 4],
    [Math.PI, Math.PI],
    [Math.PI, (-3 * Math.PI) / 4],
    [Math.PI, -Math.PI / 2]
  ],
  [
    [Math.PI / 4, -Math.PI / 4],
    [Math.PI / 2, 0.0],
    [Math.PI / 4, Math.PI / 4],
    [Math.PI / 2, Math.PI / 2],
    [Math.PI / 4, (3 * Math.PI) / 4],
    [Math.PI / 2, Math.PI],
    [Math.PI / 4, (-3 * Math.PI) / 4],
    [Math.PI / 2, -Math.PI / 2]
  ],
  [
    [Math.PI / 4, -Math.PI / 4],
    [Math.PI / 2, 0.0],
    [Math.PI / 4, Math.PI / 4],
    [Math.PI / 2, Math.PI / 2],
    [Math.PI / 4, (3 * Math.PI) / 4],
    [Math.PI / 2, Math.PI],
    [Math.PI / 4, (-3 * Math.PI) / 4],
    [Math.PI / 2, -Math.PI / 2]
  ]
];
function changeCameraAngle(t, p) {
  theta = t;
  phi = p;
}
onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  aspect = canvas.width / canvas.height;

  var sum = [0, 0, 0];
  for (var i = 0; i < 306; i++)
    for (j = 0; j < 3; j++) sum[j] += vertices[i][j];
  for (j = 0; j < 3; j++) sum[j] /= 306;
  for (var i = 0; i < 306; i++)
    for (j = 0; j < 2; j++) vertices[i][j] -= sum[j] / 2;
  for (var i = 0; i < 306; i++) for (j = 0; j < 3; j++) vertices[i][j] *= 2;

  var h = 1.0 / numDivisions;

  var patch = new Array(numTeapotPatches);
  for (var i = 0; i < numTeapotPatches; i++) patch[i] = new Array(16);
  for (var i = 0; i < numTeapotPatches; i++)
    for (j = 0; j < 16; j++) {
      patch[i][j] = vec4([
        vertices[indices[i][j]][0],
        vertices[indices[i][j]][2],
        vertices[indices[i][j]][1],
        1.0
      ]);
    }

  for (var n = 0; n < numTeapotPatches; n++) {
    var data = new Array(numDivisions + 1);
    for (var j = 0; j <= numDivisions; j++)
      data[j] = new Array(numDivisions + 1);
    for (var i = 0; i <= numDivisions; i++)
      for (var j = 0; j <= numDivisions; j++) {
        data[i][j] = vec4(0, 0, 0, 1);
        var u = i * h;
        var v = j * h;
        var t = new Array(4);
        for (var ii = 0; ii < 4; ii++) t[ii] = new Array(4);
        for (var ii = 0; ii < 4; ii++)
          for (var jj = 0; jj < 4; jj++)
            t[ii][jj] = bezier(u)[ii] * bezier(v)[jj];

        for (var ii = 0; ii < 4; ii++)
          for (var jj = 0; jj < 4; jj++) {
            temp = vec4(patch[n][4 * ii + jj]);
            temp = scale(t[ii][jj], temp);
            data[i][j] = add(data[i][j], temp);
          }
      }

    var ndata = new Array(numDivisions + 1);
    for (var j = 0; j <= numDivisions; j++)
      ndata[j] = new Array(numDivisions + 1);
    var tdata = new Array(numDivisions + 1);
    for (var j = 0; j <= numDivisions; j++)
      tdata[j] = new Array(numDivisions + 1);
    var sdata = new Array(numDivisions + 1);
    for (var j = 0; j <= numDivisions; j++)
      sdata[j] = new Array(numDivisions + 1);
    for (var i = 0; i <= numDivisions; i++)
      for (var j = 0; j <= numDivisions; j++) {
        ndata[i][j] = vec4(0, 0, 0, 0);
        sdata[i][j] = vec4(0, 0, 0, 0);
        tdata[i][j] = vec4(0, 0, 0, 0);
        var u = i * h;
        var v = j * h;
        var tt = new Array(4);
        for (var ii = 0; ii < 4; ii++) tt[ii] = new Array(4);
        var ss = new Array(4);
        for (var ii = 0; ii < 4; ii++) ss[ii] = new Array(4);

        for (var ii = 0; ii < 4; ii++)
          for (var jj = 0; jj < 4; jj++) {
            tt[ii][jj] = nbezier(u)[ii] * bezier(v)[jj];
            ss[ii][jj] = bezier(u)[ii] * nbezier(v)[jj];
          }

        for (var ii = 0; ii < 4; ii++)
          for (var jj = 0; jj < 4; jj++) {
            var temp = vec4(patch[n][4 * ii + jj]);
            temp = scale(tt[ii][jj], temp);
            tdata[i][j] = add(tdata[i][j], temp);

            var stemp = vec4(patch[n][4 * ii + jj]);
            stemp = scale(ss[ii][jj], stemp);
            sdata[i][j] = add(sdata[i][j], stemp);
          }
        temp = cross(tdata[i][j], sdata[i][j]);

        ndata[i][j] = normalize(vec4(temp[0], temp[1], temp[2], 0));
      }

    document.getElementById("ButtonX").onclick = function() {
      axis = xAxis;
    };
    document.getElementById("ButtonY").onclick = function() {
      axis = yAxis;
    };
    document.getElementById("ButtonZ").onclick = function() {
      axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function() {
      flag = !flag;
    };

    for (var i = 0; i < numDivisions; i++)
      for (var j = 0; j < numDivisions; j++) {
        points.push(data[i][j]);
        normals.push(ndata[i][j]);

        points.push(data[i + 1][j]);
        normals.push(ndata[i + 1][j]);

        points.push(data[i + 1][j + 1]);
        normals.push(ndata[i + 1][j + 1]);

        points.push(data[i][j]);
        normals.push(ndata[i][j]);

        points.push(data[i + 1][j + 1]);
        normals.push(ndata[i + 1][j + 1]);

        points.push(data[i][j + 1]);
        normals.push(ndata[i][j + 1]);
        index += 6;
      }
  }

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  projectionMatrix = ortho(-4, 4, -4, 4, -200, 200);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projectionMatrix"),
    false,
    flatten(projectionMatrix)
  );
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

  var lightPosition = vec4(0.0, 0.0, 20.0, 0.0);
  var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
  var materialShininess = 10.0;

  var ambientProduct = mult(lightAmbient, materialAmbient);
  var diffuseProduct = mult(lightDiffuse, materialDiffuse);
  var specularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  $(document).keydown(function(e) {
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
};
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
  console.log(id_x, id_y);
  console.log(angle_idx[id_y][id_x][0], angle_idx[id_y][id_x][1]);
  changeCameraAngle(angle_idx[id_y][id_x][0], angle_idx[id_y][id_x][1]);
}
var flag1 = true;
var flag2 = true;
var flag3 = true;
var flag4 = true;
var flag5 = true;
var flag6 = true;
var flag7 = true;
var flag8 = true;
var flag9 = true;
var flag10 = true;
var flag11 = true;
var flag12 = true;
var render = function() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (flag) {
    if (flag1) {
      if (xTranslation < 2) {
        xTranslation += 0.1;
      } else {
        flag1 = false;
        flag2 = true;
      }
    } else if (flag2) {
      if (xTranslation >= 0) {
        xTranslation -= 0.1;
      } else {
        flag2 = false;
        flag3 = true;
      }
    } else if (flag3) {
      if (xTranslation > -2) {
        xTranslation -= 0.1;
      } else {
        flag3 = false;
        flag4 = true;
      }
    } else if (flag4) {
      if (xTranslation <= 0) {
        xTranslation += 0.1;
      } else {
        flag4 = false;
        flag5 = true;
      }
    } else if (flag5) {
      if (zTranslation < 2) {
        zTranslation += 0.1;
      } else {
        flag5 = false;
        flag6 = true;
      }
    } else if (flag6) {
      if (zTranslation >= 0) {
        zTranslation -= 0.1;
      } else {
        flag6 = false;
        flag7 = true;
      }
    } else if (flag7) {
      if (zTranslation > -2) {
        zTranslation -= 0.1;
      } else {
        flag7 = false;
        flag8 = true;
      }
    } else if (flag8) {
      if (zTranslation <= 0) {
        zTranslation += 0.1;
      } else {
        flag8 = false;
        flag9 = true;
      }
    } else if (flag9) {
      if (yTranslation < 2) {
        yTranslation += 0.1;
      } else {
        flag9 = false;
        flag10 = true;
      }
    } else if (flag10) {
      if (yTranslation >= 0) {
        yTranslation -= 0.1;
      } else {
        flag10 = false;
        flag11 = true;
      }
    } else if (flag11) {
      if (yTranslation > -2) {
        yTranslation -= 0.1;
      } else {
        flag11 = false;
        flag12 = true;
      }
    } else if (flag12) {
      if (yTranslation <= 0) {
        yTranslation += 0.1;
      } else {
        flag12 = false;
        flag1 = true;
      }
    }
  }
  eye = vec3(
    radius * Math.sin(phi),
    radius * Math.sin(theta),
    radius * Math.cos(phi)
  );

  modelViewMatrix = lookAt(eye, at, up);

  // modelViewMatrix = mat4();

  modelViewMatrix = mult(
    modelViewMatrix,
    translate(xTranslation, yTranslation, zTranslation)
  );
  projectionMatrix = perspective(fovy, aspect, near, far);
  // projectionMatrix = ortho(-4, -4, -4, -4, -200, 200);

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "modelViewMatrix"),
    false,
    flatten(modelViewMatrix)
  );
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projectionMatrix"),
    false,
    flatten(modelViewMatrix)
  );
  normalMatrix = [
    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
  ];
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  // gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, index);
  //for(var i=0; i<index; i+=3) gl.drawArrays( gl.LINE_LOOP, i, 3 );
  requestAnimFrame(render);
};
