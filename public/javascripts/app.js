var app = angular.module('app', []);

app.controller('myCtrl', function ($scope, $http) {
    $scope.FolderList = [];
    $scope.FileList = [];
    $scope.LanguageList = [];
    $scope.SearchFile = "";
    $scope.CurrentFile = "";

    $scope.GetDir = function () {
        $http.get('/api/GetDir').then(function (result) {
            $scope.FolderList = result.data;
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

    $scope.edit = function (Item) {
        Item.isEdit = true;
    };
    $scope.save = function (Item) {
        console.log( {
            FileName:$scope.CurrentFile.Name,
            FilePath:$scope.CurrentFile.Path,
            Key:Item.Key,
            Val:Item.Val
        });
        $http.post('/api/EditXmlData', {
                FileName:$scope.CurrentFile.Name,
                FilePath:$scope.CurrentFile.Path,
                Key:Item.Key,
                Val:Item.Val
            })
            .then(function () {
                console.log("Success");
                Item.isEdit = false;
            }, function () {
                console.log("Error");
            });
    };
    //初始
    $scope.GetDir();
});