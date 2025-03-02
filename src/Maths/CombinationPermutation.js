import { factorial } from "./Functions";

export function combination(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function permutation(n, r) {
  return factorial(n) / factorial(n - r);
}
