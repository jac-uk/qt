<template>
  <div
    class="govuk-form-group"
    :class="{'govuk-form-group--error': hasError}"
  >
    <label
      :for="id"
      class="govuk-heading-m govuk-!-margin-bottom-2"
    >
      <span
        v-if="labelHidden"
        class="govuk-visually-hidden"
      >
        {{ label }}
      </span>
      <template v-else>
        {{ label }}
      </template>
    </label>
    <span
      v-if="hint"
      class="govuk-hint"
    >
      {{ hint }}
    </span>
    <FormFieldError
      :id="id"
      :error-message="errorMessage"
    />
    <input
      :id="id"
      v-model="value"
      class="govuk-input"
      :class="[inputClass, {'govuk-input--error': hasError}]"
      :type="fieldType"
      :max="numMax"
      :autocomplete="autoComplete"
    >
  </div>
</template>

<script>
import FormField from '@/components/Form/FormField';
import FormFieldError from '@/components/Form/FormFieldError';

export default {
  components: {
    FormFieldError,
  },
  extends: FormField,
  props: {
    inputClass: {
      default: '',
      type: String,
    },
    numMax: {
      default: null,
      type: Number,
    },
    labelHidden: {
      default: false,
      type: Boolean,
    },
    modelValue: {
      default: '',
      type: String,
    },
    type: {
      default: 'text',
      type: String,
    },
    autocomplete: {
      default: '',
      type: String,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    autoComplete() {
      if (this.autocomplete === 'off') {
        return this.autocomplete;
      }
      else {
        switch (this.type) {
        case 'tel':
        case 'email':
          return this.type;
        default:
          return false;
        }
      }
    },
    fieldType() {
      switch (this.type) {
      case 'text':
      case 'email':
        return 'text'; // we are using custom email validation, so don't use html5 input types
      default:
        return this.type;
      }
    },
  },
};
</script>
