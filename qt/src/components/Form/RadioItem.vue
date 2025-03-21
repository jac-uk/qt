<template>
  <div class="govuk-radios__item-container">
    <div class="govuk-radios__item">
      <input
        v-if="field"
        :id="inputId"
        v-model="$parent.inputValue[field]"
        :class="`govuk-radios__input info-radio--${hyphenization(inputName[field])}--${hyphenization(value)}`"
        type="radio"
        :name="inputName[field]"
        :value="value"
        :aria-describedby="hint ? hintId : false"
        :disabled="disabled"
      >
      <input
        v-else
        :id="inputId"
        v-model="$parent.inputValue"
        :class="`govuk-radios__input info-radio--${hyphenization(inputName)}--${hyphenization(value)}`"
        type="radio"
        :name="inputName"
        :value="value"
        :aria-describedby="hint ? hintId : null"
        :disabled="disabled"
      >
      <label
        class="govuk-label govuk-radios__label"
        :for="inputId"
      >
        {{ label }}
      </label>
      <span
        v-if="hint"
        :id="hintId"
        class="govuk-hint govuk-radios__hint"
      >
        {{ hint }}
      </span>
    </div>
    <div
      v-if="showConditionalContent"
      class="govuk-radios__conditional"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { hyphenize } from '@/filters';

let index = 0;

export default {
  name: 'RadioItem',
  props: {
    label: {
      required: true,
      type: String,
    },
    value: {
      required: true,
      validator: () => true,
    },
    field: {
      default: null,
      type: String,
    },
    hint: {
      default: '',
      type: String,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      hasConditionalContent: !!(this.$slots.default),
    };
  },
  computed: {
    inputId() {
      return `${this.$parent.id}__${index}`;
    },
    hintId() {
      return `${this.$parent.id}__${index}__hint`;
    },
    inputName() {
      return this.$parent.id;
    },
    showConditionalContent() {
      return this.hasConditionalContent && (this.$parent.inputValue === this.value);
    },
  },
  beforeCreate() {
    if (this.$parent.$options.name !== 'RadioGroup') {
      throw new Error('RadioItem component can only be used inside a RadioGroup component');
    }
    index++;
  },
  methods: {
    hyphenization(value) {
      return hyphenize(value);
    },
  },
};
</script>

<style type="text/css" rel="stylesheet/scss" lang="scss" scoped>
  // We need to wrap both the input & conditional content in one top-level element
  // This is because Vue doesn't (yet) support components with multiple top-level elements (e.g. React Fragments)
  // This results in our markup structure differing slightly from the officially documented markup for this component
  // The fix is to re-implement the margin-bottom on radio items here
  .govuk-radios__item-container {
    margin-bottom: govuk-spacing(2);
  }
</style>
