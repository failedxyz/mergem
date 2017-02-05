import { Asset } from "./Asset";

export class AssetLibrary {
    assets: Asset[];
    constructor() {
        this.assets = [];

        this.assets.push(new Asset("sound", "applause", "applause.mp3"));
        this.assets.push(new Asset("music", "bgm", "bgm.mp3"));
        this.assets.push(new Asset("sound", "end", "end.mp3"));
        this.assets.push(new Asset("music", "endgame", "endgame.mp3"));
        this.assets.push(new Asset("image", "floor", "floor.png"));
        this.assets.push(new Asset("sound", "ice", "ice.mp3"));
        this.assets.push(new Asset("image", "ice", "ice.png"));
        this.assets.push(new Asset("sound", "menuhit", "menuhit.wav"));
        this.assets.push(new Asset("sound", "merge", "merge.mp3"));
        this.assets.push(new Asset("sound", "portal", "portal.mp3"));
        this.assets.push(new Asset("image", "portal", "portal.png"));
        this.assets.push(new Asset("sound", "retry", "retry.mp3"));
        this.assets.push(new Asset("image", "space", "space.png"));
        this.assets.push(new Asset("image", "sprite", "sprite.png"));
        this.assets.push(new Asset("image", "sprite1", "sprite1.png"));
        this.assets.push(new Asset("sound", "step", "step.mp3"));
        this.assets.push(new Asset("image", "switch", "switch.png"));
        this.assets.push(new Asset("sound", "switch", "switch.wav"));
        this.assets.push(new Asset("image", "wall", "wall.png"));
    }
}