const TILE_SIZE = 128;

imageLibrary = {
    floor: "assets/floor.png",
    space: "assets/space.png",
    sprite: "assets/sprite.png",
    switch: "assets/switch.png",
    wall: "assets/wall.png",
};

class Tile {
    static create(char, metadata) {
        var symtable = metadata.symtable;
        var [x, y] = metadata.coordinates;
        if (char in symtable) {
            var tiletype = tiledefs[symtable[char]];
            return new tiletype(x, y);
        }
        if (char.match(/^\d$/)) {
            return new SpawnTile(x, y);
        }
        return new SpaceTile(x, y);
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    render() {
        rawCtx.drawImage(this.tileImage, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}

class ActionTile extends Tile {
    constructor(x, y) {
        super(x, y);
    }
    action() { }
}

class SwitchTile extends ActionTile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.switch;
        this.used = false;
        this.singleUse = true;
        this.disabled = false;
    }
    disable() {
        this.tileImage = imageLibrary.floor;
        this.disabled = true;
    }
    action() {
        if (numPlayers() == 1) {
            return this.disable();
        }
        var level = levels[ci];
        if (this.disabled) {
            return;
        }
        var touchingSwitch = 0;
        for (var i = 1; i < level.map.characters.length; ++i) {
            if (level.map.characters[i] === null) continue;
            var tile = level.map.characters[i].currentTile();
            if (tile instanceof SwitchTile && !tile.disabled) {
                touchingSwitch |= 1 << i;
                tile.disable();
            }
        }
        controlled = (~touchingSwitch) & ~(~0 << level.map.characters.length);
        if (this.singleUse) {
            this.disable();
        }
    }
}

class ExitTile extends ActionTile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = tint(imageLibrary.floor, [102, 204, 0]);
    }
    action() {
        if (numPlayers() == 1) {
            ci += 1;
            loadLevel(ci);
        }
    }
}

class FloorTile extends Tile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.floor;
    }
}
class SpawnTile extends FloorTile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.floor;
    }
}
class SpaceTile extends Tile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.space;
    }
}
class WallTile extends Tile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.wall;
    }
}

var tiledefs = {
    "floor": FloorTile,
    "switch": SwitchTile,
    "wall": WallTile,
    "exit": ExitTile,
    "ice": SpaceTile,
    "portal": SpaceTile,
};