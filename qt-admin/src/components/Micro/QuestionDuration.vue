<template>
  <div class="question-duration">
    <div
      v-if="start"
      class="govuk-summary-list__row"
    >
      <dt class="govuk-body-s govuk-!-margin-bottom-0">
        Started:
      </dt>

      <dd
        v-if="Array.isArray(start)"
        class="govuk-body-s govuk-!-margin-bottom-0"
      >
        <ul class="date-list">
          <li
            v-for="item in start"
            :key="item"
          >
            {{ $filters.formatDate(item, 'datetime') }}
          </li>
        </ul>
      </dd>

      <dd
        v-else
        class="govuk-body-s govuk-!-margin-bottom-0"
      >
        {{ $filters.formatDate(start, 'datetime') }}
      </dd>
    </div>

    <div
      v-if="end"
      class="govuk-summary-list__row"
    >
      <dt class="govuk-body-s govuk-!-margin-bottom-0">
        Last updated:
      </dt>
      <dd class="govuk-body-s govuk-!-margin-bottom-0">
        {{ $filters.formatDate(end, 'datetime') }}
      </dd>
    </div>
    <hr>
  </div>
</template>

<script>
export default {
  props: {
    start: {
      type: [Date, Array],
      default: null,
    },
    end: {
      type: Date,
      default: null,
    },
  },
};
</script>

<style scoped>
.question-duration {
  margin: 0;
}

.govuk-summary-list__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align items to the top */
}

.govuk-body-s {
  margin: 0;
}

.date-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.date-list li {
  margin-bottom: 4px;
}

dt {
  flex: 1; /* Makes sure the "First started" text stays on the left */
}

dd {
  flex: 2; /* Ensures the dates align properly on the right */
  text-align: right;
}
</style>
