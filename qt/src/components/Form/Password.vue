<template>
  <div
    class="govuk-form-group"
    :class="{'govuk-form-group--error': hasError}"
  >
    <label
      :for="id"
      class="govuk-heading-m govuk-!-margin-bottom-2"
    >
      {{ label }}
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
      v-model="localValue"
      :class="[inputClass, 'govuk-input', 'govuk-!-width-three-quarters', {'govuk-input--error': hasError}]"
      :type="fieldType"
      :autocomplete="type"
      @input="handleValidatePassword"
    >

    <button
      class="govuk-button govuk-button--secondary govuk-!-margin-left-1 info-btn--sign-up--password--show-hide"
      @click.prevent="toggleVisibility"
    >
      {{ toggleLabel }}
    </button>
  </div>
</template>

<script>
import FormField from '@/components/Form/FormField.vue';
import FormFieldError from '@/components/Form/FormFieldError.vue';

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
    modelValue: {
      default: '',
      type: String,
    },
    type: {
      default: 'current-password',
      type: String,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showPassword: false,
      regex: {
        // eslint-disable-next-line
        containsCapitalLetters: /[A-Z]+/,
        containsDigits: /\d+/,
        containsSpecialCharacters: /[^A-Za-z\d]+/,
        repeatedCharacters: /(.)\1{2,}/,
      },
    };
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    fieldType() {
      if (this.showPassword) {
        return 'text';
      }
      return 'password';
    },
    toggleLabel() {
      if (this.showPassword) {
        return 'Hide';
      }
      return 'Show';
    },
  },
  mounted() {
    this.emitter.on('validate', this.handleValidatePassword);
  },
  beforeUnmount: function() {
    this.setError('');
    this.emitter.off('validate', this.handleValidatePassword);
  },
  methods: {
    toggleVisibility() {
      this.showPassword = !this.showPassword;
    },
    handleValidatePassword(event) {
      // don't bother checking if generic validation failed
      // if (!this.hasError) {
      let value = this.localValue;
      if (event && event.target) {
        value = event.target.value;
      }

      this.setError('');
      this.validatePassword(value);
      // }
    },
    validatePassword(password) {

      if (password.length < 8) {
        this.setError(`${this.label} should be 8 or more characters long`);
      }

      if (!this.regex.containsCapitalLetters.test(password)) {
        this.setError(`${this.label} must include at least one capital letter.`);
      }

      if (!this.regex.containsDigits.test(password)) {
        this.setError(`${this.label} must include at least one digit.`);
      }

      if (!this.regex.containsSpecialCharacters.test(password)) {
        this.setError(`${this.label} must include at least one special character - for example £, #, @, !, %, -, &, *.`);
      }

      if (this.regex.repeatedCharacters.test(password)) {
        this.setError(`${this.label} must include no more than 2 consecutive repeating characters.`);
      }
    },
  },
};
</script>
