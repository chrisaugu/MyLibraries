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
        while(arr[i] < pivotValue) {
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