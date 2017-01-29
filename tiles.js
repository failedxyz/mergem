const TILE_SIZE = 64;

var imageLibrary = {
    "floor": "/assets/floor.png",
    "wall": "/assets/wall.png",
    "space": "/assets/space.png", // TODO
};

class Tile {
    static create (char, metadata) {
        var symtable = metadata.symtable;
        [this.x, this.y] = metadata.coordinates;
        if (char in symtable) {
            var tiletype = tiledefs[symtable[char]];
            return new tiletype();
        } else {
            return new SpaceTile();
        }
    }
    render(rCanvas) {
        var ctx = rCanvas.getContext("2d");
        ctx.drawImage(this.tileImage, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        return rCanvas;
    }
}

class FloorTile extends Tile {
    constructor() {
        super();
        this.tileImage = imageLibrary["floor"];
    }
}
class SpaceTile extends Tile {
    constructor() {
        super();
        this.tileImage = imageLibrary["space"];
    }
}
class WallTile extends Tile {
    constructor() {
        super();
        this.tileImage = imageLibrary["wall"];
    }
}

var tiledefs = {
    "floor": FloorTile,
    "wall": WallTile
};