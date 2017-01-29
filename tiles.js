const TILE_SIZE = 128;

var imageLibrary = {
    "floor": "/assets/floor.png",
    "wall": "/assets/wall.png",
    "space": "/assets/space.png", // TODO
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
    render(rCanvas) {
        var ctx = rCanvas.getContext("2d");
        ctx.drawImage(this.tileImage, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        return rCanvas;
    }
}

class ActionTile extends Tile {
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