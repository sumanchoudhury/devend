angular
  .module('app')
  //combine name
  .filter('displayName', function() {
    return function(user) {
      return user.firstName + " " + user.lastName;
    }
  })

  //filter requests by status
  .filter('filterRequestStatus', function() {
    return function( items, status) {
      if(!status){
        return items;
      }
      if(!status.accepted && !status.declined && !status.pending){
        return items;
      }

      return items.filter(function(item){
        if(status.accepted &&  item.endorserAcceptStatus == 1) {
          return true;
        } else if(status.declined &&  item.endorserAcceptStatus == 2) {
          return true;
        } else if(status.pending &&  !item.endorserAcceptStatus) {
          return true;
        } else {
          return false;
        }
      });
    };
  })
//filter endorsements by profile
  .filter('filterEndorsementByProfile', function() {
    return function( items, profileFilter) {
      if(profileFilter.profile == undefined){
        return items;
      }
      if(profileFilter.profile.id == undefined){
        return items;
      }
      //console.log(profileFilter);
      return items.filter(function(item){
        if(angular.equals(item.userProfileId, profileFilter.profile.id)) {
          return true;
        } else {
          return false;
        }
      });
    };
  })
//filter admin
  .filter('filterCompanyAdmin', function() {
    return function( items, adminFilter) {
      if(adminFilter == undefined){
        return items;
      }

      var searchTextSplit = adminFilter.toLowerCase().split(' ');
      return items.filter(function(item){
        for(var y = 0; y < searchTextSplit.length; y++){
          if(item.companyUser.firstName.toLowerCase().indexOf(searchTextSplit[y]) !== -1 || item.companyUser.lastName.toLowerCase().indexOf(searchTextSplit[y]) !== -1){
            return true;
          } else {
            return false;
          }
        }

      });
    };
  })
//filter company user
  .filter('filterCompanyUser', function() {
    return function( items, companyUser) {
      if(companyUser == undefined){
        return items;
      }
      var searchTextSplit = companyUser.toLowerCase().split(' ');
      return items.filter(function(item){
        item.assignEndorsets.filter(function(assignEndorset){
          if(item.assignEndorset == undefined){
            return true;
          }
          if(item.assignEndorset.inviteUser == undefined){
            return true;
          }
          for(var y = 0; y < searchTextSplit.length; y++){
            if(item.assignEndorset.inviteUser.firstName.toLowerCase().indexOf(searchTextSplit[y]) !== -1 || item.assignEndorset.inviteUser.lastName.toLowerCase().indexOf(searchTextSplit[y]) !== -1){
              return true;
            } else {
              return false;
            }
          }
        });


      });
    };
  });
