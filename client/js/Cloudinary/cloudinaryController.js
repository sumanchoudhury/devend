angular
  .module('app')
/**
 * Cloudinary controller
 */
  .controller('CloudinaryController',
  ['$scope', 'Upload',
    function($scope, Upload) {
      var cloud_name = "communycreation-ltd";
      $scope.$watch('files', function () {
        $scope.upload($scope.files);
      });

      $scope.upload = function (files) {
        if (files && files.length) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            Upload.upload({
              url: "https://api.cloudinary.com/v1_1/" + cloud_name + "/upload",
              fields: {'username': $scope.username},
              file: file
            }).progress(function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
              console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            }).error(function (data, status, headers, config) {
              console.log('error status: ' + status);
            })
          }
        }
      };
    }
  ]
);