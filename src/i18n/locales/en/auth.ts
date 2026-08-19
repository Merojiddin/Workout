/** Sign in, register, password reset, and the auth gate's loading state. */
export const authMessages = {
  'auth.loadingSession': 'Loading your session...',

  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.name': 'Name',
  'auth.confirmPassword': 'Confirm password',
  'auth.newPassword': 'New password',
  'auth.confirmNewPassword': 'Confirm new password',

  'auth.login.title': 'Welcome back',
  'auth.login.subtitle': 'Sign in to sync your training to the cloud.',
  'auth.login.submit': 'Sign in',
  'auth.login.submitting': 'Signing in...',
  'auth.login.failed': 'Could not sign in.',
  'auth.login.forgot': 'Forgot password?',
  'auth.login.newHere': 'New here?',
  'auth.login.createAccount': 'Create an account',

  'auth.register.title': 'Create your account',
  'auth.register.subtitle': 'Your training, backed up and synced.',
  'auth.register.submit': 'Register',
  'auth.register.submitting': 'Creating...',
  'auth.register.failed': 'Could not create the account.',
  'auth.register.tooShort': 'Password must be at least 6 characters.',
  'auth.register.mismatch': 'Passwords do not match.',
  'auth.register.confirmEmail':
    'Account created. Check your email to confirm, then sign in.',
  'auth.register.haveAccount': 'Already have an account?',

  'auth.forgot.title': 'Reset password',
  'auth.forgot.subtitle': "Enter your email and we'll send a reset link.",
  'auth.forgot.submit': 'Send reset link',
  'auth.forgot.submitting': 'Sending...',
  'auth.forgot.failed': 'Could not send the reset link.',
  'auth.forgot.sent': 'If that email exists, a password reset link is on its way.',

  'auth.update.title': 'Choose a new password',
  'auth.update.subtitle':
    'Set a new password for your account, then carry on training.',
  'auth.update.submit': 'Update password',
  'auth.update.submitting': 'Saving...',
  'auth.update.failed': 'Could not update the password.',
  'auth.update.tooShort': 'Use at least {count} characters.',
  'auth.update.mismatch': 'The two passwords do not match.',
  'auth.update.done': 'Password updated.',

  'auth.backToSignIn': 'Back to sign in',
} as const
