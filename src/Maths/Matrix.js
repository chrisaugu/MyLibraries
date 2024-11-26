export class Matrix {
	constructor(m, n) {
		let M = [
			[1,2,3,4],
			[5,6,7,8],
			[9,10,11,12]
		];
		let N = [
			[1,2,3,4],
			[5,6,7,8],
			[9,10,11,12]
		];
		this.size = m * n;
	}

	get size() {
		return this.size;
	}
	
	add() {
		if (m * n > 2) {
			for (var i = 0; i < Things.length; i++) {
				Things[i]
			};
		}
		return new Error("Can't add one vector");
	}

	multiply() {
		
	}

	/**
	 * If A is any matrix, then the transpose of A, denoted by AT
, is defined to be the matrix that results
by interchanging the rows and columns of A; that is, the first column of AT
 is the first row of A, the second
column of AT
 is the second row of A, and so forth.
	 */
	transpose() {
		let newMatrix = _createMatix(this.m, this.n);

		// iterate and swap the entries
		for (var i = 0; i < N.length; i++) {
			for (let j = 0; j < N[i].length; j++) {
				newMatrix[j][i] = N[i][j]
			}
		}
	}

	_createMatix(m_size, n_size) {
		for (var i = 0; i < m_size; i++) {
			M[i] = [];
		}
	}
}


class Matrix2 {
	constructor(m, n) {
		let A = [];
		this.size = m * n;
	}

	get size() {
		return this.size;
	}
	
	add() {
		this.size;
	}

	multiply() {
		
	}

	add(matrix1, matrix2) {
		
	}

	subtract(matrix1, matrix2) {

	}

	multiply(matrix1, matrix2) {
		
	}

	divide(matrix1, matrix2) {
		
	}
}


function matrix(array) {

}

function transpose(A) {
	var A = [[12,7],[4,5],[3,8]];
	var T = [[0,0,0],[0,0,0]];

	for (var k = 0; k < A.length; k++) {
		for (var j = 0; j < A[0].length; j++) {
			T[j][k] = A[k][j];
		}
	}

	for (r of T) {
		return r;
	}
}

function __sigmoid(x) {
	return 1 / (1 + Math.exp(-x));
}

function train(inputs, outputs, num) {
	for (var iteration=0; i<num; ++i) {
		output = think(inputs);
		error = outputs - output;
		// adjustment = dot(inputs.T, error * output * (1-output))
		adjustment = 0.01 * dot(matrix(inputs), error);
		weights += adjustment;
	}
}

function think(inputs) {
	return __sigmoid(dot(inputs, weights))
}

// inputs = [[1,1,1],[1,0,1],[0,1,1]];
// outputs = matrix([[1,1,0]])
// train(inputs, outputs, 10000);
// console.log(think(array([1,0,0])));


// function matrix() {
// 	let m = [];

// 	this.add = function(matrix1, matrix2) {

// 	}

// 	this.subtract = function(matrix1, matrix2) {

// 	}

// 	this.multiply = function(matrix1, matrix2) {

// 	}

// 	this.divide = function(matrix1, matrix2) {

// 	}
// }
