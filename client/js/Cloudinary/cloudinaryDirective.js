angular
  .module('app')
  .directive('cloudinaryUpload', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/cloudinary/widgets/upload.html'
    }
  })
  .directive('userImageUpload', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/cloudinary/widgets/user-image-upload.html'
    }
  });
