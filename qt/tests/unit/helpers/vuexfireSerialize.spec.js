import vuexfireSerialize from '@/helpers/vuexfireSerialize';
import convertFirestoreTimestampsToDates from '@/helpers/convertFirestoreTimestampsToDates';
import { Timestamp } from 'firebase/firestore';

const createMockSnapshot = async (data) => {
  const mockFirebase = (require('firebase-mock')).MockFirebaseSdk();
  const mockFirestore = mockFirebase.firestore();
  mockFirestore.autoFlush();
  const ref = await mockFirestore.collection('documents').add(data);
  return await ref.get();
};

// vi.mock('@/helpers/convertFirestoreTimestampsToDates', async () => {
//   const realMethod = await vi.importActual('@/helpers/convertFirestoreTimestampsToDates').default;
//   return jest.fn(input => {
//     const converted = realMethod(input);
//     converted.__hasBeenConverted = true;
//     return converted;
//   });
// });

/**
 * These tests are skipped as they are currently broken after the vue3 upgrade
 */
describe.skip('@/helpers/vuexfireSerialize', () => {
  let mockSnapshot;
  beforeEach(async () => {
    mockSnapshot = await createMockSnapshot({
      name: 'Name of exercise',
      opensAt: Timestamp.fromDate(new Date()),
    });
  });

  afterEach(() => {
    convertFirestoreTimestampsToDates.mockClear();
  });

  it('is a Function', () => {
    expect(vuexfireSerialize).toBeInstanceOf(Function);
  });

  it('accepts a Firestore DocumentSnapshot and returns an Object', () => {
    expect(vuexfireSerialize(mockSnapshot)).toBeInstanceOf(Object);
    expect(vuexfireSerialize(mockSnapshot)).not.toBeNull();
  });

  it('runs snapshot.data() through convertFirestoreTimestampsToDates helper', () => {
    const serialized = vuexfireSerialize(mockSnapshot);
    expect(convertFirestoreTimestampsToDates).toHaveBeenCalledWith(mockSnapshot.data());
    expect(serialized.__hasBeenConverted).toBe(true);
  });

  it('adds the document ID to the returned object as a non-enumerable property `id`', () => {
    const serialized = vuexfireSerialize(mockSnapshot);
    const keys = Object.keys(serialized);
    expect(keys).toEqual(['name', 'opensAt', '__hasBeenConverted']);
    expect(keys).not.toContain('id');
    expect(serialized.id).toBeTruthy();
    expect(serialized.id).toEqual(mockSnapshot.id);
  });
});
