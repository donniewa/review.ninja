var url = require('./url');
var github = require('./github');
var Star = require('mongoose').model('Star');
var Milestone = require('mongoose').model('Milestone');

module.exports = {
    update: function(args, done) {

        Star.find({repo: args.repo_uuid, sha: args.sha}, function(err, stars) {

            stars = stars || [];

            Milestone.findOne({
                pull: args.number,
                repo: args.repo_uuid
            }, function(err, milestone) {

                github.call({
                    obj: 'issues',
                    fun: 'getMilestone',
                    arg: {
                        user: args.user,
                        repo: args.repo,
                        number: milestone ? milestone.number : null
                    },
                    token: args.token
                }, function(err, milestone) {

                    var issues = milestone ? milestone.open_issues : 0;

                    var status = issues ? 'failure' : stars.length ? 'success' : 'pending';
                    github.call({
                        obj: 'statuses',
                        fun: 'create',
                        arg: {
                            user: args.user,
                            repo: args.repo,
                            sha: args.sha,
                            state: status,
                            description: 'ReviewNinja: ' + stars.length + (stars.length === 1 ? ' star, ' : ' stars, ') + issues + (issues === 1 ? ' issue' : ' issues'),
                            target_url: url.reviewPullRequest(args.user, args.repo, args.number),
                            context: 'code-review/reviewninja'
                        },
                        token: args.token
                    }, done);
                });
            });
        });
    }
};
