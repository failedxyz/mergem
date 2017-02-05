var canvas;
var keys;
var leveldata;
var levels;
var ci;
var rawCanvas;
var rawCtx;
var controlled;
var imageLibrary;

var sfx = {
    menuhit: new Howl({ src: ['assets/menuhit.wav'] }),
    merge: new Howl({ src: ['assets/merge.mp3'] }),
    step: new Howl({ src: ['assets/step.mp3'], volume: 0.5 }),
    ice: new Howl({ src: ['assets/ice.mp3'], volume: 0.5 }),
    portal: new Howl({ src: ['assets/portal.mp3'] }),
    end: new Howl({ src: ['assets/end.mp3'] }),
    switch: new Howl({ src: ['assets/switch.wav'] }),
    retry: new Howl({ src: ['assets/retry.mp3'] }),
    applause: new Howl({ src: ['assets/applause.mp3'] })
};

var bgm = {
    bgm: new Audio('assets/bgm.mp3'),
    endgame: new Audio('assets/endgame.mp3')
};

var numPlayers = function () {
    var level = levels[ci];
    return level.map.characters.filter(function (character) { return character !== null; }).length;
};

var tint = function (img, col) {
    if (col === undefined) return img;
    var canvas = document.createElement('canvas');
    canvas.height = img.height;
    canvas.width = img.width;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var w = img.width,
        h = img.height;
    if (!w || !h) return img;
    var imgdata = ctx.getImageData(0, 0, w, h);
    var rgba = imgdata.data;
    for (var px = 0, ct = w * h * 4; px < ct; px += 4) {
        rgba[px] *= col[0] / 255;
        rgba[px + 1] *= col[1] / 255;
        rgba[px + 2] *= col[2] / 255;
    }
    ctx.putImageData(imgdata, 0, 0);
    return canvas;
};

var rgbArrayToString = function (arr) {
    return `rgb(${parseInt(arr[0])}, ${parseInt(arr[1])}, ${parseInt(arr[2])})`;
};

var mergeColors = function (color1, color2) {
    var [r1, g1, b1] = color1;
    var [r2, g2, b2] = color2;
    return [(r1 + r2) / 2, (g1 + g2) / 2, (b1 + b2) / 2];
};

var isInside = function (x, y, z1, z2, w, h) {
    var z3 = z1 + w;
    var z4 = z2 + h;
    x1 = Math.min(z1, z3);
    x2 = Math.max(z1, z3);
    y1 = Math.min(z2, z4);
    y2 = Math.max(z2, z4);
    if ((x1 <= x) && (x <= x2) && (y1 <= y) && (y <= y2)) {
        return true;
    } else {
        return false;
    }
};