import {describe, expect, test} from '@jest/globals';
import { MinimumHeap } from '@/DataStructures';

describe('testing Min. Heap data structure', () => {
    const q = new MinimumHeap<number>();
    test('add 1 person to the queue so count is 1', () => {
        q.insert(1);
        expect(q.getMin()).toEqual(1)
    })
})