var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

//----------------------
//	    CONSTANTS
//----------------------

// SCREEN
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

// LEVEL
var LAYER_COUNT = 3;
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
var MAP = {tw: 60, th: 15};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

// FORCES
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 1500;

// STATES
var STATE_SPLASH = 0;
var STATE_MAINMENU = 1;
var STATE_SETTINGS = 2;
var STATE_CREDITS = 3;
var STATE_GAME = 4;
var STATE_GAMEOVER = 5;

// SELECTED ITEM MENU
var MENU_PLAY = 0;
var MENU_SETTINGS = 1;
var MENU_CREDITS = 2;

//----------------------
//	     ARRAYS
//----------------------

var cells = [];

//----------------------
//	    VARIABLES
//----------------------

// FPS
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// SHOOT
var shootCount = 50;

// OBJECTS
var enemy = new Enemy();
var player = new Player();
var keyboard = new Keyboard();
var bullet = new Bullet();
var logo = document.createElement("img");
logo.src = "logo.png";
var gameLogo = document.createElement("img");
gameLogo.src = "gameLogo.png";
var overworld = document.createElement("img");
overworld.src = "overworld.png";
var cave = document.createElement("img");
cave.src = "cave.png";

var newSize = scaleSize(200, 200, 500, 313);

// SELECTION
var selectionTimer = 0;
var selectedItem = MENU_PLAY;

// STATES
var gameState = STATE_SPLASH;

// SPLASH
var splashTimer = 10;
var wordTimer = 0;

// LEVEL TILES
var tileset = document.createElement("img");
tileset.src = "resources/tileset.png";

//----------------------
// COLLISION DETECTION
//----------------------
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 || x2+ w2 < x1 || x2 > x1 + w1 || y2 > y1 + h1)
	{
		return false;
	}
	return true;
}

function cellAtPixelCoord(layer, x,y)
{
	if(x < 0 || x > SCREEN_WIDTH || y < 0)
		return 1;
	if(y>SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
	if(tx < 0 || tx >= MAP.tw || ty < 0)
		return 1;
	if(ty>=MAP.th)
		return 0;
	return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
	return tile * TILE;
};

function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
};


function drawMap()
{
	for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
	{
		var idx = 0;
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			for( var x = 0; x < level1.layers[layerIdx].width; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, x*TILE, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function initialize()
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
	{
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++)
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++)
			{
				if(level1.layers[layerIdx].data[idx] != 0)
				{
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1)
				{
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
}

function run()
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	
	switch(gameState)
	{
	case STATE_SPLASH:
		runSplash(deltaTime);
		break;
	case STATE_MAINMENU:
		runMainMenu(deltaTime);
		break;
	case STATE_GAME:
		runGame(deltaTime);
		break;
	case STATE_SETTINGS:
		break;
	case STATE_CREDITS:
		break;
	case STATE_GAMEOVER:
		runGameOver(deltaTime);
		break;
	}
}

function runSplash(deltaTime)
{
	if(keyboard.isKeyDown(keyboard.KEY_ESCAPE) == true)
	{
		gameState = STATE_MAINMENU;
	}
	
	splashTimer -= deltaTime;
	if(splashTimer <= 0)
	{
		gameState = STATE_MAINMENU;
		return;
	}
	
	wordTimer += deltaTime;
	if(wordTimer <= 3)
	{
		context.fillStyle = "#000";
		context.font="24px Arial";
		context.fillText("Chuck Norris stars in:", 210, 240);
	}
	else if(wordTimer <= 6)
	{
		context.fillStyle = "#000";
		context.font="24px Arial";
		context.fillText("A Relentless Games production", 160, 240);
		context.drawImage(logo, 260, 150);
	}
	else if(wordTimer >= 6)
	{
		context.drawImage(gameLogo, 210, 180);
	}
	
}

function runMainMenu(deltaTime)
{
	/* newSize = scaleSize(200, 200, logo.width, logo.height);
	logo.width = newSize[0];
	logo.height = newSize[1]; */
	
	context.drawImage(logo, 501, 400);
	context.drawImage(gameLogo, 5, 400);
	
	context.fillStyle = "#FFF";
	context.font="24px Arial";
	context.fillText("Play", 295, 70);
	
	context.fillText("Settings", 275, 100);
	
	context.fillText("Credits", 280, 130)
	
	if(keyboard.isKeyDown(keyboard.KEY_DOWN) == true && selectionTimer >= 40)
	{
		if(selectedItem == MENU_PLAY)
		{
			selectedItem = MENU_SETTINGS;
		}
		else if(selectedItem == MENU_SETTINGS)
		{
			selectedItem = MENU_CREDITS;
		}
		else if(selectedItem == MENU_CREDITS)
		{
			selectedItem = MENU_PLAY;
		}
		selectionTimer = 0;
	}
	else if(keyboard.isKeyDown(keyboard.KEY_UP) == true && selectionTimer >= 40)
	{
		if(selectedItem == MENU_PLAY)
		{
			selectedItem = MENU_CREDITS;
		}
		else if(selectedItem == MENU_SETTINGS)
		{
			selectedItem = MENU_PLAY;
		}
		else if(selectedItem == MENU_CREDITS)
		{
			selectedItem = MENU_SETTINGS;
		}
		selectionTimer = 0;
	}
	else{
		selectionTimer += 1;
	}
	
	if(selectedItem == MENU_PLAY)
	{
		context.fillStyle = "#000";
		context.font="24px Arial";
		context.fillText("Play", 295, 70);
	}
	else if(selectedItem == MENU_SETTINGS)
	{
		context.fillStyle = "#000";
		context.font="24px Arial";
		context.fillText("Settings", 275, 100);
	}
	else if(selectedItem == MENU_CREDITS)
	{
		context.fillStyle = "#000";
		context.font="24px Arial";
		context.fillText("Credits", 280, 130)
	}
	
	if(keyboard.isKeyDown(keyboard.KEY_ENTER) == true)
	{
		if(selectedItem == MENU_PLAY)
		{
			gameState = STATE_GAME;
		}
		else if(selectedItem == MENU_SETTINGS)
		{
			gameState = STATE_SETTINGS;
		}
		else if(selectedItem == MENU_CREDITS)
		{
			gameState = STATE_CREDITS;
		}
	}
}

function scaleSize(maxW, maxH, currW, currH)
{
	var ratio = currH / currW;
	
	if(currW >= maxW || ratio <= 1)
	{
		currW = maxW;
		currH = currW * ratio;
	}
	else if(currH >= maxH)
	{
		currH = maxH;
		currW = currH / ratio;
	}
	
	return [currW, currH]
}

function runGame(deltaTime)
{
	context.drawImage(cave, 0, 0)
	drawMap();
	
	bullet.shootTimerReset(deltaTime);
	
	if(keyboard.isKeyDown(keyboard.KEY_SHIFT) == true && shootTimer <= 0)
	{
		bullet.shootDelay(shootCount, player.rotation, player.x, player.y);
		shootCount += 1;
		if(shootCount >= 51)
		{
			shootCount = 0; 
		}
	}
	
	bullet.update();
	
	if(player.isDead == false)
	{
		player.update(deltaTime);
		player.draw();
	}
	
	/* if(bullet.collisions(enemy.x, enemy.y, enemy.width, enemy.height) == true)
	{
		enemy.isDead = true;
		enemy.x = 9000;
		enemy.y = 9000;
	}
	
	if(enemy.isDead == false)
	{
		enemy.update(deltaTime);
		enemy.draw();
	} */
	
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
	
	if(player.position.y > SCREEN_HEIGHT)
	{
		player.isDead = true;
	}
	
	if(player.isDead == true)
	{
		gameState = STATE_GAMEOVER;
	}
}

function runGameOver()
{
	
}

initialize();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
