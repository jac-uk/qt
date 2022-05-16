<template>
  <dl class="govuk-summary-list">
    <div class="govuk-summary-list__row">
      <dt class="govuk-summary-list__key">
        Name
      </dt>
      <dd class="govuk-summary-list__value">
        {{ data.name }}
      </dd>
    </div>
  </dl>
</template>

<script>

export default {
  props: {
    data: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
};
</script>
