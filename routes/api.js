var express = require('express');
var xmlTool = require('../module/xmlFileTool');
var formatTool = require('../module/formatTool');
var fsPath = require("path");
// 把路由包裝成模組
var router = express.Router();

var resxFilePath = {
    MobileWebMall:'../../nineyi.my.webstore.mobilewebmall/WebStore/Resources',
    SMS: '../../nineyi.my.sms/CrossLayer/Resources'
};

// 取得資料夾結構
router.post('/GetDir', (req, res) => {
    var path = resxFilePath[req.body.Type] ? resxFilePath[req.body.Type] : '../resxFile';
    xmlTool.renderAllFolder(fsPath.join(__dirname, path))
        .then((folderList) => {
            res.json(formatTool.getFolderViewJson(folderList));
        });
});

// 取得檔案xml json
router.post('/GetXmlData', (req, res) => {
    xmlTool.renderResx(req.body)
        .then((data) => {
            res.json(formatTool.getFileViewJson(data));
        }, () => {
            res.sendStatus(500);
        });
});

router.post('/EditXmlData', (req, res) => {
    xmlTool.updateResxFile(req.body.FileName, req.body.FilePath, req.body.Key, req.body.Val)
        .then(() => {
            res.sendStatus(200);
        }, (err) => {
            res.sendStatus(500).send(err);
        });
});


module.exports = router;
