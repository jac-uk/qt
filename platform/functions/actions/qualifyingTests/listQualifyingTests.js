import { getDocuments } from '../../shared/helpers.js';

export default (config, firebase, db) => {

  return listQualifyingTests;

  /**
  * listQualifyingTests
  * Lists qualifying tests in a folder
  * @param {*} `params` is an object containing
  *   `folder` (required) Name of parent folder for test
  */
  async function listQualifyingTests(params) {

    if (!params) return { success: false, message: 'No params' };
    if (!params.folder) return { success: false, message: 'No folder' };

    // get matching folder
    const folderRef = db.collection('folders').where('name', '==', params.folder);
    let folder = await getDocuments(folderRef);
    if (folder.length) {
      folder = folder[0];
    } else {
      return { success: false, message: 'No folder' };
    }

    // get qualifying tests
    const qualifyingTests = await getDocuments(db.collection('qualifyingTests').where('folderId', '==', folder.id));
    const data = qualifyingTests.filter(qt => ['dry-run', 'mop-up'].indexOf(qt.mode) < 0).map(qt => {
      return {
        id: qt.id,
        title: qt.title,
        type: qt.type,
      };
    });

    return {
      success: true,
      data: data,
    };

  }

};
