/**
 * Checks if a value is null or undefined
 * @param {*} value - The value to check
 * @returns {boolean} - Returns true if the value is null or undefined
 */
function nullUndefinedCheck(value) {
    return value === null || value === undefined;
  }
  
  module.exports = nullUndefinedCheck;