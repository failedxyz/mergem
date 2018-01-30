import { game } from "../../main";
import { State } from "./State";

export class GameState extends State {
    constructor() {
        super();
        requestAnimationFrame(this.render);
    }
    click = (event: MouseEvent) => {
    }
    render = () => {
        game.context.clearRect(0, 0, game.width, game.height);
        requestAnimationFrame(this.render);
    }
    update = () => { };
}