import { Injector } from "@sailplane/injector";
import * as fs from 'fs';

import { CsvStream } from "./csv";
import { User } from "../domain";
import { generateUserDemographics } from "./generateUser";

const csvWriter = Injector.get(CsvStream)!

const content = fs.readFileSync('./data/users_raw.csv', 'utf-8')
const users = csvWriter.read<User>(content.toString())

const demographics = generateUserDemographics(users)

csvWriter.write(demographics, './data/users_demographics_raw')