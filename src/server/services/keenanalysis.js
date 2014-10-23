var Keen = require('keen.io');
var config = require('../../config');

module.exports = function() {
    var prefix = 'dev90002';
    var client = Keen.configure(config.server.keen);

    this.starsPerPullRequest = function(user, repo, prid, done) {
        var countStar = new Keen.Query('count', {
            eventCollection: [prefix, user, repo, 'star', 'add'].join(),
            filters: [
                {
                    "property_name": "pull_request.id",
                    "operator": "eq",
                    "property_value": prid
                }
            ]
        });

        var countUnstar = new Keen.Query('count', {
            eventCollection: [prefix, user, repo, 'star', 'remove'].join(),
            filters: [
                {
                    "property_name": "pull_request.id",
                    "operator": "eq",
                    "property_value": prid
                }
            ]
        });

        client.run([countStar, countUnstar], function(err, res){
            if (err) {
                return console.log('Error', err);
            }
            done(null, res[0].result - res[1].result);
        });
    };
};
