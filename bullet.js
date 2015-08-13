var BULLET_SPEED = 3;

var bullets = [];

var Bullet = function() {
	this.image = document.createElement('img');
	this.x = player.x;
	this.y = player.y;
	this.width = 5;
	this.height = 5;
	this.velocityX = 0;
	this.velocityY = 0;
	
	this.image.src = "bullet.png"
};

Bullet.prototype.shootDelay = function(canShoot, shootCount)
{
	if(canShoot == true && shootCount >= 50)	
	{
		shootTimer +=0.3;
		playerShoot();
		shootCount = 0;
	}
	else
	{
		shootCount += 1;
	}
}

Bullet.prototype.update = function()
{
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].x += bullets[i].velocityX;
		bullets[i].y += bullets[i].velocityY;
	}
	for(var i=0; i<bullets.length; i++)
	{
		if(bullets[i].x < -bullets[i].width || bullets[i].x > SCREEN_WIDTH || bullets[i].y < -bullets[i].height || bullets[i].y > SCREEN_HEIGHT)
		{
			bullets.splice(i, 1);
			break;
		}
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		context.drawImage(bullets[i].image, bullets[i].x - bullets[i].width/2, bullets[i].y - bullets[i].height/2);
	}
}

Bullet.prototype.playerShoot = function(playerRotation, x, y)
{
	var velX = 0;
	var velY = 1;
	
	var s = Math.sin(playerRotation);
	var c = Math.cos(playerRotation);
	
	var xVel = (velX * c) - (velY * s);
	var yVel = (velX * s) + (velY * c);

	this.velocityX = xVel * BULLET_SPEED;
	this.velocityY = yVel * BULLET_SPEED;
	
	this.x += this.velocityX;
	this.y += this.velocityY;
	
	this.x = x;
	this.y = y;
	
	bullets.push(this);
};

Bullet.prototype.draw = function()
{
	context.drawImage(bullet.image, this.x, this.y)
};