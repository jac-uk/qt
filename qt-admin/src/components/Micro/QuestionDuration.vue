<template>
  <div class="question-duration">
    <p
      v-if="start"
      class="govuk-body-s"
    >
      First started: {{ $filters.formatDate(start, 'datetime') }}
    </p>
    <p
      v-if="end"
      class="govuk-body-s"
    >
      Last updated: {{ $filters.formatDate(end, 'datetime') }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    start: {
      type: Date,
      default: null,
    },
    end: {
      type: Date,
      default: null,
    },
  },
};
</script>

<style type="text/css" rel="stylesheet/scss" lang="scss" scoped>
.question-duration p {
  margin: 0;
  color: #505a5f;
}
</style>
