import { Asset } from "./lib/assets/Asset";
import { AssetLibrary } from "./lib/assets/AssetLibrary";
import { LevelLoader } from "./lib/levels/LevelLoader";
import { MenuState } from "./lib/states/MenuState";
import { State } from "./lib/states/State";
import { StateMachine } from "./lib/states/StateMachine";
import { Util } from "./lib/Util";


export class Game {
    levelLibrary: LevelLoader;
    assetLibrary: AssetLibrary;
    stateMachine: StateMachine;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor() {
        console.log("Mergem");
    }
    loadAssets = (callback: (task: string, status: string, progress: number | null, callback_: () => void) => void) => {
        let processed: number = 0;
        const total: number = this.assetLibrary.assets.length;
        Util.async(this.assetLibrary.assets, function (asset: Asset, callback__) {
            asset.load(() => {
                processed += 1;
                callback("assets", "progress", processed * 1.0 / total, () => {
                    callback__();
                });
            });
        }, function () {
            callback("assets", "done", null, () => { });
        });
    }
    resize = (event?: Event) => {
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;
    }
    click = (event: MouseEvent) => {
        try {
            const current = this.stateMachine.peek();
            current.click(event);
        } catch (e) {
            console.log(`Error reading from stateMachine: ${e}`);
        }
    }
    init = () => {
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        const context = this.canvas.getContext("2d");
        if (context === null) return;
        this.context = context;

        window.onresize = this.resize;
        window.onclick = this.click;
        this.resize();

        this.assetLibrary = new AssetLibrary();
        this.stateMachine = new StateMachine();
        this.stateMachine.push(new MenuState());
    }
}

export const game = new Game();
game.init();