

/*    

p5.js implementation of slime volleyball, with evolved neural networks to be the ai.

@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2015 david ha, otoro.net, otoro labs

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.   


@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

// game settings:
var showArrowKeys = true;
var ref_w = 24;
var ref_h = ref_w;
var ref_u = 1.5; // ground height
var ref_wallwidth = 1.0; // wall width
var ref_wallheight = 3.5;
var factor = 1;
var playerSpeedX = 10;
var playerSpeedY = 10;
var maxBallSpeed = 15;
var gravity;
var timeStep = 1/30;
var theFrameRate = 60*1;
var nudge = 0.1;
var friction = 1.0; // 1 means no friction, less means friction
var windDrag = 1.0;
var initDelayFrames = 30*2*1;
var trainingFrames = 30*20; // assume each match is 7 seconds. (vs 30fps)
var theGravity = -9.8*2;
var trainingMode = false;
var human1 = false; // if this is true, then player 1 is controlled by keyboard
var human2 = false; // same as above
var humanHasControlled = false;
var trainer = null;
var generationCounter = 0;
var traningVersion = false;

var initGeneJSON1 = '{"fitness":1.5,"nTrial":0,"gene":{"0":5.8365,"1":1.4432,"2":3.1023,"3":0.2617,"4":-3.5896,"5":-1.0675,"6":-5.3384,"7":0.8505,"8":-3.1851,"9":-5.6325,"10":-3.2459,"11":0.7676,"12":1.321,"13":-1.4931,"14":-1.1353,"15":-0.2911,"16":1.164,"17":0.8755,"18":-1.1329,"19":0.3585,"20":-3.9182,"21":0.325,"22":-0.3397,"23":-0.2513,"24":0.5678,"25":1.9984,"26":0.7691,"27":2.6176,"28":1.791,"29":-0.9755,"30":1.8437,"31":0.4196,"32":0.5471,"33":-2.6769,"34":1.6382,"35":1.1442,"36":7.1792,"37":2.4046,"38":0.5512,"39":2.8792,"40":0.6744,"41":3.8023,"42":-2.704,"43":2.872,"44":-3.7659,"45":-1.7561,"46":-1.5691,"47":-5.0168,"48":-3.1482,"49":0.4531,"50":6.3125,"51":0.2956,"52":2.5486,"53":-0.3944,"54":-2.7155,"55":-5.5154,"56":-1.1787,"57":-3.8094,"58":-2.0738,"59":-4.0264,"60":3.3217,"61":11.0153,"62":2.8341,"63":-0.2914,"64":4.8417,"65":-0.9244,"66":-3.2621,"67":-0.2639,"68":-1.3825,"69":-1.1969,"70":0.7021,"71":-4.1637,"72":-1.5203,"73":-3.1297,"74":-1.7193,"75":-2.1526,"76":4.2902,"77":1.4272,"78":-0.6137,"79":1.1164,"80":-0.0067,"81":1.0377,"82":-0.2344,"83":-0.3008,"84":-2.3273,"85":2.4405,"86":-2.3012,"87":-1.9193,"88":-3.7453,"89":1.44,"90":-4.5812,"91":-1.9701,"92":2.3101,"93":-4.2018,"94":-3.0907,"95":1.7332,"96":-3.311,"97":-2.2417,"98":-1.9073,"99":5.5644,"100":2.5601,"101":3.2058,"102":0.7374,"103":-3.6406,"104":-0.6569,"105":2.5963,"106":3.074,"107":-4.7564,"108":1.0644,"109":-0.7439,"110":-0.2318,"111":1.1902,"112":-2.2391,"113":1.5935,"114":-4.6269,"115":-2.0589,"116":-2.2949,"117":-0.4391,"118":7.0848,"119":4.902,"120":-0.929,"121":3.1709,"122":0.163,"123":-1.6548,"124":-0.0521,"125":0.3726,"126":-1.3681,"127":-0.2623,"128":-1.4581,"129":0.3422,"130":1.1412,"131":-0.2376,"132":0.7743,"133":3.0866,"134":-3.6638,"135":-0.9372,"136":2.5364,"137":-1.3026,"138":-1.7666,"139":-0.1401}}';

var initGeneJSON2 = '{"fitness":1.2,"nTrial":0,"gene":{"0":6.5097,"1":2.3385,"2":0.1029,"3":0.5598,"4":-6.3998,"5":-1.2678,"6":-4.4426,"7":0.8709,"8":-4.4122,"9":-7.7086,"10":0.769,"11":2.1251,"12":0.8503,"13":-0.8715,"14":-0.9924,"15":0.0656,"16":1.0124,"17":0.1899,"18":-2.8846,"19":0.3021,"20":-6.7481,"21":0.3985,"22":-4.174,"23":1.1515,"24":-1.4622,"25":-0.5959,"26":0.5139,"27":2.9706,"28":2.043,"29":0.189,"30":1.3854,"31":-4.0551,"32":-2.7276,"33":-5.0728,"34":4.6398,"35":4.0611,"36":9.7766,"37":0.7044,"38":0.8835,"39":4.2447,"40":0.4375,"41":1.0766,"42":-1.8893,"43":-0.6249,"44":-3.2812,"45":-0.7335,"46":-3.1081,"47":-4.3488,"48":-2.7436,"49":0.7618,"50":8.131,"51":-0.967,"52":3.6646,"53":2.5841,"54":-2.7902,"55":-6.0235,"56":-3.595,"57":-1.7922,"58":-3.8774,"59":-2.701,"60":3.674,"61":13.4126,"62":3.4967,"63":-0.7306,"64":2.8581,"65":-1.6179,"66":-5.6636,"67":-0.8102,"68":-2.6126,"69":-1.5072,"70":1.3759,"71":-4.8595,"72":0.3855,"73":-3.3951,"74":-3.4629,"75":1.0211,"76":3.0887,"77":-1.372,"78":0.7817,"79":-1.4717,"80":1.3833,"81":1.4233,"82":-1.5142,"83":-1.7674,"84":-2.4652,"85":1.913,"86":-2.3676,"87":-1.0603,"88":-6.4953,"89":0.4749,"90":-5.6628,"91":-1.6198,"92":-0.4882,"93":-4.4501,"94":-5.0181,"95":1.9535,"96":-3.4906,"97":0.1522,"98":-0.4891,"99":6.3273,"100":2.2241,"101":2.1854,"102":6.0501,"103":-0.2328,"104":-0.542,"105":4.1188,"106":2.343,"107":-4.705,"108":1.4819,"109":-2.1852,"110":-0.2348,"111":-0.6274,"112":0.7755,"113":3.2003,"114":-6.7855,"115":-3.9196,"116":-3.1513,"117":-1.4553,"118":6.7805,"119":5.0117,"120":-0.4204,"121":2.3323,"122":-2.7064,"123":-1.9625,"124":-3.5944,"125":2.7761,"126":-1.4873,"127":-0.477,"128":-1.4658,"129":0.2057,"130":0.4323,"131":-0.8676,"132":-0.9874,"133":2.4903,"134":-3.1455,"135":-2.6227,"136":5.2044,"137":-0.6598,"138":1.6745,"139":1.5329}}';

var initGeneRaw = JSON.parse(initGeneJSON2);

var initGene = convnetjs.zeros(Object.keys(initGeneRaw.gene).length); // Float64 faster.
for (var i = 0; i < initGene.length; i++) {
  initGene[i] = initGeneRaw.gene[i];
}

//initGene = null;

// html elements
var myCanvas;

var handSymbolDisplayed = true;
function moveHandSymbol(x, y) {
  $("#theHand").css({ 
      "position": "absolute",
      "top": (y) + "px",
      "left": (x-32) + "px",
      "font-size": 3.5 +"em",
      "color": "#459AD3"
      });
}

function hideHandSymbol() {
  if (handSymbolDisplayed) {
    $("#theHand").hide();
  }
  handSymbolDisplayed = false;
}

function showHandSymbol() {
  $("#theHand").fadeIn(500);
}
/*
var intro = {
  text: null,
};
*/

// declare objects
var game = {
  ball: null,
  deadball: null,
  ground: null,
  fence: null,
  fenceStub: null,
  agent1: null,
  agent2: null
};

// deal with mobile device nuances
var mobileMode = false;
var md = null;

// conversion to pixels
function toX(x) {
  return (x+ref_w/2)*factor;
}
function toP(x) {
  return (x)*factor;
}
function toY(y) {
  return height-y*factor;
}

var delayScreen = {
  life: initDelayFrames,
  init: function(life) {
    this.life = life;
  },
  status: function() {
    if (this.life === 0) {
      return true;
    }
    this.life -= 1;
    return false;
  }
};

// objects
function Particle(loc, v, r, c) { // location p5.Vector, velocity p5.Vector, r float, color
  "use strict";
  this.loc = loc || createVector(random(-ref_w*1/4, ref_w*1/4), random(ref_w/4, ref_w*3/4));
  //console.log(this.loc);
  this.prevLoc = this.loc.copy();
  this.v = v || createVector(random(-20, 20), random(10, 25));
  this.r = r || random(0.5, 1.5);
  this.c = c || getRandomColor(128);
}
Particle.prototype.move = function() {
  this.prevLoc = this.loc.copy();
  this.loc.add(p5.Vector.mult(this.v, timeStep));
  this.v.mult(1-(1-windDrag)*timeStep);
};
Particle.prototype.applyAcceleration = function(acceleration) {
  this.v.add(p5.Vector.mult(acceleration, timeStep));
};
Particle.prototype.checkEdges = function() {
  if (this.loc.x<=this.r-ref_w/2) {
    this.v.x *= -friction;
    this.loc.x = this.r-ref_w/2+nudge*timeStep;
  }
  if (this.loc.x >= (ref_w/2-this.r)) {
    this.v.x *= -friction;
    this.loc.x = ref_w/2-this.r-nudge*timeStep;
  }
  if (this.loc.y<=this.r+ref_u) {
    this.v.y *= -friction;
    this.loc.y = this.r+ref_u+nudge*timeStep;
    if (this.loc.x <= 0) {
      return -1;
    } else {
      return 1;
    }
  }
  if (this.loc.y >= (ref_h-this.r)) {
    this.v.y *= -friction;
    this.loc.y = ref_h-this.r-nudge*timeStep;
  }
  // fence:
  if ((this.loc.x <= (ref_wallwidth/2+this.r)) && (this.prevLoc.x > (ref_wallwidth/2+this.r)) && (this.loc.y <= ref_wallheight)) {
    this.v.x *= -friction;
    this.loc.x = ref_wallwidth/2+this.r+nudge*timeStep;
  }
  if ((this.loc.x >= (-ref_wallwidth/2-this.r)) && (this.prevLoc.x < (-ref_wallwidth/2-this.r)) && (this.loc.y <= ref_wallheight)) {
    this.v.x *= -friction;
    this.loc.x = -ref_wallwidth/2-this.r-nudge*timeStep;
  }
  return 0;
};
Particle.prototype.getDist2 = function(p) { // returns distance squared from p
  var dy = p.loc.y - this.loc.y;
  var dx = p.loc.x - this.loc.x;
  return (dx*dx+dy*dy);
};
Particle.prototype.isColliding = function(p) { // returns true if it is colliding w/ p
  var r = this.r + p.r;
  return (r*r > this.getDist2(p)); // if distance is less than total radius, then colliding.
};
Particle.prototype.bounce = function(p) { // bounce two balls that have collided (this and that)
  var ab = createVector();
  //debugger;
  ab.set(this.loc);
  ab.sub(p.loc);
  ab.normalize();
  ab.mult(nudge);
  while(this.isColliding(p)) {
    this.loc.add(ab);
  }
  var n = p5.Vector.sub(this.loc, p.loc);
  n.normalize();
  var u = p5.Vector.sub(this.v, p.v);
  var un = p5.Vector.mult(n, u.dot(n)*2); // added factor of 2
  u.sub(un);
  //u.mult(0.5);
  this.v = p5.Vector.add(u, p.v);

  //p.v = p5.Vector.add(un, p.v); // don't move the agent.
};
Particle.prototype.limitSpeed = function(minSpeed, maxSpeed) {
  var mag2 = this.v.magSq();
  if (mag2 > (maxSpeed*maxSpeed) ) {
    this.v.normalize();
    this.v.mult(maxSpeed);
  }
  if (mag2 < (minSpeed*minSpeed) ) {
    this.v.normalize();
    this.v.mult(minSpeed);
  }
  return;
};
Particle.prototype.display = function() {
  "use strict";
  noStroke();
  fill(this.c);
  ellipse(toX(this.loc.x), toY(this.loc.y), toP(this.r)*2, toP(this.r)*2);
};

// design agent's brain using neural network
function Brain() {
  "use strict";
  this.nGameInput = 12; // 8 states for agent, plus 4 state for opponent
  this.nGameOutput = 3; // 3 buttons (forward, backward, jump)
  this.nRecurrentState = 4; // extra recurrent states for feedback.
  this.nOutput = this.nGameOutput+this.nRecurrentState;
  this.nInput = this.nGameInput+this.nOutput;

  // store current inputs and outputs
  this.inputState = convnetjs.zeros(this.nInput);
  this.convInputState = new convnetjs.Vol(1, 1, this.nInput); // compatible with convnetjs lib input.
  this.outputState = convnetjs.zeros(this.nOutput);
  this.prevOutputState = convnetjs.zeros(this.nOutput);

  // setup neural network:
  this.layer_defs = [];
  this.layer_defs.push({
    type: 'input',
    out_sx: 1,
    out_sy: 1,
    out_depth: this.nInput
  });
  this.layer_defs.push({
    type: 'fc',
    num_neurons: this.nOutput,
    activation: 'tanh'
  });

  this.net = new convnetjs.Net();
  this.net.makeLayers(this.layer_defs);

  var chromosome = new convnetjs.Chromosome(initGene);

  chromosome.pushToNetwork(this.net);

  //convnetjs.randomizeNetwork(this.net); // set init settings to be random.
}
Brain.prototype.populate = function (chromosome) { // populate network with a given chromosome.
  chromosome.pushToNetwork(this.net);
};
Brain.prototype.arrayToString = function(x, precision) {
  "use strict";
  var result = "[";
  for (var i = 0; i < x.length; i++) {
    result += Math.round(precision*x[i])/precision;
    if (i < x.length-1) {
      result += ",";
    }
  }
  result += "]";
  return result;
};
Brain.prototype.getInputStateString = function() {
  "use strict";
  return this.arrayToString(this.inputState, 100);
};
Brain.prototype.getOutputStateString = function() {
  "use strict";
  return this.arrayToString(this.outputState, 100);
};
// get current input for nn
Brain.prototype.setCurrentInputState = function (agent, opponent) {
  "use strict";
  var i;
  var scaleFactor = 10; // scale inputs to be in the order of magnitude of 10.
  var scaleFeedback = 1; // to scale back up the feedback.
  this.inputState[0] = agent.state.x/scaleFactor;
  this.inputState[1] = agent.state.y/scaleFactor;
  this.inputState[2] = agent.state.vx/scaleFactor;
  this.inputState[3] = agent.state.vy/scaleFactor;
  this.inputState[4] = agent.state.bx/scaleFactor;
  this.inputState[5] = agent.state.by/scaleFactor;
  this.inputState[6] = agent.state.bvx/scaleFactor;
  this.inputState[7] = agent.state.bvy/scaleFactor;
  this.inputState[8] = 0*opponent.state.x/scaleFactor;
  this.inputState[9] = 0*opponent.state.y/scaleFactor;
  this.inputState[10] = 0*opponent.state.vx/scaleFactor;
  this.inputState[11] = 0*opponent.state.vy/scaleFactor;
  for (i = 0; i < this.nOutput; i++) { // feeds back output to input
    this.inputState[i+this.nGameInput] = this.outputState[i]*scaleFeedback;
  }

  for (i = 0; i < this.nInput; i++) { // copies input state into convnet cube object format to be used later.
    this.convInputState.w[i] = this.inputState[i];
  }

};
Brain.prototype.forward = function () {
  "use strict";
  // get output from neural network:
  var a = this.net.forward(this.convInputState);
  for (var i = 0; i < this.nOutput; i++) {
    this.prevOutputState[i] = this.outputState[i]; // backs up previous value.
    this.outputState[i] = a.w[i];
  }
};

function matchFunction(chromosome1, chromosome2) { // this function is passed to trainer.
  var result = 0;
  var oldInitDelayFrames = initDelayFrames;
  initDelayFrames = 1;
  trainingMode = true;
  initGame();
  // put chromosomes into brains before getting them to duel it out.
  game.agent1.brain.populate(chromosome1);
  game.agent2.brain.populate(chromosome2);
  result = update(trainingFrames); // the dual
  trainingMode = false;
  initDelayFrames = oldInitDelayFrames;
  return result; // -1 means chromosome1 beat chromosome2, 1 means vice versa, 0 means tie.
}

function Trainer(brain, initialGene) {
  // trainer for neural network interface.  must pass in an initial brain so it knows the net topology.
  // the constructor won't modify the brain object passed in.

  this.net = new convnetjs.Net();
  this.net.makeLayers(brain.layer_defs);

  this.trainer = new convnetjs.GATrainer(this.net, {
      population_size: 50*1,
      mutation_size: 0.1,
      mutation_rate: 0.05,
      num_match: 4*2,
      elite_percentage: 0.20
    }, initialGene);

}
Trainer.prototype.train = function() {
  this.trainer.matchTrain(matchFunction);
};
Trainer.prototype.getChromosome = function(n) {
  // returns a copy of the nth best chromosome (if not provided, returns first one, which is the best one)
  n = n || 0;
  return this.trainer.chromosomes[n].clone();
};

function Agent(dir, loc, c) {
  "use strict";
  this.dir = dir; // -1 means left, 1 means right player for symmetry.
  this.loc = loc || createVector(ref_w/4, 1.5);
  this.v = createVector(0, 0);
  this.desiredVelocity = createVector(0, 0);
  this.r = 1.5;
  this.c = c;
  this.opponent = null;
  this.score = 0;
  this.emotion = "happy"; // hehe...
  this.action = { // the current set of actions the agent wants to take 
    forward : false, // this set of actions can be set either by neural net, or keyboard
    backward : false,
    jump : false
  };
  this.actionIntensity = [0, 0, 0];
  this.state = { // complete game state for this agent.  used by neural network.
    x: 0, // normalized to side, appears different for each agent's perspective
    y: 0,
    vx: 0,
    vy: 0,
    bx: 0, 
    by: 0,
    bvx: 0,
    bvy: 0
  };
  this.brain = new Brain();
}
Agent.prototype.setOpponent = function(opponent) { // sets the opponent into this agent
  "use strict";
  this.opponent = opponent;
};
Agent.prototype.setAction = function(forward, backward, jump) {
  "use strict";
  this.action.forward = forward;
  this.action.backward = backward;
  this.action.jump = jump;
};
Agent.prototype.setBrainAction = function() {
  "use strict"; // this function converts the brain's output layer into actions to move forward, backward, or jump
  var forward = this.brain.outputState[0] > 0.75; // sigmoid decision.
  var backward = this.brain.outputState[1] > 0.75; // sigmoid decision.
  var jump = this.brain.outputState[2] > 0.75; // sigmoid decision.
  this.setAction(forward, backward, jump);
};
Agent.prototype.processAction = function() { // convert action into real movement
  "use strict";
  var forward = this.action.forward;
  var backward = this.action.backward;
  var jump = this.action.jump;
  this.desiredVelocity.x = 0;
  this.desiredVelocity.y = 0;

  if (forward && !backward) {
    this.desiredVelocity.x = -playerSpeedX;
  }
  if (backward && !forward) {
    this.desiredVelocity.x = playerSpeedX;
  }

  if (jump) {
    this.desiredVelocity.y = playerSpeedY;
  }
};
Agent.prototype.move = function() {
  "use strict";
  this.loc.add(p5.Vector.mult(this.v, timeStep));
};
Agent.prototype.getState = function() { // returns game state for this agent
  "use strict";
  this.state = { // complete game state for this agent.  used by neural network.
    x: this.loc.x*this.dir, // normalized to side, appears different for each agent's perspective
    y: this.loc.y,
    vx: this.v.x*this.dir,
    vy: this.v.y,
    bx: game.ball.loc.x*this.dir, 
    by: game.ball.loc.y,
    bvx: game.ball.v.x*this.dir,
    bvy: game.ball.v.y
  };
  return this.state;
};
Agent.prototype.printState = function() {
  // prints the state of the agent on the side of the screen the agent is on
  // uses p5.js text functions
  "use strict";
  // print fps
  var r = 10;
  var stateText = '';
  var state = this.getState();
  stateText += 'X: '+Math.round(state.x*r)/r+'\n';
  stateText += 'Y: '+Math.round(state.y*r)/r+'\n';
  stateText += 'vx: '+Math.round(state.vx*r)/r+'\n';
  stateText += 'vy: '+Math.round(state.vy*r)/r+'\n';
  stateText += 'bx: '+Math.round(state.bx*r)/r+'\n';
  stateText += 'by: '+Math.round(state.by*r)/r+'\n';
  stateText += 'bvx: '+Math.round(state.bvx*r)/r+'\n';
  stateText += 'bvy: '+Math.round(state.bvy*r)/r+'\n';
  fill(this.c);
  stroke(this.c);
  textFont("Courier New");
  textSize(16);
  text(stateText, toX(this.dir*ref_w/4), toP(ref_u));
};
Agent.prototype.drawState = function(human) { // illustrates inputState and output actions on p5 canvas
  "use strict";
  var brain = this.brain;
  var r = red(this.c);
  var g = green(this.c);
  var b = blue(this.c);
  var i, j = 0;
  var temp;
  var radius = ref_w/2/((brain.nGameInput-4)+4);
  var factor = 3/4;
  var startX = ref_w/4 - radius*((brain.nGameInput-4)/2);
  var ballFactor = 1.0;
  var startX2 = ref_w/4 - ballFactor*radius*(brain.nGameOutput/2);
  var secondLayerY = Math.max(height*1/8+toP(radius)+0.5*toP(radius), height*3/16);

  this.actionIntensity[0] += (this.action.forward ? 16 : 0);
  this.actionIntensity[1] += (this.action.jump ? 16 : 0);
  this.actionIntensity[2] += (this.action.backward ? 16 : 0);

  if (!human) {
    for (i = 0; i < (brain.nGameInput-4); i++) {

      noStroke();
      fill(r, g, b, brain.inputState[i]*32+8);
      ellipse(toX((startX+i*radius)*this.dir), height*1/8+toP(radius), toP(radius*factor), toP(radius*factor));

      for (j = 0; j < brain.nGameOutput; j++) {

        if (this.actionIntensity[j] > 64) {
          stroke(r, g, b, brain.inputState[i]*32);
          line(toX((startX+i*radius)*this.dir), height*1/8+toP(radius), toX((startX2+ballFactor*j*radius)*this.dir), secondLayerY+(ballFactor+0)*toP(radius));
        }
      }

    }
  }

  for (j = 0; j < brain.nGameOutput; j++) {

      this.actionIntensity[j] -= 4;
      this.actionIntensity[j] = Math.min(this.actionIntensity[j], 128);
      this.actionIntensity[j] = Math.max(this.actionIntensity[j], 16);

      noStroke();
      fill(r, g, b, (this.actionIntensity[j]));
      ellipse(toX((startX2+ballFactor*j*radius)*this.dir), secondLayerY+(ballFactor+0)*toP(radius), toP(radius*factor)*ballFactor, toP(radius*factor)*ballFactor);

  }


};
Agent.prototype.update = function() {
  "use strict";
  this.v.add(p5.Vector.mult(gravity, timeStep));
  if (this.loc.y <= ref_u + nudge*timeStep) {
    this.v.y = this.desiredVelocity.y;
  }
  this.v.x = this.desiredVelocity.x*this.dir;
  this.move();
  if (this.loc.y <= ref_u) {
    this.loc.y = ref_u;
    this.v.y = 0;
  }

  // stay in their own half:
  if (this.loc.x*this.dir <= (ref_wallwidth/2+this.r) ) {
    this.v.x = 0;
    this.loc.x = this.dir*(ref_wallwidth/2+this.r);
  }
  if (this.loc.x*this.dir >= (ref_w/2-this.r) ) {
    this.v.x = 0;
    this.loc.x = this.dir*(ref_w/2-this.r);
  }
};
Agent.prototype.display = function() {
  "use strict";
  var x = this.loc.x;
  var y = this.loc.y;
  var r = this.r;
  var angle = 60;
  var eyeX = 0;
  var eyeY = 0;

  if (this.dir === 1) angle = 135;
  noStroke();
  fill(this.c);
  //ellipse(toX(x), toY(y), toP(r)*2, toP(r)*2);
  arc(toX(x), toY(y), toP(r)*2, toP(r)*2, Math.PI, 2*Math.PI);
  /*
  fill(255);
  rect(toX(x-r), toY(y), 2*r*factor, r*factor);
  */

  // track ball with eyes (replace with observed info later):
  var ballX = game.ball.loc.x-(x+(0.6)*r*fastCos(angle));
  var ballY = game.ball.loc.y-(y+(0.6)*r*fastSin(angle));
  if (this.emotion === "sad") {
    ballX = -this.dir;
    ballY = -2;
  }
  var dist = Math.sqrt(ballX*ballX+ballY*ballY);
  eyeX = ballX/dist;
  eyeY = ballY/dist;

  fill(255);
  ellipse(toX(x+(0.6)*r*fastCos(angle)), toY(y+(0.6)*r*fastSin(angle)), toP(r)*0.6, toP(r)*0.6);
  fill(0);
  ellipse(toX(x+(0.6)*r*fastCos(angle)+eyeX*0.15*r), toY(y+(0.6)*r*fastSin(angle)+eyeY*0.15*r), toP(r)*0.2, toP(r)*0.2);

};
Agent.prototype.drawScore = function() {
  "use strict";
  var r = red(this.c);
  var g = green(this.c);
  var b = blue(this.c);
  var size = 64;

  if (this.score > 0) {
    textFont("Courier New");
    textSize(size);
    //stroke(255);
    stroke(r, g, b, 128);
    fill(r, g, b, 64);
    textAlign(this.dir === -1? LEFT:RIGHT);
    text(this.score, this.dir === -1? size*3/4 : width-size/4, size/2+height/3);
  }

};

function Wall(x, y, w, h) {
  "use strict";
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.c = color(0, 200, 50, 128);
}

Wall.prototype.display = function() {
  "use strict";
  noStroke();
  fill(255);
  rect(toX(this.x-this.w/2), toY(this.y+this.h/2), toP(this.w), toP(this.h));
  fill(this.c);
  rect(toX(this.x-this.w/2), toY(this.y+this.h/2), toP(this.w), toP(this.h));
};

function initGame() {
  game.ball = new Particle(createVector(0, ref_w/4));
  game.ball.r = 0.25;

  game.agent1 = game.agent1 || new Agent(-1, createVector(-ref_w/4, 1.5), color(240, 75, 0, 255));
  game.agent2 = game.agent2 || new Agent(1, createVector(ref_w/4, 1.5), color(0, 150, 255, 255));

  game.agent1.setOpponent(game.agent2); // point agent to the other agent as an opponent.
  game.agent2.setOpponent(game.agent1);

  human1 = false;
  human2 = false;

  delayScreen.init(initDelayFrames);
}

function setup() {
  "use strict";

  // deal with mobile device nuances
  md = new MobileDetect(window.navigator.userAgent);
  if (md.mobile()) {
      mobileMode = true;
      console.log('mobile: '+md.mobile());
  } else {
      theFrameRate /= 2;
      console.log('not mobile');
  }

  myCanvas = createCanvas(windowWidth,windowHeight);
  factor = windowWidth / ref_w;
  ref_h = ref_w;
  myCanvas.parent('p5Container');
  frameRate(theFrameRate);

  // create html elements
  //http://otoro.net/slimevolley/

  //intro.text = createA("http://blog.otoro.net/2015/03/28/neural-slime-volleyball/", "neural slime volleyball", "_blank");
  //intro.text.position(32+width/32, height/32);

  gravity = createVector(0, theGravity);

  // setup game objects
  game.ground = new Wall(0, 0.75, ref_w, ref_u);
  game.fence = new Wall(0, 0.75 + ref_wallheight/2, ref_wallwidth, (ref_wallheight-1.5));
  game.fence.c = color(240, 210, 130, 255);
  game.fenceStub = new Particle(createVector(0, ref_wallheight), createVector(0, 0), ref_wallwidth/2, color(240, 210, 130, 255));

  initGame();

  trainer = new Trainer(game.agent1.brain, initGene);
  game.agent1.brain.populate(trainer.getChromosome()); // best one
  game.agent2.brain.populate(trainer.getChromosome()); // best one
}

// updates game element according to physics
function update(nStep) {
  "use strict";

  var result = 0;

  for (var step = 0; step < nStep; step++) {

    // ai here
    // update internal states
    game.agent1.getState();
    game.agent2.getState();
    // push states to brain
    game.agent1.brain.setCurrentInputState(game.agent1, game.agent2);
    game.agent2.brain.setCurrentInputState(game.agent2, game.agent1);
    // make a decision
    game.agent1.brain.forward();
    game.agent2.brain.forward();
    // convert brain's output signals into game actions
    game.agent1.setBrainAction();
    game.agent2.setBrainAction();

    // get human keyboard control
    if (!trainingMode) {
      keyboardControl(); // may want to disable this for speed.
      touchControl(); // mobile device
      betweenGameControl();
    }

    // process actions
    game.agent1.processAction();
    game.agent2.processAction();
    game.agent1.update();
    game.agent2.update();

    if (delayScreen.status() === true) {
      game.ball.applyAcceleration(gravity);
      game.ball.limitSpeed(0, maxBallSpeed);
      game.ball.move();
    }

    if (game.ball.isColliding(game.agent1)) {
      game.ball.bounce(game.agent1);
    }
    if (game.ball.isColliding(game.agent2)) {
      game.ball.bounce(game.agent2);
    }
    if (game.ball.isColliding(game.fenceStub)) {
      game.ball.bounce(game.fenceStub);
    }

    result = game.ball.checkEdges();
    if (Math.abs(result) > 0) {
      // make graphics for dead ball
      if (!trainingMode) {
        game.deadball = new Particle(game.ball.loc.copy());
        game.deadball.r = 0.25;
        game.deadball.life = initDelayFrames;
      }
      initGame();
      if (!trainingMode) {
        console.log('player '+(result > 0? '1' : '2')+' won.');
        if (result > 0) {
          game.agent1.score += 1;
          game.agent1.emotion = "happy";
          game.agent2.emotion = "sad";
        } else {
          game.agent2.score += 1;
          game.agent2.emotion = "happy";
          game.agent1.emotion = "sad";
        }
      }
      return result;
    }

  }

  return result; // 0 means tie, -1 means landed on left side, 1 means landed on right side.
}

function drawScenery() {
  // draws the scenery
  for (var i = 0; i < 24; i++) {
    noStroke();
    fill(50, 100, 240, 16*(24-i)/24);
    rect(0, i*height/24/3, width, height/24/3);
  }
  fill(255, 240, 0, 64);
  noStroke();
  ellipse(toX(-ref_w/4), 1*height/2, 2*factor, 2*factor);
  fill(50, 255, 50, 16);
  ellipse(toX(ref_w/8), toY(-1.5), 12*factor, 20*factor);
  fill(50, 255, 50, 16);
  ellipse(toX(-ref_w/8), toY(-1.5), 8*factor, 12*factor);
  fill(50, 255, 50, 16);
  ellipse(toX(ref_w/3), toY(-1.5), 6*factor, 24*factor);
}

function keyboardControl() {
  // player 1:
  var a1_forward = 68; // 'd' key
  var a1_backward = 65; // 'a' key
  var a1_jump = 87; // 'w' key
  // player 2:
  var a2_forward = LEFT_ARROW;
  var a2_backward = RIGHT_ARROW;
  var a2_jump = UP_ARROW;

  if (keyIsDown(a1_forward) || keyIsDown(a1_backward) || keyIsDown(a1_jump)) {
    human1 = true;
    humanHasControlled = true;
  }
  if (human1) {
    game.agent1.setAction(keyIsDown(a1_forward), keyIsDown(a1_backward), keyIsDown(a1_jump));
  }

  if (keyIsDown(a2_forward) || keyIsDown(a2_backward) || keyIsDown(a2_jump)) {
    human2 = true;
    humanHasControlled = true;
  }
  if (human2) {
    game.agent2.setAction(keyIsDown(a2_forward), keyIsDown(a2_backward), keyIsDown(a2_jump));
  }

}

function touchControl() {
  "use strict";
  var paddingY = height/64;
  var paddingX = width/64;
  var dx = 0;
  var dy = 0;
  var x = 0;
  var y = 0;
  var agentX = toX(game.agent2.loc.x);
  var agentY = toY(game.agent2.loc.y);
  var jumpY = toY(ref_wallheight*2);
  var gestureEvent = false;

  if (touchIsDown) {
    x = touchX;
    y = touchY;
    dx = touchX-ptouchX;
    dy = touchY-ptouchY;
    gestureEvent = true;
  }

  if (mouseIsPressed) {
    x = mouseX;
    y = mouseY;
    dx = mouseX-pmouseX;
    dy = mouseY-pmouseY;
    gestureEvent = true;
  }

  if (gestureEvent) {
    human2 = true;
    humanHasControlled = true;
    game.agent2.setAction((x - agentX) < -paddingX, (x - agentX) > paddingX, dy < -paddingY);
  }

}

// between end of this match to the next match.  guy wins jumps, guy who loses regrets...
function betweenGameControl() {
  "use strict";
  var agent = [game.agent1, game.agent2];
  if (delayScreen.life > 0) {
    for (var i = 0; i < 2; i++) {
      if (agent[i].emotion === "happy") {
        agent[i].action.jump = true;
      } else {
        agent[i].action.jump = false;
      }
    }
  } else {
    agent[0].emotion = "happy";
    agent[1].emotion = "happy";
  }
}

function getNNDebugString() {
  "use strict";
  var result = "";
  result += "agent1:\n";
  result += "input1: "+JSON.stringify(game.agent1.brain.getInputStateString())+"\n";
  result += "output1: "+JSON.stringify(game.agent1.brain.getOutputStateString())+"\n";
  result += "agent2:\n";
  result += "input2: "+JSON.stringify(game.agent2.brain.getInputStateString())+"\n";
  result += "output2: "+JSON.stringify(game.agent2.brain.getOutputStateString())+"\n";
  return result;
}

function arrayToString(x, precision) {
  "use strict";
  precision = precision || 1000;
  var result = "[";
  for (var i = 0; i < x.length; i++) {
    result += Math.round(precision*x[i])/precision;
    if (i < x.length-1) {
      result += ",";
    }
  }
  result += "]";
  return result;
}

// cool p5.js functions to draw p-noise bouncy keyboard control graphics.
var pNoiseSeed = 0;
function drawArrowKeyboard(x, y, s1, c, intensity, theColor) {
  "use strict";

  var rc = red(theColor);
  var gc = green(theColor);
  var bc = blue(theColor);

  function nextNoise() {
    var pFactor = 10;
    var f = 5;
    pNoiseSeed = pNoiseSeed || 0;
    pNoiseSeed += 1;
    return (noise(pNoiseSeed / pFactor)-0.5)*f;
  }

  function drawArrowKey(x, y, s, r) {


    var f = 5;
    //console.log(nextNoise());
    stroke(rc, gc, bc, intensity);
    noFill();
    beginShape();
    var x1offset = nextNoise();
    var y1offset = nextNoise();
    var x2offset = nextNoise();
    var y2offset = nextNoise();
    var x3offset = nextNoise();
    var y3offset = nextNoise();
    curveVertex(x-s+x1offset, y+s-r+y1offset);
    curveVertex(x-s+x2offset, y-s+r+y2offset);
    curveVertex(x-s+r+x3offset, y-s+y3offset);
    curveVertex(x+s-r+nextNoise(), y-s+nextNoise());
    curveVertex(x+s+nextNoise(), y-s+r+nextNoise());
    curveVertex(x+s+nextNoise(), y+s-r+nextNoise());
    curveVertex(x+s-r+nextNoise(), y+s+nextNoise());
    curveVertex(x-s+r+nextNoise(), y+s+nextNoise());
    curveVertex(x-s+x1offset, y+s-r+y1offset);
    curveVertex(x-s+x2offset, y-s+r+y2offset);
    curveVertex(x-s+r+x3offset, y-s+y3offset);
    endShape();
    noStroke();
  }

  var s2 = s1 * 0.8;
  var r1 = s1 * 0.2;
  var r2 = s2 * 0.2;
  var fontSize = 32;

  function drawFullKey(x, y, c) {
    drawArrowKey(x, y, s1/2, r1);
    drawArrowKey(x, y, s2/2, r2);

    stroke(rc, gc, bc, intensity);
    fill(rc, gc, bc, intensity);

    text(c, x+nextNoise()/1-fontSize/2, y+nextNoise()/1+fontSize/4);
  }

  textFont("monospace");
  textSize(fontSize);
  drawFullKey(x-s1, y, c[0]);
  drawFullKey(x, y-s1, c[1]);
  drawFullKey(x+s1, y, c[2]);

}

// n = 1, first agent, n = 2, second agent.
function drawAgentKeyboard(x, y, s, n, intensity, theColor) {
  var c = ['ａ', 'ｗ', 'ｄ'];
  if (n == 2) c = ['◀', '▲', '▶'];
  drawArrowKeyboard(x, y, s, c, intensity, theColor);
}

function draw() {
  "use strict";
  var result = 0;

  background(255);

  // draw box around frame

  result = update(1);

  if (result !== 0 && traningVersion) { // someone has lost
    var genStep = 50;
    console.log('training generation #'+(generationCounter+genStep));
    for (var i = 0; i < genStep; i++) {
      trainer.train();
    }
    // print results
    for (i = 0; i < 4; i++) {
      console.log('#'+i+':'+Math.round(100*trainer.getChromosome(i).fitness)/100);
    }
    var N = trainer.trainer.population_size;
    for (i = N-4; i < N; i++) {
      console.log('#'+i+':'+Math.round(100*trainer.getChromosome(i).fitness)/100);
    }
    if (traningVersion) {
      $("#nn_gene").text(JSON.stringify(trainer.getChromosome()));
    }
    generationCounter += genStep;
    initGame();
    game.agent1.brain.populate(trainer.getChromosome(0)); // best one
    game.agent2.brain.populate(trainer.getChromosome(1)); // second best one
  }

  // draw the game objects
  drawScenery();
  game.agent1.display();
  game.agent2.display();

  if (!mobileMode && showArrowKeys & !humanHasControlled) {
    var intensity = 64*Math.min(16*(delayScreen.life/initDelayFrames)*(initDelayFrames-delayScreen.life)/initDelayFrames, 64);
    drawAgentKeyboard(width/4, toY(ref_wallheight*1), width/12, 1, intensity, game.agent1.c);
    drawAgentKeyboard(3*width/4, toY(ref_wallheight*1), width/12, 2, intensity, game.agent2.c);
  }
  if (!humanHasControlled && handSymbolDisplayed ) {
    moveHandSymbol(toX(game.agent2.loc.x), toY(game.agent2.loc.y)-height/2.5);
  } else {
    hideHandSymbol();
  }

  game.ball.c = color(255, 200, 20, 255*Math.max((initDelayFrames-delayScreen.life)/initDelayFrames, 0));
  game.ball.display();
  game.ground.display();
  game.fence.display();
  game.fenceStub.display();

  // prints agent states (used for nn input)
  //game.agent1.printState();
  //game.agent2.printState();

  game.agent1.drawState(human1);
  game.agent2.drawState(human2);

  game.agent1.drawScore();
  game.agent2.drawScore();

  // draw dead ball
  if (game.deadball) {
    game.deadball.life -= 1;
    game.deadball.c = color(250, 0, 0, 128*(game.deadball.life/initDelayFrames));
    game.deadball.display();
    if (game.deadball.life <= 0) {
      game.deadball = null;
    }
  }

  //$("#nn_weights").text(getNNDebugString());

}

function windowResized() {
  "use strict";
  resizeCanvas(windowWidth, windowHeight);
  myCanvas.size(windowWidth, windowHeight);
  factor = windowWidth / ref_w;
}

// When the mouse is released 
var deviceReleased = function() {
  "use strict";
};

// When the mouse is pressed we. . .
var devicePressed = function(x, y) {
  "use strict";
};

var deviceDragged = function(x, y) {
  "use strict";
};

var mousePressed = function() {
  "use strict";
  devicePressed(mouseX, mouseY);
  return false;
};

var touchStarted = function() {
  "use strict";
  devicePressed(touchX, touchY);
  return false;
};

// interaction with touchpad and mosue:

var mouseDragged = function() {
  "use strict";
  deviceDragged(mouseX, mouseY);
  return false;
};

var touchMoved = function() {
  "use strict";
  return false;
};

var mouseReleased = function() {
  "use strict";
  return false;
};

var touchEnded = function() {
  "use strict";
  return false;
};



