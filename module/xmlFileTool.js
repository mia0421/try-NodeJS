/**
 * @module xmlFileTool
 */

var fs = require("fs");
var fsPath = require("path");
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();


var tool = (name, path) => {
    return new Promise((resolve, reject) => {
        var List = [];
        var statInfo = fs.statSync( fsPath.join(path,name));

        if (statInfo.isDirectory()) {
            xmlTool.renderFolder( fsPath.join(path,name)).then((dirList) => {
                var qList = [];
                dirList.forEach((dirName) => {
                    qList.push(tool(dirName, fsPath.join(path,name)));
                });
                Promise.all(qList).then((dirItems) => {
                    var dirItemList = [];
                    dirItems.forEach((item) => {
                        dirItemList = dirItemList.concat(item);
                    });

                    List.push({
                        Name: name,
                        Path: fsPath.join(path,name),
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

    /**
     * 讀取特定資料夾下所有Folder&File結構
     * @memberof xmlFileTool
     * @function renderAllFolder
     * @param path {String} 指定Folder路徑
     * @return {Promise} 資料夾下所有Folder&File結構
     * @example
     * {
     *      a:11,
     *      b:222
     * }
     */
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

    /**
     * 取得指定目錄下的資料夾＆檔案
     * @function renderFolder
     * @param path {String} 指定Folder路徑
     * @returns {Promise} 當層檔案結構
     */
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

    /**
     * 尋找某一語系檔所有語系檔案名稱
     * @function searchFile
     * @param fileName {String} 檔案名稱,不含副檔名
     * @param filePath {String} 檔案路徑不,含檔案名稱
     * @returns {Promise} 檔案名稱Array
     */
    searchFile: (fileName, filePath) => {
        return new Promise((resolve, reject) => {
            xmlTool.renderFolder(filePath).then((fileList) => {
                resolve(fileList.filter((item) => {
                    return fsPath.extname(item) === ".resx" && item.indexOf(fileName) >= 0;
                }));
            });
        });
    },

    /**
     * 讀取特定單一File資料(原始結構)
     * @function renderFile
     * @param fileName {String} 檔案名稱,不含副檔名
     * @param filePath {String} 檔案路徑不,含檔案名稱
     * @returns {Promise} 該語系之Json格式資料
     */
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

    /**
     * 取得該檔案所有語系資料
     * @function renderResx
     * @param fileData {Object}
     * @param fileData.Name {String} 要取得的語系檔名稱
     * @param fileData.Path {String} 要取得的語系檔路徑不含檔案名稱
     * @returns {Promise}
     */
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

    /**
     * 更新特定File資料
     * @function updateFile
     * @param fileName {String} 要更新的語系檔名稱
     * @param filePath {String} 要更新的語系檔路徑不含檔案名稱
     * @param key {String} 要更新資料的語系Key
     * @param language {String} 要更新的語系
     * @param val {String} 更新的資料
     * @returns {Promise}
     */
    updateFile: (fileName, filePath, key, language, val) => {
        return new Promise((resolve, reject) => {
            var name = language === 'Default' ? `${fileName}.resx` : `${fileName}.${language}.resx`;
            var path = fsPath.join(filePath, name);
            var xmlData = fs.readFileSync(path);
            var xmlBuilder;

            parser.parseString(xmlData, (err, xmlObj) => {
                var isNewVal = true;
                xmlObj.root.data.forEach((value) => {
                    if (value.$.name === key) {
                        value.value[0] = val;
                        isNewVal = false;
                    }
                });
                if (isNewVal) {
                    xmlObj.root.data.push({
                        "$": {
                            "name": key,
                            "xml:space": "preserve"
                        },
                        "value": [val]
                    });
                }
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

    /**
     * 呼叫更新語系方法
     * @function updateResxFile
     * @param fileName {String} 要更新的語系檔名稱
     * @param filePath {String} 要更新的語系檔路徑不含檔案名稱
     * @param Key {String} 要更新資料的語系Key
     * @param LanguageValObj {Object} 要更新的語系與新的文案
     * @returns {Promise}
     */
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