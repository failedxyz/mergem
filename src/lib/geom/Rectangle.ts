import { Point } from "./Point";

export class Rectangle {
    constructor(public x: number, public y: number, public w: number, public h: number) {
    }
    contains(point: Point): boolean {
        const z1: number = this.x + this.w;
        const z2: number = this.y + this.h;

        const x1: number = Math.min(this.x, z1);
        const x2: number = Math.max(this.x, z1);
        const y1: number = Math.min(this.y, z2);
        const y2: number = Math.max(this.y, z2);

        return (x1 <= point.x) && (point.x <= x2) && (y1 <= point.y) && (point.y <= y2);
    }
}
