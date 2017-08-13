var app = angular.module('app', []);

app.controller('myCtrl', function ($scope, $http) {
    $scope.FolderList = [];
    $scope.FileList = [];
    $scope.LanguageList = [];
    $scope.SearchFile = "";

    $scope.GetDir = function () {
        $http.get('/api/GetDir').then(function (result) {
            $scope.FolderList = result.data;
        }, function () {

        });
    };
    $scope.GetXmlData = function (selectFile) {
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
                        Val: [{
                            language: languageItem.Language,
                            Txt: item.Val,
                        }]
                    });
                } else {
                    FileList[indexNum].Val.push({
                        language: languageItem.Language,
                        Txt: item.Val,
                    });
                }
            });
        });
        return FileList;
    };
    //初始
    $scope.GetDir();
});