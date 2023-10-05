
// Scheduled
exports.backupFirestore = require('./scheduledFunctions/backupFirestore');
exports.backupFirestoreWhenBusy = require('./scheduledFunctions/backupFirestoreWhenBusy');
exports.backupAuthentication = require('./scheduledFunctions/backupAuthentication');

// Background
exports.onDelete = require('./backgroundFunctions/onDelete');
exports.onQualifyingTestResponseUpdate = require('./backgroundFunctions/onQualifyingTestResponseUpdate');
exports.onQualifyingTestUpdate = require('./backgroundFunctions/onQualifyingTestUpdate');

// Callable
exports.api = require('./callableFunctions/api');
exports.activateQualifyingTest = require('./callableFunctions/activateQualifyingTest');
exports.exportQualifyingTestResponses = require('./callableFunctions/exportQualifyingTestResponses');
exports.initialiseQualifyingTest = require('./callableFunctions/initialiseQualifyingTest');
exports.logEvent = require('./callableFunctions/logEvent');
exports.scoreQualifyingTest = require('./callableFunctions/scoreQualifyingTest');
exports.signIn = require('./callableFunctions/signIn');

// admin call api
exports.adminCallAPI = require('./callableFunctions/admin.callAPI');
