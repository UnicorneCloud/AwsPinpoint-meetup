import { CsvWriter } from "./csv";
import { generateUsers } from "./generateUser";

const writer = new CsvWriter()

const users = generateUsers(10)

writer.write(users, './data/users')