class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

const bookList = [];
const isbnNumbers = new Set();
const books = new Map();

const createBook = (title, author, isbn) => {
    // const existingBook = books.has(isbn);
    const existingBook = isbnNumbers.has(isbn);

    if (existingBook) {
        // return books.get(isbn);
        return existingBook;
    }
    else {
        const book = new Book(title, author, isbn);
        // books.set(isbn, book);
        isbnNumbers.add(isbn);

        return book;
    }
}


const addBook = (title, author, isbn, availability, sales) => {
    const book = {
        ...createBook(title, author, isbn),
        sales,
        availability,
        isbn
    };

    bookList.push(book);
    return book;
}

let book1 = addBook("Harry Potter", "JK Rowling", "AB123", false, 100);
let book2 = addBook("Harry Potter", "JK Rowling", "AB123", true, 50);
let book3 = addBook("To Kill a Mockingbird", "Harper Lee", "CD345", true, 10);
let book4 = addBook("To Kill a Mockingbird", "Harper Lee", "CD345", false, 20);
let book5 = addBook("The Great Gatsby", "F. Scott Fitzgerald", "EF567", false, 20);

console.log(bookList)