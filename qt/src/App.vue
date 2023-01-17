<template>
  <div class="page-container">
    <LoadingMessage
      v-if="loaded === false"
      :load-failed="loadFailed"
    />
    <template v-else>
      <header
        v-if="!fullPageMode"
        class="govuk-width-container"
      >
        <div class="govuk-grid-row">
          <div class="govuk-grid-column-two-thirds">
            <img
              src="@/assets/jac-logo.svg"
              alt="Judicial Appointments Commission"
              width="197"
              height="66"
              style="text-align: center"
              class="govuk-!-margin-top-4 govuk-!-margin-bottom-5"
            >
          </div>
          <div class="govuk-grid-column-one-third text-right">
            <button
              v-if="isSignedIn"
              class="govuk-button govuk-!-margin-top-4"
              data-module="govuk-button"
              @click="signOut"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        class="govuk-width-container"
        role="main"
      >
        <div
          :class="fullPageMode ? 'full-page' : 'govuk-main-wrapper govuk-main-wrapper--auto-spacing govuk-!-padding-top-0'"
        >
          <RouterView />
        </div>
      </main>

      <!-- <Footer
        v-if="!fullPageMode"
      /> -->
    </template>
  </div>
</template>

<script>
// import Header from '@/components/Page/Header';
// import Footer from '@/components/Page/Footer';
import LoadingMessage from '@/components/LoadingMessage';
import { auth } from '@/firebase';

export default {
  name: 'App',
  components: {
    LoadingMessage,
    // Header,
    // Footer,
  },
  data() {
    return {
      loaded: false,
      loadFailed: false,
    };
  },
  computed: {
    fullPageMode() {
      return this.$route.meta.fullPageMode;
    },
    isSignedIn() {
      return this.$store.getters['auth/isSignedIn'];
    },
  },
  async mounted() {
    const meta = document.createElement('meta');
    meta.name = 'version';
    meta.content = this.$store.getters.appVersion;
    document.head.appendChild(meta);
    try {
      await this.$store.dispatch('session/load');
      this.loaded = true;
    } catch {
      this.loadFailed = true;
    }
  },
  methods: {
    signOut() {
      auth.signOut();
    },
  },
};
</script>

<style lang="scss">
  .page-container {
    position: relative;
    min-height: 100%;
    overflow: hidden;
  }
  .full-page {
    margin-top: 60px;
  }
</style>
