import { Point } from "./Point";

class Line {
    constructor() {
        this.p1 = new Point();
        this.p2 = new Point();
    }

    setP1 = (p) => { this.p1 = p; };
    setP2 = (p) => { this.p2 = p; };
    getP1 = () => { return this.p1; };
    getP2 = () => { return this.p2; };
}