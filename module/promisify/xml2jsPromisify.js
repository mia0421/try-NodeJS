var Promise = require("bluebird");

// 將xml結構轉成json
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();
var parseString = Promise.promisify(parser.parseString, {context: parser});


module.exports = {
    parseString: parseString,
    builder: builder
};
