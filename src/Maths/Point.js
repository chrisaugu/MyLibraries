
function Point2(x, y) {
	this.x = x;
	this.y = y;
    this.setX = (x) => {this.x = x};
    this.setY = (y) => {this.y = y};
    this.getX = () => { return this.x};
    this.getY = () => { return this.y};
}

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  set X(x) {
    this.x = x;
  }
  get X() {
    return this.x;
  }
  set Y(y) {
    this.y = y;
  }
  get Y() {
    return this.y;
  }
}
