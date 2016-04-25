export async function up(knex) {
  await knex.schema.table('schools', function (table) {
    table.boolean('is_open').index();

    table.text('principal_name');
    table.text('principal_surname');

    table.integer('foundation_year').index();
    table.integer('foundation_month');
    table.integer('foundation_day');

    table.jsonb('number_of_students');  // {2001: 68, 2012: 74, …}
    table.jsonb('org_membership').index('membership_idx', 'gin');  // {eudec: {is_member: true, url: ''}}  // true|false|null
    table.jsonb('teaching_languages').index('teaching_languages_idx', 'gin');  // []
    table.jsonb('required_languages').index('required_languages_idx', 'gin');  // []

    table.uuid('country_id')
      .references('id').inTable('geotags').onDelete('SET NULL').onUpdate('cascade');
    table.text('postal_code');
    table.text('city');
    table.text('address1');
    table.text('address2');
    table.text('house');

    // email // NO
    table.text('phone');

    table.text('website');
    table.text('facebook');
    table.text('twitter');
    table.text('wikipedia');
  });
}

export async function down(knex) {
  await knex.schema.table('schools', function (table) {
    table.dropColumns(
      'is_open',
      'principal_name', 'principal_surname',
      'foundation_year', 'foundation_month', 'foundation_day',
      'number_of_students', 'org_membership', 'teaching_languages', 'required_languages',
      'country_id', 'postal_code', 'city', 'address1', 'address2', 'house',
      'phone',
      'website', 'facebook', 'twitter', 'wikipedia'
    );
  });
}
