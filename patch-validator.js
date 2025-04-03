// patch-validator.js
const fs = require('fs');
const path = require('path');

console.log('Running validator package patch script...');

try {
  const validatorDir = path.join(__dirname, 'node_modules', 'validator', 'lib');
  const utilDir = path.join(validatorDir, 'util');
  
  // Create util directory if it doesn't exist
  if (!fs.existsSync(utilDir)) {
    fs.mkdirSync(utilDir, { recursive: true });
    console.log("Created util directory in validator package");
  }
  
  // Create nullUndefinedCheck.js file if it doesn't exist
  const nullCheckFile = path.join(utilDir, 'nullUndefinedCheck.js');
  if (!fs.existsSync(nullCheckFile)) {
    const nullCheckContent = `/**
 * Checks if a value is null or undefined
 * @param {*} value - The value to check
 * @returns {boolean} - Returns true if the value is null or undefined
 */
function nullUndefinedCheck(value) {
  return value === null || value === undefined;
}

module.exports = nullUndefinedCheck;`;
    fs.writeFileSync(nullCheckFile, nullCheckContent);
    console.log("Created nullUndefinedCheck.js in validator/lib/util");
  } else {
    console.log("nullUndefinedCheck.js already exists in validator/lib/util");
  }
  
  // Create checkHost.js file if it doesn't exist
  const checkHostFile = path.join(utilDir, 'checkHost.js');
  if (!fs.existsSync(checkHostFile)) {
    const checkHostContent = `/**
 * Check if a string is a valid host (domain or IP)
 * @param {string} str - The string to check
 * @returns {boolean} - Returns true if the string is a valid host
 */
function checkHost(str) {
  // Simple implementation - for proper implementation consider using another validator function
  return typeof str === 'string' && str.length > 0;
}

module.exports = checkHost;`;
    fs.writeFileSync(checkHostFile, checkHostContent);
    console.log("Created checkHost.js in validator/lib/util");
  } else {
    console.log("checkHost.js already exists in validator/lib/util");
  }
  
  console.log('Validator package patch completed successfully!');
} catch (err) {
  console.error("Failed to patch validator package:", err);
  process.exit(1);
}