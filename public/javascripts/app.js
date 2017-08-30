var app = angular.module('app', []);

app.controller('myCtrl', function ($scope, $http) {
    $scope.FolderList = [];
    $scope.FolderData = [];
    $scope.FileList = [];
    $scope.LanguageList = [];
    $scope.SearchFile = "";
    $scope.CurrentFile = "";
    $scope.CurrentWebSite = "MobileWebMall";

    $scope.GetDir = function (webSite) {
        $http.post('/api/GetDir', {Type: webSite})
            .then(function (result) {
                $scope.FolderData = result.data;
                $scope.FolderList = angular.copy($scope.FolderData);
            }, function () {

            });
    };
    $scope.GetXmlData = function (selectFile) {
        $scope.CurrentFile = selectFile;
        if (!selectFile.IsFolder) {
            $http.post('/api/GetXmlData', selectFile).then(function (result) {
                $scope.FileList = $scope.formatXmlData(result.data);
            }, function () {
            });
        } else {
            $scope.FileList = [];
        }
    };
    $scope.formatXmlData = function (fileList) {
        var FileList = [];
        $scope.LanguageList = [];
        fileList.forEach((languageItem) => {
            $scope.LanguageList.push(languageItem.Language);
            languageItem.Data.forEach((item) => {
                var indexNum = -1;
                FileList.forEach((data, index) => {
                    if (data.Key === item.Key) {
                        indexNum = index;
                    }
                })
                if (indexNum === -1) {
                    FileList.push({
                        Key: item.Key,
                        Val: {
                            [languageItem.Language]: item.Val
                        },
                        isEdit: false
                    });
                } else {
                    FileList[indexNum].Val[languageItem.Language] = item.Val;

                }
            });
        });
        return FileList;
    };
    $scope.select = function () {
        var tool = function (key, list) {
            var result = [];
            list.forEach(function (item) {
                if (item.IsFolder) {
                    result = result.concat(tool(key, item.ChildList));
                } else {
                    if (item.Name.toLowerCase().indexOf(key.toLowerCase()) >= 0) result.push(item);
                }
            });
            return result;
        };
        if ($scope.SearchFile) {
            $scope.FolderList = tool($scope.SearchFile, $scope.FolderData);
        } else {
            $scope.FolderList = angular.copy($scope.FolderData);
        }
    };
    $scope.selectWebsite = function (data) {
        $scope.CurrentWebSite = data;
        $scope.GetDir(data);
    };
    $scope.edit = function (Item) {
        Item.isEdit = true;
    };
    $scope.save = function (Item) {
        console.log({
            FileName: $scope.CurrentFile.Name,
            FilePath: $scope.CurrentFile.Path,
            Key: Item.Key,
            Val: Item.Val
        });
        $http.post('/api/EditXmlData', {
            FileName: $scope.CurrentFile.Name,
            FilePath: $scope.CurrentFile.Path,
            Key: Item.Key,
            Val: Item.Val
        })
            .then(function () {
                console.log("Success");
                Item.isEdit = false;
            }, function () {
                console.log("Error");
            });
    };
    //初始
    $scope.GetDir($scope.CurrentWebSite);
});