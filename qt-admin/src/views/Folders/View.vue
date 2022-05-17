<template>
  <div v-if="folder">
    <RouterView />
  </div>
</template>

<script>

export default {
  computed: {
    folderId() {
      return this.$route.params.folderId;
    },
    folder() {
      return this.$store.state.folder.record;
    },
  },
  created() {
    this.$store.dispatch('folder/bind', this.folderId);
  },
};
</script>
