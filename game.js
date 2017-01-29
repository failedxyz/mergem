const GWIDTH = 1280, GHEIGHT = 720;
var moving = false;

const COLORS = [[0, 102, 204], [204, 0, 102], [102, 204, 0]];

class LevelMap {
    static parse(mapdata, metadata) {
        var lines = mapdata.split(/\r?\n/g).map(function (line) { return line.replace(/~+$/, ""); }).filter(function (line) { return line.length > 0; });
        var maparray = [];
        var characters = [null];
        var colors_temp = COLORS.slice(0);
        for (var y = 0; y < lines.length; ++y) {
            var line = lines[y];
            var row = [];
            for (var x = 0; x < line.length; ++x) {
                metadata.coordinates = [x, y];
                var char = line.charAt(x);
                var tile = Tile.create(char, metadata);
                row.push(tile);
                if (tile instanceof SpawnTile) {
                    characters.push(new Character(colors_temp.shift(), x, y));
                }
            }
            maparray.push(row);
        }
        var map = new LevelMap(maparray, characters, metadata);
        return map;
    }
    constructor(array, characters, metadata) {
        this.zoom = 0.8;
        this.targetzoom = 0.8;
        this.tilemap = array;
        this.characters = characters;
        this.size = [array[0].length * TILE_SIZE, array.length * TILE_SIZE];
    }
    adjustZoom() {
    }
    update() {
        this.zoom += (this.targetzoom - this.zoom) / 8;
    }
    render() {
        for (var y = 0; y < this.tilemap.length; ++y) {
            var row = this.tilemap[y];
            for (var x = 0; x < row.length; ++x) {
                row[x].render(rawCanvas);
            }
        }
        for (var i = 1; i < this.characters.length; ++i) {
            var character = this.characters[i];
            character.render(rawCanvas);
        }
    }
}

class Character {
    constructor(color, x, y) {
        this.image = tint(imageLibrary.sprite, color);
        this.x = x;
        this.y = y;
    }
    render() {
        rawCtx.drawImage(this.image, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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

const DIRECTION_UP = 0;
const DIRECTION_DOWN = 0;
const DIRECTION_LEFT = 0;
const DIRECTION_RIGHT = 0;

var attemptMove = function (direction) {
    if (!moving) {

    }
};

var update = function () {
    if (keys[87] || keys[38]) {
        attemptMove(DIRECTION_UP);
    } else if (keys[83] || keys[40]) {
        attemptMove(DIRECTION_DOWN);
    } else if (keys[65] || keys[37]) {
        attemptMove(DIRECTION_LEFT);
    } else if (keys[68] || keys[39]) {
        attemptMove(DIRECTION_RIGHT);
    }
    var level = levels[ci];
    level.map.update();
};

var render = function () {
    ctx.clearRect(0, 0, GWIDTH, GHEIGHT);
    var level = levels[ci];
    rawCtx.clearRect(0, 0, rawCanvas.width, rawCanvas.height);
    level.map.render();

    var [sw, sh] = [rawCanvas.width * level.map.zoom, rawCanvas.height * level.map.zoom];
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
    update();
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
    ctx = canvas.getContext("2d");
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
            window.onmousewheel = mousewheel;

            rawCanvas = document.createElement("canvas");
            [rawCanvas.width, rawCanvas.height] = levels[ci].map.size;
            rawCtx = rawCanvas.getContext("2d");
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

var mousewheel = function (event) {
    levels[ci].map.targetzoom += (event.wheelDelta || -event.detail) / 1200;
    levels[ci].map.targetzoom = Math.max(0.2, Math.min(1, levels[ci].map.targetzoom));
};

window.onload = init;