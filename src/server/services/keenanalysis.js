var Keen = require('keen.io');
var keenconfig = require('./keenconfig');

module.exports = function() {
    var client = Keen.configure(keenconfig);

    this.allcommentsCount = function() {
        var count = new Keen.Query('count', {
            eventCollection: 'dev4-issues-createComment'
        });
        client.run(count, function(err, res) {
            if(err) {
                return console.log('Keen.io analysis error', err);
            }
            console.log(res);
        });
    };

    this.commentsPer = function() {
        var count = new Keen.Query('count', {
            eventCollection: 'dev4-issues-createComment'
        });
        client.run(count, function(err, res) {
            if(err) {
                return console.log('Keen.io analysis error', err);
            }
            console.log(res);
        });
    };
};
