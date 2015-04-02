// useful simple math functions

sign = Math.sign || function sign(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
      return x;
  }
  return x > 0 ? 1 : -1;
};

function rectify(x, minValue, maxValue) {
  if (x > maxValue) return maxValue;
  if (x < minValue) return minValue;
  return x;
}

function getWidth() {
  return $(window).width()-20*0;
}

function getHeight() {
  return $(window).height()-20*0;
}

// useful helper functions
var getRandom = function (min, max) {
  return Math.random() * (max - min) + min;
};

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

var getRandomColor = function(alpha) {
  var c = color(getRandomInt(127, 255), getRandomInt(127, 255), getRandomInt(127, 255), alpha? alpha : 0);
  return c;
};

var cosTable = new Array(360);
var sinTable = new Array(360);
var PI = Math.PI;

// pre compute sine and cosine values to the nearest degree
for (i = 0; i < 360; i++) {
  cosTable[i] = Math.cos((i / 360) * 2 * PI);
  sinTable[i] = Math.sin((i / 360) * 2 * PI);
}

var fastSin = function (xDeg) {
  var deg = Math.round(xDeg);
  if (deg >= 0) {
    return sinTable[(deg % 360)];
  }
  return -sinTable[((-deg) % 360)];
};

var fastCos = function (xDeg) {
  var deg = Math.round(Math.abs(xDeg));
  return cosTable[deg % 360];
};
