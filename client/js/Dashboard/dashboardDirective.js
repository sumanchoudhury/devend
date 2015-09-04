angular
  .module('app')
  /*professional dashboard*/
  .directive('professionalDashboard', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard.html'
    }
  })
  /*company dashboard*/
  .directive('companyDashboard', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/company-dashboard.html'
    }
  })
  /*Endorsements tab for dashboard*/
  .directive('dashboardEndorsemts', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsements.html'
    }
  })
  /*Endorsements Requests tab for dashboard*/
  .directive('dashboardEndorsemtsRequests', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsements-requests.html'
    }
  })
  /*Endorsements Requests tab Request Forms for dashboard*/
  .directive('dashboardEndorsemtsRequestsForms', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsements-requests-forms.html'
    }
  })

  /*Endorsements List tab for dashboard*/
  .directive('dashboardEndorsemtsList', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsements-list.html'
    }
  })
  /*Endorsement for dashboard*/
  .directive('dashboardEndorsemt', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsement.html'
    }
  })
  /*Endorsements List draft for dashboard*/
  .directive('dashboardEndorsemtsListDraft', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsements-list-draft.html'
    }
  })

  /*Endorset tab for dashboard*/
  .directive('dashboardEndorsets', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsets.html'
    }
  })
  /*Endorsets List tab for dashboard*/
  .directive('dashboardEndorsetsList', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsets-list.html'
    }
  })
  /*Endorsets Requests tab for dashboard*/
  .directive('dashboardEndorsetsRequests', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/dashboard/widgets/dashboard-endorsets-requests.html'
    }
  });