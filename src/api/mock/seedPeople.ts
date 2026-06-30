import type { OrgPerson } from '../types';

function person(
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  jobTitle: string,
  department: string,
  site: string,
): OrgPerson {
  return {
    id,
    firstName,
    lastName,
    email: email.toLowerCase(),
    jobTitle,
    department,
    site,
    status: 'active',
    source: 'seed',
  };
}

/** Directory rows aligned with people.html demo data. */
export const SEED_PEOPLE: OrgPerson[] = [
  person('person-1', 'Harry', 'Bender', 'harry.bender@nexuscrop.com', 'Head of Design', 'Product', 'Rome'),
  person('person-2', 'Katy', 'Fuller', 'katy.fuller@nexuscrop.com', 'Fullstack Engineer', 'Engineering', 'Miami'),
  person(
    'person-3',
    'Jonathan',
    'Kelly',
    'jonathan.kelly@nexuscrop.com',
    'Mobile Lead',
    'Product',
    'Kyiv',
  ),
  person(
    'person-4',
    'Billie',
    'Wright',
    'billie.wright@nexuscrop.com',
    'Sales Manager',
    'Operations',
    'Ottawa',
  ),
  person(
    'person-5',
    'Sarah',
    'Page',
    'sarah.page@nexuscrop.com',
    'Network engineer',
    'Product',
    'Sao Paulo',
  ),
  person('person-6', 'Erica', 'Wyatt', 'erica.wyatt@nexuscrop.com', 'Head of Design', 'Product', 'London'),
  person('person-7', 'Alex', 'Rivera', 'alex.rivera@nexuscrop.com', 'Product Manager', 'Product', 'Remote'),
  person('person-8', 'Jordan', 'Lee', 'jordan.lee@nexuscrop.com', 'Engineering Lead', 'Engineering', 'Remote'),
  person('person-9', 'Sam', 'Chen', 'sam.chen@nexuscrop.com', 'UX Designer', 'Product', 'Remote'),
  person('person-10', 'Taylor', 'Brooks', 'taylor.brooks@nexuscrop.com', 'Data Analyst', 'Operations', 'Remote'),
  person('person-11', 'Morgan', 'Patel', 'morgan.patel@nexuscrop.com', 'HR Partner', 'People', 'Remote'),
  person(
    'person-12',
    'Casey',
    'Nguyen',
    'casey.nguyen@nexuscrop.com',
    'Software Engineer',
    'Engineering',
    'Remote',
  ),
];
