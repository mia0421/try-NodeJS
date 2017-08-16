var express = require('express');
var xmlTool = require('../module/xmlFileTool');
var formatTool = require('../module/formatTool');

// 把路由包裝成模組
var router = express.Router();

// 取得資料夾結構
router.get('/GetDir', (req, res) => {
    xmlTool.renderAllFolder("./resxFile")
        .then((folderList) => {
            res.json(formatTool.getFolderViewJson(folderList));
        });
});

// 取得檔案xml json
router.post('/GetXmlData', (req, res) => {
    xmlTool.renderResx(req.body)
        .then((data) => {
            res.json(formatTool.getFileViewJson(data));
        });
});


module.exports = router;
