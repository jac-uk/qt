<template>
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <form
        ref="formRef"
        @submit.prevent="login"
      >
        <p class="govuk-body-l">To access your tests please provide your email address</p>

        <ErrorSummary :errors="errors" />

        <TextField
          id="email"
          v-model="formData.email"
          label="Email address"
          type="email"
        />

        <button class="govuk-button">
          Continue
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import ErrorSummary from '@/components/Form/ErrorSummary';
import TextField from '@/components/Form/TextField';
import { auth } from '@/firebase';

export default {
  components: {
    ErrorSummary,
    TextField,
  },
  data () {
    return {
      formData: {},
      errors: [],
    };
  },
  methods: {
    async login() {
      if (this.formData.email) {
        this.errors = [];
        console.log('send email link to user', auth.currentUser);
        const actionCodeSettings = {
          url: 'http://localhost:8181/sign-in-completed',
          handleCodeInApp: true,
        };
        try {
          await auth.sendSignInLinkToEmail(this.formData.email, actionCodeSettings);
          window.localStorage.setItem('emailForSignIn', this.formData.email);
          this.$router.push({ name: 'sign-in-progress' });
        } catch (e) {
          console.log('error', e);
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
