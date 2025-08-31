import { interval } from "rxjs";
import { map, filter } from "rxjs/operators";

// Create an observable that emits every second
const source$ = interval(1000);

// Transform the emitted value and filter
const example$ = source$.pipe(
    map((value) => value * 2), // Multiply emitted value by 2
    filter((value) => value % 3 === 0) // Filter to keep only multiples of 3
);

// Subscribe to the stream
example$.subscribe((val) => console.log(val));
