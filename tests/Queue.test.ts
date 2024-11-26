import {describe, expect, test} from '@jest/globals';
import Queue from "../src/DataStructures/esm/Queue";
import { Person } from './fixtures';

describe('testing Queue data structure', () => {
    let q = new Queue<Person>();
    test('add 1 person to the queue so count is 1', () => {
        q.enqueue(new Person("10 Spade", "male"))
        expect(q.front()).toEqual({"gender": "male", "name": "10 Spade"})
    })
})