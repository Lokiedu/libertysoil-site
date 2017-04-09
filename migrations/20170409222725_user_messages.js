export async function up(knex) {
  await knex.schema.table('user_messages', table => {
    table.renameColumn('reciever_id', 'receiver_id');
  });
}

export async function down(knex) {
  await knex.schema.table('user_messages', table => {
    table.renameColumn('receiver_id', 'reciever_id');
  });
}
