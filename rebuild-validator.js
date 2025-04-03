// rebuild-validator.js
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

console.log('Starting validator package rebuild...');

try {
  // Get the current version of validator
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const validatorVersion = packageJson.dependencies.validator.replace('^', '');
  
  console.log(`Current validator version: ${validatorVersion}`);
  
  // Remove the current validator package
  console.log('Removing current validator package...');
  try {
    // Remove validator directory from node_modules
    const validatorDir = path.join(__dirname, 'node_modules', 'validator');
    if (fs.existsSync(validatorDir)) {
      child_process.execSync(`rm -rf "${validatorDir}"`, { stdio: 'inherit' });
    }
  } catch (err) {
    console.error('Error removing validator directory:', err);
  }
  
  // Get package-lock.json validator entry and remove it
  try {
    const packageLockPath = path.join(__dirname, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
      if (packageLock.packages && packageLock.packages['node_modules/validator']) {
        delete packageLock.packages['node_modules/validator'];
        fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
        console.log('Removed validator from package-lock.json');
      }
    }
  } catch (err) {
    console.error('Error updating package-lock.json:', err);
  }
  
  // Use a different version of validator that might be more stable with Node.js 22
  console.log('Installing validator version 13.9.0...');
  try {
    child_process.execSync('npm install validator@13.9.0 --save', { stdio: 'inherit' });
    console.log('Validator reinstalled successfully!');
  } catch (err) {
    console.error('Error reinstalling validator:', err);
    console.log('Falling back to fix script...');
    
    // Run the fix validator script as a fallback
    require('./fix-validator');
  }
} catch (err) {
  console.error('Error in validator rebuild script:', err);
  process.exit(1);
}