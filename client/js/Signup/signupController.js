angular
  .module('app')
/**
 * Signup Controller
 */
  .controller('SignUpController', ['$scope', 'LoginService', '$state', 'UserType', 'UserDetail', 'Company',
  function($scope, LoginService, $state, UserType, UserDetail, Company) {
    $scope.user = { username : ""};
    $scope.professionalTab = true;
    $scope.businessTab = false;
    $scope.userTypes = [];
    $scope.submitted = false;
    $scope.successMsg = false;
    $scope.errorMsg = false;
    $scope.errors = [];

    $scope.companyStep = 1;
    $scope.company = {};

    //fetch user types
    UserType.find().$promise
      .then(function(response) {
        $scope.userTypes = response;
      });

    //display profession tab
    $scope.showProfessionalTab = function (){
      $scope.professionalTab = true;
      $scope.businessTab = false;

    };

    //display business tab
    $scope.showBusinessTab = function (){
      $scope.businessTab = true;
      $scope.professionalTab = false;
      $scope.companyStep = 1;

    };

    //handle professional register
    $scope.register = function(isValid) {
      $scope.submitted = true;
      $scope.user.username = $scope.user.email;
      if(isValid){
        if($scope.businessTab){
          $scope.user.userTypeId = "5589c01bc05dc30300447177";
        } else {
          $scope.user.userTypeId = "5589c00cc05dc30300447176";
        }
        LoginService.register($scope.user)
          .then(function(userData) {
            //console.log(userData);

            //$state.transitionTo('sign-up-success');
            LoginService.login($scope.user.username, $scope.user.password)
              .then(function(response) {
                $state.transitionTo('user-identity');
              });
          },
          function (error) {
            console.log(error);
            $scope.successMsg = false;
            if(error){
              $scope.errorMsg = true;
              $scope.errors = error.data.error.details.messages;
            }

          });
      } else {
        console.log("Not valid");
      }

    };

    //next step
    $scope.nextStep = function(isValid){
      if(isValid) {
        $scope.companyStep += 1;
      }
    };
    //revert back step
    $scope.backStep = function(){
      $scope.companyStep -= 1;
    };
    /**
     * handle business.company registration
     * @param isValid
     */
    $scope.registerBusiness = function(isValid) {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $scope.submitted = true;
      if(isValid){
        $scope.company.userTypeId = "5589c01bc05dc30300447177";

        UserDetail.create({userTypeId: $scope.company.userTypeId, firstName: $scope.company.firstName, lastName: $scope.company.lastName, position: $scope.company.position, username: $scope.company.username, email: $scope.company.company_email, password: $scope.company.company_password})
          .$promise
          .then(function(userData) {
            //console.log(userData);
            Company.create({userDetailId: userData.id, companyName: $scope.company.companyName, companyNumber: $scope.company.companyNumber, industry: $scope.company.industry, country: $scope.company.country})
              .$promise
              .then(function(companyData) {
                $scope.successMsg = "Company user registered successfully!";
                $scope.errorMsg = false;
                LoginService.login($scope.company.username, $scope.company.company_password)
                  .then(function(loginres) {
                    $state.transitionTo('dashboard');
                  });
              },
              function(error){
                console.log(error);
              });
          },
          function(error){
            console.log(error);
            $scope.successMsg = false;
            $scope.errorMsg = true;
            $scope.errors = error.data.error.details.messages;
          });

      } else {
        console.log("Not valid");
      }

    };
  }]);