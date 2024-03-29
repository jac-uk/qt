const getIPAddress = async () => {
  let ip = '';
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ip = data.ip;
  } catch (error) {
    ip = '';
  }
  return ip;
};

// Implement a function to get the browser meta since vue-browser-detect-plugin does not support Vue 3
// ref: https://github.com/ICJIA/vue-browser-detect-plugin/blob/master/src/main.js
const getBrowserDetect = () => {
  const ua = window.navigator.userAgent;
  const browserObj = {};

  // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
  browserObj.isOpera =
    !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  // Firefox 1.0+
  browserObj.isEdge = /Edg/.test(navigator.userAgent);
  browserObj.isFirefox = /Firefox/.test(navigator.userAgent);
  // Safari 3.0+
  /*eslint-disable */
  browserObj.isSafari =
    /constructor/i.test(window.HTMLElement) ||
    (function(p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(!window["safari"] || safari.pushNotification);
  /*eslint-ensable */
  // Internet Explorer 6-11
  browserObj.isIE = /*@cc_on!@*/ false || !!document.documentMode;
  // Edge 20+

  browserObj.isChrome = /Google Inc/.test(navigator.vendor) && !browserObj.isEdge;
  browserObj.isChromeIOS = /CriOS/.test(navigator.userAgent);
  browserObj.isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  browserObj.isBrave = (typeof navigator.brave !== "undefined");

  browserObj.meta = browserSpecs();
  browserObj.meta.ua = ua;

  function browserSpecs() {
    /**
     * https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
     */
    var tem,
      M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: "IE", version: tem[1] || "" };
    }
    if (M[1] === "Chrome") {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null)
        return { name: tem[1].replace("OPR", "Opera"), version: tem[2] };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return { name: M[0], version: M[1] };
  }

  return browserObj;
};

// Check if web worker is supported
const isWebWorkerSupported = () => {
  return typeof Worker !== 'undefined';
};

// Create a worker script from a function
// ref: https://medium.com/@adithyaviswam/overcoming-browser-throttling-of-setinterval-executions-45387853a826
const createWorkerScript = (workerCode) => {
  let code = workerCode.toString();
  code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));
  const blob = new Blob([code], { type: 'application/javascript' });
  const workerScript = URL.createObjectURL(blob);
  return workerScript;
};

export {
  getIPAddress,
  getBrowserDetect,
  isWebWorkerSupported,
  createWorkerScript,
};
