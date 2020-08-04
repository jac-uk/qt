const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const slog = require('../sharedServices').slog;

const PROJECT_ID = functions.config().project.id;
const bucket = `gs://${PROJECT_ID}-backups/firestore/${(new Date()).toISOString()}`;
console.log('bucket = ', bucket);

//const FIRESTORE_BACKUP_SCHEDULE = 'every 1 hours synchronized';
const FIRESTORE_BACKUP_SCHEDULE = 'every day 23:00';

module.exports = functions.region('europe-west2')
                          .pubsub
                          .schedule(FIRESTORE_BACKUP_SCHEDULE)
                          .timeZone('Europe/London')
                          .onRun(() => {
  const databaseName = client.databasePath(PROJECT_ID, '(default)');
  console.log(`databaseName = ${databaseName}`);

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    // collectionIds: ['users', 'posts']
    collectionIds: [],
    })
  .then(responses => {
    const response = responses[0];
    slog(`SUCCESS: Firestore backup to ${bucket} succeeded`);
    console.log(`Operation Name: ${response['name']}`);
    return response;
  })
  .catch(err => {
    slog(`ERROR: Firestore backup to ${bucket} failed`);
    slog(err);
    throw new Error('Export operation failed');
  });
});
