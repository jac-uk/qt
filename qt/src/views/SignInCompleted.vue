<script>
import { auth } from '@/firebase';

export default {
  created() {
    if (auth.isSignInWithEmailLink(window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      auth.signInWithEmailLink(email, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
        })
        .catch(() => {
          this.$router.push({ name: 'sign-in' });
        });
    }
  },
  render() {
    return '';
  },
};
</script>
