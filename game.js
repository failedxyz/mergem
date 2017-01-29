const GWIDTH = 1280, GHEIGHT = 720;
var moving = false;
var stateMachine;

const COLORS = [[0, 102, 204], [204, 0, 102], [102, 204, 0]];
const INTERVAL = 0.25;

const DIRECTION_UP = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_RIGHT = 4;

const CHARACTER_SIZE = 96;
const NUM_LEVELS = 8;

var cameraFocus;
var cameraTargetFocus;
var customzoom = false;

var KeyPress = 0;
var unretardedParseInt = function (x) {
    return parseInt(x.trim());
};

class LevelMap {
    static parse(mapdata, metadata) {
        var lines = mapdata.split(/\r?\n/g).map(function (line) { return line.replace(/~+$/, ""); }).filter(function (line) { return line.length > 0; });
        var maparray = [];
        var characters = [];
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
                    var number = parseInt(line.charAt(x));
                    characters.push(new Character(number, colors_temp.shift(), x, y));
                }
            }
            maparray.push(row);
        }
        characters.sort(function (a, b) {
            return a.number - b.number;
        });
        characters.unshift(null);
        var map = new LevelMap(maparray, characters, metadata);
        return map;
    }
    constructor(array, characters, metadata) {
        this.zoom = this.targetzoom = 0.5;
        this.tilemap = array;
        this.characters = characters;
        var portalConnections = [];
        var portalLookup = {};
        if (metadata.portals) {
            for (var portal of metadata.portals) {
                var [x1, y1, x2, y2, n] = portal.split(",");
                [x1, y1, x2, y2, n] = [x1, y1, x2, y2, n].map(unretardedParseInt);
                var tile1 = this.tilemap[y1][x1];
                if (!(tile1 instanceof PortalTile)) continue;
                var tile2 = this.tilemap[y2][x2];
                if (!(tile2 instanceof PortalTile)) continue;

                portalLookup[`${x1},${y1}`] = { dest: [x2, y2], id: portalConnections.length };
                portalLookup[`${x2},${y2}`] = { dest: [x1, y1], id: portalConnections.length };
                portalConnections.push({ portals: [[x1, y1], [x2, y2]], times: n });
            }
        }
        this.portalConnections = portalConnections;
        this.portalLookup = portalLookup;
        this.size = [Math.max.apply(null, array.map((o) => { return o.length; })) * TILE_SIZE, array.length * TILE_SIZE];
    }
    updateCamera() {
        var i, char;
        var avgx = 0, avgy = 0;
        var controlledArray = [];
        for (i = 1; i < this.characters.length; ++i) {
            char = this.characters[i];
            if (char === null) continue;
            if ((controlled >> i) & 1) {
                controlledArray.push(i);
                avgx += char.x;
                avgy += char.y;
            }
        }
        avgx /= controlledArray.length;
        avgy /= controlledArray.length;

        var maxDist = 0.1;

        for (i of controlledArray) {
            char = this.characters[i];
            var dist = Math.pow(Math.pow(char.x - avgx, 2) + Math.pow(char.y - avgy, 2), 0.5);
            if (dist > maxDist) maxDist = dist;
        }

        maxDist *= TILE_SIZE;

        this.targetzoom = Math.min(1, Math.max(0.2, 0.2 * rawCanvas.height / maxDist));

        cameraTargetFocus = [avgx * TILE_SIZE + CHARACTER_SIZE / 2, avgy * TILE_SIZE + CHARACTER_SIZE / 2];
        if (!cameraFocus) cameraFocus = cameraTargetFocus;
    }
    getCameraFrame() {
        var sh = this.zoom * rawCanvas.height,
            sw = this.zoom * rawCanvas.width;

        return [GWIDTH / 2 - cameraFocus[0] * this.zoom, GHEIGHT / 2 - cameraFocus[1] * this.zoom, sw, sh];
    }
    update() {
        var i, j, character;
        this.zoom += (this.targetzoom - this.zoom) / 8;
        cameraFocus[0] += (cameraTargetFocus[0] - cameraFocus[0]) / 16;
        cameraFocus[1] += (cameraTargetFocus[1] - cameraFocus[1]) / 16;
        for (i = 1; i < this.characters.length; ++i) {
            character = this.characters[i];
            if (character === null) continue;
            character.update();
        }
        for (i = 1; i < this.characters.length; ++i) {
            var collides = 0;
            if (this.characters[i] === null) continue;
            for (j = 1; j < this.characters.length; ++j) {
                if (i == j) continue;
                if (this.characters[j] === null) continue;
                var ic = [this.characters[i].x, this.characters[i].y];
                var jc = [this.characters[j].x, this.characters[j].y];
                if (ic[0] == jc[0] && ic[1] == jc[1]) {
                    collides = j;
                    break;
                }
            }
            if (collides) {
                sfx.merge.play();
                var mergedColor = mergeColors(this.characters[i].color, this.characters[j].color);
                this.characters[j] = null;
                this.characters[i].color = mergedColor;
                this.characters[i].image = tint(imageLibrary.sprite, mergedColor);
                this.characters[i].controlled = true;
                controlled |= (1 << i);
                controlled &= ~(1 << j);
                var tile = this.characters[i].currentTile();
                if (tile instanceof ExitTile) {
                    tile.action(this.characters[i]);
                }
                if (!(tile instanceof IceTile)) {
                    moving = false;
                }
            }
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
            if (character === null) continue;
            character.render();
        }
    }
}

class Character {
    constructor(number, color, x, y) {
        this.number = number;
        this.color = color;
        this.image = tint(imageLibrary.sprite, color);
        this.displayx = this.x = x;
        this.displayy = this.y = y;
        this.direction = this.momentum = 0;
        this.controlled = false;
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
        if (this.momentum && !(this.currentTile() instanceof IceTile)) return false;
        return !(tile instanceof WallTile);
    }
    startMove(direction) {
        if (!this.canMove(direction)) {
            this.momentum = 0;
            moving = false;
            return false;
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
        var tile = this.currentTile();
        if (tile instanceof IceTile) {
            sfx.ice.play();
            this.momentum = direction;
        } else {
            sfx.step.play();
        }
        if (tile instanceof ActionTile) {
            tile.action(this);
        }
        return true;
    }
    currentTile() {
        var map = levels[ci].map.tilemap;
        return map[this.y][this.x];
    }
    update() {
        if (this.direction) {
            var arrived = false;
            switch (this.direction) {
                case DIRECTION_UP:
                    if (this.displayy <= this.y) {
                        arrived = true;
                    } else {
                        this.displayy -= INTERVAL;
                    }
                    break;
                case DIRECTION_DOWN:
                    if (this.displayy >= this.y) {
                        arrived = true;
                    } else {
                        this.displayy += INTERVAL;
                    }
                    break;
                case DIRECTION_LEFT:
                    if (this.displayx <= this.x) {
                        arrived = true;
                    } else {
                        this.displayx -= INTERVAL;
                    }
                    break;
                case DIRECTION_RIGHT:
                    if (this.displayx >= this.x) {
                        arrived = true;
                    } else {
                        this.displayx += INTERVAL;
                    }
                    break;
            }
            if (arrived) {
                if (this.momentum) {
                    this.startMove(this.momentum);
                } else {
                    this.direction = 0;
                    this.displayx = this.x;
                    this.displayy = this.y;
                    moving = false;
                }
            }
        }
    }
    render() {
        rawCtx.save();
        if (this.controlled) {
            rawCtx.shadowBlur = 50;
            rawCtx.shadowColor = rgbArrayToString(this.color);
        }
        rawCtx.drawImage(this.image, this.displayx * TILE_SIZE + (TILE_SIZE - CHARACTER_SIZE) / 2, this.displayy * TILE_SIZE + (TILE_SIZE - CHARACTER_SIZE) / 2, CHARACTER_SIZE, CHARACTER_SIZE);
        rawCtx.restore();
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
        customzoom = false;
        moving = true;
        var madeMove = false;
        for (var i = 1; i < level.map.characters.length; i += 1) {
            var character = level.map.characters[i];
            if (character === null) continue;
            if ((controlled >> i) & 1) {
                madeMove |= character.startMove(direction);
            }
        }
        if (madeMove) KeyPress += 1;
    }
};

var loadLevels = function (callback) {
    console.log("loading levels...");
    leveldata = [];
    levels = [];
    (function next(i) {
        if (i < NUM_LEVELS) {
            $.get(`levels/${i}.txt`, function (data) {
                var level = Level.parse(data);
                leveldata.push(data);
                levels.push(level);
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

var loadLevel = function (level) {
    KeyPress = 0;
    console.log("loading level " + level);
    moving = false;
    ci = level;
    levels[ci] = Level.parse(leveldata[ci]);
    rawCanvas = document.createElement("canvas");
    [rawCanvas.width, rawCanvas.height] = levels[ci].map.size;
    rawCtx = rawCanvas.getContext("2d");
    controlled = 0;
    levels[ci].map.characters.forEach(function (char) {
        if (char) char.controlled = false;
    });
    for (var j = 0; j < levels[ci].metadata.control.length; ++j) {
        controlled |= (1 << levels[ci].metadata.control[j]);
        levels[ci].map.characters[levels[ci].metadata.control[j]].controlled = true;
    }
};

class StateMachine {
    constructor() {
        this.stack = [];
    }
    empty() {
        return this.stack.length === 0;
    }
    top() {
        if (!this.empty()) {
            return this.stack[this.stack.length - 1];
        }
    }
    push(state) {
        if (state instanceof State) {
            this.stack.push(state);
        }
    }
    pop() {
        return this.stack.pop();
    }
}

class State {
    click(event) { }
    update() { }
    render() { }
}

class MainMenuState extends State {
    constructor() {
        super();
        this.playBtn = [440, 300, 400, 80];
        this.helpBtn = [440, 400, 400, 80];
    }
    update() { }
    click(event) {
        var mx = event.offsetX;
        var my = event.offsetY;
        if (isInside(mx, my, ...this.playBtn)) {
            sfx.menuhit.play();
            stateMachine.push(new GameState());
        } else if (isInside(mx, my, ...this.helpBtn)) {
            sfx.menuhit.play();
            stateMachine.push(new HelpState());
        }
    }
    render() {
        ctx.clearRect(0, 0, GWIDTH, GHEIGHT);

        var message = "Mergem";
        ctx.font = "120px 'Alfa Slab One'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(message, (GWIDTH - ctx.measureText(message).width) / 2, 200);

        ctx.fillStyle = "#cccccc";
        ctx.fillRect(...this.playBtn);

        message = `Play`;
        ctx.font = "40px sans-serif";
        ctx.fillStyle = "#000000";
        ctx.fillText(message, (GWIDTH - ctx.measureText(message).width) / 2, 353);

        ctx.fillStyle = "#cccccc";
        ctx.fillRect(...this.helpBtn);

        message = `Help`;
        ctx.fillStyle = "#000000";
        ctx.fillText(message, (GWIDTH - ctx.measureText(message).width) / 2, 453);
    }
}

class GameState extends State {
    update() {
        var level = levels[ci];
        if (!customzoom) level.map.updateCamera();
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
        if (keys[82]) {
            sfx.retry.play();
            loadLevel(ci);
            keys[82] = false;
        }
        if (keys[27]) {
            stateMachine.push(new PauseState());
            keys[27] = false;
        }
        level.map.update();
    }
    render() {
        ctx.clearRect(0, 0, GWIDTH, GHEIGHT);
        var level = levels[ci];
        rawCtx.clearRect(0, 0, rawCanvas.width, rawCanvas.height);
        level.map.render();

        ctx.drawImage(rawCanvas, ...level.map.getCameraFrame());
        ctx.font = "30px 'Alfa Slab One'";
        ctx.fillStyle = '#fff';
        ctx.fillText("Level " + (ci + 1), 50, 50);
        ctx.fillText("Steps Taken: " + KeyPress, 1000, 50);
    }
}

class PauseState extends State {
    update() {
        if (keys[27]) {
            stateMachine.pop();
            keys[27] = false;
        }
    }
    render() {
        ctx.clearRect(0, 0, GWIDTH, GHEIGHT);

        var message = "Game Paused";
        ctx.font = "90px 'Alfa Slab One'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(message, (GWIDTH - ctx.measureText(message).width) / 2, 200);
    }
}

class EndgameState extends State {
    constructor() {
        super();
        bgm.bgm.pause();
        bgm.endgame.play();
    }
    render() {
        ctx.clearRect(0, 0, GWIDTH, GHEIGHT);

        var message = "Congratulations!";
        ctx.font = "90px 'Alfa Slab One'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(message, (GWIDTH - ctx.measureText(message).width) / 2, 200);
    }
}

class HelpState extends State {
    update() {
        if (keys[27]) {
            stateMachine.pop();
            keys[27] = false;
        }
    }
    render() {
        ctx.clearRect(0, 0, GWIDTH, GHEIGHT);

        var message = "wasd to move, r to reset, esc to go back";
        ctx.font = "20px 'Alfa Slab One'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(message, 40, 200);
    }
}

var frame = function () {
    var current;
    if (!stateMachine.empty()) {
        current = stateMachine.top();
        current.update();
        current.render();

        // ctx.font = "10px monospace";
        // ctx.fillStyle = "#fff";
        // ctx.fillText("current state: " + current.constructor.name, 15, GHEIGHT - 15);
    }
    requestAnimationFrame(frame);
};

var init = function () {
    bgm.bgm.play();
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ci = 0;
    keys = Array(256).fill(false);
    stateMachine = new StateMachine();
    stateMachine.push(new MainMenuState());

    var tasks = [loadImages, loadLevels];
    (function next(i) {
        if (i < tasks.length) {
            tasks[i](function () {
                next(i + 1);
            });
        } else {
            canvas.focus();

            canvas.onclick = click;
            window.onkeydown = keydown;
            window.onkeyup = keyup;
            window.onmousewheel = mousewheel;

            loadLevel(ci);
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

var click = function (event) {
    if (!stateMachine.empty()) {
        var current = stateMachine.top();
        current.click(event);
    }
}

var mousewheel = function (event) {
    customzoom = true;
    levels[ci].map.targetzoom += (event.wheelDelta || -event.detail) / 1200;
    levels[ci].map.targetzoom = Math.max(0.2, Math.min(1.2, levels[ci].map.targetzoom));
};

window.onload = init;