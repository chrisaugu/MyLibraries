var array = [1, 3, 3, -2, 3, 14, 7, 8, 1, 2, 2];
// sorted form: [-2, 1, 1, 2, 2, 3, 3, 3, 7, 8, 14]
function quickSelectInPlace(A, l, h, k) {
  var p = partition(A, l, h);
  if (p == k - 1) {
    return A[p];
  } else if (p > k - 1) {
    return quickSelectInPlace(A, l, p - 1, k);
  } else {
    return quickSelectInPlace(A, p + 1, h, k);
  }
}
function medianQuickSelect(array) {
  return quickSelectInPlace(
    array,
    0,
    array.length - 1,
    Math.floor(array.length / 2)
  );
}
