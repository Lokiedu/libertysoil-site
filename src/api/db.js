import Knex from 'knex';
import Bookshelf from 'bookshelf';

export default function initBookshelf(config) {
  let knex = Knex(config);
  let bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');

  return bookshelf;
}
