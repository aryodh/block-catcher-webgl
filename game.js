/*

Created by:
Zack Rauen

*/
var player;
var blocks = [];
var gl;

var display, scoreDisplay, statusDisplay, playDisplay;

var score = 0,
	scoreThreshold = 500;
var SetTime = 60;
var gameStarted = false;
var lastFrame = performance.now();

function initializeGame() {

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
	player = new Player(gl); // create new player
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

// Function for check action when pressing a key
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

// Function for check action when unpressing a key
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

		// Check if the block was catch
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
var localStorageName = "crackalien";
var highScore;
highScore = localStorage.getItem(localStorageName) == null ? 0 :
	localStorage.getItem(localStorageName);


// Timer function
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

// Start new game
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

// Spawn new block
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