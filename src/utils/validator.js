/**
 * Validation utilities
 * Reusable validation functions for the application
 */
class Validator {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validate name format
   */
  static isValidName(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 100;
  }

  /**
   * Validate age
   */
  static isValidAge(age) {
    return typeof age === 'number' && age >= 0 && age <= 150;
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate required fields
   */
  static validateRequired(obj, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
      if (!obj[field]) {
        errors.push(`${field} is required`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validator; 