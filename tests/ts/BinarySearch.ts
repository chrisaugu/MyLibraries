import { describe, expect, test } from "@jest/globals";
import { recursiveBinarySearch } from "@/Algorithms/Search/ts/BinarySearch";

let arr = [-5, 2, 4, 6, 10];

describe("testing Binary Search algorithm", () => {
  test("empty string should result in zero", () => {
    expect(recursiveBinarySearch(arr, 2)).toBe(1);
  });
});
