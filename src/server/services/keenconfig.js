var config = require('../../config');

module.exports = {
    projectId: config.server.keen.projectid,
    writeKey: config.server.keen.writekey,
    readKey: config.server.keen.readkey,
    masterKey: config.server.keen.masterkey
};
