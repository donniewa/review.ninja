var Keen = require('keen.io');
var keenconfig = require('./keenconfig');

module.exports = function() {
    var client = Keen.configure(keenconfig);

    function logerror(err) {
        return {
           status: 'error',
           errormessage: err.toString()
        }
    }

    function logsuccess(res) {
        // TODO log all relevant data here
        // TODO how to differentiate between the different log events
        return {
            response: res
        }
    }

    this.logevent = function(obj, fun, err, res) {
        var eventname =  'dev4-' + obj + '-' + fun;
        var logdata = err ? logerror(err) : logsuccess(res);

        client.addEvent(eventname, logdata, function(err, res) {
            if(err) {
                return console.log('Keen.io log error', err);
            }
        });
    }
};
