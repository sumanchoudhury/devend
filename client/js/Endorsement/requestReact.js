'use strict'
function createShowSubItemClickHandler(reactComponent) {
  var scope = reactComponent.props.scope;
  return scope.$apply.bind(
    scope,
    scope.onReactShowSubItemClick.bind(null, reactComponent)
  );
}
function createUpdateSubItemClickHandler(reactComponent) {
  var scope = reactComponent.props.scope;
  return scope.$apply.bind(
    scope,
    scope.onReactUpdateSubItemClick.bind(null, reactComponent)
  );
}

angular
  .module('app')
  .factory( "endorsementSentRequest", function( $filter ) {
    return React.createClass({
      propTypes : {
        endorsements: React.PropTypes.object.isRequired
      },

      getDefaultProps: function() {
        return { endorsements: [] };
      },
      render: function() {
        console.log(this);
        //var scope = this.props.scope;
        var itemClickHandler = function(endorsement){
          console.log(endorsement);
          //scope.$apply.bind( scope, scope.onReactUpdateSubItemClick.bind(endorsement));
        };

        var createEndorsement = function(endorsement, index) {
          var seen;
          if(endorsement.endorserSeenAt != undefined){
            seen = React.DOM.span(null, 'Seen ', React.DOM.span({amTimeAgo: endorsement.endorserSeenAt}, ' '));

          }
          var endorserAcceptStatus;
          if(endorsement.endorserAcceptStatus == 1){
            endorserAcceptStatus = React.DOM.span(null, "Accepted");
          } else if(endorsement.endorserAcceptStatus == 2){
            endorserAcceptStatus = React.DOM.span(null, "Declined");
          } else {
            endorserAcceptStatus = React.DOM.span(null, "Pending");
          }


          return React.DOM.li(
            {
              key: index,
              className: 'list-group-item link',
              onClick: itemClickHandler(endorsement)
            },
            React.DOM.p(null, React.DOM.span(null, endorsement.firstName + " " + endorsement.lastName), React.DOM.span({amTimeAgo: endorsement.created}, '') ),
            React.DOM.p(null, seen, endorserAcceptStatus)
          );
        };
        return React.DOM.ul({className: 'list-group'}, this.props.endorsements.map(createEndorsement));
      }
    });
  })
  .directive('endorsementSentRequestList', function(reactDirective){
    return reactDirective( 'endorsementSentRequest' );
  });