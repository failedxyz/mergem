import { State } from "./State";

export class StateMachine {
    private stack: State[];
    constructor() {
        this.stack = [];
    }
    empty = (): boolean => {
        return this.stack.length === 0;
    }
    peek = (): State => {
        if (this.empty()) {
            throw new Error("State machine is empty.");
        }
        return this.stack[this.stack.length - 1];
    }
    push(state: State): void {
        this.stack.push(state);
    }
    pop(): State {
        const state: State | undefined = this.stack.pop();
        if (state === undefined) {
            throw new Error("State machine is empty.");
        }
        return state;
    }
}
