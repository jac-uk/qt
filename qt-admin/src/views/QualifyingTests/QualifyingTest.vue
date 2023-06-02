<template>
  <div class="xgovuk-grid-row">
    <RouterLink
      class="govuk-back-link"
      :to="{ name: 'qualifying-tests', params: { folderId: folderId } }"
    >
      Back
    </RouterLink>
    <span class="govuk-caption-l">{{ folder.name }}</span>

    <LoadingMessage
      v-if="loaded === false"
      :load-failed="loadFailed"
    />
    <RouterView v-else />
  </div>
</template>

<script>
import LoadingMessage from '@jac-uk/jac-kit/draftComponents/LoadingMessage';
export default {
  components: {
    LoadingMessage,
  },
  data() {
    return {
      loaded: false,
      loadFailed: false,
    };
  },
  computed: {
    folderId() {
      return this.$route.params.folderId;
    },
    folder() {
      return this.$store.state.folder.record;
    },
    qualifyingTestId() {
      return this.$route.params.qualifyingTestId;
    },
  },
  watch: {
    '$route.params.qualifyingTestId'() {
      this.loadPage();
    },
  },
  mounted() {
    this.loadPage();
  },
  unmounted() {
    this.$store.dispatch('qualifyingTest/unbind');
  },
  methods: {
    loadPage() {
      this.loaded = false;
      this.$store.dispatch('qualifyingTest/bind', this.qualifyingTestId)
        .then((data) => {
          if (data === null) {
            this.redirectToPage();
          }
          else {
            this.loaded = true;
          }
        }).catch((e) => {
          this.loadFailed = true;
          throw e;
        });
    },
    redirectToPage() {
      // this.$router.replace({ name: 'page-not-found' });
      // TODO: If the requested test is an Equal Merit tie-breaker redirects to the EM tie-breakers page
      // else redirect to the QTs page
      this.$router.replace({ name: 'qualifying-tests' });
    },
  },
};
</script>
