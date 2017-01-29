var canvas;
var keys;
var levels;
var ci;
var imageLibrary = imageLibrary || {};

var GameCamera = function() {};
var Level = function() {};
var LevelMap = function(array) {
    this.tilemap = array;
    this.size = [array[0].length * TILE_SIZE, array.length * TILE_SIZE];
    this.render = function(rCanvas) {
        var ctx = rCanvas.getContext("2d");
        for (var y = 0; y < this.tilemap.length; ++y) {
            var row = this.tilemap[y];
            for (var x = 0; x < row.length; ++x) {
                rCanvas = row[x].render(rCanvas);
            }
        }
        return rCanvas;
    };
};

LevelMap.parse = function(mapdata, metadata) {
    var lines = mapdata.split(/\r?\n/g).map(function(line) { return line.trim(); }).filter(function(line) { return line.length > 0; });
    var maparray = [];
    for (var y = 0; y < lines.length; y += 1) {
        var line = lines[y];
        var row = [];
        for (var x = 0; x < line.length; x += 1) {
            metadata.coordinates = [x, y];
            row.push(Tile.create(line.charAt(x), metadata));
        }
        maparray.push(row);
    }
    var map = new LevelMap(maparray);
    return map;
};

Level.parse = function(data) {
     var parts = data.split("jason lu plays eroge everyday");
     if (parts.length != 2) {
         // fuck you
     }
     var [map, metadata] = parts;
     var level = new Level();

     level.metadata = jsyaml.load(metadata);
     level.map = LevelMap.parse(map, level.metadata);

     return level;
};

var render = function() {
    var ctx = canvas.getContext("2d");
    var level = levels[ci];
    var rawCanvas = document.createElement("canvas");
    [rawCanvas.width, rawCanvas.height] = level.map.size;
    var rawCanvas = level.map.render(rawCanvas);
    ctx.drawImage(rawCanvas, 0, 0, 1000, 500);
};

var frame = function () {
    render();
    requestAnimationFrame(frame);
};

var loadLevels = function(callback) {
    console.log("loading levels...");
    levels = [];
    (function next(i) {
        if (i < 1) {
            $.get(`/levels/${i}.txt`, function(data) {
                levels.push(Level.parse(data));
                next(i + 1);
            });
        } else {
            callback();
        }
    })(0);
};

var loadImages = function(callback) {
    console.log("loading assets...");
    var keys = Object.keys(imageLibrary);
    (function next(i) {
        if (i < keys.length) {
            var key = keys[i];
            var path = imageLibrary[key];
            var el = new Image();
            el.src = path;
            el.onload = function() {
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
            tasks[i](function(){
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

var keydown = function(event) {
    keys[event.keyCode] = true;
};

var keyup = function(event) {
    keys[event.keyCode] = false;
};

window.onload = init;