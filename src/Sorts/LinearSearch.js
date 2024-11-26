/**
 * LinearSearch
 */
// iterate through the array and find
function linearSearch(array, n) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == n) {
            return true;
        }
    }
    return false;
}
