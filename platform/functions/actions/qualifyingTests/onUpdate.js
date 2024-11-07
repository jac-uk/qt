import { applyUpdates, getDocuments } from '../../shared/helpers.js';

export default (config, firebase, db) => {
  return onUpdate;

  /**
   * Qualifying Test event handler for Update
   * - if message has changed then update all Qualifying Test Responses
   */
  async function onUpdate(qualifyingTestId, dataBefore, dataAfter) {
    const commands = [];

    const msgInDataBefore = 'message' in dataBefore;
    const msgInDataAfter = 'message' in dataAfter;

    const msgRemoved = msgInDataBefore && !msgInDataAfter || (dataBefore.message !== '' && dataAfter.message === '');
    const msgAdded = !msgInDataBefore && msgInDataAfter;
    const msgUpdated = msgInDataBefore && msgInDataAfter && (dataBefore.message !== dataAfter.message);

    const msgChanged = msgRemoved || msgAdded || msgUpdated;

    if (msgChanged) {

      // Get QTR records for this QT
      const qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
        .where('qualifyingTest.id', '==', qualifyingTestId)
        .select('id');
      const qualifyingTestResponseRecords = await getDocuments(qualifyingTestResponsesRef);
      const qualifyingTestResponseRecordIds = qualifyingTestResponseRecords.map(item => item.id);
      for (let i = 0, len = qualifyingTestResponseRecordIds.length; i < len; ++i) {
        const qualifyingTestResponseRecordId = qualifyingTestResponseRecordIds[i];
        commands.push({
          command: 'update',
          ref: db.collection('qualifyingTestResponses').doc(qualifyingTestResponseRecordId),
          data: {
            message: dataAfter.message,
          },
        });
      }
    }

    if (commands.length) {
      const result = await applyUpdates(db, commands);
      return result ? true : false;
    }
    return true;
  }
};
