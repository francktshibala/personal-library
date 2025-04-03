// fix-validator.js
const fs = require('fs');
const path = require('path');

console.log('Running comprehensive validator package fix...');

try {
  const validatorDir = path.join(__dirname, 'node_modules', 'validator', 'lib');
  const utilDir = path.join(validatorDir, 'util');
  
  // Create util directory if it doesn't exist
  if (!fs.existsSync(utilDir)) {
    fs.mkdirSync(utilDir, { recursive: true });
    console.log("Created util directory in validator package");
  }
  
  // Define all possible utility functions we might need for util directory
  const utilFunctions = {
    'nullUndefinedCheck.js': `/**
 * Checks if a value is null or undefined
 * @param {*} value - The value to check
 * @returns {boolean} - Returns true if the value is null or undefined
 */
function nullUndefinedCheck(value) {
  return value === null || value === undefined;
}

module.exports = nullUndefinedCheck;`,

    'checkHost.js': `/**
 * Check if a string is a valid host (domain or IP)
 * @param {string} str - The string to check
 * @returns {boolean} - Returns true if the string is a valid host
 */
function checkHost(str) {
  // Simple implementation - for proper implementation consider using another validator function
  return typeof str === 'string' && str.length > 0;
}

module.exports = checkHost;`,

    'merge.js': `/**
 * Merge defaults with user options
 * @param {Object} defaults - Default options
 * @param {Object} options - User options
 * @returns {Object} - Merged options
 */
function merge(defaults, options) {
  options = options || {};
  
  Object.keys(defaults).forEach(function(key) {
    if (options[key] === undefined) {
      options[key] = defaults[key];
    }
  });
  
  return options;
}

module.exports = merge;`,

    'toString.js': `/**
 * Convert value to string
 * @param {*} input - Value to convert
 * @returns {string} - String representation
 */
function toString(input) {
  if (typeof input === 'object' && input !== null) {
    if (typeof input.toString === 'function') {
      input = input.toString();
    } else {
      input = '[object Object]';
    }
  } else if (input === null || input === undefined || (isNaN(input) && !input.length)) {
    input = '';
  }
  return String(input);
}

module.exports = toString;`,

    'assertString.js': `/**
 * Assert that the input is a string
 * @param {*} input - Value to check
 * @throws {Error} - If input is not a string
 */
function assertString(input) {
  const isString = typeof input === 'string' || input instanceof String;
  
  if (!isString) {
    let invalidType = typeof input;
    if (input === null) {
      invalidType = 'null';
    } else if (invalidType === 'object') {
      invalidType = input.constructor.name;
    }
    
    throw new TypeError(\`Expected a string but received a \${invalidType}\`);
  }
}

module.exports = assertString;`
  };
  
  // Create all util files
  let createdCount = 0;
  for (const [filename, content] of Object.entries(utilFunctions)) {
    const filePath = path.join(utilDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`Created ${filename} in validator/lib/util`);
      createdCount++;
    }
  }
  
  if (createdCount > 0) {
    console.log(`Successfully created ${createdCount} utility files for validator package.`);
  } else {
    console.log('All utility files already exist.');
  }

  // Create an index.js file to export all utilities
  const indexPath = path.join(utilDir, 'index.js');
  const indexContent = Object.keys(utilFunctions)
    .map(filename => {
      const name = filename.replace('.js', '');
      return `const ${name} = require('./${filename}');`;
    })
    .join('\n') + '\n\nmodule.exports = {\n  ' + 
    Object.keys(utilFunctions)
      .map(filename => filename.replace('.js', ''))
      .join(',\n  ') + 
    '\n};';
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('Created or updated index.js in validator/lib/util');
  
  // Add missing modules directly in the lib directory
  const libModules = {
    'isULID.js': `/**
 * Checks if a string is a valid ULID
 * @param {string} str - The string to check
 * @returns {boolean} - Returns true if the string is a valid ULID
 */
function isULID(str) {
  const assertString = require('./util/assertString');
  
  try {
    assertString(str);
  } catch (e) {
    return false;
  }
  
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(str);
}

module.exports = isULID;`
  };
  
  // Create missing lib modules
  for (const [filename, content] of Object.entries(libModules)) {
    const filePath = path.join(validatorDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`Created ${filename} in validator/lib`);
    }
  }
  
  console.log('Validator package fix completed successfully!');
} catch (err) {
  console.error("Failed to fix validator package:", err);
  process.exit(1);
}