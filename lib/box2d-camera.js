
// -----------------------------------------------------------------------------
// Scale Methods
// -----------------------------------------------------------------------------

// supposed to translate (x_b2, y_b2) -> (x_pixel, y_pixel).  everything else scaled by a factor of scaleFactor
var b2Camera = { 
  scaleFactor : 10,
  x_b2: 0,
  y_b2: 0,
  x_pixel: 0,
  y_pixel: 0
};

var gravity;
var gravityStrength = 20;

var scaleToWorld = function(a,b) {
  var newv;
  if (a instanceof box2d.b2Vec2) {
    newv = new box2d.b2Vec2();
    newv.x = (a.x-b2Camera.x_pixel)/b2Camera.scaleFactor+b2Camera.x_b2;
    newv.y = (a.y-b2Camera.y_pixel)/b2Camera.scaleFactor+b2Camera.y_b2;
    return newv;
  } else if ("undefined"!=typeof b) {
    newv = new box2d.b2Vec2();
    newv.x = (a-b2Camera.x_pixel)/b2Camera.scaleFactor+b2Camera.x_b2;
    newv.y = (b-b2Camera.y_pixel)/b2Camera.scaleFactor+b2Camera.y_b2;
    return newv;
  } else {
    return a/b2Camera.scaleFactor;
  }
};


var makeB2Vec2 = function(a,b) {
  var newv;
  newv = new box2d.b2Vec2();
  newv.x = (a)/1;
  newv.y = (b)/1;
  return newv;
};

var scaleToPixels = function(a,b) {
  var newv;
  if (a instanceof box2d.b2Vec2) {
    newv = new box2d.b2Vec2();
    newv.x = (a.x-b2Camera.x_b2)*b2Camera.scaleFactor+b2Camera.x_pixel;
    newv.y = (a.y-b2Camera.y_b2)*b2Camera.scaleFactor+b2Camera.y_pixel;
    return newv;
  } else if ("undefined"!=typeof b) {
    newv = new box2d.b2Vec2();
    newv.x = (a-b2Camera.x_b2)*b2Camera.scaleFactor+b2Camera.x_pixel;
    newv.y = (b-b2Camera.y_b2)*b2Camera.scaleFactor+b2Camera.y_pixel;
    return newv;
  } else {
    return a*b2Camera.scaleFactor;
  }
};

// -----------------------------------------------------------------------------
// Create Methods
// -----------------------------------------------------------------------------

var createWorld = function() {

	var worldAABB = new box2d.b2AABB();
	worldAABB.lowerBound.SetXY(-this.bounds, -this.bounds);
	worldAABB.upperBound.SetXY(this.bounds, this.bounds);
	gravity = new box2d.b2Vec2(0,gravityStrength);
	var doSleep = true;

	return new box2d.b2World(gravity, doSleep);
};

// -----------------------------------------------------------------------------
// Draw Methods
// -----------------------------------------------------------------------------

var debugDraw = function(canvas, scale, world) {

	var context = canvas.getContext('2d');
  var j, b, f;
  context.fillStyle = '#DDD';
  context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw joints
	for( j=world.m_jointList; j; j=j.m_next) {
    context.lineWidth = 0.25;
    context.strokeStyle = '#00F';
    drawJoint(context, scale, world, j);
  }

	// Draw body shapes
	for( b=world.m_bodyList; b; b=b.m_next) {
		for( f = b.GetFixtureList(); f!==null; f=f.GetNext()) {  
      context.lineWidth = 0.5;
			context.strokeStyle = '#F00';
      drawShape(context, scale, world, b, f);
    }
  }
};

var drawJoint = function(context, scale, world, joint) {
	context.save();
  context.scale(scale,scale);
  context.lineWidth /= scale;

  var b1 = joint.m_bodyA;
  var b2 = joint.m_bodyB;
  var x1 = b1.GetPosition();
  var x2 = b2.GetPosition();
  var p1 = joint.GetAnchorA();
  var p2 = joint.GetAnchorB();

  context.beginPath();
  switch (joint.m_type) {
    case box2d.b2Joint.e_distanceJoint:
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      break;
    default: {
      if (b1 == world.m_groundBody) {
        context.moveTo(p1.x, p1.y);
        context.lineTo(x2.x, x2.y);
      }
      else if (b2 == world.m_groundBody) {
        context.moveTo(p1.x, p1.y);
        context.lineTo(x1.x, x1.y);
      }
      else {
        context.moveTo(x1.x, x1.y);
        context.lineTo(p1.x, p1.y);
        context.lineTo(x2.x, x2.y);
        context.lineTo(p2.x, p2.y);
      }
    } break;
  }
  context.closePath();
  context.stroke();
  context.restore();
};

var drawShape = function(context, scale, world, body, fixture) {

  context.save();
  context.scale(scale,scale);

  var bPos = body.GetPosition();
  context.translate(bPos.x, bPos.y);
  context.rotate(body.GetAngleRadians());
  
  context.beginPath();
  context.lineWidth /= scale;

	var shape = fixture.m_shape;
  var i;
  switch(shape.m_type) {
    case box2d.b2ShapeType.e_circleShape: {
      var r = shape.m_radius;
      var segments = 16.0;
      var theta = 0.0;
      var dtheta = 2.0 * Math.PI / segments;

      context.moveTo(r, 0);
      for (i = 0; i < segments; i++) {
        context.lineTo(r + r * Math.cos(theta), r * Math.sin(theta));
        theta += dtheta;
      }
      context.lineTo(r, 0);
    } break;

    case box2d.b2ShapeType.e_polygonShape:
    case box2d.b2ShapeType.e_chainShape: {

      var vertices = shape.m_vertices;
      var vertexCount = shape.m_count;
      if (!vertexCount) return;

      context.moveTo(vertices[0].x, vertices[0].y);
      for (i = 0; i < vertexCount; i++)
        context.lineTo(vertices[i].x, vertices[i].y);
    } break;
  }

  context.closePath();
  context.stroke();
  context.restore();
};