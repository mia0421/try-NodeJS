var fs = require("fs");
var fsPath = require("path");
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();

// 取得folder結構
var tool = (name, path) => {
    return new Promise((resolve, reject) => {
        var List = [];
        var statInfo = fs.statSync(path + '/' + name);

        if (statInfo.isDirectory()) {
            xmlTool.renderFolder(path + '/' + name).then((dirList) => {
                var qList = [];
                dirList.forEach((dirName) => {
                    qList.push(tool(dirName, path + '/' + name));
                });
                Promise.all(qList).then((dirItems) => {
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

                    resolve(List);
                });

            });
        } else {
            if (fsPath.extname(name) === ".resx") {
                List.push({
                    Name: fsPath.basename(name, '.resx'),
                    Path: path,
                    IsFolder: false,
                    ChildList: []
                });
            }
            resolve(List);
        }
    });
};

var xmlTool = {
    //讀取特定資料夾下所有Folder&File結構
    renderAllFolder: (path) => {
        return new Promise((resolve, reject) => {
            var FolderList = [];

            xmlTool.renderFolder(path).then((data) => {
                var qlist = [];
                data.forEach((item) => {
                    qlist.push(tool(item, path));
                });
                Promise.all(qlist).then((qitem) => {
                    qitem.forEach((list) => {
                        FolderList = FolderList.concat(list)
                    });
                    resolve(FolderList);
                })

            });
        })

    },
    // 讀取特定Folder＆File結構
    renderFolder: (path) => {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, data) => {
                if (err) {
                    resolve([]);
                } else {
                    resolve(data)
                }
            });
        });
    },

    // 尋找某一語系檔所有語系檔案名稱
    searchFile: (fileName, filePath) => {
        return new Promise((resolve, reject) => {
            xmlTool.renderFolder(filePath).then((fileList) => {
                resolve(fileList.filter((item) => {
                    return fsPath.extname(item) === ".resx" && item.indexOf(fileName) >= 0;
                }));
            });
        });
    },


    // 讀取特定單一File資料(原始結構)
    renderFile: (fileName, filePath) => {
        return new Promise((resolve, reject) => {
            var xmlData = fs.readFileSync(`${filePath}/${fileName}`);
            parser.parseString(xmlData, (err, data) => {
                if (data) {
                    resolve({
                        Name: fileName,
                        Language: fileName.split('.').length === 2 ? 'Default' : fileName.split('.')[1],
                        Data: data.root.data
                    });
                } else {
                    //error
                    reject("parse xml string error");
                }
            });

        });

    },
    // 取得該檔案所有語系資料
    renderResx: (fileData) => {
        return new Promise((resolve, reject) => {
            xmlTool.searchFile(fileData.Name, fileData.Path).then((filePathList) => {
                var QLsit = [];
                filePathList.forEach((fileName) => {
                    QLsit.push(xmlTool.renderFile(fileName, fileData.Path));
                });
                Promise.all(QLsit).then((QItem) => {
                    var list = [];
                    QItem.forEach((item) => {
                        list = list.concat(item);
                    });
                    resolve(list);
                }, (err) => {
                    reject(err);
                });
            });
        });
    },

    // 更新特定File資料
    updateFile: (fileName, filePath, key, language, val) => {
        return new Promise((resolve, reject) => {
            var name = language === 'Default' ? `${fileName}.resx` : `${fileName}.${language}.resx`;
            var path = fsPath.join(filePath, name);
            var xmlData = fs.readFileSync(path);
            var xmlBuilder;

            parser.parseString(xmlData, (err, xmlObj) => {
                xmlObj.root.data.forEach((value) => {
                    if (value.$.name === key) {
                        value.value[0] = val;
                    }
                });
                xmlBuilder = builder.buildObject(xmlObj);
                fs.writeFile(path, xmlBuilder, () => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

    },
    // 更新該檔案所有語系資料
    updateResxFile: (fileName, filePath, Key, LanguageValObj) => {
        return new Promise((resolve, reject) => {
            var qList = [];
            Object.keys(LanguageValObj).forEach((objkey) => {
                qList.push(xmlTool.updateFile(fileName, filePath, Key, objkey, LanguageValObj[objkey]));
            });

            Promise.all(qList).then((result) => {
                resolve();
            }, () => {
                reject();
            });
        });

    }
};

module.exports = xmlTool;