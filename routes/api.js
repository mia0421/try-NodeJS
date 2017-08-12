var express = require('express');
var xmlTool = require('../module/xmlFileTool');

var router = express.Router();

router.get('/getGist', (req, res) => {
    xmlTool.renderFolder("./resxFile")
        .then((folderList) => {
            res.json({Folder: folderList});
        });
});

module.exports = router;
