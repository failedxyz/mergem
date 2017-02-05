export abstract class State {
    abstract click: (event: MouseEvent) => void;
    abstract render: () => void;
    abstract update: () => void;
}
