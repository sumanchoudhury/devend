angular
  .module('app')
  .directive('commonTopNav', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/common/widgets/common-top-nav.html'
    }
  })
  .directive('commonLogin', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/common/widgets/common-login.html'
    }
  })
  .directive('loading',   ['$http' ,function ($http)
  {
    return {
      restrict: 'A',
      template: '<div class="loading-spiner-holder" data-loading ><div class="loading-spiner"><img src="..." />Loading</div></div>',
      link: function (scope, elm, attrs)
      {
        scope.isLoading = function () {
          return $http.pendingRequests.length > 0;
        };

        scope.$watch(scope.isLoading, function (v)
        {
          if(v){
            elm.show();
          }else{
            elm.hide();
          }
        });
      }
    };

  }])
//check if equal
  .directive('nxEqual', function() {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, model) {
        if (!attrs.nxEqual) {
          console.error('nxEqual expects a model as an argument!');
          return;
        }
        scope.$watch(attrs.nxEqual, function (value) {
          model.$setValidity('nxEqual', value === model.$viewValue);
        });
        model.$parsers.push(function (value) {
          var isValid = value === scope.$eval(attrs.nxEqual);
          model.$setValidity('nxEqual', isValid);
          return isValid ? value : undefined;
        });
      }
    };
  })
  //file upload thumb
  .directive('ngThumb', ['$window', function($window) {
    var helper = {
      support: !!($window.FileReader && $window.CanvasRenderingContext2D),
      isFile: function(item) {
        return angular.isObject(item) && item instanceof $window.File;
      },
      isImage: function(file) {
        var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    };

    return {
      restrict: 'A',
      template: '<canvas/>',
      link: function(scope, element, attributes) {
        if (!helper.support) return;

        var params = scope.$eval(attributes.ngThumb);

        if (!helper.isFile(params.file)) return;
        if (!helper.isImage(params.file)) return;

        var canvas = element.find('canvas');
        var reader = new FileReader();

        reader.onload = onLoadFile;
        reader.readAsDataURL(params.file);

        function onLoadFile(event) {
          var img = new Image();
          img.onload = onLoadImage;
          img.src = event.target.result;
        }

        function onLoadImage() {
          var width = params.width || this.width / this.height * params.height;
          var height = params.height || this.height / this.width * params.width;
          canvas.attr({ width: width, height: height });
          canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
        }
      }
    };
  }])
  .directive('messageBoxContainer', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/common/widgets/message-box.html'
    }
  });
