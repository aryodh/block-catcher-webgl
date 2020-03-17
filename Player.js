var player;
var blocks = [];
var gl;

var display, scoreDisplay, statusDisplay, playDisplay;

var score = 0,
	scoreThreshold = 500;
var SetTime = 60;
var gameStarted = false;
var lastFrame = performance.now();
var localStorageName = "crackalien";
var highScore;
highScore = localStorage.getItem(localStorageName) == null ? 0 :
	localStorage.getItem(localStorageName);



var playerVShaderID = "vertexShader";
var playerFShaderID = "yellow";
var numOfPoints = 0;
var cIndex = 0;

var Player = function (gl, playerFShaderID) {
	this.gl = gl;
	this.points = [vec2(-.20, -.925), vec2(.20, -.925), vec2(.15, -.975), vec2(-.15, -.975)];
	this.leftTopMax = 0;
	this.rightBottomMax = 2;
	numOfPoints = this.points.length;
	this.shiftX = 0;
	this.shiftY = 0;
	this.deltaTrans = 0.03;
	this.buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW);
	this.velocity = 0;
	this.attachShaders(playerFShaderID);
}

Player.prototype.attachShaders = function (playerFShaderIDInput) {
	playerFShaderID = playerFShaderIDInput;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, document.getElementById(playerVShaderID).text);
	gl.compileShader(vertexShader);

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, document.getElementById(playerFShaderID).text);
	gl.compileShader(fragShader);

	this.shaderProgram = gl.createProgram();
	this.gl.attachShader(this.shaderProgram, vertexShader);
	this.gl.attachShader(this.shaderProgram, fragShader);
	this.gl.linkProgram(this.shaderProgram);
}

Player.prototype.attachVariables = function () {
	var myPosition = this.gl.getAttribLocation(this.shaderProgram, "myPosition");
	this.gl.vertexAttribPointer(myPosition, 2, this.gl.FLOAT, false, 0, 0);
	this.gl.enableVertexAttribArray(myPosition);

	this.xshiftLoc = this.gl.getUniformLocation(this.shaderProgram, "xshift");
	this.gl.uniform1f(this.xshiftLoc, this.shiftX);
	this.yshiftLoc = this.gl.getUniformLocation(this.shaderProgram, "yshift");
}

Player.prototype.moveX = function (forward, timestep) {
	var change = forward ? this.deltaTrans : -this.deltaTrans;
	change *= timestep / 25;
	if (this.points[this.leftTopMax][0] + change >= -1.01 && this.points[this.rightBottomMax][0] + change < 1.01) {
		this.shiftX += change;
		for (var i = 0; i < this.points.length; i++) {
			this.points[i][0] = this.points[i][0] + change;
		}
	}
}

Player.prototype.render = function (left, right, timestep) {
	gl.useProgram(this.shaderProgram);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	if (left)
		this.moveX(false, timestep);
	if (right)
		this.moveX(true, timestep);
	this.attachVariables();
	this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.points.length);
	//window.requestAnimFrame(this.render);
}

function initializeGame() {
	var m = document.getElementById("mymenu");
	console.log(m);
	m.addEventListener("click", function () {
		cIndex = m.selectedIndex;
		if (cIndex == 0) {
			playerFShaderID = "pink";
		} else if (cIndex == 1) {
			playerFShaderID = "yellow";
		} else if (cIndex == 2) {
			playerFShaderID = "orange";
		} else if (cIndex == 3) {
			playerFShaderID = "purple";
		} else {
			playerFShaderID = "green";
		}
		console.log(playerFShaderID);
		initializeGame();
	});

	display = document.getElementById("time");
	scoreDisplay = document.getElementById("score");
	statusDisplay = document.getElementById("status");
	playDisplay = document.getElementById("play");
	high_score = document.getElementById("highScore");
	high_score.textContent = highScore;

	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL is not available");
	}

	gl.viewport(0, 0, 512, 512); // set size of viewport
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // background black
	gl.clear(gl.COLOR_BUFFER_BIT); // allows color

	var timestep = lastFrame;
	player = new Player(gl, playerFShaderID); // create new player
	player.render(false, false, 0);

	render(timestep);
}

var keyEnum = {
	UP: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3
};
var keyArray = new Array(4);

function keyDown(event) {
	var keyCode = event.keyCode;

	if (keyCode == 32) { // SPACE
		event.preventDefault();
	} else if (keyCode == 37) { // LEFT
		event.preventDefault();
		keyArray[keyEnum.LEFT] = true;
	} else if (keyCode == 38) { // UP
		event.preventDefault();
		keyArray[keyEnum.UP] = true;
	} else if (keyCode == 39) { // RIGHT
		event.preventDefault();
		keyArray[keyEnum.RIGHT] = true;
	} else if (keyCode == 40) { // DOWN
		event.preventDefault();
		keyArray[keyEnum.DOWN] = true;
	}
}

function keyUp(event) {
	var keyCode = event.keyCode;
	if (keyCode == 32) { // SPACE
		event.preventDefault();
		startGame();
	} else if (keyCode == 37) { // LEFT
		event.preventDefault();
		keyArray[keyEnum.LEFT] = false;
	} else if (keyCode == 38) { // UP
		event.preventDefault();
		keyArray[keyEnum.UP] = false;
	} else if (keyCode == 39) { // RIGHT
		event.preventDefault();
		keyArray[keyEnum.RIGHT] = false;
	} else if (keyCode == 40) { // DOWN
		event.preventDefault();
		keyArray[keyEnum.DOWN] = false;
	}
}

function render(frameStart) {
	var timestep = frameStart - lastFrame;
	lastFrame = frameStart;
	gl.clear(gl.COLOR_BUFFER_BIT); // allows color
	player.render(keyArray[keyEnum.LEFT], keyArray[keyEnum.RIGHT], timestep);
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].render(timestep);
		if (blocks[i].points[blocks[i].rightBottomMax][1] <= player.points[player.leftTopMax][1] && blocks[i].points[blocks[i].leftTopMax][1] >= player.points[player.rightBottomMax][1] &&
			blocks[i].points[blocks[i].rightBottomMax][0] >= player.points[player.leftTopMax][0] && blocks[i].points[blocks[i].leftTopMax][0] <= player.points[player.rightBottomMax][0]) {

			// Change border color
			// if get red block (minus point) it will change to red
			// if get blue or white block (plus point) it will change to green
			if (blocks[i].blockData.color == 'red') {
				document.getElementsByTagName("canvas")[0].setAttribute("style", "border: 4px solid red;");
			} else {
				document.getElementsByTagName("canvas")[0].setAttribute("style", "border: 4px solid #3EDC81;");
			}

			// Adding score
			score += blocks[i].blockData.points;
			scoreDisplay.textContent = score;
			blocks.splice(i, 1);
			i--;
		} else if (blocks[i].points[blocks[i].leftTopMax][1] <= -1.0) {
			blocks.splice(i, 1);
			i--;
		}
	}
	window.requestAnimFrame(render);
}
var gameTimer;

function startTimer(duration, display) {
	var timer = duration,
		minutes, seconds;
	gameTimer = setInterval(function () {
		minutes = parseInt(timer / 60, 10);
		seconds = parseInt(timer % 60, 10);

		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;

		display.textContent = minutes + ":" + seconds;

		SpawnBlocks(timer);

		if (--timer < 0) {
			timer = 0;
		}
	}, 1000);
}

function startGame() {
	if (gameStarted == false) {
		gameStarted = true;
		score = 0;
		scoreDisplay.textContent = score;
		statusDisplay.textContent = "Playing...";
		statusDisplay.style.color = "gray";
		playDisplay.textContent = "";
		startTimer(SetTime, display);
	}
}

function SpawnBlocks(timer) {
	if (timer != 0) {
		blocks.push(new Block(gl));
	} else {
		blocks.splice(0, blocks.length);
		clearInterval(gameTimer);
		display.textContent = "01:00";
		gameStarted = false;
		if (score >= scoreThreshold) {
			if (score > highScore) {
				console.log("New Highscore");
				highScore = score;
				console.log(highScore);
				highScore = Math.max(score, highScore);
				localStorage.setItem(localStorageName, highScore);
				high_score.textContent = highScore;

				statusDisplay.textContent = "YOU WON! - New High Score : " + highScore;
				statusDisplay.style.color = "green";
			} else {
				statusDisplay.textContent = "YOU WON!";
				statusDisplay.style.color = "green";
			}

		} else {
			statusDisplay.textContent = "YOU LOST!";
			statusDisplay.style.color = "red";
		}
		playDisplay.textContent = "Press SPACE to play again!";
	}
}