import * as fs from 'fs';
import { parse } from 'json2csv';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const json = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
const fields = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'type',
  'businessName',
  'subscriptionType',
  'registeredDate',
  'lastActiveDate',
  'status',
];

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const csv = parse(json.customers, { fields });
fs.writeFileSync('./customers.csv', csv);

console.log('✅ Done: customers.csv created.');
