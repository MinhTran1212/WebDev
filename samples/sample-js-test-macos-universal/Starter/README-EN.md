# JavaScript Practice Exam – Giants of World Literature

## General Information

The practice exam consists of three independent tasks worth a total of **40 points (12 + 14 + 14)**.

This year, some of the greatest figures in world literature are gathering for a special literary festival. Unfortunately, the organizers have become a little overwhelmed by the endless collection of novels, poetry volumes, and literary classics. The library's records are still a mess, the program for the grand reading evening has yet to be finalized, and the books in the exhibition hall are still waiting to find their rightful places.

**The festival is about to begin! Help bring some order to the masterpieces of world literature!**

## 1. Library Overview (task-1, 12 points)

Works by many famous authors from around the world have arrived at the festival library, but the librarians are having trouble keeping track of all the books. Among other things, they would like to find out who wrote the longest novels, which works were published more than a century ago, and how many pages of reading material they have collected in total.

**Help the librarians make sense of their collection and answer their questions using the available data!**

The `authors` array in the `dataEN.js` file contains the following information:

- the author's name (`name`)
- the author's language (`language`)
- the author's books (`books`), each containing:
  - the title (`title`)
  - the publication year (`year`)
  - the number of pages (`pages`)
  - a list of genres (`genres`)

English data is loaded from `dataEN.js` by default. To use Hungarian data, change the script source to `data.js` in `index.html` and follow the Hungarian task description. Display boolean answers as `true` or `false`.

Complete the following tasks:

- **a. (1 point)** In the `#taskA` element, display whether there is an author who has at least two books published before 1900!

- **b. (2 points)** In the `#taskB` element, display whether every author has at least one book whose genre list contains `novel`!

- **c. (2 points)** In the `#taskC` element, display the names of authors who have a book longer than 500 pages whose genre list contains `novel`!

- **d. (2 points)** In the `#taskD` element, display the total number of pages across all listed books!

- **e. (2 points)** In the `#taskE` element, display the name of the author whose books have the highest total page count! In the event of a tie, the author appearing earlier in the data wins.

- **f. (3 points)** In the `#taskF` element, display the average number of pages of books published before 1900 whose genre list contains `novel`, rounded to two decimal places! Each book should be counted only once, even if it belongs to multiple genres.

## 2. Reading Evening Planner (task-2, 14 points)

The festival organizers want to crown the event with a grand reading evening. Unfortunately, the enthusiastic host would happily read the entirety of world literature aloud in a single night, which might test even the most patient audience's endurance. To make matters worse, some of the selected books are practically the size of bricks, so the reading pace matters quite a bit!

**Help put together the evening's program and find out whether everything fits within the available time, before the audience starts looking for the exit instead of waiting for the final chapter!**

There is no separate data file for this task, all necessary elements are provided in `index.html`. The important elements have already been selected at the beginning of `index.js`. Write your solution in that file! The necessary styles are defined in `index.css`. **Use direct event handlers in this task!**

Complete the following tasks:

- **a. (1 point)** When the `#add-work` button is clicked, add the book title entered in the `#work-input` field as a new list item (`li`) to the `#reading-list` list!

- **b. (2 points)** Validate the entered titles!
  - (1 point) Remove leading and trailing whitespace from the input using `trim()`! Do not allow empty titles or titles consisting only of whitespace to be added!
  - (1 point) Do not allow a title that is already in the list to be added again, regardless of capitalization! Whitespace within the text does not need to be normalized. After a successful addition, clear the input field. If the title is rejected, preserve its contents!

- **c. (1 point)** The `#work-count` element must always display the number of titles in the list! The list may contain at most four titles. Once four titles have been added, disable the `#add-work` button (`disabled`)! The event handler responsible for adding titles must also prevent more than four items from being added!

- **d. (1 point)** When the `#edition` dropdown changes (`change` event), update the cover image (`img#cover`) to match the selected edition! The `value` attribute of each `option` contains the image path: assign it to the image's `src` attribute, and assign the option's text to the `alt` attribute!

- **e. (2 points)** When the `#minutes` slider is moved (`input` event), display the available time!
  - (1 point) Display the slider's current value in the `#minutes-value` element!
  - (1 point) Set the height (`height`) of the `#time-bar` element to the same number of pixels!

- **f. (2 points)** When the `#pace` slider is moved (`input` event), display the reading speed!
  - (1 point) Display the slider's current value in the `#pace-value` element and set the width (`width`) of both `span` elements with the `page` class to twenty times the slider's value, in pixels!
  - (1 point) If the reading speed is at least 4 pages per minute, add the `fast` class to both page elements, otherwise, remove it from both!

- **g. (4 points)** When the `#check` button is clicked, determine whether the program fits within the available time!
  - (1 point) If the list is empty, display `Add at least one title first!` in the `#status` element! Do not add the `ready` class to the `#planner` element, and do not disable any controls!
  - (1 point) Otherwise, calculate the required time using the formula: `required time = selected book's page count / reading speed + number of titles * 5`. The page count is stored in the `data-pages` attribute of the currently selected `option` in the `#edition` dropdown. The selected edition represents a single shared reading volume, while each title in the list represents a five-minute introduction.
  - (1 point) If the available time is at least the required time, add the `ready` class to the `#planner` element and set the content of `#status` to `The program fits! (X minutes)`! Otherwise, ensure that the `ready` class is not present and set the content of `#status` to `Not enough time! (X minutes)`!
  - (1 point) Replace `X` with the required time rounded to two decimal places (e.g., `The program fits! (85.00 minutes)`)! Use the unrounded value for the comparison!

- **h. (1 point)** After a successful check, disable (`disabled`) both sliders, the edition dropdown, the title input field, the add button, and the check button! After an unsuccessful attempt, the program must remain editable!

The initial values displayed by the sliders and the initial sizes of the visual elements are already provided in `index.html`, so you do not need to initialize them separately.

## 3. Putting the Books Back (task-3, 14 points)

The world literature festival is over, the guests have gone home, and the organizers are finally relaxing. Unfortunately, they forgot one tiny detail: all the exhibited books are still scattered across the sorting table, and the librarian is already considering handing in their resignation. Luckily, every author has a dedicated shelf, so all that remains is figuring out which book belongs where.

**Help return the books to their correct shelves!** You can rearrange them freely on the table, but be careful: once a book has been placed on its shelf, it must not be moved again. When every book has found its way back to its author, the librarian can finally go home... hopefully before the next festival begins!

Write your solution in the `index.js` file! You already have access to the `library` object defined in `dataEN.js`. The object contains the following information:

- the number of rows (`rows`) and columns (`cols`) in the map,
- an array of shelves (`shelves`): each shelf has an author's name (`author`), a row index (`row`), and a column index (`col`),
- an array of books (`books`): each book has a title (`title`), an author (`author`), a row index (`row`), and a column index (`col`).

Row and column indices start at zero. Initially, every book is located in a separate cell, and none of the books are on a shelf. Each author has exactly one shelf, which has enough room for all of their books.

Generate the map inside the empty `#map` table! You will find an HTML example in a comment inside the table. The necessary styles are defined in `index.css`. The CSS displays the authors of shelves and books based on their `data-author` attributes.

The starter package provides a helper function called `delegate(parent, child, when, what)`. It handles events of type `when` on the `parent` element and calls `what(event, elem)` for the element matching the `child` selector. **Use event delegation to handle clicks!**

### Generation

- **a. (1 point)** Generate `rows` table rows (`tr`) inside the `#map` table, each containing `cols` table cells (`td`)!

- **b. (2 points)** Display the shelves in their corresponding cells (at the shelf's `row` and `col` coordinates)! You can access a cell using `table.rows[row].cells[col]`.
  - (1 point) Add the `shelf` class to the corresponding cell!
  - (1 point) Set its `data-author` attribute to the name of the author assigned to that shelf!

- **c. (2 points)** Generate a button (`button`) with the `book` class for each book, placing it in its corresponding cell!
  - (1 point) Set the button's `type` attribute to `button`, its text to the book's title, and its `title` attribute to the format `Author: Title` (e.g., `Jane Austen: Emma`)!
  - (1 point) Place the button in the correct cell and set its `data-author` attribute to the author's name!

### Event Handling

- **d. (2 points)** When a book is clicked, add the `selected` class to it. If the already selected book is clicked again, remove the class!
  - (1 point) Toggling the selection on and off works correctly.
  - (1 point) At most one book may be selected at a time: when another book is clicked, the previous selection must be cleared!

- **e. (2 points)** If a book is selected and the user clicks an empty table cell (one without the `shelf` class and containing no book), move the selected book to that cell, then clear its selection!
  - (1 point) Moving the book and clearing its selection work correctly.
  - (1 point) If no book is selected, or if the target table cell already contains a book, nothing should happen! Clicking a book should only handle selection and must not trigger a move!
  - If you use `appendChild` to append an existing element to another element, it is moved rather than copied.

- **f. (3 points)** Put the books back in their rightful places!
  - (1 point) When a shelf is clicked, move the selected book onto it only if the book's `data-author` value matches the shelf's `data-author` value! After a successful move, clear the selection! If the shelf belongs to another author, nothing should happen, and the selection must remain unchanged! A shelf may contain multiple books.
  - (1 point) Books already placed on shelves must not be selectable or movable! Clicking a book on a shelf must not cause another currently selected book to move either!
  - (1 point) When all books have been placed on shelves, display `All books are in place!` in the `#status` element! Until then, the element must remain empty!

- **g. (2 points)** Implement subtasks d–f using **event delegation**! Register the event handlers on the `#map` table!
  - (1 point) Clicking books (selection).
  - (1 point) Clicking cells (moving books and placing them on shelves).
