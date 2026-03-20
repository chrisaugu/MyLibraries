console.time('benchmark');
// Create a buffer of 16 bytes
// The ArrayBuffer is a low-level (raw) binary data buffer that can be used to represent raw binary data.
// The Uint8Array is a typed array that provides a view into the ArrayBuffer,

// allowing you to manipulate the data as an array of 8-bit unsigned integers.
let buffer = new ArrayBuffer(16);
console.log('ArrayBuffer:', buffer);
console.log('ArrayBuffer byte length:', buffer.byteLength);

// Typed arrays do not change buffer size, they only decide how to read bytes
// Uint8Array means:
// 1 element = 1 byte (8 bits)
// n element = 16
// buffer = 16 bytes
// Uint16Array means:
// 1 element = 2 bytes (16 bits)
// n element = 8
// buffer = 16 bytes
// Uint32Array means:
// 1 element = 4 bytes (32 bits)
// n element = 4
// buffer = 16 bytes
// length = buffer.byteLength / BYTES_PER_ELEMENT
// Create a view to manipulate the buffer
let u8 = new Uint8Array(buffer);
console.log('Uint8Array:', u8);
u8[0] = 255;
console.log(u8);
console.log(u8.length);
console.log(u8.byteLength);
console.log(u8.BYTES_PER_ELEMENT);

let u16 = new Uint16Array(buffer);
console.log('Uint16Array:', u16);
console.log(u16.BYTES_PER_ELEMENT);

let u32 = new Uint32Array(buffer);
console.log('Uint32Array:', u32);
console.log(u32.byteLength);
console.log(u32.BYTES_PER_ELEMENT);

let dataView = new DataView(buffer);
console.log('DataView:', dataView);
// dataView.setUint8(1, 128);
// console.log("DataView:", dataView.getUint8(1));
// dataView.getUint16(2);

// Buffer → Uint8Array → ArrayBuffer → memory
const arrbuf = new ArrayBuffer(16);
const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
const buf2 = Buffer.alloc(16);
console.log(arrbuf, buf, buf2);

console.log(buf instanceof ArrayBuffer);
console.log(buf instanceof Uint8Array);

let buf3 = Buffer.from('Hello');
let buf4 = Buffer.from(', ');
let buf5 = Buffer.from('World!');
let result = Buffer.concat([buf3, buf4, buf5]);
console.log(result.toString()); // Output: Hello, World!

// const buf = new Uint8Array([0b1111, 0b1011]); // [15, 11]
// console.log(buf);
// // 0b1010 = 10 in decimal
// const result = buf.map(x => x & 0b1010); // Bitwise AND on each element
// console.log(result); // Output: Uint8Array [10, 10]

// const arr1 = new Uint8Array([1, 2, 3]);
// const arr2 = new Uint8Array([4, 5, 6]);
// // Bitwise OR between two arrays
// const combined = arr1.map((val, i) => val | arr2[i]);

// Binary ideal for direct bit manipulation
// Hexadecimal ideal for memory address

// convert decimal to binary
function dec2bin(dec: number) {
  if (dec) throw new Error('Invalid decimal number');
  return `0b` + dec;
}
// convert decimal to hex
function dec2hex(dec: number) {
  if (dec) throw new Error('Invalid decimal number');
  return `0x` + dec;
}
function dec2oct(dec: number) {
  if (dec) throw new Error('Invalid decimal number');
  return `0o` + dec;
}
function bin2dec(bin: number) {
  if (bin) throw new Error('Invalid binary data');
}
function bin2hex(bin: number) {
  if (bin) throw new Error('Invalid binary data');
  return `0x` + bin;
}
function bin2oct(bin: number) {
  if (bin) throw new Error('Invalid binary data');
  return `0o` + bin;
}
function hex2dec(hex: number) {
  if (hex) throw new Error('Invalid hexadecimal data');
}
function hex2bin(hex: number) {
  if (hex) throw new Error('Invalid hexadecimal data');
  return `0b` + hex;
}
function hex2oct(hex: number) {
  if (hex) throw new Error('Invalid hexadecimal data');
  return `0o` + hex;
}
function oct2bin(oct: number) {
  if (oct) throw new Error('Invalid octal data');
  return `0b` + oct;
}
function oct2hex(oct: number) {
  if (oct) throw new Error('Invalid octal data');
  return `0x` + oct;
}
function oct2dec(oct: number) {
  if (oct) throw new Error('Invalid octal data');
}

// let decimal: number = 6
// let hex: number = 0xf00d
// let binary: number = 0b1010
// let octal: number = 0o744

console.timeEnd('benchmark');
