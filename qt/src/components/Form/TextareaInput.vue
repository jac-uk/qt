<template>
  <div
    class="govuk-form-group"
    :class="{'govuk-form-group--error': hasError}"
  >
    <label
      :for="id"
      :class="labelHidden ? 'govuk-visually-hidden' : 'govuk-heading-m govuk-!-margin-bottom-2'"
    >
      {{ label }}
    </label>
    <!-- eslint-disable -->
    <span
      v-if="hint"
      class="govuk-hint"
      v-html="hint"
    >
      <!-- eslint-enable -->
    </span>
    <FormFieldError
      :id="id"
      :error-message="errorMessage"
    />
    <textarea
      :id="id"
      v-model="text"
      class="govuk-textarea"
      name="word-count"
      :rows="rows"
    />
    <div
      v-if="wordLimit"
      class="govuk-hint govuk-character-count__message"
    >
      <span
        :class="wordsTooMany > -2 ? 'govuk-error-message' : ''"
      >
        {{ wordLimitCount }}
      </span>
    </div>
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
    value: {
      default: '',
      type: String,
    },
    rows: {
      default: '5',
      type: String,
    },
    wordLimit: {
      required: false,
      default: 0,
      type: Number,
    },
    labelHidden: {
      default: false,
      type: Boolean,
    },
    hardWordLimit: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    wordsTooMany() {
      return this.words.length - this.wordLimit;
    },
    wordLimitCount() {
      let result;
      const plural = Math.abs(this.wordsTooMany) > 1 ? 's' : '';
      if (this.words.length > this.wordLimit) {
        result = `You have ${this.wordsTooMany} word${plural} too many`;
      } else if (Math.floor(this.wordLimit * 0.20) > Math.abs(this.wordsTooMany)) {
        result = `You have ${Math.abs(this.wordsTooMany)} word${plural} remaining`;
      } else {
        result = `${this.words.length}/${this.wordLimit} words`;
      }
      if (this.wordsTooMany == 0) {
        result = 'You have no words remaining';
      }
      return result;
    },
    text: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  watch: {
    text(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.handleLimit();
      }
    },
  },
  methods: {
    handleLimit(){
      if (this.wordLimit) {
        if (this.hardWordLimit) {
          this.enforceHardWordLimit();
        }
      }
    },
    enforceHardWordLimit() {
      if (this.words.length > this.wordLimit) {
        this.text = this.getMaxWordsString();
      }
    },

    /**
     * Split a string into two arrays, one of words and one of their whitespace separators.
     * Truncate the arrays according to the number of words allowed then rejoin them.
     * Add a space to the returning string to prevent strange concatenation if the user
     * continues typing.
     */
    getMaxWordsString() {
      const splitArrays = this.splitStringWithWhitespace(this.text);
      splitArrays.words.length = this.wordLimit;
      splitArrays.whitespace.length = this.wordLimit;
      const result = [];
      for (let i = 0; i < splitArrays.words.length; i++) {
        result.push(splitArrays.words[i]);
        result.push(splitArrays.whitespace[i]);
      }
      // Remove the last whitespace character since the arrays have the same length
      result.pop();
      return `${result.join('')} `;
    },

    // Split a string into two arrays, one of words and one of their whitespace separators.
    splitStringWithWhitespace(inputString) {
      // Use a regular expression to split the string
      const wordArray = inputString.split(/\s+/);
      // Use a regular expression to find all whitespace characters
      const whitespaceArray = inputString.match(/\s+/g) || [];
      return { words: wordArray, whitespace: whitespaceArray };
    },

  },
};
</script>
