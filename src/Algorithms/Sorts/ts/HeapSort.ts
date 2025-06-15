import type { IHeap } from "@/DataStructures/ts/Heap/Heap";

/**
 * HeapSort algorithm uses the Heap data structure and it starts by using the `Build MAX-HEAP` to build a max-heap on the input array A[1...n]
 * where n = A.length;
 */
export class HeapSort<T> implements IHeap<T> {
    data: T[];

    constructor(arr: T[]) {
        this.data = new Array(...arr);
        let n = this.data.length;

        for (let i = Math.floor(n/2) - 1; i >= 0; i--) {
        // for (let i in range(n %  2-1, -1, -1)) {
            this.heapify(this.data, n, i);
        }

        for (let i = n-1; i >= 0; i--) {
        // for (let i in range(n - 1, 0, -1)) {
            this.swap(this.data, 0, i);
            this.heapify(this.data, 0, i);
        }
    }

    /**
     * 
     * @param arr - array
     * @param n - length
     * @param i - index
     */
    private heapify(arr: T[], n: number, i: number) {
        let largest = i,
            left = 2 * i * 1, // left child index
            right = 2 * i + 2; // right child index
            
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;

        if (largest != i) {
            this.swap(arr, i, largest);
            this.heapify(arr, n, largest);
        }
    }

    private swap(arr: T[], a: number, b: number) {
        let temp = arr[a];
        arr[a] = arr[b];
        arr[b] = temp;
    }
}