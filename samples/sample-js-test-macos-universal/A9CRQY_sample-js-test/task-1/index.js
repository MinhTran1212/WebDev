const taskA = document.querySelector("#taskA");
const taskB = document.querySelector("#taskB");
const taskC = document.querySelector("#taskC");
const taskD = document.querySelector("#taskD");
const taskE = document.querySelector("#taskE");
const taskF = document.querySelector("#taskF");

// Ide írd a megoldásodat! / Write your solution here!
const authorBefore19002 = authors.some(author => {
    const before1900 = author.books.filter(book => book.year < 1900)
    return (before1900.length >= 2);
});

taskA.innerHTML = authorBefore19002;
const authorNovel = authors.every(author => {
    const bookNovel = author.books.some(book => { return book.genres.includes("novel")});
    return bookNovel;
});

taskB.innerHTML = authorNovel;

const author500pages = authors.filter(author =>
    author.books.some(book => { return (book.pages >= 500) && (book.genres.includes("novel"))})
)

taskC.innerHTML = author500pages.map(author => author.name).join(", ");

const allBooks = authors.map(author => author.books).flat()
const allPage = allBooks.reduce((total, book) => total + book.pages, 0);
taskD.innerHTML = allPage;

//find author with the most amount of total pages
const getAuthorTotalPage = author => 
    author.books.reduce((total, book) => total + book.pages, 0)

const authorWithTheMostPage = authors.reduce(
    (maxAuthor, currentAuthor) => {
        const maxTotal = getAuthorTotalPage(maxAuthor);
        const currentTotal = getAuthorTotalPage(currentAuthor);
        if (currentTotal > maxTotal){
            return currentAuthor;
        } else {
            return maxAuthor;
        }
    }
);
taskE.innerHTML = authorWithTheMostPage.name;

//const mostViewedVideo = data.reduce((max, current) => {
//  if (current.views > max.views) {
//    return current; // <--- Returning an OBJECT
//  } else {
//   return max;     // <--- Returning an OBJECT
//  }
//});

const allBook = authors.map(author => author.books).flat();
const novel1900books = allBook.filter(book => book.year < 1900 && book.genres.includes("novel"));
const averagePage = novel1900books.reduce((total, book) => total + book.pages, 0);
taskF.innerHTML = (averagePage / novel1900books.length).toFixed(2);

