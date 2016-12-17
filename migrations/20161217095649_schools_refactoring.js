export async function up(knex) {
  // Foundation date
  await knex.raw('ALTER TABLE schools ADD COLUMN foundation_date date');
  await knex.raw(`
    UPDATE schools SET foundation_date = make_date(
      foundation_year, coalesce(foundation_month, 1), coalesce(foundation_day, 1)
    )
  `);
  await knex.schema.table('schools', table => {
    table.dropColumns(['foundation_year', 'foundation_month', 'foundation_day']);
  });

  // Merging address1 and address2 into one
  await knex.raw(`UPDATE schools SET address1 = NULL WHERE address1 = ''`);
  await knex.raw(`UPDATE schools SET address2 = NULL WHERE address2 = ''`);
  await knex.raw(`ALTER TABLE schools RENAME COLUMN address1 TO address`);
  await knex.raw(`UPDATE schools SET address = concat_ws(E',\\n', address, address2)`);
  await knex.raw('ALTER TABLE schools DROP COLUMN address2');

  // New columns
  await knex.schema.table('schools', table => {
    /*
      Represents a subtype of https://schema.org/EducationalOrganization
      Possible values:
        EducationalOrganization (default)
        CollegeOrUniversity
        ElementarySchool
        HighSchool
        MiddleSchool
        Preschool
        School
    */
    table.string('type').defaultTo('EducationalOrganization');
    table.string('fax');
    table.string('email');
  });
}

export async function down(knex) {
  // Foundation date
  await knex.raw('ALTER TABLE schools ADD COLUMN foundation_year integer');
  await knex.raw('ALTER TABLE schools ADD COLUMN foundation_month integer');
  await knex.raw('ALTER TABLE schools ADD COLUMN foundation_day integer');
  await knex.raw(`
    UPDATE schools SET
      foundation_year = extract(year FROM foundation_date),
      foundation_month = extract(month FROM foundation_date),
      foundation_day = extract(day FROM foundation_date)
  `);
  await knex.raw('ALTER TABLE schools DROP COLUMN foundation_date');

  // Address
  await knex.raw(`ALTER TABLE schools ADD COLUMN address1 text`);
  await knex.raw(`ALTER TABLE schools ADD COLUMN address2 text`);
  await knex.raw(`
    UPDATE schools SET
      address1 = split_part(address, E',\\n', 1),
      address2 = split_part(address, E',\\n', 2)
  `);
  await knex.raw(`ALTER TABLE schools DROP COLUMN address`);

  // New columns
  await knex.schema.table('schools', table => {
    table.dropColumns(['type', 'fax', 'email']);
  });
}
