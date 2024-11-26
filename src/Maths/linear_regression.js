// Simple Linear Regression

import "./math-fx";

// var e = 0; // error
// var y = a + b*x;

// variable x
var x = [-2, -1, 0, 1, 2];
var y = [1, 1, 3, 5, 5];
var n = avg(x, y);

// means
let _x = x.reduce((e, f) => e + f) / x.length;
let _y = y.reduce((e, f) => e + f) / y.length;

let a = 0; // y-intercept
let b = 1; // slope of line

// best-fitting line - regression line
let y_ = (x) => a + b*x;

// probabilistic model
let y_model = (x) => a + b*x + e;

// line of means
let B = [];
let u = (x) => B[0] + B[1]*x;

// line of best-fit
let B_ = [];
let u_ = (x) => B_[0] + B_[1]*x;

// Least Squares Estimators of a and B
let S = [];
let bb = (r, x, y) => r * (S[y] / S[x]);
let aa = _y - bb*_x;

// Least Square Error
// let sum = 0;
// for (let i = 0; i < y.length; i++) {
// 	sum += (y[i] - y_[i]);
// }
let s = sum(y_model, y_, function(a, b) {
    return a - b;
});
let SSE = s**2;

// Exy
let xy = sum(x, y_model, function(a, b) {
    return a * b;
});

let Sxy = sum(x, y_model) - (sum(x) * sum(y_model)) / n;

let xx = (sum(x))**2
let Sxx = 0;

/**
 * Summation
 */
function sum(a, b, cb) {
	if (a instanceof Array && b instanceof Function) {

	}
	if (a.length != b.length) {
		throw new Error("arrays must be of same size");
	}

	var s = 0;
	for (let i = 0; i < a.length; i++) {
		s += cb(a[i], b[i])
	}

	return s;
}

/**
 * Average
 */
function avg(a, b) {
	if (!(a instanceof Array) && !(b instanceof Array)) {
		throw new Error("a and b must arrays");
	}
	return (a.length + b.length) / 2;
}