import { describe, expect, test } from "@jest/globals";
import Dictionary from "@/DataStructures/js/Dictionary";

let d = new Dictionary();

describe("testing Dictionary Data Structure", () => {
  test("empty string should result in zero", () => {
    d.add(2, 3);
    expect(d.find(3)).toBe(5);
  });
});
