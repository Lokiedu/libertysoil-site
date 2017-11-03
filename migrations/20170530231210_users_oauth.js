async function createProviderContraint(knex, provider) {
  await knex.raw(`
    CREATE UNIQUE INDEX users_provider_${provider}_id_index ON users((providers->'${provider}'->>'id'))
    WHERE (providers->'${provider}'->>'id') NOTNULL
  `);
}

export async function up(knex) {
  await knex.schema.table('users', function (table) {
    table.jsonb('providers'); // example: { facebook: { id: '123' }, google: {...} }
  });

  await createProviderContraint(knex, 'facebook');
  await createProviderContraint(knex, 'google');
  await createProviderContraint(knex, 'twitter');
  await createProviderContraint(knex, 'github');
}

export async function down(knex) {
  await knex.schema.table('users', function (table) {
    table.dropColumn('providers');
  });
}
