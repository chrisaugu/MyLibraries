function unless(d: any, then: () => void) {
  if (!d) then();
}

function every(array: any) { }

function loop(array: any) { }

/**
 *
 * @param {*} items
 * @param {*} groupName
 * @returns counts;
 */
function countBy(items: any, groupName: (arg0: string) => any) {
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

function map(array: any, transform: (arg0: any) => any) {
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
function reduce(array: any, combine: (arg0: any, arg1: any) => any, start: any) {
  let current = start;
  for (let element of array) {
    current = combine(current, element);
  }
  return current;
}

/**
 * Fibonacci Sequence function
 * @param {*} n
 * @returns {number}
 */
function fibonacci(n: number): number {
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
function memoizedFibonacci(n: number, cache: number[]): number {
  cache = cache || [1, 1];

  if (cache[n]) {
    console.log("Fetching from cache");
    return cache[n];
  }

  console.log("Calculating result");
  return (cache[n] = memoizedFibonacci(n - 1, cache) + memoizedFibonacci(n - 2, cache));
}

function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// console.log(memoizedFibonacci(4, []))

function memoize(fn: (arg0: any) => any) {
  let cache = {};

  return function (...args: string | number) {
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

// console.log(fibonacci(5));
// const memoizedFib = memoize(fibonacci)
// console.log(memoizedFib(5))

async function parallel(arr: any[], fn: (arg0: any) => any, threads = 2) {
  const result = [];

  while (arr.length) {
    const res = await Promise.all(arr.splice(0, threads).map((x: any) => fn(x)));
    result.push(res);
  }
  return result.flat();
}

// Helper function to clamp values between 0 and 255
const clamp = (value: number) => Math.max(0, Math.min(255, value));

function swap<T>(a: T, b: T) {
  let temp = a;
  a = b;
  b = temp;

  return { a, b };
}

export function swapArr(arr: { [x: string]: any; }, a: string | number, b: string | number) {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
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


function praisdropAlgorithm() {
  // fetch products that are within 5 mile radius to customer
  // sort by prices asc
  // sort by distance from customer
}

// https://medium.com/@khosravi.official/intelligent-sort-i-s-a-new-method-for-product-sorting-in-e-commerce-6d4f1d11c340
// Intelligent Sort
// SPV = SALE PER VIEW = SALE / VIEW
// SALE: the number of times a product has been sold
// VIEW: the number of times the product has been viewed by users on the product listing page (not on the product detail page)
// (this.scrollY+window.screen.height)/(document.body.scrollHeight)

// I.S = ()


