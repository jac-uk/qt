import { firestore, auth } from '@/firebase';
import { collection, query, where, orderBy, writeBatch, doc, getDocs,addDoc, updateDoc, serverTimestamp } from '@firebase/firestore';
import { firestoreAction } from '@/helpers/vuexfireJAC';
import vuexfireSerialize from '@jac-uk/jac-kit/helpers/vuexfireSerialize';
import tableQuery from '@jac-uk/jac-kit/components/Table/tableQuery';
import { QUALIFYING_TEST, QUALIFYING_TEST_RESPONSE } from '@/helpers/constants';
import { authorisedToPerformAction } from '@/helpers/authUsers';
import clone from 'clone';

const collectionRef = collection(firestore, 'qualifyingTestResponses');

export default {
  namespaced: true,
  actions: {
    bind: firestoreAction(async ({ bindFirestoreRef, state, commit }, params) => {

      const isSearchAdjustment = params.searchStatus === 'reasonable-adjustments';
      const isSearchStarted = params.searchStatus === QUALIFYING_TEST.STATUS.STARTED;
      const isSearchInProgress = params.searchStatus === QUALIFYING_TEST.STATUS.PROGRESS;
      const isSearchStatus = params.searchStatus !== 'all' && !isSearchAdjustment && params.searchStatus !== '' && !isSearchStarted && !isSearchInProgress;

      let firestoreRef = query(
        collectionRef,
        where('qualifyingTest.id', '==', params.qualifyingTestId)
      );

      if (isSearchStatus) {
        firestoreRef = query(
          firestoreRef,
          where('status', '==', params.searchStatus)
        );
      }

      if (isSearchAdjustment) {
        firestoreRef = query(
          firestoreRef,
          where('participant.reasonableAdjustments', '==', true)
        );
      }

      if (isSearchStarted) {
        firestoreRef = query(
          firestoreRef,
          where('statusLog.started', '>', new Date('1900-01-01')), // INCLUDE all items with a valid date - not null and not ''
          orderBy('statusLog.started')
        );
      }

      if (isSearchInProgress) {
        firestoreRef = query(
          firestoreRef,
          where('status', '==', QUALIFYING_TEST.STATUS.STARTED)
        );
      }

      firestoreRef = await tableQuery(state.records, firestoreRef, params);

      if (firestoreRef) {
        return bindFirestoreRef('records', firestoreRef, { serialize: vuexfireSerialize });
      } else {
        commit('records', []);
      }
    }),
    unbind: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('records');
    }),
    bindRecord: firestoreAction(({ bindFirestoreRef }, { id } ) => {
      const firestoreRef = doc(collectionRef, id);
      return bindFirestoreRef('record', firestoreRef, { serialize: vuexfireSerialize });
    }),
    unbindRecord: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('record');
    }),
    create: async (context, { data }) => {
      data.lastUpdated = serverTimestamp();
      return await addDoc(collectionRef, data);
    },
    update: async (context, { data, id }) => {
      data.lastUpdated = serverTimestamp();
      return await updateDoc(doc(collectionRef, id), data);
    },
    updateRA: async (context, { data, id }) => {
      // Update Reasonable Adjustments
      await context.dispatch('update', { data: data, id: id });
    },
    delete: (context, { id }) => {
      const batch = writeBatch(firestore);
      const timestamp = serverTimestamp();
      const data = {
        status: QUALIFYING_TEST_RESPONSE.STATUS.DELETED,
        lastUpdated: timestamp,
        statusLog: {
          'deleted': timestamp,
        },
      };
      const queryRef = query(collectionRef, where('application.id', '==', id));
      getDocs(queryRef)
        .then(async snapshot => {
          snapshot.forEach(response => {
            const ref = doc(collectionRef, response.id);
            batch.set(ref, data, { merge: true } );
          });
          await batch.commit();
        });
    },
    moveTest: async (context, { qualifyingTest, qualifyingTestResponse }) => {
      const qtData = {
        id: qualifyingTest.id,
        type: qualifyingTest.type,
        title: qualifyingTest.title,
        startDate: qualifyingTest.startDate,
        endDate: qualifyingTest.endDate,
        additionalInstructions: qualifyingTest.additionalInstructions,
        feedbackSurvey: qualifyingTest.feedbackSurvey,
      };

      const data = {
        qualifyingTest: qtData,
        testQuestions: [],
        status: QUALIFYING_TEST_RESPONSE.STATUS.CREATED,
        responses: qualifyingTestResponse.responses,
        'statusLog.started': null,
        'statusLog.completed': null,
      };

      await context.dispatch('update', { data: data, id: qualifyingTestResponse.id });
    },
    resetTest: async (context) => {
      const timestamp = serverTimestamp();
      const email = auth.currentUser.email;
      const canReset = await authorisedToPerformAction(email);
      if (canReset) {
        const rec = context.state.record;
        const data = {
          'status': 'activated',
          'statusLog.reset': timestamp,
          'statusLog.started': null,
        };
        if (rec.isOutOfTime === true) {
          data.isOutOfTime = false;
        }
        await context.dispatch('update', { data: data, id: rec.id });
      }
    },
    markAsCompleted: async (context) => {
      const email = auth.currentUser.email;
      const canMarkAsCompleted = await authorisedToPerformAction(email);
      if (canMarkAsCompleted) {
        const rec = context.state.record;
        const data = {
          'status': 'completed',
        };
        await context.dispatch('update', { data: data, id: rec.id });
      }
    },
  },
  mutations: {
    set(state, { name, value }) {
      state[name] = value;
    },
    records(state, data) {
      state.records = data;
    },
  },
  state: {
    records: [],
    record: null,
  },
  getters: {
    id: (state) => {
      if (state.record === null) return null;
      return state.record.id;
    },
    data: (state) => () => {
      return clone(state.record);
    },
  },
};
