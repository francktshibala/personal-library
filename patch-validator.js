// patch-validator.js
const fs = require('fs');
const path = require('path');

console.log('Running validator package patch script...');

try {
  const validatorDir = path.join(__dirname, 'node_modules', 'validator', 'lib');
  const utilDir = path.join(validatorDir, 'util');
  const nullCheckFile = path.join(utilDir, 'nullUndefinedCheck.js');
  
  // Create util directory if it doesn't exist
  if (!fs.existsSync(utilDir)) {
    fs.mkdirSync(utilDir, { recursive: true });
    console.log("Created util directory in validator package");
  }
  
  // Create nullUndefinedCheck.js file if it doesn't exist
  if (!fs.existsSync(nullCheckFile)) {
    const fileContent = `/**
 * Checks if a value is null or undefined
 * @param {*} value - The value to check
 * @returns {boolean} - Returns true if the value is null or undefined
 */
function nullUndefinedCheck(value) {
  return value === null || value === undefined;
}

module.exports = nullUndefinedCheck;`;
    fs.writeFileSync(nullCheckFile, fileContent);
    console.log("Created nullUndefinedCheck.js in validator/lib/util");
  } else {
    console.log("nullUndefinedCheck.js already exists in validator/lib/util");
  }
  
  console.log('Validator package patch completed successfully!');
} catch (err) {
  console.error("Failed to patch validator package:", err);
  process.exit(1);
}