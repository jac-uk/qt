import firestore from '@google-cloud/firestore';
import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';
import initSlack from '../../shared/slack.js';

const client = new firestore.v1.FirestoreAdminClient();

export default (config, firebase, db) => {
  const slack = initSlack(config);
  return {
    backupFirestore,
    backupFirestoreWhenBusy,
  };

  async function backupFirestoreWhenBusy() {
    const settingsRef = db.collection('settings').doc('services');
    const settings = await getDocument(settingsRef);
    if (!settings.backupFirestoreWhenBusy) return false;
    if (!settings.backupFirestoreWhenBusy.enabled) return false;
    const responses = await getDocuments(
      db.collection('qualifyingTestResponses')
      .where('lastUpdated', '>', settings.backupFirestoreWhenBusy.lastStarted)
      .limit(settings.backupFirestoreWhenBusy.numberOfChanges)
      .select()
    );
    if (responses && responses.length === settings.backupFirestoreWhenBusy.numberOfChanges) {
      const data = {};
      data['backupFirestoreWhenBusy.lastStarted'] = firebase.firestore.FieldValue.serverTimestamp(),
      await applyUpdates(db, [{
        command: 'update',
        ref: settingsRef,
        data: data,
      }]);
      await backupFirestore();
      return true;
    }
    return false;
  }

  async function backupFirestore() {
    const BACKUP_BUCKET = `${config.PROJECT_ID}-backups`;
    const BACKUP_PATH = 'firestore';
    const exportPath = `gs://${BACKUP_BUCKET}/${BACKUP_PATH}/${(new Date()).toISOString()}`;
    const databaseName = client.databasePath(config.PROJECT_ID, '(default)');
    try {
      console.log('Exporting firestore (i.e., taking database backup)...');
      await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: exportPath,
        collectionIds: [],
      });
    } catch (err) {
      await slack.post(`ERROR: Firestore backup to ${exportPath} failed. ${JSON.stringify(err)}`);
      console.log('backupFirestore error', JSON.stringify(err));
      throw new Error('Export operation failed');
    }
  }

};
