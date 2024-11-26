
let dnom = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
let owed = 5632;
let payed = [];

for (let d of dnom) {
    while (owed >= d) {
        owed -= d;
        payed.push(d);
    }
}

console.log(payed.reduce((acc, v) => acc + v));