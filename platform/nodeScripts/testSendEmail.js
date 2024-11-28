'use strict';

const config = require('./shared/config.js');
const { app } = require('./shared/admin.js');
const { sendEmail } = require('../functions/shared/notify.js')(config);

const participantEmail = '';
const templateId = '3717496b-69d7-4eab-b6bd-3b7815e4efc6';
const personalisation = {
  testTitle: 'Scenarios Test',
  testType: 'scenarioTest',
  feedbackSurvey: '',
};

const main = async () => {
  try {
    return await sendEmail(participantEmail, templateId, personalisation);
  } catch (error) {
    console.error(error);
  }
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.log(error);
    process.exit();
  });
