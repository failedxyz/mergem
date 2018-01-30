import { game } from "../../main";
import { Point } from "../geom/Point";
import { Util } from "../Util";
import { GameState } from "./GameState";
import { State } from "./State";

export class MenuState extends State {
    ready: boolean = false;
    currentTask: string = "";
    currentProgress: number = 0;

    constructor() {
        super();

        const self: MenuState = this;
        requestAnimationFrame(this.render);
        Util.async([game.loadAssets], (task: (callback: (task: string, status: string, progress: number | null, callback_: () => void) => void) => void, callback: () => void): void => {
            task((task: string, status: string, progress: number | null, callback_: () => void) => {
                self.currentTask = task;
                if (status === "done") {
                    callback();
                } else if (status === "progress" && progress !== null) {
                    self.currentProgress = Math.round(progress * 10000) / 100.0;
                    self.ready = true;
                    callback_();
                }
            });
        }, (): void => {
            // self.ready = true;
        });
    }
    click = (event: MouseEvent) => {
        const mouse: Point = new Point(event.offsetX, event.offsetY);
        if (this.ready) {
            game.stateMachine.push(new GameState());
        }
    }
    render = () => {
        game.context.clearRect(0, 0, game.width, game.height);
        let message: string = "";
        if (!this.ready) {
            message = `Loading ${this.currentTask}: ${this.currentProgress}%`;
        } else {
            message = "Click anywhere to start.";
        }

        game.context.font = "20px 'Open Sans'";
        game.context.fillStyle = "#fff";
        const width: number = game.context.measureText(message).width;

        game.context.fillText(message, (game.width - width) / 2, game.height / 2);
        requestAnimationFrame(this.render);
    }
    update = () => { };
}
