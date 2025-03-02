export function isPerpendicular(p1, p2) {
  return -1 === calculateGradient(p1, p2) * calculateGradient(p2, p1);
}

export function isConcurrent(eqn, p) {
  return false;
}

export function isCollinear(p1, p2, p3) {
  let m = new Array();
  let m1 = calculateGradient(p1, p2);
  let m2 = calculateGradient(p2, p3);
  if (m1 === m2) {
    return true;
  }
  return false;
}

export function calculateGradient(p1, p2) {
  let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  return m;
}

export function calculateDistance(p1, p2) {
  let x1 = p1[0];
  let y1 = p1[1];
  let x2 = p2[0];
  let y2 = p2[1];
  // let d = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2));
  let d = pythagoreanTheorem(x2 - x1, y2 - y1);
  return d;
}

export function calculateMidPoint(p1, p2) {
  let x1 = p1[0];
  let y1 = p1[1];
  let x2 = p2[0];
  let y2 = p2[1];
  let x = (x1 + x2) / 2;
  let y = (y1 + y2) / 2;
  return {
    x: x,
    y: y,
  };
}

export function isParallel(p1, p2) {
  if (p1 == p2) {
    return true;
  }
  return false;
}
