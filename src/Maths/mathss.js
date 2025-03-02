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
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    variance: (numbers) => {
        const avg = this.mean(numbers);
        return this.mean(numbers.map(num => Math.pow(num - avg, 2)));
    },

    standardDeviation: (numbers) => Math.sqrt(this.variance(numbers))
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
  return arr.some(el => el === element);
  // return arr.indexOf(element) !== -1;
}

// Example usage
// const array = [1, 2, 3, 4, 5];
// console.log(isElement(array, 3)); // Output: true
// console.log(isElement(array, 6)); // Output: false
