/**
 * BubbleSort Algorithm
 * Given an array of integers, sort the array
 * @constructor
 */
const arr = [-6, 20, 8, -2, 4];

function bubbleSort(arr) {
  let swapped;

  do {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        // swap(arr, i, i+1);
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
}

function swap(arr, a, b) {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

bubbleSort(arr);
console.log(arr);

/**
 * Product
 */
function Product(a, b) {
  this.title = a;
  this.price = b;
}

let products = [];
let brands = ["Roots rice", "Diana tuna", "dolly tuna"];
for (let i = 0; i < 10; i++) {
  let a = brands[Math.floor(Math.random() * brands.length)];
  let b = Math.random().toFixed(2) * 10;
  products.push(new Product(a, b));
}

// swaps two array element values
function swap(array, index1, index2) {
  var temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
}

/**
 * BubbleSort
 */
function bubbleSort(array) {
  for (var i = 0, arrayLength = array.length; i < arrayLength; i++) {
    for (var j = 0; j <= i; j++) {
      if (array[i] instanceof Product && array[j] instanceof Product) {
        if (array[i] < array[j]) {
          swap(array, i, j);
        }
      } else {
        throw new Error("");
      }
    }
  }
  return array;
}

/**
 * SelectionSort
 */
function selectionSort(items) {
  var len = items.length,
    min;

  for (var i = 0; i < len; i++) {
    // set minimum to this position
    min = i;
    // check the rest of the array to see if anything is smaller
    for (j = i + 1; j < len; j++) {
      if (items[j] < items[min]) {
        min = j;
      }
    }
    // if the minimum isn't in the position, swap it
    if (i !== min) {
      swap(items, i, min);
    }
  }
  return items;
}

function insertionSort(items) {
  var len = items.length, // number of items in the array
    value, // the value currently being compared
    i, // index into unsorted section
    j; // index into sorted section

  for (i = 0; i < len; i++) {
    // store the current value because it may shift later
    value = items[i];

    // Whenever the value in the sorted section is greater than the value
    // in the unsorted section, shift all items in the sorted section
    // over by one. This creates space in which to insert the value.
    for (j = i - 1; j > -1 && items[j] > value; j--) {
      items[j + 1] = items[j];
    }
    items[j + 1] = value;
  }

  return items;
}

function quickSort(items) {
  return quickSortHelper(items, 0, items.length - 1);
}
function quickSortHelper(items, left, right) {
  var index;

  if (items.length > 1) {
    index = partition(items, left, right);

    if (left < index - 1) {
      quickSortHelper(items, left, index - 1);
    }

    if (index < right) {
      quickSortHelper(items, index, right);
    }
  }

  return items;
}
function partition(array, left, right) {
  var pivot = array[Math.floor((right + left) / 2)].pricing.price;

  while (left <= right) {
    while (pivot > array[left].pricing.price) {
      left++;
    }

    while (pivot < array[right].pricing.price) {
      right--;
    }

    if (left <= right) {
      var temp = array[left];
      array[left] = array[right];
      array[right] = temp;
      left++;
      right--;
    }
  }

  return left;
}
export { quickSort };

var array = [1, 3, 3, -2, 3, 14, 7, 8, 1, 2, 2];
// sorted form: [-2, 1, 1, 2, 2, 3, 3, 3, 7, 8, 14]
function quickSelectInPlace(A, l, h, k) {
  var p = partition(A, l, h);
  if (p == k - 1) {
    return A[p];
  } else if (p > k - 1) {
    return quickSelectInPlace(A, l, p - 1, k);
  } else {
    return quickSelectInPlace(A, p + 1, h, k);
  }
}
function medianQuickSelect(array) {
  return quickSelectInPlace(
    array,
    0,
    array.length - 1,
    Math.floor(array.length / 2)
  );
}

/**
 * MergeSort
 * MergeSort i
 */
function merge(leftA, rightA) {
  var results = [],
    leftIndex = 0,
    rightIndex = 0;

  while (leftIndex < leftA.length && rightIndex < rightA.length) {
    if (leftA[leftIndex] < rightA[rightIndex]) {
      results.push(leftA[leftIndex++]);
    } else {
      results.push(rightA[rightIndex++]);
    }
  }

  var leftRemains = leftA.slice(leftIndex),
    rightRemains = rightA.slice(rightIndex);

  // add remaining to resultant array
  return results.concat(leftRemains).concat(rightRemains);
}
function mergeSort(array) {
  if (array.length < 2) {
    return array; // Base case: array is now sorted since it's just 1 element
  }

  var midpoint = Math.floor(array.length / 2),
    leftArray = array.slice(0, midpoint),
    rightArray = array.slice(midpoint);

  return merge(mergeSort(leftArray), mergeSort(rightArray));
}

function countSort(array) {
  var hash = {},
    countArr = [];
  for (var i = 0; i < array.length; i++) {
    if (!hash[array[i]]) {
      hash[array[i]] = 1;
    } else {
      hash[array[i]]++;
    }
  }

  for (var key in hash) {
    // for any number of _ element, add it to array
    for (var i = 0; i < hash[key]; i++) {
      countArr.push(parseInt(key));
    }
  }

  return countArr;
}

var array1 = [12, 3, 4, 2, 1, 34, 23];
exports.array1 = array1;
function comparatorNumber(a, b) {
  return b - a;
}
array1.sort(comparatorNumber);

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
