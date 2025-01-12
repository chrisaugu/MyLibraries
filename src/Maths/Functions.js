/**
 * Math formulas
 * (c) 2022, Christian Augustyn
 */
/**
 * @license Math-Functions.js v4.2.0 05/03/2022
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2022, Christian Augsutyn (xian@christianaugustyn.me)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
export function dot(multicand, multiplier) {
  var el = [0, 0, 0];
  for (var i = 0; i < multicand.length; ++i) {
    for (var j = 0; j < multiplier.length; ++j) {
      el[i] += multicand[i][j] * multiplier[j];
    }
  }
  return el;
}

export function calculateTurningPoint() {
  return {
    x: "",
    y: "",
  };
}

export function xCoordinates() {
  return {
    x: "",
    y: 0,
  };
}

export function yCoordinates() {
  return {
    x: 0,
    y: "",
  };
}

export function calculatePointOfIntersectioon() {
  return {
    x: "",
    y: "",
  };
}

export function isPerpendicular(p1, p2) {
  return -1 === calculateGradient(p1, p2) * calculateGradient(p2, p1);
}

/**
 * Check is the two points are parallel by comparing their gradient
 * @param {Point} p1 
 * @param {Point} p2 
 * @returns {boolean}
 */
export function isParallel(p1, p2) {
  let m1 = calculateGradient(p1, p2);
  let m2 = calculateGradient(p2, p3);

  if (m1 === m2) {
    return true;
  }
  return false;
}

export function isConcurrent(eqn, p) {
  return false;
}

export function isCollinear(p1, p2, p3) {
  let m = [];
  let m1 = calculateGradient(p1, p2);
  let m2 = calculateGradient(p2, p3);

  if (m1 === m2) {
    return true;
  }
  return false;
}

export function constructEquation(e) {
  // "y=3x+1" == "3x-y+1=0"
  // if (y[\-\+\=]?) {}
  // if (y[\-\+]?) {}
  // if (y[\-\+\=]?) {}
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

export function pythagoreanTheorem(x, y, z = 0) {
  let d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
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

export function factorial(n) {
  // return (n != 1) ? n * factorial(n - 1) : 1;
  if (n == 1) {
    return 1;
  }
  return n * factorial(n - 1);

  // function factorial(n) {
  // 	if (n == 0) return 1;
  // 	while (n) {
  // 		return n * factorial(n-1);
  // 	}
}

/**
 * Modulo function
 * % - modular operator
 */
export function mod(m, n) {
  let a = m,
    b = n,
    c,
    r;
  r = Math.floor(a / b);
  c = r * b;
  return a - c;
}

/**
 * Used for calculating Greatest Common Denominator (GCD)
 * using Euclid's Algorithm
 */
export function gcd(m, n) {
  if (n === 0) {
    return m;
  } else {
    return gcd(n, m % n);
  }
}

/**
 * Used for calculating Least Common Denominator (LCD)
 */
export function lcd(m, n) {}

export function rem(m, n) {}

export function gcf(m, n) {}

export function lcf(m, n) {}

export function hcf(text1, text2) {
  var gcd = 1;
  if (text1 > text2) {
    text1 = text1 + text2;
    text2 = text1 - text2;
    text1 = text1 - text2;
  }
  if (text2 == Math.round(text2 / text1) * text1) {
    gcd = text1;
  } else {
    for (var i = Math.round(text1 / 2); i > 1; i = i - 1) {
      if (text1 == Math.round(text1 / i) * i) {
        if (text2 == Math.round(text2 / i) * i) {
          gcd = i;
          i = -1;
        }
      }
    }
  }
  return gcd;
}

/**
 * Lowest Common Multiple
 * LCM(a,b) = ( a × b) / GCF(a,b)
 */
export function lcm(t1, t2) {
  var cm = 1;
  var f = hcf(t1, t2);
  cm = (t1 * t2) / f;
  return cm;
}

export function findRelativelyPrimes(m) {
  let _rel = [];
  for (let i = 0; i < m; i++) {
    if (gcd(m, i) == 1) {
      _rel.push(i);
    }
    console.log(`gcd(${m}, ${i})=${gcd(m, i)}`);
  }
  console.log("relatively primes of " + m + " = {" + _rel + "}");
}

// function deci2Bin(deci) {
// 	var temp = [];
// 	if (deci == 0) {
// 		return deci;
// 	}
// 	return deci2Bin(Math.floor(deci / 2)) % deci;
// };

export function bin_2_dec(bin) {
  var r = null;
  var d = bin.length;
  for (var i = 0; i < bin.length; i++) {
    d -= 1;
    r += Math.pow(2, Number(bin[i]) * d) * Number(bin[i]);
  }
  return r;
}

export function dec_2_bin(dec) {
  var i = dec;
  var r = [];
  while (dec > 0) {
    i = dec % 2;
    dec /= 2;
    dec = Math.floor(dec);
    r.push(i);
  }
  r.push(dec);
  return r.reverse().join("");
}

export function dec_2_oct(dec) {}

export function difference(...a) {
  var diff = 0;
  a.forEach(function (n) {
    diff += n;
  });
  return diff;
}

export function summation(...a) {
  let sum = 0;
  a.forEach(function (n) {
    sum += n;
  });
  return sum;
}

// nth term: t = a + (n - 1) * d
export function nthTerm(a, d, n) { 
  return a + (n - 1) * d;
}

// t =
export function arithmeticProgression(a, b, n) {
  var sequences = [];
  var d = b - a;
  for (var i = 1; i <= n; i++) {
    var t = a + (i - 1) * d;
    sequences.push(t);
  }
  return sequences;
}

export function geometricProgression(a, b, n) {
  var r = b / a;
  // -1 < r < 1
  if (!(-1 < r && r < 1)) return (a * (Math.sqrt(r, n) - 1)) / (r - 1);
  else return (a * (1 - Math.sqrt(r, n))) / (1 - r);
}

export function geometricSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1) {
    throw new Error("Cannot determine the GP with only one element.");
  }

  if (seq[1] / seq[0] == seq[3] / seq[2]) {
    return summation(...seq);
  }
}

export function isSequenceArithmetic(...seq) {
  if (seq.length < 2) {
    return "Cannot determine the common difference with only one element.";
  }

  if (seq.length == 3) {
    return seq[1] - seq[0] == (seq[2] - seq[0]) / 2;
  }

  if (seq.length > 3) {
    return seq[1] - seq[0] == seq[3] - seq[2];
  }
}

export function arithmeticSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1)
    throw new Error("Cannot determine the AP with only one element.");

  if (seq[1] - seq[0] == seq[3] - seq[2]) return summation(...seq);
  else throw new Error("Sequence is not arithmetic.");
}

export function combination(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function permutation(n, r) {
  return factorial(n) / factorial(n - r);
}

export function binomialExpansion(n) {
  var d = [];
  for (var i = 0; i < n + 1; i++) {
    var e = `${combination(n, i)}(x)^${n - i}(y)^${i}`;
    d.push(e);
  }
  return d.join(" + ");
}

// Graph: Equation of calculating the number of edges in a number of vertices
function numberOfEdgesOfVertex(v) {export 
  var n = (v * (v + 1)) / 2 - v;
  return n;
}

// Computes and output the result of the quadratic
function outputRoots(a, b, c) {export 
  var d = b * b - 4 * a * c;

  // Two real roots
  if (d > 0) {
    var sqrtd = Math.sqrt(d);
    console.log(
      "There are two real roots " +
        eval((-b + sqrtd) / (2 * a)) +
        " and " +
        eval((-b - sqrtd) / (2 * a))
    );
  }
  // Both roots are the same
  else if (d == 0) {
    console.log("There is only one distinct root " + eval(-b / (2 * a)));
  }
  // Complex conjugate roots
  else {
    console.log(
      "The roots are complex" +
        "\nThe real part is " +
        eval(-b / (2 * a)) +
        "\nThe imaginary part is " +
        eval(Math.sqrt(-d) / (2 * a))
    );
  }
}

export function cross(multicand, multiplier) {}

export function calculateTurningPoint() {
  return {
    x: "",
    y: "",
  };
}

export function xCoordinates() {
  return {
    x: "",
    y: 0,
  };
}

export function yCoordinates() {
  return {
    x: 0,
    y: "",
  };
}

export function calculatePointOfIntersectioon() {
  return {
    x: "",
    y: "",
  };
}

export function isPerpendicular(p1, p2) {
  return -1 === calculateGradient(p1, p2) * calculateGradient(p2, p1);
}

export function isParallel() {
  if (true) {
    return true;
  }
  return false;
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

export function constructEquation(e) {
  // "y=3x+1" == "3x-y+1=0"
  // if (y[\-\+\=]?) {}
  // if (y[\-\+]?) {}
  // if (y[\-\+\=]?) {}
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

export function pythagoreanTheorem(x, y, z = 0) {
  let d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
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

export function factorial(n) {
  return n != 1 ? n * factorial(n - 1) : 1;
}
// function factorial(n) {
// 	if (n == 0) return 1;
// 	while (n) {
// 		return n * factorial(n-1);
// 	}
// };

/**
 * Modulo function
 * % - modular operator
 */
export function mod(m, n) {
  let a = m,
    b = n,
    c,
    r;
  r = Math.floor(a / b);
  c = r * b;
  return a - c;
}

/**
 * Used for calculating Greatest Common Denominator (GCD)
 * using Euclid's Algorithm
 */
export function gcd(m, n) {
  if (n == 0) {
    return m;
  } else {
    return gcd(n, m % n);
  }
}

/**
 * Used for calculating Least Common Denominator (LCD)
 */
export function lcd(m, n) {}

export function rem(m, n) {}

export function gcf(m, n) {}

export function lcf(m, n) {}

export function hcf(text1, text2) {
  var gcd = 1;
  if (text1 > text2) {
    text1 = text1 + text2;
    text2 = text1 - text2;
    text1 = text1 - text2;
  }
  if (text2 == Math.round(text2 / text1) * text1) {
    gcd = text1;
  } else {
    for (var i = Math.round(text1 / 2); i > 1; i = i - 1) {
      if (text1 == Math.round(text1 / i) * i) {
        if (text2 == Math.round(text2 / i) * i) {
          gcd = i;
          i = -1;
        }
      }
    }
  }
  return gcd;
}

/**
 * Lowest Common Multiple
 * LCM(a,b) = ( a × b) / GCF(a,b)
 */
export function lcm(t1, t2) {
  var cm = 1;
  var f = hcf(t1, t2);
  cm = (t1 * t2) / f;
  return cm;
}

export function findRelativelyPrimes(m) {
  let _rel = [];
  for (let i = 0; i < m; i++) {
    if (gcd(m, i) == 1) {
      _rel.push(i);
    }
    console.log(`gcd(${m}, ${i})=${gcd(m, i)}`);
  }
  console.log("relatively primes of " + m + " = {" + _rel + "}");
}

// function deci2Bin(deci) {
// 	var temp = [];
// 	if (deci == 0) {
// 		return deci;
// 	}
// 	return deci2Bin(Math.floor(deci / 2)) % deci;
// };

export function bin_2_dec(bin) {
  var r = null;
  var d = bin.length;
  for (var i = 0; i < bin.length; i++) {
    d -= 1;
    r += Math.pow(2, Number(bin[i]) * d) * Number(bin[i]);
  }
  return r;
}

export function dec_2_bin(dec) {
  var i = dec;
  var r = [];
  while (dec > 0) {
    i = dec % 2;
    dec /= 2;
    dec = Math.floor(dec);
    r.push(i);
  }
  r.push(dec);
  return r.reverse().join("");
}

export function dec_2_oct(dec) {}

export function difference(...a) {
  var diff = 0;
  a.forEach(function (n) {
    diff += n;
  });
  return diff;
}

export function summation(...a) {
  var sum = 0;
  a.forEach(function (n) {
    sum += n;
  });
  return sum;
}

// nth term: t = a + (n - 1) * d
export function nthTerm(a, d, n) { 
  return a + (n - 1) * d;
}

// t =
export function arithmeticProgression(a, b, n) {
  var sequences = [];
  var d = b - a;
  for (var i = 1; i <= n; i++) {
    var t = a + (i - 1) * d;
    sequences.push(t);
  }
  return sequences;
}

export function geometricProgression(a, b, n) {
  var r = b / a;
  // -1 < r < 1
  if (!(-1 < r && r < 1)) return (a * (Math.sqrt(r, n) - 1)) / (r - 1);
  else return (a * (1 - Math.sqrt(r, n))) / (1 - r);
}

export function geometricSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1) {
    throw new Error("Cannot determine the GP with only one element.");
  }

  if (seq[1] / seq[0] == seq[3] / seq[2]) {
    return summation(...seq);
  }
}

export function isSequenceArithmetic(...seq) {
  if (seq.length < 2) {
    return "Cannot determine the common difference with only one element.";
  }

  if (seq.length == 3) {
    return seq[1] - seq[0] == (seq[2] - seq[0]) / 2;
  }

  if (seq.length > 3) {
    return seq[1] - seq[0] == seq[3] - seq[2];
  }
}

export function arithmeticSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1) {
    throw new Error("Cannot determine the AP with only one element.");
  }

  if (seq[1] - seq[0] == seq[3] - seq[2]) {
    return summation(...seq);
  } else {
    throw new Error("Sequence is not arithmetic.");
  }
}

export function combination(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function permutation(n, r) {
  return factorial(n) / factorial(n - r);
}

export function binomialExpansion(n) {
  var d = [];
  for (var i = 0; i < n + 1; i++) {
    var e = `${combination(n, i)}(x)^${n - i}(y)^${i}`;
    d.push(e);
  }
  return d.join(" + ");
}

// Computes and output the result of the quadratic
function outputRoots(a, b, c) {export 
  var d = b * b - 4 * a * c;

  // Two real roots
  if (d > 0) {
    var sqrtd = Math.sqrt(d);
    console.log(
      "There are two real roots " +
        eval((-b + sqrtd) / (2 * a)) +
        " and " +
        eval((-b - sqrtd) / (2 * a))
    );
  }
  // Both roots are the same
  else if (d == 0) {
    console.log("There is only one distinct root " + eval(-b / (2 * a)));
  }
  // Complex conjugate roots
  else {
    console.log(
      "The roots are complex" +
        "\nThe real part is " +
        eval(-b / (2 * a)) +
        "\nThe imaginary part is " +
        eval(Math.sqrt(-d) / (2 * a))
    );
  }
}

export function scalar() {
  return {};
}

export function matrix(array) {
  let m = [];

  this.add = function (matrix1, matrix2) {};

  this.subtract = function (matrix1, matrix2) {};

  this.multiply = function (matrix1, matrix2) {};

  this.divide = function (matrix1, matrix2) {};
}

Array.matrix = function (numrows, numcols, initial) {
  var arr = [];
  for (var i = 0; i < numrows; ++i) {
    var columns = [];
    for (var j = 0; j < numcols; ++j) {
      columns[j] = initial;
    }
    arr[i] = columns;
  }
  return arr;
};

export function transpose(A) {
  var A = [
    [12, 7],
    [4, 5],
    [3, 8],
  ];
  var T = [
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (var k = 0; k < A.length; k++) {
    for (var j = 0; j < A[0].length; j++) {
      T[j][k] = A[k][j];
    }
  }

  for (r of T) {
    return r;
  }
}

// function __sigmoid(x) {
// 	return 1 / (1 + Math.exp(-x));
// }

// function train(inputs, outputs, num) {
// 	for (var iteration=0; i<num; ++i) {
// 		output = think(inputs);
// 		error = outputs - output;
// 		// adjustment = dot(inputs.T, error * output * (1-output))
// 		adjustment = 0.01 * dot(matrix(inputs), error);
// 		weights += adjustment;
// 	}
// }

// function think(inputs) {
// 	return __sigmoid(dot(inputs, weights))
// }

// inputs = [[1,1,1],[1,0,1],[0,1,1]];
// outputs = matrix([[1,1,0]])
// train(inputs, outputs, 10000);
// console.log(think(array([1,0,0])));

// Graph: Equation of calculating the number of edges in a number of vertices
function numberOfEdgesOfVertex(v) {export 
  var n = (v * (v + 1)) / 2 - v;
  return n;
}

export function GaussMethod() {
  let n1 = 0;
  let a = [];
  let n = 0;

  for (let row = 1; row <= n1; row++) {
    for (let row_below = row + 1; row_below <= n; row_below++) {
      let multiplier = a[(row_below, row)] / a[(row, row)];

      for (let col = row; col <= n; col++) {
        a[(row_below, col)] = multiplier * a[(row, col)];
      }
    }
  }
}

export function dot(multicand, multiplier) {
  var el = [0, 0, 0];
  for (var i = 0; i < multicand.length; ++i) {
    for (var j = 0; j < multiplier.length; ++j) {
      el[i] += multicand[i][j] * multiplier[j];
    }
  }
  return el;
}

export function calculateTurningPoint() {
  return {
    x: "",
    y: "",
  };
}

export function xCoordinates() {
  return {
    x: "",
    y: 0,
  };
}

export function yCoordinates() {
  return {
    x: 0,
    y: "",
  };
}

export function calculatePointOfIntersectioon() {
  return {
    x: "",
    y: "",
  };
}

export function isPerpendicular(p1, p2) {
  return -1 === calculateGradient(p1, p2) * calculateGradient(p2, p1);
}

export function isParallel(p1, p2) {
  if (p1 == p2) {
    return true;
  }
  return false;
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

export function constructEquation(e) {
  // "y=3x+1" == "3x-y+1=0"
  // if (y[\-\+\=]?) {}
  // if (y[\-\+]?) {}
  // if (y[\-\+\=]?) {}
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

export function pythagoreanTheorem(x, y, z = 0) {
  let d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
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

export function factorial(n) {
  return n != 1 ? n * factorial(n - 1) : 1;
}
// function factorial(n) {
// 	if (n == 0) return 1;
// 	while (n) {
// 		return n * factorial(n-1);
// 	}
// };

/**
 * Modulo function
 * % - modular operator
 */
export function mod(m, n) {
  let a = m,
    b = n,
    c,
    r;
  r = Math.floor(a / b);
  c = r * b;
  return a - c;
}

/**
 * Used for calculating Greatest Common Denominator (GCD)
 * using Euclid's Algorithm
 */
export function gcd(m, n) {
  if (n == 0) {
    return m;
  } else {
    return gcd(n, m % n);
  }
}

/**
 * Used for calculating Least Common Denominator (LCD)
 */
export function lcd(m, n) {}

export function rem(m, n) {}

export function gcf(m, n) {}

export function lcf(m, n) {}

export function hcf(text1, text2) {
  var gcd = 1;
  if (text1 > text2) {
    text1 = text1 + text2;
    text2 = text1 - text2;
    text1 = text1 - text2;
  }
  if (text2 == Math.round(text2 / text1) * text1) {
    gcd = text1;
  } else {
    for (var i = Math.round(text1 / 2); i > 1; i = i - 1) {
      if (text1 == Math.round(text1 / i) * i) {
        if (text2 == Math.round(text2 / i) * i) {
          gcd = i;
          i = -1;
        }
      }
    }
  }
  return gcd;
}

/**
 * Lowest Common Multiple
 * LCM(a,b) = ( a × b) / GCF(a,b)
 */
export function lcm(t1, t2) {
  var cm = 1;
  var f = hcf(t1, t2);
  cm = (t1 * t2) / f;
  return cm;
}

export function findRelativelyPrimes(m) {
  let _rel = [];
  for (let i = 0; i < m; i++) {
    if (gcd(m, i) == 1) {
      _rel.push(i);
    }
    console.log(`gcd(${m}, ${i})=${gcd(m, i)}`);
  }
  console.log("relatively primes of " + m + " = {" + _rel + "}");
}

// function deci2Bin(deci) {
// 	var temp = [];
// 	if (deci == 0) {
// 		return deci;
// 	}
// 	return deci2Bin(Math.floor(deci / 2)) % deci;
// };

export function bin_2_dec(bin) {
  var r = null;
  var d = bin.length;
  for (var i = 0; i < bin.length; i++) {
    d -= 1;
    r += Math.pow(2, Number(bin[i]) * d) * Number(bin[i]);
  }
  return r;
}

export function dec_2_bin(dec) {
  var i = dec;
  var r = [];
  while (dec > 0) {
    i = dec % 2;
    dec /= 2;
    dec = Math.floor(dec);
    r.push(i);
  }
  r.push(dec);
  return r.reverse().join("");
}

export function dec_2_oct(dec) {}

export function difference(...a) {
  var diff = 0;
  a.forEach(function (n) {
    diff += n;
  });
  return diff;
}

export function summation(...a) {
  var sum = 0;
  a.forEach(function (n) {
    sum += n;
  });
  return sum;
}

export function add(a, b) {
  return a + b;
}

export function sum(...addends) {
  return addends.reduce((a, b) => a + b);
}

console.log(sum([1, 2, 3]));

// nth term: t = a + (n - 1) * d
export function nthTerm(a, d, n) { 
  return a + (n - 1) * d;
}

// t =
export function arithmeticProgression(a, b, n) {
  var sequences = [];
  var d = b - a;
  for (var i = 1; i <= n; i++) {
    var t = a + (i - 1) * d;
    sequences.push(t);
  }
  return sequences;
}

export function geometricProgression(a, b, n) {
  var r = b / a;
  // -1 < r < 1
  if (!(-1 < r && r < 1)) return (a * (Math.sqrt(r, n) - 1)) / (r - 1);
  else return (a * (1 - Math.sqrt(r, n))) / (1 - r);
}

export function geometricSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1) {
    throw new Error("Cannot determine the GP with only one element.");
  }

  if (seq[1] / seq[0] == seq[3] / seq[2]) {
    return summation(...seq);
  }
}

export function isSequenceArithmetic(...seq) {
  if (seq.length < 2) {
    return "Cannot determine the common difference with only one element.";
  }

  if (seq.length == 3) {
    return seq[1] - seq[0] == (seq[2] - seq[0]) / 2;
  }

  if (seq.length > 3) {
    return seq[1] - seq[0] == seq[3] - seq[2];
  }
}

export function arithmeticSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1)
    throw new Error("Cannot determine the AP with only one element.");

  if (seq[1] - seq[0] == seq[3] - seq[2]) return summation(...seq);
  else throw new Error("Sequence is not arithmetic.");
}

export function combination(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function permutation(n, r) {
  return factorial(n) / factorial(n - r);
}

export function binomialExpansion(n) {
  var d = [];
  for (var i = 0; i < n + 1; i++) {
    var e = `${combination(n, i)}(x)^${n - i}(y)^${i}`;
    d.push(e);
  }
  return d.join(" + ");
}

// Graph: Equation of calculating the number of edges in a number of vertices
function numberOfEdgesOfVertex(v) {export 
  var n = (v * (v + 1)) / 2 - v;
  return n;
}

// Computes and output the result of the quadratic
function outputRoots(a, b, c) {export 
  var d = b * b - 4 * a * c;

  // Two real roots
  if (d > 0) {
    var sqrtd = Math.sqrt(d);
    console.log(
      "There are two real roots " +
        eval((-b + sqrtd) / (2 * a)) +
        " and " +
        eval((-b - sqrtd) / (2 * a))
    );
  }
  // Both roots are the same
  else if (d == 0) {
    console.log("There is only one distinct root " + eval(-b / (2 * a)));
  }
  // Complex conjugate roots
  else {
    console.log(
      "The roots are complex" +
        "\nThe real part is " +
        eval(-b / (2 * a)) +
        "\nThe imaginary part is " +
        eval(Math.sqrt(-d) / (2 * a))
    );
  }
}

export function isPrime(n) {
  if (n < 2) {
    return false;
  }

  for (let i = 2; i < n; i++) {
    if (n % i === 0) {
      return false;
    }
  }

  return true;
}

console.log(isPrime(4));

/**
 * 
 * @param {*} num 
 * @returns 
 */
export function isEven(num) {
  return num % 2 == 0;
}

/**
 * 
 * @param {*} num 
 * @returns 
 */
export function isOdd(num) {
  return num % 2 !== 0;
}

/**
 * Returns a list of prime numbers that are smaller than `max`.
 */
export function getPrimes(max) {
  const isPrime = Array.from({ length: max }, () => true);
  isPrime[0] = isPrime[1] = false;
  isPrime[2] = true;
  for (let i = 2; i * i < max; i++) {
    if (isPrime[i]) {
      for (let j = i ** 2; j < max; j += i) {
        isPrime[j] = false;
      }
    }
  }
  return [...isPrime.entries()]
    .filter(([, isPrime]) => isPrime)
    .map(([number]) => number);
}
