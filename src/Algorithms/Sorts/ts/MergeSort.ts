/**
 * MergeSort
 * Given an arr,
 * @param arr
 */
function mergeSort(arr) {
  if (arr.length < 2) {
    return arr;
  }
  const mid = Math.floor(arr.length / 2);
  const leftArr = arr.slice(0, mid);
  const rightArr = arr.slice(mid);
  return merge(mergeSort(leftArr), mergeSort(rightArr));
}

function merge(leftArr, rightArr) {
  const sortedArr = [];
  while (leftArr.length && rightArr.length) {
    if (leftArr[0] <= rightArr[0]) {
      sortedArr.push(leftArr.shift());
    } else {
      sortedArr.push(rightArr.shift());
    }
  }

  return [...sortedArr, ...leftArr, ...rightArr];
}

const arr = [-6, 20, 8, -2, 4];
console.log(mergeSort(arr));

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
