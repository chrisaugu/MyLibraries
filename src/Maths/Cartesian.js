/**
 * Cartesian Product
 * @param {*} A
 * @param {*} B
 * @returns
 */
function Cartesian(A, B) {
  let product = [];

  for (let a of A) {
    for (let b of B) {
      product.push([a, b]);
    }
  }
  return product;
}

console.log(Cartesian([2, 3], [1, 2]));
