/**
 * LinearSearch
 */
// iterate through the array and find
export function linearSearch(array, n) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == n) {
            return true;
        }
    }
    return false;
}
