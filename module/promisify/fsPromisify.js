var Promise = require("bluebird");
var fs = require("fs");

var readdir = Promise.promisify(fs.readdir, {context: fs});
var readFile = Promise.promisify(fs.readFile, {context: fs});
var writeFile = Promise.promisify(fs.writeFile, {context: fs});
var stat = Promise.promisify(fs.stat, {context: fs});

module.exports = {
    readdir: readdir,
    readFile: readFile,
    writeFile: writeFile,
    stat: stat
};



