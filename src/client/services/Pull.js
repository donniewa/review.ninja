// *****************************************************
// Pull Factory
// *****************************************************

module.factory('Pull', ['$HUB', '$RPC', '$stateParams', function($HUB, $RPC, $stateParams) {

    return {

        milestone: function(pull) {

            if(pull.milestone) {
                $HUB.call('issues', 'getMilestone', {
                    user: pull.base.repo.owner.login,
                    repo: pull.base.repo.name,
                    number: pull.milestone.number
                }, function(err, milestone) {
                    if(!err) {
                        pull.milestone = milestone.value;
                    }
                });
            }

            return pull;
        },

        render: function(pull) {

            if(pull.body) {
                $HUB.wrap('markdown', 'render', {
                    text: pull.body,
                    mode: 'gfm',
                    context: $stateParams.user + '/' + $stateParams.repo
                }, function(err, markdown) {
                    if(!err) {
                        pull.html = markdown.value.body;
                    }
                });
            }

            return pull;
        },

        stars: function(pull) {

            $RPC.call('star', 'all', {
                sha: pull.head.sha,
                repo_uuid: pull.base.repo.id
            }, function(err, stars) {
                if(!err) {
                    pull.stars = stars.value;
                    pull.stars.forEach(function(star) {
                        star.user = $HUB.call('user', 'getFrom', {
                            user: star.name
                        });
                    });
                }
            });

            return pull;
        },

        threshold: function(pull) {
            $RPC.call('star', 'threshold', {
                user: pull.head.user.login,
                repo: pull.head.repo.name,
                ref: pull.head.ref
            }, function(err, threshold) {
                if(!err) {
                    pull.threshold = threshold.value;
                }
            });
            return pull;
        }
    };
}]);
