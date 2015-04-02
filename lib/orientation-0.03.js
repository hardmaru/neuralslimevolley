// get orientation of mobile device

/**
 * Determine the mobile operating system.
 * This function either returns 'iOS', 'Android' or 'unknown'
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
  {
    return 'iOS';

  }
  else if( userAgent.match( /Android/i ) )
  {

    return 'Android';
  }
  else
  {
    return 'unknown';
  }
}

var Orientation = {
	enabled: false,
	x: 0,
	y: 0,
	z: 0,
	alpha: 0,
	beta: 0,
	gamma: 0,
	normalizer: 1,
	toString: function() {
		var result = "";
		if (this.enabled === true) {
			result = "a:"+this.alpha+"\tb:"+this.beta+"\tg:"+this.gamma+"\tx:"+this.x+"\ty:"+this.y+"\tz:"+this.z;
		}
		return result;
	},
	getX: function() {
		var result = 0;
		if (this.x) {
			result = this.x*this.normalizer;
		}
		return result;
	},
	getY: function() {
		var result = 0;
		if (this.y) {
			result = this.y*this.normalizer;
		}
		return result;
	},
	getZ: function() {
		var result = 0;
		if (this.z) {
			result = this.z;
		}
		return result;
	},
	getAlpha: function() {
		var result = 0;
		if (this.alpha) {
			result = this.alpha;
		}
		return result;
	},
	getBeta: function() {
		var result = 0;
		if (this.beta) {
			result = this.beta;
		}
		return result;
	},
	getGamma: function() {
		var result = 0;
		if (this.gamma) {
			result = this.gamma;
		}
		return result;
	},
	getMagnitude: function() {
		var result = 0.0;
		if (this.x && this.y) {
			return Math.sqrt(this.x*this.x+this.y*this.y);
		}
		return result;
	},
	getMag2: function() {
		var result = 0.0;
		if (this.x && this.y) {
			return this.x*this.x+this.y*this.y;
		}
		return result;
	}

};

if (getMobileOperatingSystem() === 'Android') {
	Orientation.normalizer = -1.0;
}

window.addEventListener('devicemotion', function (e) {
    Orientation.x = Math.round(e.accelerationIncludingGravity.x*10)/10;
    Orientation.y = Math.round(e.accelerationIncludingGravity.y*10)/10;
    Orientation.z = Math.round(e.accelerationIncludingGravity.z*10)/10;       
    if (Orientation.getMag2() > 0.00000001) {
 		Orientation.enabled = true;
	} else {
		Orientation.enabled = false;
	}     
}, false);


window.addEventListener('deviceorientation', function (e) {
    Orientation.alpha = Math.round(e.alpha*10)/10;
    Orientation.beta = Math.round(e.beta*10)/10;
    Orientation.gamma = Math.round(e.gamma*10)/10;           
}, false);

/*
if((window.DeviceMotionEvent) || ('listenForDeviceMovement' in window)){ // gyroscope support
    console.log('DeviceOrientationEvent support OK');
    Orientation.enabled = true;
} else {
    console.log('DeviceOrientationEvent support KO');
    Orientation.enabled = false;
}
*/
