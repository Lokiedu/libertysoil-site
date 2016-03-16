export async function up(knex, Promise) {
    await knex.schema.createTable('comments', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('post_id').references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
        table.uuid('user_id').references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
        table.text('text');
        table.timestamp('created_at', true).defaultTo(knex.raw('now()'));
        table.timestamp('updated_at', true).defaultTo(knex.raw('now()'));
    });
};

export async function down(knex, Promise) {
    await knex.schema.dropTable('comments');
};
