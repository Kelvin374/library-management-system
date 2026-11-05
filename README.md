## Schema Decisions

### Why Book references Genre instead of embedding it

`Book` stores a `genreId` foreign key pointing to a row in the `Genre` table,
rather than copying the genre's name and details inside each book record.

- **Single source of truth.** A genre's name lives in exactly one row. If
  "Sci-Fi" is renamed to "Science Fiction", we update one record and every book
  reflects it. With embedding, we would have to update every book, and any we
  missed would silently disagree.
- **Data integrity.** The foreign key constraint means a book cannot point to a
  genre that does not exist, and Postgres enforces this regardless of what the
  application code does.
- **No duplication.** Hundreds of books share one genre. Embedding would repeat
  the same data hundreds of times.
- **Natural fit for relational data.** Genre is an entity in its own right: it
  has a unique name and slug and can be listed, queried, and managed
  independently of books. Referencing lets us query "all books in a genre"
  (`genre.books`) or "a book with its genre" (`include: { genre: true }`)
  efficiently.
- **One-to-many relationship.** One Genre has many Books, so the foreign key
  goes on the "many" side (`Book.genreId`).

### Other decisions

- `Role` is an enum (`PATRON`, `LIBRARIAN`) so invalid roles cannot be stored.
- `isbn` and `email` are `@unique` so the database itself rejects duplicates.
- `availableCopies` is tracked separately from `totalCopies` so borrowing can
  be modeled without losing the total inventory.

  ### Review model

`Review` links a `User` to a `Book` with a `rating` (1-5) and an optional
`comment`. It holds both foreign keys (`userId`, `bookId`) because it is the
"many" side of two one-to-many relationships. A composite unique constraint on
`(userId, bookId)` limits each user to one review per book, and deleting a
book or user cascades to their reviews.

### What felt different from a document database

The biggest shift was that I could not just nest reviews inside the book.
In a document database like MongoDB, I would probably embed an array of
reviews in each book document, which is quick to read but makes it awkward to
ask "show every review this user wrote" and lets a document grow without
limit. In Prisma and Postgres, reviews are their own table connected by
foreign keys, so both questions are simple queries (`book.reviews` and
`user.reviews`), and the database itself enforces rules like one review per
user per book and "no review for a book that does not exist". The trade-off is
more upfront design and a migration for every change, but the structure is
guaranteed instead of depending on application code.
