<template>
  <fieldset class="govuk-fieldset">
    <RadioGroup
      id="criticalAnalysisRadio"
      v-model="value"
      :label="question"
      hint="Choose one option."
    >
      <RadioItem
        v-for="(item, index) in options"
        :key="index"
        :value="index"
        :label="item.answer"
        :disabled="disabled"
      />
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
      validator: (value) => (value >= 0 || value === null || value === undefined),
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
        // this.$emit('answered');
        if (val !== this.value && this.value !== null && this.value !== undefined) {
          this.$emit('answered', { value: val, type: '' });
        }
      },
    },
  },
};
</script>
