function unless(d, then) {
  if (!d) then();
}

function every(array) {}

function loop(array) {}

/**
 *
 * @param {*} items
 * @param {*} groupName
 * @returns counts;
 */
function countBy(items, groupName) {
  let counts = [];
  
  for (let item in items) {
    let name = groupName(item);
    let known = counts.find((c) => c.name == name);
    if (!known) {
      counts.push({ name, count: 1 });
    } else {
      known.count++;
    }
  }

  return counts;
}

function map(array, transform) {
  let mapped = [];

  for (let element of array) {
    mapped.push(transform(element));
  }
  
  return mapped;
}

/**
 *
 * @param {*} array
 * @param {*} combine
 * @param {*} start
 * @returns
 *
 *   console.log(reduce([1, 2, 3, 4], (a, b) => a + b, 0));
 */
function reduce(array, combine, start) {
  let current = start;
  for (let element of array) {
    current = combine(current, element);
  }
  return current;
}

/**
 * Fibonacci Sequence function
 * @param {*} n
 * @returns
 */
function fibonacci(n) {
  if (n < 2) {
    return 1;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}

/**
 * Memoized version of Fibonacci Sequence function
 * @param {*} n
 * @param {*} cache
 * @returns
 */
function memoizedFibonacci(n, cache) {
  cache = cache || [1, 1];

  if (cache[n]) {
    console.log("Fetching from cache");
    return cache[n];
  }

  console.log("Calculating result");
  return (cache[n] =
    memoizedFibonacci(n - 1, cache) + memoizedFibonacci(n - 2, cache));
}

function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// console.log(memoizedFibonacci(4, []))

function memoize(fn) {
  let cache = {};

  return function (...args) {
    console.time("timer");
    if (args in cache) {
      console.log("Fetching from cache");
      return cache[args];
    }

    console.log("Calculating result");
    let value = fn(...args);
    cache[args] = value;
    console.timeEnd("timer");
    return value;
  };
}

// const sum = (a, b) => a + b;
// const memoizedSum = memoize(sum)
// console.log(memoizedSum(1, 5))
// console.log(memoizedSum(1, 5))
// console.log(memoizedSum(1, 5))

console.log(fibonacci(5));
// const memoizedFib = memoize(fibonacci)
// console.log(memoizedFib(5))

async function parallel(arr, fn, threads = 2) {
  const result = [];

  while (arr.length) {
    const res = await Promise.all(arr.splice(0, threads).map((x) => fn(x)));
    result.push(res);
  }
  return result.flat();
}

// Helper function to clamp values between 0 and 255
const clamp = (value) => Math.max(0, Math.min(255, value));



function swap(a, b) {
  let temp = a;
  a = b;
  b = temp;

  return {a, b};
}


let range = {
  from: 1,
  to: 5,

  *[Symbol.iterator]() {
    // a shorthand for [Symbol.iterator]: function*()
    for (let value = this.from; value <= this.to; value++) {
      yield value;
    }
  },
};
// console.log( [...range] );
