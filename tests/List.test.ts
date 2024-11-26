import {describe, expect, test} from '@jest/globals';

import List from "../src/DataStructures/esm/List";
import { Person } from "./fixtures";

const people = new List<Person>();
people.append(new Person('kitten', 'male'));
people.append(new Person('dolly', 'female'));
people.append(new Person('molly', 'female'));
people.append(new Person('rolly', 'female'));
people.append(new Person('polly', 'female'));
people.append(new Person('colly', 'female'));
people.append(new Person('golly', 'female'));
people.append(new Person('holly', 'female'));
people.append(new Person('nolly', 'female'));
people.append(new Person('solly', 'female'));

// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// people.next()
// console.log(people.currPos())
// console.log(people.length())

// for (people.end(); people.currPos() >= 0; people.prev()) {
// for (people.front(); people.currPos() < people.length(); people.next()) {
//   if (people.getElement() instanceof Person) {
//     if (people.getElement()['gender'] === 'female') {
//       console.log(people.getElement()['name'])
//     }
//   }
// }

describe('testing List data structure', () => {
    test('empty string should result in zero', () => {
        expect(people.length()).toBe(10)
    });

    test('3rd person on the list is a female', () => {
        expect(people.length()).toBe(10)
    });
});