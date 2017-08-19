
var tool = {
    // 整理成頁面呈現用json資料
    getFolderViewJson: (dirList) => {
        // 是檔案 過濾掉 多語言的重複檔案
        var root = (list) => {
            return list.filter((item) => {
                if (item.IsFolder) {
                    item.ChildList = root(item.ChildList);
                    return true;
                } else {
                    return item.Name.split('.').length === 1;
                }
            });
        }
        return root(dirList);
    },

    getFileViewJson: (languageList) => {
        return languageList.map((languageItem) => {
            languageItem.Data = languageItem.Data.map((item) => {

                return {
                    Key: item.$.name,
                    Val: item.value[0]
                }
            });
            return languageItem;
        });
    }
};

module.exports = tool;