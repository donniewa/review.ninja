// *****************************************************
// Pull Request Controller
//
// tmpl: pull/pull.html
// path: /:user/:repo/pull/:number
// resolve: repo, pull
// *****************************************************

module.controller('PullCtrl', ['$scope', '$state', '$stateParams', '$modal', '$HUB', '$RPC', 'repo', 'pull', 'socket', 'Pull',
    function($scope, $state, $stateParams, $modal, $HUB, $RPC, repo, pull, socket, Pull) {

        // get the repo
        $scope.repo = repo.value;

        // get the pull request
        $scope.pull = Pull.issues(pull.value);
        $scope.base = $scope.pull.base.sha;
        $scope.head = $scope.pull.head.sha;

        // file reference
        $scope.reference = {};
        $scope.selection = [];

        // get the files (for the diff view)
        $scope.files = $HUB.wrap('pullRequests', 'getFiles', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            number: $stateParams.number
        });

        // get the tree (for the file browser)
        $scope.tree = $HUB.call('gitdata', 'getTree', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            sha: $scope.head
        });

        // get the star
        $scope.star = $RPC.call('star', 'get', {
            sha: $scope.head,
            repo_uuid: $scope.repo.id
        });

        // get the users for each star
        $scope.pull.stars.forEach(function(star) {
            star.user = $HUB.call('user', 'getFrom', {
                user: star.name
            });
        });

        // get the pull req comments
        $scope.comments = $HUB.wrap('issues', 'getComments', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            number: $stateParams.number
        });


        //
        // Events
        //

        $scope.$on('issue:set', function(event, issue) {
            $scope.issue = issue;
            $scope.selection = [];
        });

        $scope.$on('reference:set', function(event, issues) {

            var reference = [];

            issues.forEach(function(issue) {
                if(issue.sha && issue.ref) {

                    var key = issue.sha + '/' + issue.ref;

                    if(!reference[key]) {
                        reference[key] = [];
                    }

                    reference[key].push({
                        ref: issue.ref,
                        sha: issue.sha,
                        issue: issue.number
                    });
                }
            });

            $scope.reference = reference;
        });

        $scope.$on('issue:open', function(event, issue) {
            $scope.pull = Pull.issues($scope.pull);
        });

        $scope.$on('issue:closed', function(event, issue) {
            $scope.pull = Pull.issues($scope.pull);
        });


        //
        // Actions
        //

        $scope.compComm = function(base, head) {

            if(($scope.base!==base || $scope.head!==head) && base!==head) {
                console.log('here yo');
                $HUB.wrap('repos', 'compareCommits', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    base: base,
                    head: head
                }, function(err, res) {
                    if(!err) {
                        $scope.base = base;
                        $scope.head = head;
                        $scope.files.value = res.value.files;
                    }
                });
            }
        };

        $scope.merge = function() {
            $scope.merging = $HUB.call('pullRequests', 'merge', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                number: $stateParams.number
            }, function(err, res) {

                // todo: handle error or unmerged

                if(!err && res.value.merged) {
                    $scope.refreshPullRequest();
                }
            });
        };

        $scope.toggle = function() {

            var fn = $scope.star.value ? 'rmv' : 'set';

            $RPC.call('star', fn, {
                repo: $stateParams.repo,
                user: $stateParams.user,
                sha: $scope.head,
                number: $stateParams.number,
                repo_uuid: $scope.repo.id
            }, function(err, star) {
                if(!err) {
                    $scope.star.value = fn === 'set' ? star.value : null;
                }
            });
        };

        $scope.refreshStars = function() {
            $RPC.call('star', 'all', {
                sha: $scope.head,
                repo_uuid: $scope.repo.id
            }, function(err, stars) {
                if(!err) {
                    $scope.pull.stars = stars.value;
                    $scope.pull.stars.forEach(function(star) {
                        star.user = $HUB.call('user', 'getFrom', {
                            user: star.name
                        });
                    });
                }
            });
        };

        $scope.refreshPullRequest = function() {
            $scope.refreshing = $HUB.wrap('pullRequests', 'get', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                number: $stateParams.number
            }, function(err, pull) {
                if(!err) {
                    $scope.pull = Pull.issues(pull.value);
                }
            });
        };

        $scope.addComment = function() {
            if($scope.comment) {
                $scope.commenting = $HUB.wrap('issues', 'createComment', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number,
                    body: $scope.comment
                }, function(err, comment) {
                    if(!err) {
                        $scope.comment = null;
                        $scope.comments.value.push(comment.value);
                    }
                });
            }
        };

        $scope.badge = function() {
            var modal = $modal.open({
                templateUrl: '/modals/templates/badge.html',
                controller: 'BadgeCtrl'
            });
        };

        //
        // Websockets
        //

        socket.on($stateParams.user + ':' + $stateParams.repo + ':pull-request-' + $stateParams.number + ':starred', function() {
            $scope.refreshStars();
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':pull-request-' + $stateParams.number + ':unstarred', function() {
            $scope.refreshStars();
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':pull-request-' + $stateParams.number + ':merged', function() {
            if(!$scope.pull.value.merged && !$scope.refreshing.loading) {
                $scope.refreshPullRequest();
            }
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':issue-comment-' + $scope.number, function(id) {
            $HUB.call('issues', 'getComment', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                id: id
            }, function(err, comment) {
                if(!err && comment.value.user.id !== $rootScope.user.value.id) {
                  $scope.comments.value.push(comment.value);
                }
            });
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':pull-request-' + $stateParams.number + ':synchronize', function(head) {
            
            // update comparison
            $scope.compComm($scope.base, head);

            // update tree
            $HUB.call('gitdata', 'getTree', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                sha: head
            }, function(err, res) {
                if(!err) {
                    $scope.tree.value =  res.value;
                }
            });
        });
    }
]);
