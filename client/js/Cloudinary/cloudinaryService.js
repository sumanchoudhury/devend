angular
  .module('app')
/**
 * Cloudinary services
 */
  .factory('CloudinaryService',
  ['$rootScope', '$resource',
    function($rootScope, $resource) {

      /**
       * Get all images of path
       * @param folderName
       * @returns {*}
       */
      function getImages(folderName){
        var url = $.cloudinary.url(folderName, {format: 'json', type: 'list'});
        url = url + "?" + Math.ceil(new Date().getTime()/1000);
        return $resource(url, {}, {
          images: {method:'GET', isArray:false}
        });
      }


      return {
        getImages: getImages
      };
    }
  ]
);
