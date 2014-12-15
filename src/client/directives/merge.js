// *****************************************************
// Merge Directive
// *****************************************************

module.directive('mergeButton', ['$HUB', '$stateParams', '$timeout', function($HUB, $stateParams, $timeout) {
    return {
        restrict: 'E',
        templateUrl: '/directives/templates/merge.html',
        scope: {
            pull: '=',
            status: '='
        },
        link: function(scope, elem, attrs) {

            var text = {
                failure: 'failed',
                pending: 'pending',
                success: 'succeeded'
            };

            $HUB.call('gitdata', 'getReference', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                ref: 'heads/' + scope.pull.head.ref
            }, function(err, ref) {
                if(!err) {
                    scope.branch = true;
                }
            });

            scope.$watch('status', function(status) {
                var state = status ? status.state : null;
                if(state) {
                    scope.status.count = 0;
                    scope.status.text = text[state];
                    scope.status.statuses.forEach(function(status) {
                        if(status.state === state) {
                            scope.status.count++;
                        }
                    });
                }

                // the default status
                scope.status = scope.status || {
                    state: 'pending',
                    statuses: []
                };
            });

            scope.deleteBranch = function() {
                scope.showConfirmation = false;
                $HUB.call('gitdata', 'deleteReference', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    ref: 'heads/' + scope.pull.head.ref
                }, function(err, result) {
                    if(!err) {
                        scope.branch = false;
                    }
                });
            };

            scope.mergeable = function() {
                return scope.pull.ninjafile.threshold <= scope.pull.stars.length && scope.pull.mergeable;
            };

            scope.merge = function() {
                scope.merging = $HUB.call('pullRequests', 'merge', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number
                });
            };

            //
            // Helper funtion
            //

            scope.confirm = function() {
                scope.showConfirmation = true;
                $timeout(function() {
                    scope.showConfirmation = false;
                }, 10000);
            };
        }
    };
}]);
