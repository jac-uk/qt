<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <div
        class="govuk-panel govuk-panel--confirmation"
        :style="bannerStyle"
      >
        <h1 class="govuk-panel__title">
          {{ bannerText }}
        </h1>
      </div>

      <dl class="govuk-summary-list">
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Browser
          </dt>
          <template v-if="isModernBrowser">
            <dd class="govuk-summary-list__value">
              You are using a modern browser
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">PASS</span>
            </dd>
          </template>
          <template v-else>
            <dd class="govuk-summary-list__value">
              <p class="govuk-body">
                Your current browser is: <strong>{{ browserName }} version {{ browserVersion }}</strong>
              </p>
              <p>For the best experience please use:</p>
              <dl class="browser-list">
                <dd>Chrome version >= 87</dd>
                <dd>Edge version >= 88</dd>
                <dd>Safari version >= 14</dd>
                <dd>Firefox version >= 78</dd>
              </dl>
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--red">FAIL</span>
            </dd>
          </template>
        </div>

        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Javascript Enabled
          </dt>
          <dd class="govuk-summary-list__value">
            Javascript is enabled and working
          </dd>
          <dd class="govuk-summary-list__actions">
            <span class="moj-badge moj-badge--green">PASS</span>
          </dd>
        </div>

        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Firestore Connection
          </dt>

          <template v-if="checksComplete.firestore === false">
            <dd class="govuk-summary-list__value">
              Checking Firestore connection ...
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">CHECK</span>
            </dd>
          </template>
          <template v-else-if="isConnectedToFirestore">
            <dd class="govuk-summary-list__value">
              You are connected to Firestore
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">PASS</span>
            </dd>
          </template>
          <template v-else>
            <dd class="govuk-summary-list__value">
              You are not connected to Firestore
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--red">FAIL</span>
            </dd>
          </template>
        </div>

        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            RTDB Connection
          </dt>
          <template v-if="checksComplete.rtdb === false">
            <dd class="govuk-summary-list__value">
              Checking RTDB connection ...
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">CHECK</span>
            </dd>
          </template>
          <template v-else-if="isConnectedToRTDB">
            <dd class="govuk-summary-list__value">
              You are connected to the Realtime Database
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">PASS</span>
            </dd>
          </template>
          <template v-else>
            <dd class="govuk-summary-list__value">
              You are not connected to the Realtime Database
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--red">FAIL</span>
            </dd>
          </template>
        </div>

        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            IP Info
          </dt>
          <template v-if="checksComplete.ip === false">
            <dd class="govuk-summary-list__value">
              Checking IP ...
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">CHECK</span>
            </dd>
          </template>
          <template v-else-if="hasIP">
            <dd class="govuk-summary-list__value">
              Your IP address is accessible
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--green">PASS</span>
            </dd>
          </template>
          <template v-else>
            <dd class="govuk-summary-list__value">
              Your IP address is inaccessible
            </dd>
            <dd class="govuk-summary-list__actions">
              <span class="moj-badge moj-badge--red">FAIL</span>
            </dd>
          </template>
        </div>
      </dl>
    </div>
  </div>
</template>

<script>
import { firestore } from '@/firebase';
import { doc, getDoc } from '@firebase/firestore';
import { getIPAddress, getBrowserDetect } from '@/helpers/browser';

export default {
  name: 'BrowserTest',
  data () {
    return {
      ip: null,
      isConnectedToFirestore: false,
      checksComplete: {
        ip: false,
        rtdb: false,
        firestore: false,
      },
    };
  },
  computed: {
    allChecksComplete() {
      return this.checksComplete.firestore
        && this.checksComplete.ip
        && this.checksComplete.rtdb;
    },
    browserDetect() {
      return getBrowserDetect();
    },
    isChrome() {
      return this.browserDetect.isChrome;
    },
    isFirefox() {
      return this.browserDetect.isFirefox;
    },
    isSafari() {
      return this.browserDetect.isSafari;
    },
    isEdge() {
      return this.browserDetect.isEdge;
    },
    browserName() {
      return this.browserDetect.meta.name;
    },
    browserVersion() {
      return this.browserDetect.meta.version;
    },
    userAgent() {
      return this.browserDetect.meta.ua;
    },
    isModernBrowser() {
      return this.isChrome && this.browserVersion >= 87 ||
        this.isEdge && this.browserVersion >= 88 ||
        this.isSafari && this.browserVersion >= 14 ||
        this.isFirefox && this.browserVersion >= 78;
    },
    hasIP() {
      return this.ip !== null;
    },
    isConnectedToRTDB() {
      return this.$store.getters['connectionMonitor/isConnectedOnce'];
    },
    passesBrowserTests() {
      return this.hasIP && this.isConnectedToRTDB && this.isConnectedToFirestore && this.isModernBrowser;
    },
    bannerText() {
      if (this.allChecksComplete) {
        if (this.passesBrowserTests) {
          return 'Browser Test Passed';
        }
        return 'Browser Test Failed';
      }
      return 'Browser Test';
    },
    bannerStyle() {
      if (this.allChecksComplete) {
        if (this.passesBrowserTests) {
          return '';
        }
        return 'background-color: #d4351c;';
      }
      return 'background-color: #753880;';
    },
  },
  async created() {
    // add a delay to prevent the page from flashing
    setTimeout(() => {
      // Check RTDB connection
      this.performRTDBCheck();

      // Check IP
      this.performIPCheck();

      // Check Firestore connection
      this.performFirestoreCheck();
    }, 2000);
  },
  methods: {
    async performIPCheck() {
      try {
        this.ip = await getIPAddress();
        this.checksComplete.ip = true;
      }
      catch (error) {
        this.checksComplete.ip = true;
      }
    },
    async performRTDBCheck() {
      try {
        await this.$store.dispatch('connectionMonitor/checkConnectedOnce');
        this.checksComplete.rtdb = true;
      }
      catch (error) {
        this.checksComplete.rtdb = true;
      }
    },
    async performFirestoreCheck() {
      try {
        const docSnapshot = await getDoc(doc(firestore, 'info/connected'));
        this.checksComplete.firestore = true;
        if (docSnapshot.exists()) {
          this.isConnectedToFirestore = true;
        }
      }
      catch (error) {
        this.checksComplete.firestore = true;
        this.isConnectedToFirestore = false;
      }
    },
  },
};
</script>
<style scoped>
dl.browser-list dd {
  margin-left: 20px !important;
}
</style>
