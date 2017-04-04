const tablesToChange = ['users', 'posts', 'schools', 'attachments', 'comments'];

export async function up(knex) {
  // Set the timestamp defaults to UTC
  await Promise.all(tablesToChange.map(table => {
    return knex.raw(`
      ALTER TABLE ${table}
        ALTER created_at SET DEFAULT now() at time zone 'utc',
        ALTER updated_at SET DEFAULT now() at time zone 'utc'
    `);
  }));
}

export async function down(knex) {
  await Promise.all(tablesToChange.map(table => {
    return knex.raw(`
      ALTER TABLE ${table}
        ALTER created_at SET DEFAULT now(),
        ALTER updated_at SET DEFAULT now()
    `);
  }));
}
