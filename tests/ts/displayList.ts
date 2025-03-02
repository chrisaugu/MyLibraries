// import List from "@/DataStructures/js/List";
import Set from "@/DataStructures/js/Set";
import { CArray } from "@/Algorithms/Sorts/ts/Sort";

// function Person(name, gender) {
//   this.name = name;
//   this.gender = gender;
// }

// let people = new List();
// people.append(new Person('kitten', 'male'));
// people.append(new Person('dolly', 'female'));
// people.append(new Person('molly', 'female'));
// people.append(new Person('rolly', 'female'));
// people.append(new Person('polly', 'female'));
// people.append(new Person('colly', 'female'));
// people.append(new Person('golly', 'female'));
// people.append(new Person('holly', 'female'));
// people.append(new Person('nolly', 'female'));
// people.append(new Person('solly', 'female'));

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

// Array.matrix();
// var grades = [[89, 77, 78],[76, 82, 81],[91, 94, 89]];
// console.log(grades[2][2]);
// var total = 0;
// var average = 0.0;

// for (var row = 0; row < grades.length; ++row) {
//   for (var col = 0; col < grades[row].length; ++col) {
//     total += grades[row][col];
//   }
//   average = total / grades[row].length;
//   console.log("Student " + parseInt(row+1) + " average: " + average.toFixed(2));
//   total = 0;
//   average = 0.0;
// }

// for (var col = 0; col < grades.length; ++col) {
//   for (var row = 0; row < grades[col].length; ++row) {
//     total += grades[col][row];
//   }
//   average = total / grades[col].length;
//   console.log("Test " + parseInt(col+1) + " average: " + average.toFixed(2));
//   total = 0;
//   average = 0.0;
// }

// var grades = [[89, 77],[76, 82, 81],[91, 94, 89, 99]];
// var total = 0;
// var average = 0.0;
// for (var row = 0; row < grades.length; ++row) {
//   for (var col = 0; col < grades[row].length; ++col) {
//     total += grades[row][col];
//   }
//   average = total / grades[row].length;
//   console.log("Student " + parseInt(row+1) + " average: " + average.toFixed(2));
//   total = 0;
//   average = 0.0;
// }

// function first(word) {
//   return word[0];
// }
// var words = ["for", "your", "information"];
// var acronym = words.map(first);
// console.log(acronym.join(""));

// function isEven(num) {
//   return num % 2 == 0;
// }

// function isOdd(num) {
//   return num % 2 !== 0;
// }

// var nums = [];
// for (var i = 0; i < 20; ++i) {
//   nums[i] = i+1;
// }
// var evens = nums.filter(isEven);
// var odds = nums.filter(isOdd);
// console.log(`Even nums: ${evens}`);
// console.log(`Odd nums: ${odds}`);

// function afterc(str) {
//   if (str.indexOf("cie") > -1) {
//     return true;
//   }
//   return false;
// }
// var words = ["recieve","deceive","percieve","deceit","concieve"];
// var misspelled = words.filter(afterc);
// console.log(misspelled);

// function Point(x, y) {
// 	this.x = x;
// 	this.y = y;
// }

// function displyPts(arr) {
// 	for (var i = 0; i < arr.length; ++i) {

// 	}
// }

var numElements = 100;
var myNums = new CArray(numElements);
myNums.setData();
console.log("unsorted: ");
console.log(myNums.toString());
myNums.bubbleSort();
console.log("sorted: ");
console.log(myNums.toString());

var s = new Set();
s.add([1, 2]);
console.log(s.show());
