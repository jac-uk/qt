<template>
  <fieldset class="govuk-fieldset">
    <RadioGroup
      id="situationalJudgementRadio"
      v-model="value"
      :label="question"
      hint="Please select which of the options below are 'most appropriate' and 'least appropriate'. You can only choose one answer as most appropriate and one answer as least appropriate."
    >
      <div
        v-for="(item, index) in options"
        :key="index"
      >
        <h3 class="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
          {{ item.answer }}
        </h3>
        <p>
          <RadioItem
            :value="index"
            :disabled="disabled"
            field="mostAppropriate"
            label="Most appropriate"
          />
          <br>
          <RadioItem
            :value="index"
            :disabled="disabled"
            field="leastAppropriate"
            label="Least appropriate"
          />
        </p>
      </div>
    </RadioGroup>
  </fieldset>
</template>
<script>
import RadioGroup from '@/components/Form/RadioGroup.vue';
import RadioItem from '@/components/Form/RadioItem.vue';

export default {
  components: {
    RadioGroup,
    RadioItem,
  },
  props: {
    modelValue: {
      required: true,
      validator: (value) => (value instanceof Object || value === null || value === undefined),
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['update:modelValue', 'answered'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  watch: {
    'value.leastAppropriate': function (value) {
      if (value === this.value.mostAppropriate) {
        this.value.mostAppropriate = null;
      }
      this.$emit('answered', { value, type: 'leastAppropriate' });
    },
    'value.mostAppropriate': function (value) {
      if (value === this.value.leastAppropriate) {
        this.value.leastAppropriate = null;
      }
      this.$emit('answered', { value, type: 'mostAppropriate' });
    },
  },
};
</script>

<style scoped type="scss">
  @media (min-width: 720px) {
    .govuk-radios__item-container {
        display: inline-block;
        margin-right: 30px;
    }
  }
</style>
