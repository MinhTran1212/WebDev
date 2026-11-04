const taskA = document.querySelector("#taskA");
const taskB = document.querySelector("#taskB");
const taskC = document.querySelector("#taskC");
const taskD = document.querySelector("#taskD");
const taskE = document.querySelector("#taskE");
const taskF = document.querySelector("#taskF");

// Ide írd a megoldásodat! / Write your solution here!
const authorWith1900Books = authors.some(author =>{
    const abc = author.books.filter(book => book.year < 1900);
    return abc.length >= 2;
}
)

taskA.innerHTML = authorWith1900Books;

//includes true false questions use every and some, require return
const authorWithNovelBook = authors.every(author => {
    return author.books.some(book => { return book.genres.includes("novel") })
}
)
taskB.innerHTML = authorWithNovelBook;

//{} always require return
//find names => filter, find 1 name => find
const authorNovel500pages = authors.filter(author => {
    return author.books.some(book => { return (book.genres.includes("novel") && book.pages >= 500)})
});
console.log(authorNovel500pages);
taskC.innerHTML = authorNovel500pages.map(author => author.name).join(", ");

//total use reduce
const allBook = authors.map(author => author.books).flat();
const totalPages = allBook.reduce((total, book) => total + book.pages, 0);
taskD.innerHTML = totalPages;

const pagePerAuthor = author => author.books.reduce((total, book) => total + book.pages, 0)

const authorWithMostPage = authors.reduce((maxAuthor, currentAuthor) => {
    const maxTotal = pagePerAuthor(maxAuthor);
    const currentTotal = pagePerAuthor(currentAuthor);

    if (maxTotal >= currentTotal){
        return maxAuthor;
    } else {
        return currentAuthor;
    }
});

taskE.innerHTML = authorWithMostPage.name;

const allBooks = authors.map(author => author.books).flat();
const novelBefore1900 = allBooks.filter(book => book.genres.includes("novel") && book.year < 1900);
console.log(novelBefore1900);
const totalPage = novelBefore1900.reduce((total, book) => total + book.pages, 0);
taskF.innerHTML = totalPage / novelBefore1900.length;
