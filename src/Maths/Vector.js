export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  size() {
    return this.size;
  }

  transpose() {
    let newVector = _createVector(this.m);

    // iterate and swap the entries
    for (var i = 0; i < N.length; i++) {
      for (let j = 0; j < N[i].length; j++) {
        newVector[j][i] = N[i][j];
      }
    }

    return newVector;
  }

  _createVector(m_size, n_size) {
    for (var i = 0; i < m_size; i++) {
      M[i] = [];
    }
  }

  normalize() {
    const magnitude = this.magnitude();

    this.x = this.x / magnitude;
    this.y = this.y / magnitude;

    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  scale(factor) {
    this.x = this.x * factor;
    this.y = this.y * factor;

    return this;
  }
}
