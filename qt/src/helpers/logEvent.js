import { functions } from '@/firebase';
import { httpsCallable } from '@firebase/functions';

const logEvent = async (type, description, details) => {
  return await httpsCallable(functions, 'logEvent')({
    type: type,
    description: description,
    details: details,
  });
};

export { logEvent };
