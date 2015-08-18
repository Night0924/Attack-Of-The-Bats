var Vector2 = function() {
	this.x;
	this.y;
};

Vector2.prototype.set = function(x, y)
{
	var vector2 = new Vector2(x, y)
};

Vector2.prototype.normalize = function()
{
	var length = Math.sqrt(this.x * this.x + this.y * this.y);
	
	var normalX = Vector2.x / length;
	var normalY = Vector2.y / length;
}

Vector2.prototype.add = function(v2)
{
	v2 = (this.x, this.y) + v2;
	return v2;
}

Vector2.prototype.subtract = function(v2)
{
	v2 = (this.x, this.y) - v2;
	return v2;
}

Vector2.prototype.multiplyScalar = function(num)
{
	var vector = num*(this.x, this.y);
	return vector;
}