// Shared password validation utility
// Used by Auth.tsx and Profile.tsx to enforce consistent password requirements

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

/**
 * Validates a password against all security requirements
 * @param password - The password to validate
 * @returns Object with boolean flags for each requirement
 */
export const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password),
  };
};

/**
 * Checks if a password meets all security requirements
 * @param password - The password to check
 * @returns true if all requirements are met
 */
export const isPasswordValid = (password: string): boolean => {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
};

/**
 * Returns French error message for invalid password
 */
export const getPasswordErrorMessage = (): string => {
  return "Le mot de passe ne respecte pas tous les critères de sécurité.";
};
