import { bin_2_dec, dec_2_bin } from "../Maths/Functions.js";

// base64 encoding
// atob()
// btoa()

// binary is 0 and 1
// bit is a binary digit - 0 or 1
// byte is a unit of bits in multiples of 8 bits

function convertTextToCharCode(text) {
//   return new TextEncoder().encode(text);
    let chars = [];
    for (let i = 0; i < text.length; i++) {
        chars.push(text.charCodeAt(i));
    }
    return chars;
}

function convertDecimalToBytes(charCodes) {
    let bytes = [];
    for (let i = 0; i < charCodes.length; i++) {
        byte = charCodes[i];
        let bin = dec_2_bin(byte);
        bytes(bin);
    }
}

let charCodes = convertTextToCharCode("hello world");
console.log(charCodes)
let bytes = convertDecimalToBytes(charCodes);
console.log(bytes)