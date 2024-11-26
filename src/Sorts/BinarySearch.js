const { array1 } = require("./BubbleSort");

/**
 * BinarySearch
 */
function binarySearch(array, n) {
    var lowIndex = 0, highIndex = array1.length - 1;

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
