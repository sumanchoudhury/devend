angular
  .module('app')
/**
 * Request and Endorsement services
 */
  .factory('EndorsementService', ['Endorsement', 'EndorsementCompany', 'EndorsementProject', 'EndorserEndorsement', 'Endorset', 'Question', function(Endorsement, EndorsementCompany, EndorsementProject, EndorserEndorsement, Endorset, Question) {

    /**
     * Create or Update request
     * @param id
     * @param endorsement
     * @returns {*}
     */
    function upsert(id, endorsement) {
      if(id){
        return update(id, endorsement);
      } else {
        return create(endorsement);
      }
    }

    /**
     * create request
     * @param endorsement
     * @returns {$promise|*}
     */
    function create(endorsement) {
      return Endorsement
        .create(endorsement)
        .$promise;
    }

    /**
     * Update request
     * @param id
     * @param endorsement
     * @returns {$promise|*}
     */
    function update( id, endorsement) {
      return Endorsement
        .prototype$updateAttributes({id:id},endorsement)
        .$promise;
    }

    /**
     * create or update company
     * @param id
     * @param company
     * @returns {*}
     */
    function upsertCompany(id, company) {
      if(id){
        return updateCompany(id, company);
      } else {
        return createCompany(company);
      }
    }

    /**
     * create company
     * @param company
     * @returns {$promise|*}
     */
    function createCompany(company) {
      return EndorsementCompany
        .create(company)
        .$promise;
    }

    /**
     * Update company
     * @param id
     * @param company
     * @returns {$promise|*}
     */
    function updateCompany( id, company) {
      return EndorsementCompany
        .prototype$updateAttributes({id:id},company)
        .$promise;
    }

    /**
     * create or update project
     * @param id
     * @param project
     * @returns {*}
     */
    function upsertProject(id, project) {
      if(id){
        return updateProject(id, project);
      } else {
        return createProject(project);
      }
    }

    /**
     * create project
     * @param project
     * @returns {$promise|*}
     */
    function createProject(project) {
      return EndorsementProject
        .create(project)
        .$promise;
    }

    /**
     * update project
     * @param id
     * @param project
     * @returns {$promise|*}
     */
    function updateProject( id, project) {
      return EndorsementProject
        .prototype$updateAttributes({id:id},project)
        .$promise;
    }

    /**
     * Fetch endorsements
     * @param filters
     * @param cb
     * @param errCb
     */
    function getEndorserEndorsement(filters, cb, errCb){
      EndorserEndorsement.find(filters, cb, errCb);
    }

    /**
     * create endorsement
     * @param data
     * @returns {$promise|*}
     */
    function createEndorserEndorsement(data) {
      return EndorserEndorsement
        .create(data)
        .$promise;
    }

    /**
     * update endorsement
     * @param id
     * @param data
     * @returns {$promise|*}
     */
    function updateEndorserEndorsement( id, data) {
      return EndorserEndorsement
        .prototype$updateAttributes({id:id},data)
        .$promise;
    }

    /**
     * create or update endorsement
     * @param id
     * @param data
     * @returns {$promise|*}
     */
    function upsertEndorserEndorsement(id, data) {
      if(id){
        return updateEndorserEndorsement(id, data);
      } else {
        return createEndorserEndorsement(data);
      }
    }

    /**
     * Fetch Questions
     * @param filters
     * @param cb
     * @param errCb
     */
    function getQuestion(filters, cb, errCb){
      Question.find(filters, cb, errCb);
    }

    /**
     * create question
     * @param data
     * @returns {$promise|*}
     */
    function createQuestion(data) {
      return Question
        .create(data)
        .$promise;
    }

    /**
     * Update question
     * @param id
     * @param data
     * @returns {$promise|*}
     */
    function updateQuestion( id, data) {
      return Question
        .prototype$updateAttributes({id:id},data)
        .$promise;
    }

    /**
     * create or update question
     * @param id
     * @param data
     * @returns {$promise|*}
     */
    function upsertQuestion(id, data) {
      if(id){
        return updateQuestion(id, data);
      } else {
        return createQuestion(data);
      }
    }

    /**
     * create or update endorset
     */
    function upsertEndorset(id, data) {
      if(id){
        return updateEndorset(id, data);
      } else {
        return createEndorset(data);
      }
    }

    /**
     * create endorset
     * @param data
     * @returns {$promise|*}
     */
    function createEndorset(data) {
      return Endorset
        .create(data)
        .$promise;
    }

    /**
     * update endorset
     * @param id
     * @param data
     * @returns {$promise|*}
     */
    function updateEndorset( id, data) {
      return Endorset
        .prototype$updateAttributes({id:id},data)
        .$promise;
    }

    /**
     * Remove endoset
     * @param id
     * @returns {$promise|*}
     */
    function removeEndorsetById(id) {
      return Endorset.deleteById({id:id})
        .$promise;
    }

    return {
      upsert: upsert,
      create: create,
      update: update,
      upsertCompany: upsertCompany,
      createCompany: createCompany,
      updateCompany: updateCompany,
      upsertProject: upsertProject,
      createProject: createProject,
      updateProject: updateProject,
      getEndorserEndorsement: getEndorserEndorsement,
      createEndorserEndorsement: createEndorserEndorsement,
      updateEndorserEndorsement: updateEndorserEndorsement,
      upsertEndorserEndorsement: upsertEndorserEndorsement,
      getQuestion: getQuestion,
      createQuestion: createQuestion,
      updateQuestion: updateQuestion,
      upsertQuestion: upsertQuestion,
      createEndorset: createEndorset,
      updateEndorset: updateEndorset,
      upsertEndorset: upsertEndorset,
      removeEndorsetById: removeEndorsetById

    };
  }])
/**
 * Endorsement data service
 */

  .service('EndorsementDataService', function($rootScope, $filter, LoopBackAuth, Endorsement, EndorsementService, Question) {
    $rootScope.endorsements = [];
    $rootScope.draftEndorsements = [];
    $rootScope.receivedEndorsements = [];
    $rootScope.receivedEndorsement = null;
    $rootScope.endorsement = null;

    $rootScope.endorsementData = {endorsement:null, sentEndorsements:[], receivedEndorsements: [], draftEndorsements:[], endorserEndorsement:{questions:[]}};

    var setEndorsements = function(endorsements, currentInstance) {
      $rootScope.endorsements = endorsements;

      if($rootScope.endorsements.length && currentInstance == null){
        $rootScope.endorsement = $rootScope.endorsements[0];
      }
    };

    var getEndorsements = function(){
      return $rootScope.endorsements;
    };

    var setDraftEndorsements = function(draftEndorsements) {
      $rootScope.draftEndorsements = draftEndorsements
      if($rootScope.draftEndorsements.length){
        $rootScope.endorsement = $rootScope.draftEndorsements[0];
      }
    };

    var getDraftEndorsements = function(){
      return $rootScope.draftEndorsements;
    };

    var getReceivedData = function(){
      return $rootScope.receivedEndorsements;
    };
    var setReceivedData = function(receivedEndorsements, currentInstance){
      $rootScope.receivedEndorsements = receivedEndorsements;
      if($rootScope.receivedEndorsements.length && currentInstance == null){
        $rootScope.receivedEndorsement = $rootScope.receivedEndorsements[0];
      }
    };

    var getEndorsementData = function(){
      return $rootScope.endorsementData;
    };
    var setEndorsementData = function(endorsementData){
      $rootScope.endorsementData = endorsementData;
    };

    var getEndorsementRequest = function(id){
      angular.forEach(getEndorsements(), function(req, key){
        if(angular.equals(req.id, id)){
          return req;
        }
      });
      Endorsement.find(
        {

          filter:{
            where:{
              id: id
            },
            include:[
              'userDetail', 'userProfile', "endorserUser",
              {
                "endorsementCompanies":["endorsementProjects"]
              }
            ]
          }
        },
        function(endorsements,  httpHeader) {
          if(endorsements.length){
            return endorsements[0];
          }
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    /**
     * Load endorsements requests
     * @param profileId
     */
    var loadRequestsData = function(profileId, currentInstance, callback){
      //sent requests
      Endorsement.find(
        {

          filter:{
            where:{
              isDraft: false,
              //userProfileId: profileId,
              userDetailId: LoopBackAuth.currentUserId
            },
            limit: 30,
            include:[
              'userDetail', 'userProfile', "endorserUser",
              {
                "endorsementCompanies":["endorsementProjects"]
              }
            ]
          }
        },
        function(endorsements,  httpHeader) {
          //console.log(endorsements);
          setEndorsements(endorsements, currentInstance);
          if(callback != undefined){
            callback(endorsements);
          }

        },
        function(errorResponse) { console.log(errorResponse); }
      );

      //draft requests
      Endorsement.find(
        {

          filter:{
            where:{
              isDraft: true,
              //userProfileId: profileId,
              userDetailId: LoopBackAuth.currentUserId

            },
            limit: 30,
            include:[
              'userDetail', 'userProfile', "endorserUser",
              {
                "endorsementCompanies":["endorsementProjects"]
              }
            ]
          }
        },
        function(draftEndorsements) {
          setDraftEndorsements(draftEndorsements);
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    /**
     * Load endorsements received
     * @param profileId
     */

    var loadReceivedData = function(email, currentInstance){
      if(currentInstance == undefined){
        currentInstance = null;
      }
      Endorsement.find(
        {
          filter:{
            limit: 30,
            where:{
              isDraft: false,
              email: email

            },
            include:['userDetail', 'userProfile', "endorserUser", {'endorsementCompanies':['endorsementProjects']}]
          }
        },
        function(endorsements) {
          setReceivedData(endorsements, currentInstance);
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    //load endorsement sent data
    var loadEndorsementSentData = function(currentInstance, callback){
      if(currentInstance == undefined){
        currentInstance = null;
      }
      EndorsementService.getEndorserEndorsement(
        {

          filter:{
            where:{
              isDraft: false,
              endorserId: LoopBackAuth.currentUserId
              //userProfileId: $rootScope.profileId

            },
            limit: 30,
            "include": [
              {
                "endorsement":[
                  "userDetail",
                  {
                    "endorsementCompanies":[
                      "endorsementProjects"
                    ]
                  }
                ]
              },
              "userProfile",
              "userDetail",
              { "questions": [
                "endorser",
                "hrDetail",
                {
                  "questions":[
                    "endorser",
                    "hrDetail",
                    {
                      "questions":[
                        "endorser",
                        "hrDetail"
                      ]
                    }
                  ]
                }
              ]
              }
            ]
          }
        },
        function(endorsements) {
          angular.forEach(endorsements, function(endorsement, key){
            //count replies
            if(endorsement.questions != undefined && endorsement.questions.length){
              Question.find(
                {
                  filter: {
                    where: {
                      endorserEndorsementId: endorsement.id,
                      //hrId: 0,
                      replyId: 0,
                      isDraft: {neq: true}
                      //endorserId: {neq: 0}
                    }
                  }
                },
                function(questions) {
                  endorsements[key].numQuestions = questions.length;
                },
                function(errorResponse) { console.log(errorResponse); }
              );

            }

            var endorsetScore = 0;
            var totalScoreItem = 0;
            angular.forEach(endorsement.skillScores, function(score, key){
              endorsetScore += parseFloat(score);
              totalScoreItem++;
            });
            angular.forEach(endorsement.projectScores, function(score, key){
              endorsetScore += parseFloat(score);
              totalScoreItem++;
            });
            var avgEndorsetScore = 0.0;
            if(totalScoreItem){
              avgEndorsetScore = endorsetScore/totalScoreItem;
            }

            endorsements[key].avgEndorsetScore = $filter('number')(avgEndorsetScore, 2);
          });
          //setEndorsementData({sentEndorsements: endorsements});
          $rootScope.endorsementData.sentEndorsements = endorsements;
          if($rootScope.endorsementData.sentEndorsements.length && currentInstance == null){

            $rootScope.endorsementData.endorsement = $rootScope.endorsementData.sentEndorsements[0];
            if($rootScope.endorsementData.sentEndorsements[0].questions){
              if($rootScope.endorsementData.endorserEndorsement == undefined){
                $rootScope.endorsementData.endorserEndorsement = {};
              }
              $rootScope.endorsementData.endorserEndorsement.questions = $rootScope.endorsementData.sentEndorsements[0].questions;

            }

          }

          if(callback != undefined){
            callback(endorsements);
          }
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    //fetch draft endorsement data
    var loadEndorsementDraftData = function(selectEndorsement){
      EndorsementService.getEndorserEndorsement(
        {

          filter:{
            where:{
              isDraft: true,
              //userProfileId: $rootScope.profileId,
              endorserId: LoopBackAuth.currentUserId

            },
            limit: 30,
            include:[
              {
                "endorsement":[
                  "userDetail",
                  {
                    "endorsementCompanies":[
                      "endorsementProjects"
                    ]
                  }
                ]
              },
              'userProfile',
              'userDetail'
            ]
          }
        },
        function(endorsements) {
          angular.forEach(endorsements, function(endorsement, key){
            if(!endorsement.skillComments){
              angular.forEach(endorsement.endorsement.skills.split(','), function(skill, skillKey){
                //endorsement.skillComments = {skill:{active: false}};
                //endorsements[key] = endorsement;
                if(selectEndorsement && selectEndorsement.id == endorsement.id){
                  $rootScope.endorsementData.endorsement = endorsement;

                  if(endorsement.questions){
                    $rootScope.endorsementData.endorserEndorsement.questions = endorsement.questions;
                  }
                }
              });
            }

            var endorsetScore = 0;
            var totalScoreItem = 0;
            angular.forEach(endorsement.skillScores, function(score, key){
              endorsetScore += parseFloat(score);
              totalScoreItem++;
            });
            angular.forEach(endorsement.projectScores, function(score, key){
              endorsetScore += parseFloat(score);
              totalScoreItem++;
            });
            var avgEndorsetScore = 0.0;
            if(totalScoreItem){
              avgEndorsetScore = endorsetScore/totalScoreItem;
            }
            endorsements[key].avgEndorsetScore = $filter('number')(avgEndorsetScore, 2);
          });

          //setEndorsementData({draftEndorsements: endorsements});

          $rootScope.endorsementData.draftEndorsements = endorsements;
          if($rootScope.endorsementData.draftEndorsements.length){
            if(selectEndorsement){

            } else {
              $rootScope.endorsementData.endorsement = $rootScope.endorsementData.draftEndorsements[0];
              if($rootScope.endorsementData.draftEndorsements[0].questions){
                $rootScope.endorsementData.endorserEndorsement.questions = $rootScope.endorsementData.draftEndorsements[0].questions;
              }
            }

          }
          //console.log($rootScope.endorsementData);
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };


    //fetch received endorsements data
    var loadEndorsementReceivedData = function(profileId, currentInstance, profileIds, callback){
      if(currentInstance == undefined){
        currentInstance = null;
      }
      if(profileIds == undefined){
        profileIds.push(profileId);
      }
      EndorsementService.getEndorserEndorsement(
        {

          filter:{
            where:{
              isDraft: false,
              userProfileId: {inq: profileIds}
            },
            limit: 30,
            "include": [
              {
                "endorsement":[
                  "userDetail",
                  {
                    "endorsementCompanies":[
                      "endorsementProjects"
                    ]
                  }
                ]
              },
              "userProfile",
              "userDetail",
              "endorsets",
              { "questions": [
                "endorser",
                {
                  "questions":[
                    "endorser",
                    {
                      "questions":[
                        "endorser"
                      ]
                    }
                  ]
                }
              ]
              }
            ]
          }
        },
        function(endorsements) {
          angular.forEach(endorsements, function(endorsement, key){
            var endorsetScore = 0;
            var totalScoreItem = 0;
            angular.forEach(endorsement.skillScores, function(score, key){
              endorsetScore += parseFloat(score);
              totalScoreItem++;
            });
            angular.forEach(endorsement.projectScores, function(score, key){
              endorsetScore += parseFloat(score);
              totalScoreItem++;
            });
            var avgEndorsetScore = 0.0;
            if(totalScoreItem){
              avgEndorsetScore = endorsetScore/totalScoreItem;
            }
            endorsements[key].avgEndorsetScore = $filter('number')(avgEndorsetScore, 2);

          });
          $rootScope.endorsementData.receivedEndorsements = endorsements;

          if($rootScope.endorsementData.receivedEndorsements.length && currentInstance == null){

            $rootScope.endorsementData.endorsement = $rootScope.endorsementData.receivedEndorsements[0];

            if($rootScope.endorsementData.receivedEndorsements[0].questions){
              $rootScope.endorsementData.endorserEndorsement.questions = $rootScope.endorsementData.receivedEndorsements[0].questions;
            }
          }
          if(callback != undefined){
            callback(endorsements);
          }


        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    return {
      setEndorsements: setEndorsements,
      getEndorsements: getEndorsements,
      setDraftEndorsements: setDraftEndorsements,
      getDraftEndorsements: getDraftEndorsements,
      getReceivedData: getReceivedData,
      setReceivedData: setReceivedData,
      loadRequestsData: loadRequestsData,
      loadReceivedData: loadReceivedData,
      getEndorsementData: getEndorsementData,
      setEndorsementData: setEndorsementData,
      loadEndorsementSentData: loadEndorsementSentData,
      loadEndorsementDraftData: loadEndorsementDraftData,
      loadEndorsementReceivedData: loadEndorsementReceivedData,
      getEndorsementRequest: getEndorsementRequest
    };

  });
