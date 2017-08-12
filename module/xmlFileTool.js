var fs = require("fs");
var xml2js = require('xml2js');
var Q = require('q');

var parser = new xml2js.Parser();

var xmlTool = {
    //讀取特定資料夾下所有Folder&File結構
    renderAllFolder: (path, callback) => {
        var FolderList = [
            {
                Name: "",
                ChildList: []
            }
        ];
        xmlTool.renderFolder(path).then((data) => {

        });
    },
    // 讀取特定Folder＆File結構
    renderFolder: (path) => {
        var deferred = Q.defer();
        fs.readdir(path, (err, data) => {
            if (err) {
                deferred.resolve([]);
            } else {
                deferred.resolve(data)
            }
        });
        return deferred.promise
    },
    // 讀取特定File資料
    renderFile: (filenPath, callback) => {
        fs.renderFile(filenPath, (err, data) => {
            if (err) {
                callback("");
            } else {
                callback(data);
            }
        });
    },
    // 更新特定File資料
    updateFile: () => {

    }
};

module.exports = xmlTool;