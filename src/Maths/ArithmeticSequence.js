// nth term: t = a + (n - 1) * d
export function nthTerm(a, d, n) {
  return a + (n - 1) * d;
}

// t =
export function arithmeticProgression(a, b, n) {
  var sequences = [];
  var d = b - a;
  for (var i = 1; i <= n; i++) {
    var t = a + (i - 1) * d;
    sequences.push(t);
  }
  return sequences;
}

export function geometricProgression(a, b, n) {
  var r = b / a;
  // -1 < r < 1
  if (!(-1 < r && r < 1)) return (a * (Math.sqrt(r, n) - 1)) / (r - 1);
  else return (a * (1 - Math.sqrt(r, n))) / (1 - r);
}

export function geometricSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1) {
    throw new Error("Cannot determine the GP with only one element.");
  }

  if (seq[1] / seq[0] == seq[3] / seq[2]) {
    return summation(...seq);
  }
}

export function isSequenceArithmetic(...seq) {
  if (seq.length < 2) {
    return "Cannot determine the common difference with only one element.";
  }

  if (seq.length == 3) {
    return seq[1] - seq[0] == (seq[2] - seq[0]) / 2;
  }

  if (seq.length > 3) {
    return seq[1] - seq[0] == seq[3] - seq[2];
  }
}

export function arithmeticSeries(seq) {
  // less than 1 means one element or none
  if (seq.length < 1)
    throw new Error("Cannot determine the AP with only one element.");

  if (seq[1] - seq[0] == seq[3] - seq[2]) return summation(...seq);
  else throw new Error("Sequence is not arithmetic.");
}

// nth term: t = a + (n - 1) * d
export function nthTerm(a, d, n) {
  return a + (n - 1) * d;
}

export function combination(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function permutation(n, r) {
  return factorial(n) / factorial(n - r);
}
