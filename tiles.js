const TILE_SIZE = 128;

imageLibrary = {
    floor: "assets/floor.png",
    ice: "assets/ice.png",
    portal: "assets/portal.png",
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
    action(character) { }
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
    action(character) {
        var i;
        if (numPlayers() == 1) {
            return this.disable();
        }
        var level = levels[ci];
        if (this.disabled) {
            return;
        }
        var touchingSwitch = 0;
        for (i = 1; i < level.map.characters.length; ++i) {
            if (level.map.characters[i] === null) continue;
            var tile = level.map.characters[i].currentTile();
            if (tile instanceof SwitchTile && !tile.disabled) {
                touchingSwitch |= 1 << i;
                tile.disable();
            }
        }
        controlled = (~touchingSwitch) & ~(~0 << level.map.characters.length);
        for (i = 1; i < level.map.characters.length; ++i) {
            if (level.map.characters[i] === null) continue;
            level.map.characters[i].controlled = (controlled >> i) & 1;
        }
        sfx.switch.play();
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
    action(character) {
        if (numPlayers() == 1) {
            sfx.end.play();
            if (ci === levels.length - 1) {
                stateMachine.push(new EndgameState());
            } else {
                ci += 1;
                loadLevel(ci);
            }
        }
    }
}
class PortalTile extends ActionTile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.portal;
    }
    action(character) {
        var level = levels[ci];
        var key = `${this.x},${this.y}`;
        if (key in level.map.portalLookup) {
            var destination = level.map.portalLookup[key];
            var id = destination.id;
            if (level.map.portalConnections[id].times !== 0) {
                sfx.portal.play();
                [character.x, character.y] = destination.dest;
                [character.displayx, character.displayy] = destination.dest;
                level.map.portalConnections[id].times -= 1;
                if (level.map.portalConnections[id].times === 0) {
                    for (var [x, y] of level.map.portalConnections[id].portals) {
                        level.map.tilemap[y][x].disabled = true;
                    }
                }
            }
        }
    }
    render() {
        rawCtx.drawImage(imageLibrary.floor, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        if (!this.disabled) {
            rawCtx.drawImage(this.tileImage, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}
class IceTile extends Tile {
    constructor(x, y) {
        super(x, y);
        this.tileImage = imageLibrary.ice;
    }
    action(character) {
        character.momentum = character.direction;
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
    "exit": ExitTile,
    "floor": FloorTile,
    "ice": IceTile,
    "portal": PortalTile,
    "switch": SwitchTile,
    "wall": WallTile,
};