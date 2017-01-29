var canvas;
var keys;
var levels;
var ci;
var imageLibrary = imageLibrary || {};

const GWIDTH = 1280, GHEIGHT = 720;
var zoom = 0.6;

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
    //console.log(imgdata.data);
    for (var px = 0, ct = w * h * 4; px < ct; px += 4) {
        rgba[px] *= col[0] / 255;
        rgba[px + 1] *= col[1] / 255;
        rgba[px + 2] *= col[2] / 255;
    }
    ctx.putImageData(imgdata, 0, 0);
    return canvas;
};

class LevelMap {
    static parse(mapdata, metadata) {
        var lines = mapdata.split(/\r?\n/g).map(function (line) { return line.replace(/~+$/, ""); }).filter(function (line) { return line.length > 0; });
        var maparray = [];
        for (var y = 0; y < lines.length; ++y) {
            var line = lines[y];
            var row = [];
            for (var x = 0; x < line.length; ++x) {
                metadata.coordinates = [x, y];
                row.push(Tile.create(line.charAt(x), metadata));
            }
            maparray.push(row);
        }
        var map = new LevelMap(maparray, metadata);
        return map;
    }
    constructor(array, metadata) {
        this.tilemap = array;
        this.characters = [null];
        for (var i = 1; i <= metadata.characters; ++i) {
            this.characters.push(new Character());
        }
        this.size = [array[0].length * TILE_SIZE, array.length * TILE_SIZE];
    }
    render(rCanvas) {
        var ctx = rCanvas.getContext("2d");
        for (var y = 0; y < this.tilemap.length; ++y) {
            var row = this.tilemap[y];
            for (var x = 0; x < row.length; ++x) {
                rCanvas = row[x].render(rCanvas);
            }
        }
        for (var i = 1; i < this.characters.length; ++i) {

        }
        return rCanvas;
    }
}

class Character {
    constructor() {

    }
    render(rCanvas) {
        var ctx = rCanvas.getContext("2d");
        return rCanvas;
    }
}

class Level {
    static parse(data) {
        var parts = data.split("jason lu plays eroge everyday");
        if (parts.length != 2) {
            // fuck you
        }
        var [map, metadata] = parts;
        var level = new Level();

        level.metadata = jsyaml.load(metadata);
        level.map = LevelMap.parse(map, level.metadata);

        return level;
    }
}

var render = function () {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, GWIDTH, GHEIGHT);
    var level = levels[ci];
    var rawCanvas = document.createElement("canvas");
    [rawCanvas.width, rawCanvas.height] = level.map.size;
    rawCanvas = level.map.render(rawCanvas);

    var [sw, sh] = [rawCanvas.width * zoom, rawCanvas.height * zoom];
    var sx = 0, sy = 0;
    if (sw < GWIDTH) {
        sx = (GWIDTH - sw) / 2;
    }
    if (sh < GHEIGHT) {
        sy = (GHEIGHT - sh) / 2;
    }
    ctx.drawImage(rawCanvas, sx, sy, sw, sh);
};

var frame = function () {
    render();
    requestAnimationFrame(frame);
};

var loadLevels = function (callback) {
    console.log("loading levels...");
    levels = [];
    (function next(i) {
        if (i < 1) {
            $.get(`/levels/${i}.txt`, function (data) {
                levels.push(Level.parse(data));
                next(i + 1);
            });
        } else {
            callback();
        }
    })(0);
};

var loadImages = function (callback) {
    console.log("loading assets...");
    var keys = Object.keys(imageLibrary);
    (function next(i) {
        if (i < keys.length) {
            var key = keys[i];
            var path = imageLibrary[key];
            var el = new Image();
            el.src = path;
            el.onload = function () {
                next(i + 1);
            };
            imageLibrary[key] = el;
        } else {
            callback();
        }
    })(0);
};

var init = function () {
    canvas = document.getElementById("canvas");
    ci = 0;
    keys = Array(256).fill(false);

    var tasks = [loadImages, loadLevels];
    (function next(i) {
        if (i < tasks.length) {
            tasks[i](function () {
                next(i + 1);
            });
        } else {
            canvas.focus();
            window.onkeydown = keydown;
            window.onkeyup = keyup;

            requestAnimationFrame(frame);
        }
    })(0);
};

var keydown = function (event) {
    keys[event.keyCode] = true;
};

var keyup = function (event) {
    keys[event.keyCode] = false;
};

window.onload = init;