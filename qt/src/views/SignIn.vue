<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <form ref="formRef" autocomplete="off">
        <p class="govuk-body-l">
          To access your test please provide the email address you registered with.
        </p>

        <ErrorSummary :errors="errors" />

        <TextField
          id="email"
          v-model="formData.email"
          label="Email address"
          type="email"
          autocomplete="off"
          required
        />

        <ActionButton
          type="button"
          @click.prevent="login"
        >
          Continue
        </ActionButton>
      </form>
    </div>
  </div>
</template>

<script>
import Form from '@/components/Form/Form';
import ErrorSummary from '@/components/Form/ErrorSummary';
import TextField from '@/components/Form/TextField';
import { functions, auth } from '@/firebase';
import ActionButton from '@/components/ActionButton';
export default {
  components: {
    ErrorSummary,
    TextField,
    ActionButton,
  },
  extends: Form,
  data () {
    return {
      formData: {},
      errors: [],
    };
  },
  computed: {
    qualifyingTestId() {
      return this.$route.params.qualifyingTestId;
    },
  },
  methods: {
    async login() {
      await this.validate();
      if (this.isValid) {
        this.errors = [];
        try {
          // request access
          const response = await functions.httpsCallable('signIn')({ email: this.formData.email, testId: this.qualifyingTestId });
          if (response && response.data && response.data.success) {
            // sign in with token
            await auth.signInWithCustomToken(response.data.token);
          } else {
            this.errors = [{
              id: 'email',
              message: 'Your email address is not recognised',
            }];
          }
        } catch {
          this.errors = [{
            id: 'email',
            message: 'Your email address is not recognised (error)',
          }];
        }
      }
    },
  },
};
</script>

<style scoped>
  .login-container {
    max-width: 360px;
    margin: 0 auto;
  }
  .button-image {
    padding: 0;
    border: none;
    margin: 0;
    box-shadow: none;
    background-color: transparent;
  }

</style>
