const { applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  const { sendEmail } = require('../../shared/notify')(config);

  return onUpdate;

  /**
   * Qualifying Test Response event handler for Update
   * - if status has changed to started or completed update counts in qualifyingTest
   * - if document has been moved to another qualifyingTest then update counts in both tests
   */
  async function onUpdate(dataBefore, dataAfter) {
    if (dataBefore.status !== dataAfter.status) {
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const qualifyingTestId = dataBefore.qualifyingTest.id;
      const data = {};
      const statusBefore = dataBefore.status;
      const statusAfter = dataAfter.status;
      // started test
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED
      ) {
        data[`counts.${statusAfter}`] = increment;
        data['counts.inProgress'] = increment;
      }
      // completed test
      if (
        statusBefore === config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED &&
        statusAfter === config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED
      ) {
        data[`counts.${statusAfter}`] = increment;
        data['counts.inProgress'] = decrement;
        if (dataAfter.isOutOfTime) {
          data['counts.outOfTime'] = increment;
        }

        // Send email to candidate confirming their test response has been received
        const participantEmail = dataAfter.participant.email;
        const templateId  = '3717496b-69d7-4eab-b6bd-3b7815e4efc6';
        const testType = ('type' in dataAfter && dataAfter.type) ? dataAfter.type
          .replace(/([a-z])([A-Z])/g, '$1 $2')  // insert a space between lower & upper & make lowercase
          .toLowercase() : '';
        const personalisation = {
          testTitle: dataAfter.qualifyingTest.title,
          testType: testType,
          feedbackSurvey: dataAfter.qualifyingTest.feedbackSurvey,
        };
        sendEmail(participantEmail, templateId, personalisation);
      }
      if (Object.keys(data).length > 0) {
        await db.doc(`qualifyingTests/${qualifyingTestId}`).update(data);
      }
    }
    if (dataBefore.qualifyingTest.id !== dataAfter.qualifyingTest.id) {
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const updateBefore = {
        'counts.initialised': decrement,
      };
      const updateAfter = {
        'counts.initialised': increment,
      };
      const commands = [];
      commands.push({
        command: 'update',
        ref: db.collection('qualifyingTests').doc(dataBefore.qualifyingTest.id),
        data: updateBefore,
      });
      commands.push({
        command: 'update',
        ref: db.collection('qualifyingTests').doc(dataAfter.qualifyingTest.id),
        data: updateAfter,
      });
      const result = await applyUpdates(db, commands);
      return result;
    }
    return true;
  }

};
