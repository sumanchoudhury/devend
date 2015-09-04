var server = require('./server');
var dataSource = server.dataSources.db;

var models = [
'AccessToken',
'ACL',
'Role',
'RoleMapping',
'userType', 
'userDetail',
'userProfile',
'endorsement',
'endorsementCompany',
'endorsementProject',
'question',
'company',
'skill',
'endorsementSkill',
'hrFeedback',
'userIdentity',
'jobPost',
'endorset',
'endorsetSkill',
'vote'
];

dataSource.isActual(models, function(err, actual) {
  if(err == false){
    console.log(actual);  
  } else {
    console.log(err);
  }  
  if (!actual) {
    dataSource.autoupdate(models, function(err, result) {
      if(err == false){
        console.log(result);  
      } else {
        console.log(err);
      }          
    });
  }
});

var UserDetail = server.models.UserDetail;
var Role = server.models.Role;
var RoleMapping = server.models.RoleMapping;

UserDetail.create([
    {username: 'admin', email: 'admin@admin.com', password: 'admin', firstName: 'Admin', lastName: 'User', address:"test", userTypeId: 1}
], function(err, users) {
    if (err) {console.log(err); return ;}
        // Create the admin role
    Role.create({
      name: 'admin'
    }, function(err, role) {
      if (err) {console.log(err); return ;}
      console.log(role);
 
      // Make Bob an admin
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[0].id
      }, function(err, principal) {
        if (err) {console.log(err); return ;}
        console.log(principal);
      });
    });
  });