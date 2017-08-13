var fs = require("fs");
var fsPath = require("path");
var xml2js = require('xml2js');
var Q = require('q');

var parser = new xml2js.Parser();


// 取得folder結構
var tool = (name, path) => {
    var deferred = Q.defer();
    var List = [];
    var statInfo = fs.statSync(path + '/' + name);

    if (statInfo.isDirectory()) {
        xmlTool.renderFolder(path + '/' + name).then((dirList) => {
            var qList = [];
            dirList.forEach((dirName) => {
                qList.push(tool(dirName, path + '/' + name));
            });
            Q.all(qList).then((dirItems) => {
                var dirItemList = [];
                dirItems.forEach((item) => {
                    dirItemList = dirItemList.concat(item);
                });

                List.push({
                    Name: name,
                    Path: path + '/' + name,
                    IsFolder: true,
                    ChildList: dirItemList
                });

                deferred.resolve(List);
            });

        });
    } else {
        if (fsPath.extname(name) === ".resx") {
            List.push({
                Name: name,
                Path: path,
                IsFolder: false,
                ChildList: []
            });
        }
        deferred.resolve(List);
    }
    return deferred.promise
};

var xmlTool = {
    //讀取特定資料夾下所有Folder&File結構
    renderAllFolder: (path) => {
        var deferred = Q.defer();
        var FolderList = [];

        xmlTool.renderFolder(path).then((data) => {
            var qlist = [];
            data.forEach((item) => {
                qlist.push(tool(item, path));
            });
            Q.all(qlist).then((qitem) => {
                qitem.forEach((list) => {
                    FolderList = FolderList.concat(list)
                });
                deferred.resolve(FolderList);
            })

        });
        return deferred.promise;
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

    // 尋找某一語系檔所有語系檔案名稱
    seatchFiles: (fileName, filePath) => {
        var deferred = Q.defer();
        var name = fileName.split('.')[0];
        xmlTool.renderFolder(filePath).then((fileList) => {
            deferred.resolve(fileList.filter((item) => {
                return fsPath.extname(item) === ".resx" && item.indexOf(name) >= 0;
            }));
        });
        return deferred.promise;
    },


    // 讀取特定單一File資料(原始結構)
    renderFile: (fileName, filePath) => {
        var deferred = Q.defer();
        var xmlData = fs.readFileSync(`${filePath}/${fileName}`);
        parser.parseString(xmlData, (err, data) => {
            if (data) {
                deferred.resolve({
                    Name: fileName,
                    Language: fileName.split('.').length === 2 ? 'Default' : fileName.split('.')[1],
                    Data: data.root.data
                });
            } else {
                //error
                deferred.resolve({});
            }
        });
        return deferred.promise;
    },
    // 取得該檔案所有語系資料
    renderResx: (fileData) => {
        var deferred = Q.defer();
        xmlTool.seatchFiles(fileData.Name, fileData.Path).then((filePathList) => {
            var QLsit = [];
            filePathList.forEach((fileName) => {
                QLsit.push(xmlTool.renderFile(fileName, fileData.Path));
            });

            Q.all(QLsit).then((QItem) => {
                var list = [];
                QItem.forEach((item) => {
                    list = list.concat(item);
                });
                deferred.resolve(list);
            });
        });

        return deferred.promise;
    },

    // 更新特定File資料
    updateFile: () => {

    }
};

module.exports = xmlTool;