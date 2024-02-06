import { createWorkerScript } from '@/helpers/browser';

const workerCode = () => {
  let countdown;             // setInterval reference
  const second = 1000;
  let saveCounter = 0;       // counter for autoSave
  let saveSeconds = 5;       // autoSave every 5 seconds
  let ticksPerSecond = 1;
  let end;                   // end time in milliseconds
  let serverTimeOffset;      // server time offset in milliseconds
  let previousTimeRemaining; // previous time remaining in milliseconds

  const getTimeRemaining = () => {
    const currentLocalTime = new Date().getTime();
    const now = currentLocalTime + serverTimeOffset;
    const timeRemaining = end - now;
    return timeRemaining;
  };

  const startCountdown = (payload) => {
    // stop previous countdown if exists
    if (countdown) {
      clearInterval(countdown);
    }

    // set new countdown
    saveSeconds = payload.saveSeconds;
    ticksPerSecond = payload.ticksPerSecond;
    end = payload.end;
    serverTimeOffset = payload.serverTimeOffset;

    const timeRemaining = getTimeRemaining();
    previousTimeRemaining = timeRemaining;
    postMessage({ action: 'update', payload: { timeRemaining } });

    countdown = setInterval(() => {
      saveCounter++;
      if (saveCounter === saveSeconds * ticksPerSecond) {
        postMessage({ action: 'autoSave' });
        saveCounter = 0;
      }
      if (saveCounter === (2 * ticksPerSecond)) { // clean the autoSaver 2s after it is set to true
        postMessage({ action: 'cleanAutoSave' });
      }

      let timeRemaining = getTimeRemaining();
      const diff = Math.abs(previousTimeRemaining - timeRemaining);
      // check if time remaining has changed by more than 2 seconds to avoid local time changes
      if (diff > second * 2) {
        // adjust current time remaining based on previous value
        timeRemaining = previousTimeRemaining - second;
        postMessage({ action: 'refresh' });
      }
      previousTimeRemaining = timeRemaining;
      postMessage({ action: 'update', payload: { timeRemaining } });

      if (timeRemaining <= 0) {
        postMessage({ action: 'ended' });
        clearInterval(countdown);
      }
    }, second / ticksPerSecond);
  };

  const stopCountdown = () => {
    clearInterval(countdown);
  };

  // listen to messages from the main thread
  onmessage = function (e) {
    if (e.data.action === 'start') {
      startCountdown(e.data.payload);
    } else if (e.data.action === 'stop') {
      stopCountdown();
    }
  };
};

const workerScript = createWorkerScript(workerCode);

export default workerScript;
