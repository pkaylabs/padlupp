const FORGOT_PASSWORD_EMAIL_KEY = "forgot_password_email";
const FORGOT_PASSWORD_RESET_TOKEN_KEY = "forgot_password_reset_token";

export const forgotPasswordStorage = {
  getEmail: () => sessionStorage.getItem(FORGOT_PASSWORD_EMAIL_KEY),
  setEmail: (email: string) =>
    sessionStorage.setItem(FORGOT_PASSWORD_EMAIL_KEY, email),

  getResetToken: () => sessionStorage.getItem(FORGOT_PASSWORD_RESET_TOKEN_KEY),
  setResetToken: (token: string) =>
    sessionStorage.setItem(FORGOT_PASSWORD_RESET_TOKEN_KEY, token),

  clear: () => {
    sessionStorage.removeItem(FORGOT_PASSWORD_EMAIL_KEY);
    sessionStorage.removeItem(FORGOT_PASSWORD_RESET_TOKEN_KEY);
  },
};
