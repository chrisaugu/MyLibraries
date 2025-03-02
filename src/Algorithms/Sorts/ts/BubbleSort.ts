import { swapArr } from "@/Primitives/functions";

/**
 * BubbleSort Algorithm
 * Given an array of integers, sort the array
 * @constructor
 */
function bubbleSort(arr) {
  let swapped;

  do {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        swapArr(arr, i, i+1);
        swapped = true;
      }
    }
  } while (swapped);
}

function bubbleSort2(dataStore: string[]) {
  var numElements = dataStore.length;
  var temp;
  for (var outer = numElements; outer >= 2; --outer) {
    for (var inner = 0; inner <= outer - 1; ++inner) {
      if (dataStore[inner] > dataStore[inner + 1]) {
        swap(dataStore, inner, inner + 1);
      }
    }
    // console.log(toString());
  }
}

/**
 * BubbleSort
 */
function bubbleSort3(array: []) {
  for (var i = 0, arrayLength = array.length; i < arrayLength; i++) {
    for (var j = 0; j <= i; j++) {
      if (array[i] instanceof Product && array[j] instanceof Product) {
        if (array[i] < array[j]) {
          swapArr(array, i, j);
        }
      } else {
        throw new Error("");
      }
    }
  }
  return array;
}

var array1 = [12, 3, 4, 2, 1, 34, 23];

function comparatorNumber(a, b) {
  return b - a;
}

array1.sort(comparatorNumber);
