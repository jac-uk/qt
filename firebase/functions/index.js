
// Scheduled
// exports.backupFirestore = require('./scheduledFunctions/backupFirestore');
// exports.backupAuthentication = require('./scheduledFunctions/backupAuthentication');

// Background
exports.onDelete = require('./backgroundFunctions/onDelete');
exports.onQualifyingTestResponseUpdate = require('./backgroundFunctions/onQualifyingTestResponseUpdate');

// Callable
exports.api = require('./callableFunctions/api');
exports.createQualifyingTest = require('./callableFunctions/createQualifyingTest');
exports.listQualifyingTests = require('./callableFunctions/listQualifyingTests');
exports.activateQualifyingTest = require('./callableFunctions/activateQualifyingTest');
exports.exportQualifyingTestResponses = require('./callableFunctions/exportQualifyingTestResponses');
exports.initialiseQualifyingTest = require('./callableFunctions/initialiseQualifyingTest');
exports.logEvent = require('./callableFunctions/logEvent');
exports.scoreQualifyingTest = require('./callableFunctions/scoreQualifyingTest');

// admin call api
exports.adminCallAPI = require('./callableFunctions/admin.callAPI');
