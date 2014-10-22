// *****************************************************
// Repo Controller
//
// tmpl: repo/repo.html
// path: /:user/:repo
// resolve: repo
// *****************************************************

module.controller('RepoCtrl', ['$scope', '$stateParams', '$modal', '$HUB', '$RPC', 'repo', 'Pull',
    function($scope, $stateParams, $modal, $HUB, $RPC, repo, Pull) {

        // get the repo
        $scope.repo = repo;

        // for the authors
        $scope.authors = {};
        $scope.author = null;

        // set the default state
        $scope.type = 'open';

        // get the open pull requests
        $scope.open = $HUB.wrap('pullRequests', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            state: 'open'
        }, function(err, res) {
            if(!err) {
                res.affix.forEach(function(pull) {
                    pull = Pull.issues(pull);
                    $scope.authors[pull.user.login] = true;
                });
            }
        });

        // get the closed pull requests
        $scope.closed = $HUB.wrap('pullRequests', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            state: 'closed'
        }, function(err, res) {
            if(!err) {
                res.affix.forEach(function(pull) {
                    pull = Pull.issues(pull);
                    $scope.authors[pull.user.login] = true;
                });
            }
        });

        //
        // Actions
        //

        $scope.badge = function() {
            var modal = $modal.open({
                templateUrl: '/modals/templates/badge.html',
                controller: 'BadgeCtrl'
            });
        };
    }
]);
