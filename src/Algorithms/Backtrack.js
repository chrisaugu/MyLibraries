
function calcSubset(A, res, subset, index) {
    // if (index === res.length) {
    // Add the current subset to the result list
    res.push([...subset]);
    // return;
    // }

    // Generate subsets by recursively including and excluding elements
    for (let i = index; i < A.length; i++) {
        // Include the current element in the subset
        subset.push(A[i]);

        // Recursively generate subsets with the current element included
        calcSubset(A, res, subset, i + 1);

        // Exclude the current element from the subset (backtracking)
        subset.pop();
    }
}

function subsets(A) {
    const subset = [];
    const res = [];
    let index = 0;

    calcSubset(A, res, subset, index);

    return res;
}

// Driver code
function main() {
    const array = [1, 2, 3, 4, 5];
    const res = subsets(array);

    // Print the generated subsets
    for (let i = 0; i < res.length; i++) {
        console.log('{'+res[i].join(', ')+'}');
    }
}
main();