import { setup, teardown, setupAdmin } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
const COLLECTION_NAME = 'qualifyingTests';

describe(COLLECTION_NAME, () => {
  afterEach(async () => {
    await teardown();
  });

  const today = new Date();
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  // const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  const dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
  // const dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));

  const mockData = { 'qualifyingTests/qt1': { type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow } };
  const mockUnverifiedUser = { uid: 'user1', email: 'user@email.com', email_verified: false };
  const mockVerifiedUser = { uid: 'user1', email: 'user@email.com', email_verified: true };
  const mockUnverifiedJACUser = { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false };
  const mockVerifiedJACUser = { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true };
  const mockVerifiedJACDigitalUser = { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true };

  context('Create', () => {
    it('prevent un-authenticated user from creating a qualifying test', async () => {
      const db = await setup();
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user from creating a qualifying test', async () => {
      const db = await setup(mockUnverifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified email from creating a qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    /** */
    xit('prevent authenticated user with un-verified JAC email from creating a qualifying test', async () => {
      const db = await setup(mockUnverifiedJACUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('allow authenticated user with verified @judicialappointments.digital email to create a qualifying test', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await assertSucceeds(db.collection(COLLECTION_NAME).add(mockData));
    });

    // SKIP: The email verified is not implemented on QT
    xit('allow authenticated user with verified @judicialappointments.gov.uk email to create a qualifying test', async () => {
      const db = await setup(mockVerifiedJACUser);
      await assertSucceeds(db.collection(COLLECTION_NAME).add(mockData));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from listing qualifying tests', async () => {
      const db = await setup();
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('prevent authenticated user from listing qualifying tests', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('allow JAC admin to list qualifying tests', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).get());
    });

    it('prevent un-authenticated user from reading qualifying test data', async () => {
      const db = await setup();
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').get());
    });

    it('prevent authenticated user from reading qualifying test data', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').get());
    });

    it('allow JAC admin to read qualifying test data', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a qualifying test', async () => {
      const db = await setup();
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user from updating a qualifying test', async () => {
      const db = await setup(mockUnverifiedUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with verified email from updating a qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    // SKIP: The email verified is not implemented on QT
    xit('prevent authenticated user with un-verified JAC email from updating a qualifying test', async () => {
      const db = await setup(mockUnverifiedJACUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email to update a qualifying test', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email to update a qualifying test', async () => {
      const db = await setup(mockVerifiedJACUser);
      await setupAdmin(mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a qualifying test', async () => {
      const db = await setup();
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('prevent authenticated user from deleting someone elses assessment data', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('prevent authenticated user from deleting own assessment data', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    // SKIP: The it's not implemented
    xit('prevent authenticated user with verified @judicialappointments.gov.uk email from deleting own assessment data', async () => {
      const db = await setup(mockVerifiedJACUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    // SKIP: The it's not implemented
    xit('prevent authenticated user with verified @judicialappointments.digital email from deleting own assessment data', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
  });

});
