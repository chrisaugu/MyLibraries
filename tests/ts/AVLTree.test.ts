import AVLTree from "@/DataStructures/ts/AVLTree";

/* The constructed AVL Tree would be 
            30 
            /   \ 
        20     40 
        /  \      \ 
    10   25     50 
*/
let avlTree = new AVLTree<number, string>();
avlTree.insertNode(10);
avlTree.insertNode(20);
avlTree.insertNode(30);
avlTree.insertNode(40);
avlTree.insertNode(50);
avlTree.insertNode(25);
// Preorder traversal
avlTree.preOrder();
avlTree.printTree();