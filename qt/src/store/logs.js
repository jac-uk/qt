import { firestore } from '@/firebase';
import { doc, collection, serverTimestamp, setDoc } from '@firebase/firestore';

const collectionRef = collection(firestore, 'logs');

export default {
  namespaced: true,
  actions: {
    save: async (context, obj) => {
      let ref = doc(collectionRef, obj.type);
      ref = doc(collection(ref, obj.id));
      setDoc(
        ref,
        {
          data: obj.data,
          type: obj.type,
          date: serverTimestamp(),
        }
      );
    },
  },
};
