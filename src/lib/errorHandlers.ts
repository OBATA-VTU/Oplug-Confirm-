export const getFriendlyErrorMessage = (error: any): string => {
  const code = error?.code || error?.message || String(error);
  
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled. Please contact support or try another method.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your details and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Your account has been temporarily disabled. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/requires-recent-login':
      return 'This action requires you to log in again for security reasons.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completion. Please try again.';
    default:
      if (code.includes('permission-denied')) {
        return 'You do not have permission to perform this action.';
      }
      return 'An unexpected error occurred. Please try again later.';
  }
};
