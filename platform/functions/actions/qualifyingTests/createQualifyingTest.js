import { getDocument, getDocuments, lookup } from '../../shared/helpers';

export default (config, firebase, db) => {

  return createQualifyingTest;

  /**
  * createQualifyingTest
  * Creates a qualifyingTest document
  * @param {*} `params` is an object containing
  *   `folder` (required) Name of parent folder for test
  *   `test` (required) object containing the test details
  */
  async function createQualifyingTest(params) {

    if (!params) return { success: false, message: 'No params' };
    if (!params.folder) return { success: false, message: 'No folder' };
    if (!params.test) return { success: false, message: 'No test details' };

    // create folder if it doesn't already exist
    const folderRef = db.collection('folders').where('name', '==', params.folder);
    let folder = await getDocuments(folderRef);
    if (folder.length) {
      folder = folder[0];
    } else {
      folder = await db.collection('folders').add({
        name: params.folder,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      });
      folder = await getDocument(folder);
    }

    // create test
    const data = {
      title: params.test.title || `${lookup(config, params.test.type)} for ${params.folder}`,
      type: params.test.type,
      folderId: folder.id,
      startDate: new Date(params.test.startDate),
      endDate: new Date(params.test.endDate),
      status: config.QUALIFYING_TEST.STATUS.CREATED,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      statusLog: {},
      counts: {},
    };
    data.statusLog[config.QUALIFYING_TEST.STATUS.CREATED] = firebase.firestore.FieldValue.serverTimestamp();
    const testRef = await db.collection('qualifyingTests').add(data);

    return {
      success: true,
      message: 'Test created successfully',
      folderId: folder.id,
      testId: testRef.id,
    };

  }

};
