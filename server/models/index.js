const {knex, bookshelf} = require('../db');

let db = {knex, bookshelf};

require('./user')(bookshelf, db);
require('./team')(bookshelf, db);
require('./picks')(bookshelf, db);
require('./archive')(bookshelf, db);
require('./person')(bookshelf, db);

module.exports = db;
