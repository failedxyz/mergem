const TILE_SIZE = 128;

imageLibrary = {
    floor: "/assets/floor.png",
    space: "/assets/space.png",
    sprite: "/assets/sprite.png",
    switch: "/assets/switch.png",
    wall: "/assets/wall.png",
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
}

class SwitchTile extends ActionTile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.switch;
    }
    action() {
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
    "wall": WallTile
};