import { describe, expect, test } from "@jest/globals";
import { BinarySearchTree } from "@/DataStructures/ts/BinaryTree";
import { inspect } from "util";

let bst = new BinarySearchTree<number>();
bst.insert(23);
bst.insert(45);
bst.insert(16);
bst.insert(37);
bst.insert(3);
bst.insert(99);
bst.insert(22);

describe("testing BST Algorithm", () => {
  test("empty string should result in zero", () => {
    expect(3).toBe(3);
  });
  
  test("The minimum value of the BST is 3", () => {
    let min = bst.getMin();
    console.log("The minimum value of the BST is 3" + inspect(min))
    expect(min).toBe(3);
  });

  test("The maximum value of the BST is 99", () => {
    expect(bst.getMax()).toBe(99);
  });
});
