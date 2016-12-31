
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();


var finalGainNode = audioCtx.createGain();
finalGainNode.connect(audioCtx.destination);
finalGainNode.gain.value=0.75;

var notesPitch = 1.0;
function PianoKey(audioCtx,frequency)
{
	var self = this;

	self.frequency = frequency;
	self.gainNode = audioCtx.createGain();
	self.gainNode.connect(finalGainNode);
	self.gainNode.gain.value = 0;

	var timeoutForStop = 0;

	function start(gain) 
	{
		self.gainNode.connect(finalGainNode);

		self.oscillator = audioCtx.createOscillator();
		self.oscillator.frequency.value = self.frequency;
		self.oscillator.connect(self.gainNode);

		self.oscillator.start();
	}

	function stop() 
	{
		self.gainNode.disconnect(finalGainNode);

		self.oscillator.stop();
		delete self.oscillator;
	}

	self.down = function ()
	{
		if (timeoutForStop) {
			clearTimeout(timeoutForStop);
			timeoutForStop = 0;
		};

		var keysDownCount = Object.keys(keysDown).length;
		self.gainNode.gain.value = 1.0 / (keysDownCount ? keysDownCount : 1);
		
		if (!self.oscillator) {
			start();
		};

		self.oscillator.frequency.value = self.frequency*notesPitch;
	}

	self.up = function ()
	{
		self.gainNode.gain.value = 0;
		
		if (self.oscillator) 
		{
			timeoutForStop = setTimeout(stop.bind(self), 12000);
			
		}
	}
};

var simplePianoDiv = document.getElementById('simple-piano');
var pianoKeys88 = [];
PIANO_NOTES_FREQUENCIES = [0];
for (var i = 0; i < 88; i++) {
	var frequency = 440 * Math.pow(2,(-48+i)/12);
	PIANO_NOTES_FREQUENCIES.push(frequency);

	var pianoKey = new PianoKey(audioCtx,frequency);
	var keyNumber = i + 1;
	pianoKey.keyNumber = keyNumber;
	switch (i % 12) {
		case 1:
		case 4:
		case 6:
		case 9:
		case 11:
			pianoKey.isBlack = true;
			break;

		default:
			pianoKey.isBlack = false;
			break;
	}

	pianoKeys88.push(pianoKey);

	var pianoKeyDiv = document.getElementById('piano-key-template').cloneNode(true);
	pianoKeyDiv.removeAttribute('id');
	pianoKeyDiv.setAttribute('class','piano-key '+ (pianoKey.isBlack ? 'black' : 'white') + '-key');
	pianoKeyDiv.dataset.keyNumber = keyNumber;
	simplePianoDiv.appendChild(pianoKeyDiv);

	pianoKey.element = pianoKeyDiv;
};

KEYBOARD_PIANO_MAP = {
	']': 71,
	'=': 70,
	'[': 69,
	'p': 68,
	'0': 67,
	'o': 66,
	'9': 65,
	'i': 64,
	'u': 63,
	'7': 62,
	'y': 61,
	'6': 60,
	't': 59,
	'5': 58,
	'r': 57,
	'e': 56,
	'3': 55,
	'w': 54,
	'2': 53,
	'q': 52,

	'/': 56,
	';': 55,
	'.': 54,
	'l': 53,
	',': 52,
	'm': 51,
	'j': 50,
	'n': 49,
	'h': 48,
	'b': 47,
	'g': 46,
	'v': 45,
	'c': 44,
	'd': 43,
	'x': 42,
	's': 41,
	'z': 40,
};

var CHAR_KEY_TO_CODES = {
	"q": 81,
	"w": 87,
	"e": 69,
	"r": 82,
	"t": 84,
	"y": 89,
	"u": 85,
	"i": 73,
	"o": 79,
	"p": 80,
	"[": 219,
	"]": 221,
	"a": 65,
	"s": 83,
	"d": 68,
	"f": 70,
	"g": 71,
	"h": 72,
	"j": 74,
	"k": 75,
	"l": 76,
	";": 186,
	"'": 222,
	"z": 90,
	"x": 88,
	"c": 67,
	"v": 86,
	"b": 66,
	"n": 78,
	"m": 77,
	",": 188,
	".": 190,
	"/": 191,
	"1": 49,
	"2": 50,
	"3": 51,
	"4": 52,
	"5": 53,
	"6": 54,
	"7": 55,
	"8": 56,
	"9": 57,
	"0": 48,
	"-": 189,
	"=": 187,
};

var pianoKeys = {};

var keys = Object.keys(KEYBOARD_PIANO_MAP);

for (var i = 0; i < keys.length; i++) {
	var charKey = keys[i];
	var key = CHAR_KEY_TO_CODES[charKey]

	var keyNumber = KEYBOARD_PIANO_MAP[charKey];
	var pianoKey = pianoKeys88[keyNumber - 1];
	pianoKey.keyCode = key;
	pianoKeys[key] = pianoKey;

	var pianoKeyDiv = document.querySelector(".piano-key[data-key-number='" + keyNumber + "']");
	var textDiv = pianoKeyDiv.getElementsByClassName('mapped-keys')[0];
	textDiv.innerText = (charKey + " " + textDiv.innerText).replace(/ $/,'');

};

var keysDown = {};
var mouseDown = {};

var volume = 1.0;
function adjustFinalGain(numberOfKeys) {
	var gain = 1.0 - (1.0 / (numberOfKeys + 1));
	finalGainNode.gain.value = gain * volume;
}

document.addEventListener('keydown', function (e) {
	var pianoKey = pianoKeys[e.keyCode]
	if (!pianoKey) return ;

	pressPianoKeyDown(pianoKey);
});
document.addEventListener('keyup',function (e) {
	var pianoKey = pianoKeys[e.keyCode]
	if (!pianoKey) return ;

	pressPianoKeyUp(pianoKey);
});

function addClass(className,element)
{
	if (element.className.indexOf(className) == -1)
	{
		element.className += " " + className;
	}
}

function removeClass(className,element) 
{
	if (element.className.indexOf(className) != -1) 
	{
		element.className = element.className.replace(className,'');
	}
}

function getClickedPianoKey(target) {
	var element;
	if (target.className == 'mapped-keys') {
		element = target.parentNode;
	}
	else if (target.className.indexOf('piano-key') != -1) {
		element = target;
	}
	else {
		return null;
	}
	return pianoKeys88[element.dataset.keyNumber - 1];
}

function pressPianoKeyDown(pianoKey) {

	var keyNumber = pianoKey.keyNumber;

	if (keysDown[keyNumber]) return ;

	keysDown[keyNumber] = true;

	var keys = Object.keys(keysDown);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		pianoKeys88[key - 1].down();
	};

	addClass('pressed',pianoKey.element);
	adjustFinalGain(keys.length);
}
function pressPianoKeyUp(pianoKey) {

	var keyNumber = pianoKey.keyNumber;
	if (!keysDown[keyNumber]) return ;

	pianoKey.up();
	removeClass('pressed',pianoKey.element);
	adjustFinalGain(Object.keys(keysDown).length);
	delete keysDown[keyNumber];
}

var lastPianoKey = null;
simplePianoDiv.addEventListener('mousedown', function(e) {
	var pianoKey = getClickedPianoKey(e.target);
	if (!pianoKey) return ;

	mouseDown[e.which] = true;
	pressPianoKeyDown(pianoKey);
});

simplePianoDiv.addEventListener('mouseup', function(e) {
	var pianoKey = getClickedPianoKey(e.target);
	if (!pianoKey) return ;
	
	mouseDown[e.which] = false;
	pressPianoKeyUp(pianoKey);
	pressUpAllPianoKeys();
	lastPianoKey != null;
});
simplePianoDiv.addEventListener('mousemove', function(e) {
	if (!mouseDown[1]) return ;

	var pianoKey = getClickedPianoKey(e.target);
	if (!pianoKey) return ;
	
	if (lastPianoKey != null && lastPianoKey != pianoKey) {
		pressPianoKeyUp(lastPianoKey);
		pressPianoKeyDown(pianoKey);
	}
	lastPianoKey = pianoKey;
});

function pressUpAllPianoKeys() {
	var keys = Object.keys(keysDown);
	for (var i = keys.length - 1; i >= 0; i--) 
	{
		var key = keys[i];
		pianoKeys88[key - 1].up();
		delete keysDown[key];
	};		
}
window.addEventListener('blur', function (e) {
	pressUpAllPianoKeys();
});
