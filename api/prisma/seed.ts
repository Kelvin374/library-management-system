import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const genres = [
    { name: "Science Fiction", slug: "science-fiction" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Mystery", slug: "mystery" },
    { name: "Non-Fiction", slug: "non-fiction" },
];

const books = [
  { title: "Dune", author: "Frank Herbert", isbn: "9780441013593", genre: "science-fiction" },
  { title: "Neuromancer", author: "William Gibson", isbn: "9780441569595", genre: "science-fiction" },
  { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", isbn: "9780441478125", genre: "science-fiction" },
  { title: "Foundation", author: "Isaac Asimov", isbn: "9780553293357", genre: "science-fiction" },
  // Fantasy
  { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780547928227", genre: "fantasy" },
  { title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", isbn: "9780547773742", genre: "fantasy" },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", isbn: "9780756404741", genre: "fantasy" },
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", isbn: "9780765311788", genre: "fantasy" },
  // Mystery
  { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", isbn: "9780141034379", genre: "mystery" },
  { title: "And Then There Were None", author: "Agatha Christie", isbn: "9780062073488", genre: "mystery" },
  { title: "The Big Sleep", author: "Raymond Chandler", isbn: "9780394758282", genre: "mystery" },
  { title: "Gone Girl", author: "Gillian Flynn", isbn: "9780307588371", genre: "mystery" },
  // Non-Fiction
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316110", genre: "non-fiction" },
  { title: "Educated", author: "Tara Westover", isbn: "9780399590504", genre: "non-fiction" },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", isbn: "9781400052189", genre: "non-fiction" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374533557", genre: "non-fiction" },
];

async function main() {
    const genreIds: Record<string, number> = {};
    for (cont g of genres) {
        const genre = await prisma.genre.upsert({
            where: { slug: genreIds.slug },
            update: {},
            create: g,
        });
        genreIds[genre.slug] = genre.id;
    }

    for (const b of books) {
        await prisma.book.upsert({
            where: { isbn: b.isbn },
            update: {},
            create: {
                title: b.title,
                author: b.author,
                isbn: b.isbn,
                totalCopies: 3,
                availableCopies: 3,
                genreId: genreIds[b.genre],
            },
        });
    }

    console.log('Seeded ${genres.length} genres and ${books.length} books.');
}

main()
.catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(() => prisma.$disconnect());
