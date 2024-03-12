import { CsvStream } from "./csv";
import { generateWatchInteractions } from "./generateInteraction";
import { generateMovies } from "./generateMovies";
import { generateUsers } from "./generateUser";

const csvWriter = new CsvStream()

const users = generateUsers(1000)
const { movies, moviesBins } = generateMovies(1000)
const interactions = generateWatchInteractions(50000, users, moviesBins)

console.log('Writing files to ./data')

csvWriter.write(users, './data/users')
csvWriter.write(movies, './data/movies')
csvWriter.write(interactions, './data/interactions')