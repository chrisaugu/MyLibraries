
function isEqual(p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}

function mod(a, p) {
    if (a < 0) {
        let e = a % p;
        return e + p;
    }
    else {
        return a % p;
    }
}

function modInverse(a, p) {
    return Math.pow(a, p-2) % p;
}

function findEEC(p1, p2, a, b, p) {
    let s, x3, y3;
    if (isEqual(p1, p2)) {
        let m = (3*Math.pow(p1[0], 2)+a);
        let n = (2*p1[1]);
        if (Number.isInteger(m/n)) {
            s = m/n % p
        }
        else {
            s = (modInverse(n, p) * a) % p
        }
    }
    else {
        let m = (p2[1]-p1[1]); // y2-y1
        let n = (p2[0]-p1[0]); // x2-x1
        if (Number.isInteger(m/n)) {
            s =(m/n) % p;
        }
        else {
            s = modInverse(n, p)
        }
    }
    console.log(s)
    x3 = mod((Math.pow(s, 2) - p1[0] - p2[0]), p);
    console.log(x3)
    y3 = mod((s * (p1[0] - x3) - p1[1]), p);
    console.log(y3)

    return [x3, y3]
    
};  