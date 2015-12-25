import Bookshelf from 'bookshelf';

export async function up(knex, Promise) {
	await knex.schema.table('posts', table => {
	  table.text('url_name').unique();
	});
}

export async function down(knex, Promise) {
	await knex.schema.table('posts', table => {
		table.dropColumn('url_name');
	});
}
