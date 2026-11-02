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
