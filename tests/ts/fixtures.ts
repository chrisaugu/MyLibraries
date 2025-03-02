// import List from "../src/DataStructures/ts/List";
// import Set from "../src/DataStructures/ts/Set";
// import { CArray } from "./Sort";
// import { isEven, isOdd } from '@/Maths/Functions.js';

// let set = new Set<number>()
// set.add(2)
// set.remove(3)


export class Card {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class Person {
  name: string;
  gender: string;

  constructor(name: string, gender: string) {
    this.name = name;
    this.gender = gender;
  }
}

export namespace Person {
  export module Person {}
}


const arr = [-6, 20, 8, -2, 4];