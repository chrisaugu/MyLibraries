/**
 * QuickSort
 *
 * @param arr
 */
export function quickSort<T>(arr: T[], left = 0, right = arr.length - 1) {
    if (left < right) {
        const pivotIndex = partition(arr, left, right)
        quickSort(arr, left, pivotIndex);
        quickSort(arr, pivotIndex + 1, right);
    }
}

function partition<T>(arr: T[], left: number, right: number) {
    const pivotIndex = Math.floor((left + right) / 2);
    const pivotValue = arr[pivotIndex];
    let i = left;
    let j = right;

    while (true) {
        while (arr[i] < pivotValue) {
            i++;
        }

        while (arr[j] > pivotValue) {
            j--;
        }

        if (i >= j) {
            return j;
        }

        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
        j--;
    }
}

function quickSort(arr) {
    if (arr.length < 2) {
        return arr;
    }
    let pivot = arr[arr.length - 1];
    let left = [];
    let right = [];

    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}

const arr = [-6, 20, 8, -2, 4];
console.log(quickSort(arr));

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
