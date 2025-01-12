/**
 * Binary Search Algorithm
 * Problem::
 * Given a **sorted** array of `n` elements and a target element `t`, find the index of `t` in the array. Return -1 if the target element is not found.
 * arr = [-5,2,4,6,10], t=10 -> should return 4
 * arr = [-5,2,4,6,10], t=6 -> should return 3
 * arr = [-5,2,4,6,10], t=20 -> should return -1
 */

/**
 * binarySearch
 * @param arr
 * @param t
 * @returns {number}
 */
export function binarySearch(arr: string | any[], t: number) {
    let leftIndex = 0;
    let rightIndex = arr.length - 1;

    // if the arr has elements, find the middle element in the array. If target is equal to the middle element, return the middle element index.
    while (leftIndex <= rightIndex) {
        let midIndex = Math.floor((leftIndex + rightIndex) / 2);
        let mid = arr[midIndex];

        if (t === mid) {
            return midIndex;
        }
        if (t < mid) {
            rightIndex = midIndex - 1;
        } else {
            leftIndex = midIndex + 1;
        }
    }

    // if the arr is empty, return -1 as the element cannot be found
    return -1;
}

// console.log(binarySearch(arr, 2));


/**
 * recursiveBinarySearch
 * @param arr
 * @param t
 * @returns {number|number|number|*}
 */
export function recursiveBinarySearch(arr: number[], t: number) {
    return search(arr, t, 0, arr.length - 1);
}

/**
 * search
 * @param arr
 * @param target
 * @param leftIndex
 * @param rightIndex
 * @returns {number|number|number|*}
 */
function search(arr: number[], target: number, leftIndex: number, rightIndex: number) {
    if (leftIndex > rightIndex) {
        return -1;
    }

    let midIndex = Math.floor((leftIndex + rightIndex) / 2);
    if (target === arr[midIndex]) {
        return midIndex;
    }

    if (target < arr[midIndex]) {
        return search(arr, target, leftIndex, midIndex - 1);
    }
    else {
        return search(arr, target, midIndex + 1, rightIndex)
    }
}

/**
 * BinarySearch
 */
export function binarySearch2(array: string | any[], n: number) {
    var lowIndex = 0, highIndex = array.length - 1;

    while (lowIndex <= highIndex) {
        var midIndex = Math.floor((highIndex + lowIndex) / 2);
        if (array[midIndex] == n) {
            return midIndex;
        }
        else if (n > array[midIndex]) {
            lowIndex = midIndex;
        }
        else {
            highIndex = midIndex;
        }
    }
    return -1;
}
