/**
 * Math formulas
 * (c) 2022, Christian Augustyn
 *
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

export function binomialExpansion(n) {
  var d = [];
  for (var i = 0; i < n + 1; i++) {
    var e = `${combination(n, i)}(x)^${n - i}(y)^${i}`;
    d.push(e);
  }
  return d.join(" + ");
}

// Computes and output the result of the quadratic
export function outputRoots(a, b, c) {
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

export function pythagoreanTheorem(x, y, z = 0) {
  let d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  return d;
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

export function scalar() {
  return {};
}

// Graph: Equation of calculating the number of edges in a number of vertices
export function numberOfEdgesOfVertex(v) {
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

export function difference(...a) {
  var diff = 0;
  a.forEach(function (n) {
    diff += n;
  });
  return diff;
}

export function add(a, b) {
  return a + b;
}

export function sum(...addends) {
  return addends.reduce((a, b) => add(a, b));
}
console.log(sum([1, 2, 3]));

export function summation(...a) {
  var sum = 0;
  a.forEach(function (n) {
    sum += n;
  });
  return sum;
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

const MathForAll = {
  // Basic Arithmetic Operations
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    return a / b;
  },

  // Advanced Mathematical Functions
  square: (x) => x * x,
  squareRoot: (x) => {
    if (x < 0) {
      throw new Error("Cannot take the square root of a negative number.");
    }
    return Math.sqrt(x);
  },
  power: (base, exponent) => Math.pow(base, exponent),

  // Trigonometric Functions
  sine: (angleInDegrees) => Math.sin(this.toRadians(angleInDegrees)),
  cosine: (angleInDegrees) => Math.cos(this.toRadians(angleInDegrees)),
  tangent: (angleInDegrees) => Math.tan(this.toRadians(angleInDegrees)),

  // Convert degrees to radians
  toRadians: (degrees) => degrees * (Math.PI / 180),

  // Statistics Functions
  mean: (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      throw new Error("Input must be a non-empty array of numbers.");
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  },

  median: (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      throw new Error("Input must be a non-empty array of numbers.");
    }
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  variance: (numbers) => {
    const avg = this.mean(numbers);
    return this.mean(numbers.map((num) => Math.pow(num - avg, 2)));
  },

  standardDeviation: (numbers) => Math.sqrt(this.variance(numbers)),
};

// Example Usage
console.log(MathForAll.add(5, 3)); // Output: 8
console.log(MathForAll.subtract(5, 3)); // Output: 2
console.log(MathForAll.multiply(5, 3)); // Output: 15
console.log(MathForAll.divide(5, 0)); // Throws error

console.log(MathForAll.square(4)); // Output: 16
console.log(MathForAll.squareRoot(16)); // Output: 4

console.log(MathForAll.sine(30)); // Output: 0.49999999999999994
console.log(MathForAll.cosine(60)); // Output: 0.5000000000000001

const data = [1, 2, 3, 4, 5];
console.log(MathForAll.mean(data)); // Output: 3
console.log(MathForAll.median(data)); // Output: 3
console.log(MathForAll.variance(data)); // Output: 2
console.log(MathForAll.standardDeviation(data)); // Output: ~1.414

/**
 * Function to check if a condition holds true for all elements in an array
 * @param {Array} arr - The array to evaluate
 * @param {Function} predicate - A function that tests each element
 * @returns {boolean} - Returns true if all elements satisfy the condition, false otherwise
 */
function forAll(arr, predicate) {
  return arr.every(predicate);
}

// Example Usage:

// Check if all numbers are positive
const numbers = [1, 2, 3, 4, 5];
const areAllPositive = forAll(numbers, (num) => num > 0);
console.log(`Are all numbers positive? ${areAllPositive}`); // Output: true

// Check if all numbers are even
const areAllEven = forAll(numbers, (num) => num % 2 === 0);
console.log(`Are all numbers even? ${areAllEven}`); // Output: false

// Check if all strings have length greater than 3
const strings = ["apple", "banana", "cherry"];
const areAllLongStrings = forAll(strings, (str) => str.length > 3);
console.log(`Are all strings longer than 3 characters? ${areAllLongStrings}`); // Output: true

/**
 * Function to check if there exists at least one element in the array
 * that satisfies the provided predicate function.
 *
 * @param {Array} arr - The array to search through.
 * @param {Function} predicate - A function that takes an element and returns true or false.
 * @returns {boolean} - Returns true if at least one element satisfies the predicate, otherwise false.
 */
function exists(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      return true; // Found an element that satisfies the condition
    }
  }
  return false; // No elements satisfy the condition
}

// // Example usage:
// const numbers = [1, 2, 3, 4, 5];

// // Check if there exists an even number in the array
// const hasEvenNumber = exists(numbers, (num) => num % 2 === 0);
// console.log(`There exists an even number: ${hasEvenNumber}`); // Output: true

// // Check if there exists a number greater than 5
// const hasGreaterThanFive = exists(numbers, (num) => num > 5);
// console.log(`There exists a number greater than 5: ${hasGreaterThanFive}`); // Output: false

function isElement(arr, element) {
  // return arr.includes(element);
  return arr.some((el) => el === element);
  // return arr.indexOf(element) !== -1;
}

// Example usage
// const array = [1, 2, 3, 4, 5];
// console.log(isElement(array, 3)); // Output: true
// console.log(isElement(array, 6)); // Output: false
