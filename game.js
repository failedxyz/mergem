const GWIDTH = 1280, GHEIGHT = 720;
var moving = false;

const COLORS = [[0, 102, 204], [204, 0, 102], [102, 204, 0]];
// const INTERVAL = 0.5;

const DIRECTION_UP = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_RIGHT = 4;

const CHARACTER_SIZE = 96;

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
        this.zoom = this.targetzoom = 0.5;
        this.tilemap = array;
        this.characters = characters;
        this.size = [array[0].length * TILE_SIZE, array.length * TILE_SIZE];
    }
    adjustZoom() {
        var avgx = avgy = 0;
        this.characters.forEach(function(char) {
            
        });
    }
    update() {
        this.zoom += (this.targetzoom - this.zoom) / 8;
        for (var i = 1; i < this.characters.length; ++i) {
            var character = this.characters[i];
            character.update();
        }
    }
    render() {
        for (var y = 0; y < this.tilemap.length; ++y) {
            var row = this.tilemap[y];
            for (var x = 0; x < row.length; ++x) {
                row[x].render();
            }
        }
        for (var i = 1; i < this.characters.length; ++i) {
            var character = this.characters[i];
            character.render();
        }
    }
}

class Character {
    constructor(color, x, y) {
        this.color = color;
        this.image = tint(imageLibrary.sprite, color);
        this.x = x;
        this.y = y;
        this.direction = 0;
    }
    canMove(direction) {
        var map = levels[ci].map.tilemap;
        var tile;
        switch (direction) {
            case DIRECTION_UP:
                tile = map[this.y - 1][this.x];
                break;
            case DIRECTION_DOWN:
                tile = map[this.y + 1][this.x];
                break;
            case DIRECTION_LEFT:
                tile = map[this.y][this.x - 1];
                break;
            case DIRECTION_RIGHT:
                tile = map[this.y][this.x + 1];
                break;
        }
        return !(tile instanceof WallTile);
    }
    animateMove(direction) {
        if (!this.canMove(direction)) {
            moving = false;
            return;
        }
        var map = levels[ci].map.tilemap;
        this.direction = direction;
        switch (direction) {
            case DIRECTION_UP:
                this.y -= 1;
                break;
            case DIRECTION_DOWN:
                this.y += 1;
                break;
            case DIRECTION_LEFT:
                this.x -= 1;
                break;
            case DIRECTION_RIGHT:
                this.x += 1;
                break;
        }
        var tile = map[this.y][this.x];
        if (tile instanceof ActionTile) {
            tile.action();
        }
        moving = false;
    }
    currentTile() {
        var map = levels[ci].map.tilemap;
        return map[this.y][this.x];
    }
    update() {
        /* if (this.direction) {
            var arrived = false;
            switch (this.direction) {
                case DIRECTION_UP:
                    if (this.y <= this.targety) {
                        arrived = true;
                    } else {
                        this.y -= INTERVAL;
                    }
                    break;
                case DIRECTION_DOWN:
                    if (this.y >= this.targety) {
                        arrived = true;
                    } else {
                        this.y += INTERVAL;
                    }
                    break;
                case DIRECTION_LEFT:
                    if (this.x <= this.targetx) {
                        arrived = true;
                    } else {
                        this.x -= INTERVAL;
                    }
                    break;
                case DIRECTION_RIGHT:
                    if (this.x >= this.targetx) {
                        arrived = true;
                    } else {
                        this.x += INTERVAL;
                    }
                    break;
            }
            if (arrived) {
                this.direction = 0;
                this.x = this.targetx;
                this.y = this.targety;
                moving = false;
            }
        } */
    }
    render() {
        rawCtx.drawImage(this.image, this.x * TILE_SIZE + (TILE_SIZE - CHARACTER_SIZE) / 2, this.y * TILE_SIZE + (TILE_SIZE - CHARACTER_SIZE) / 2, CHARACTER_SIZE, CHARACTER_SIZE);
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

var attemptMove = function (direction) {
    var level = levels[ci];
    if (!moving) {
        moving = true;
        for (var i = 1; i < level.map.characters.length; i += 1) {
            var character = level.map.characters[i];
            if ((controlled >> i) & 1) {
                character.animateMove(direction);
            }
        }
    }
};

var update = function () {
    if (keys[87] || keys[38]) {
        attemptMove(DIRECTION_UP);
        keys[87] = keys[38] = false;
    } else if (keys[83] || keys[40]) {
        attemptMove(DIRECTION_DOWN);
        keys[83] = keys[40] = false;
    } else if (keys[65] || keys[37]) {
        attemptMove(DIRECTION_LEFT);
        keys[65] = keys[37] = false;
    } else if (keys[68] || keys[39]) {
        attemptMove(DIRECTION_RIGHT);
        keys[68] = keys[39] = false;
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
        if (i < 7) {
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
            for (var j = 0; j < levels[ci].metadata.control.length; ++j) {
                controlled |= (1 << levels[ci].metadata.control[j]);
            }
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