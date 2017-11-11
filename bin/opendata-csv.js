#!/usr/bin/env babel-node
import { writeFile } from 'fs';
import { join as joinPath } from 'path';

import { stringify } from 'csv';
import { types as pgTypes } from 'pg';
import isEmpty from 'lodash/isEmpty';
import mkdirp from 'mkdirp';
import moment from 'moment';
// import Git from 'nodegit';  // FIXME
import ora from 'ora';

import knex from './utils/knex';

global.Promise = require('bluebird');

const Git = null;
process.stderr.write("FIXME: part about nodegit has to be reimplemented\n");
process.exit(0);  // FIXME


const throbber = ora('preparing…').start();

const { promisify } = global.Promise;
const toCsv = promisify(stringify);
const writeFileAsync = promisify(writeFile);
const mkdirpAsync = promisify(mkdirp);

// Don't parse dates to js Date() objects
pgTypes.setTypeParser(1082, 'text');

const opendataDirectory = process.env.OPENDATA_REPO || joinPath(__dirname, '..', 'opendata');

const dumpCsvFiles = async () => {
  throbber.text = 'Dumping data: schools.csv';
  throbber.start();

  const schools = knex
    .column(
      'schools.id', 'schools.name', 'schools.description', 'principal_name', 'principal_surname',
      'schools.lat', 'schools.lon',
      'geotags.name AS country', 'schools.postal_code', 'schools.city', 'schools.address', 'schools.house',
      'schools.phone', 'schools.fax', 'schools.email',
      'schools.website', 'schools.facebook', 'schools.twitter', 'schools.wikipedia',
      'schools.foundation_date',
      'org_membership', 'teaching_languages', 'required_languages',
    )
    .select().from('schools')
    .leftJoin('geotags', 'schools.country_id', 'geotags.id');

  const rows = schools.map((row) => {
    row['ADEC'] = !isEmpty(row.org_membership) && 'adec' in row.org_membership && row.org_membership.adec.is_member === true;
    row['AERO'] = !isEmpty(row.org_membership) && 'aero' in row.org_membership && row.org_membership.aero.is_member === true;
    row['IDEN'] = !isEmpty(row.org_membership) && 'iden' in row.org_membership && row.org_membership.iden.is_member === true;

    row['teaching_languages'] = row['teaching_languages'] ? row['teaching_languages'].join(', ') : '';

    Reflect.deleteProperty(row, 'org_membership');
    Reflect.deleteProperty(row, 'required_languages');

    return row;
  });

  const csvString = toCsv(
    await rows,
    {
      delimiter: ';',
      header: true,
      rowDelimiter: 'windows',
    }
  );

  await mkdirpAsync(opendataDirectory);
  const schoolsCsvPath = joinPath(opendataDirectory, 'schools.csv');
  await writeFileAsync(schoolsCsvPath, await csvString);

  throbber.succeed(`Wrote ${schoolsCsvPath}`);
};

const commitChangesToGit = async () => {
  throbber.text = 'Git: looking for changes';
  throbber.start();

  let repo;

  try {
    repo = await Git.Repository.open(opendataDirectory);
  } catch (e) {
    throbber.fail(`Git: ${e.message}`);
    return;
  }

  const index = await repo.refreshIndex();
  const modifiedFiles = (await repo.getStatus()).filter((file) => file.isNew() || file.isModified());

  if (modifiedFiles.length === 0) {
    throbber.info('data did not change');
    return;
  }

  const addToGitPromises = modifiedFiles.map(async (file) => {
    await index.addByPath(file.path());
    throbber.info(`→ Git: Add ${file.path()}`);

    throbber.text = 'Git: looking for changes';
    throbber.start();
  });

  await Promise.all(addToGitPromises);
  throbber.text = 'Git: building commit';

  await index.write();
  const oid = await index.writeTree();
  const head = await Git.Reference.nameToId(repo, "HEAD");
  const parent = await repo.getCommit(head);

  const now = new Date();
  const unixtime = Math.floor(now / 1000);
  const author = Git.Signature.create('Loki Education (Social Enterprise)', 'info@libertysoil.org', unixtime, 0);
  const committer = Git.Signature.create('Loki Education (Social Enterprise)', 'info@libertysoil.org', unixtime, 0);

  const message = `Data changes from ${moment(now).format('YYYY-MM-DD')}`;
  const commitId = await repo.createCommit("HEAD", author, committer, message, oid, [parent]);
  throbber.succeed(`Git: Commit ${commitId} "${message}"`);

  if (!process.env.OPENDATA_KEY) {
    throbber.warn('Git: SSH key is not configured, can not Push');
    return;
  }

  throbber.text = 'Git: pushing to remote';
  throbber.start();

  let remote;
  try {
    remote = await Git.Remote.lookup(repo, 'origin');
  } catch (e) {
    throbber.warn('Git: remote is not configured, can not Push');
    return;
  }

  try {
    await remote.push(
      ["refs/heads/master:refs/heads/master"],
      {
        callbacks: {
          credentials: (url, userName) => Git.Cred.sshKeyNew(userName, `${process.env.OPENDATA_KEY}.pub`, process.env.OPENDATA_KEY, ''),
        }
      }
    );
    throbber.succeed('Git: Pushed fresh data to GitHub');
  } catch (e) {
    throbber.fail(`Git: Push failed; ${e.message}`);
  }
};

const action = async () => {
  await dumpCsvFiles();
  await commitChangesToGit();
};

throbber.succeed('Script is initialized');

action()
  .then(() => {
    throbber.stop();
    process.exit();
  })
  .catch(e => {
    throbber.stop();
    console.error(e.stack);  // eslint-disable-line no-console
    process.exit(1);
  });
