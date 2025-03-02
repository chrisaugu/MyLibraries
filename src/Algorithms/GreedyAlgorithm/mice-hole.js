function assignHole(mices, holes, n, m) {
  // Base Condition
  // No. of mouse and holes should be same
  if (n != m) return -1;

  // Sort the arrays
  mices.sort();
  holes.sort();

  // Finding max difference between
  // ith mice and hole
  let max = 0;
  for (let i = 0; i < n; ++i) {
    if (max < Math.abs(mices[i] - holes[i]))
      max = Math.abs(mices[i] - holes[i]);
  }
  return max;
}

// Position of mouses
let mices = [4, -4, 2];

// Position of holes
let holes = [4, 0, 5];

// Number of mouses
let n = mices.length;

// Number of holes
let m = holes.length;

// The required answer is returned
// from the function
let minTime = assignHole(mices, holes, n, m);

console.log("The last mouse gets into the hole in time: " + minTime);
