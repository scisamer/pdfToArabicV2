const { AsyncNedb } = require('nedb-async');

const db = {};


db.users = new AsyncNedb({ filename: './database/users.db', autoload: true });

db.adminCodes = new AsyncNedb({ filename: './database/codes.db', autoload: true });

module.exports = db;