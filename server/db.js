const config = require('config');

const knex = require('knex')(config.db);

const bookshelf = require('bookshelf')(knex);

bookshelf.plugin(require('bookshelf-modelbase').pluggable);
bookshelf.plugin(require('bookshelf-mask'));

module.exports.bookshelf = bookshelf;
module.exports.knex = knex;
