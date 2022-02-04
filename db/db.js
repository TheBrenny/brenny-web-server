const path = require('path');
let mysql = require("mysql2/promise");
const fs = require('fs');
const config = require('../config');

const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const dbFolder = path.join(__dirname);
const sqlFolder = path.join(dbFolder, "scripts");
const templateFolder = path.join(dbFolder, "templates");

let db;

module.exports = (function createDB() {
    if(db === undefined) {
        let dbUrl = config.db.url;
        if(config.db.isDev) dbUrl.searchParams.append("debug", "true");

        db = mysql.createPool({
            uri: dbUrl.href,
            multipleStatements: true,
            connectionLimit: 1, // MAYBE: Turn this into a configuration option
        });
    }
    return db;
})();

module.exports.sessionStore = new MySQLStore({}, db);

module.exports.sqlFolder = sqlFolder;
module.exports.sqlFromFile = function (filename, values) {
    filename = path.basename(filename, path.extname(filename)); // kill the file extension
    filename = path.join(sqlFolder, filename + ".sql"); // add our own!

    let out = compressSQL(fs.readFileSync(filename).toString());
    if(values != undefined) out = module.exports.insertVariables(out, values);

    return out;
};
module.exports.templateFromFile = function (filename, values) {
    // filename = path.basename(filename, path.extname(filename)); // kill the file extension
    // opting to not kill the file extension -- this should be documented.
    filename = path.join(templateFolder, filename + ".template.sql"); // add our own!
    let template = compressSQL(fs.readFileSync(filename).toString());

    if(!Array.isArray(values)) values = [values];

    let out = [];

    out.push(template.substring(0, template.indexOf("@{beginDupe}")));
    template = template.substring(template.indexOf("@{beginDupe}") + "@{beginDupe}".length);
    let dupeTemplate = template.substring(0, template.indexOf("@{endDupe}"));

    let dupeArr = [];
    Array.from(values).forEach(v => { // v is an object
        let dupe = module.exports.insertVariables(dupeTemplate, v);
        dupeArr.push(dupe);
    });
    out.push(dupeArr.join(", "));

    out.push(template.substring(template.indexOf("@{endDupe}") + "@{endDupe}".length));

    console.log(compressSQL(out.join(" ")));

    return compressSQL(out.join(" "));
};
module.exports.insertVariables = function (query, values) {
    for(let e of Object.entries(values)) {
        let r = new RegExp("\\$\\{" + e[0] + "\\}", "g"); // lucky this is only run by trusted sources using trusted sources...
        query = query.replace(r, e[1]);
    }
    return query;
};
module.exports.compressSQL = compressSQL;

function compressSQL(data) {
    return data.replace(/(\/\*(.|\s)+?\*\/|^\s*--.*?$)/gm, "").replace(/\n\r/gm, " ").replace(/\s+/gm, " ").trim();
}

// Returns a Promise!
// This should be used as require('./db').then(blah).blah...
// or (await require("./db"))