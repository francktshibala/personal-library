// Setup script to help with initial project configuration
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Directories that need to be created if they don't exist
const requiredDirs = [
  'config',
  'controllers',
  'middleware',
  'models',
  'routes',
  'swagger',
  'utils'
];

console.log('Personal Library API - Setup Script');
console.log('===================================');

// Check and create required directories
console.log('\nChecking required directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log(`✓ Created directory: ${dir}`);
  } else {
    console.log(`✓ Directory exists: ${dir}`);
  }
});

// Check for .env file
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.log('\nCreating .env file...');
  
  rl.question('\nEnter MongoDB URI (or press enter for default): ', (mongoUri) => {
    const defaultMongoUri = 'mongodb+srv://book:library@cluster7.ih8gugg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7';
    const uri = mongoUri || defaultMongoUri;
    
    rl.question('Enter JWT Secret (or press enter for default): ', (jwtSecret) => {
      const defaultJwtSecret = 'personal_library_super_secret_key_123';
      const secret = jwtSecret || defaultJwtSecret;
      
      rl.question('Enter Google Client ID (optional): ', (googleClientId) => {
        rl.question('Enter Google Client Secret (optional): ', (googleClientSecret) => {
          const envContent = `# Environment variables (not committed to Git)
MONGODB_URI=${uri}
PORT=3000
JWT_SECRET=${secret}
JWT_EXPIRE=30d
${googleClientId ? `GOOGLE_CLIENT_ID=${googleClientId}` : '# GOOGLE_CLIENT_ID=your_google_client_id'}
${googleClientSecret ? `GOOGLE_CLIENT_SECRET=${googleClientSecret}` : '# GOOGLE_CLIENT_SECRET=your_google_client_secret'}`;
          
          fs.writeFileSync(envFile, envContent);
          console.log('✓ Created .env file');
          
          // Check for swagger.json
          const swaggerFile = path.join(__dirname, 'swagger', 'swagger.json');
          if (!fs.existsSync(swaggerFile)) {
            console.log('\nCreating basic swagger.json file...');
            
            // Basic swagger file content
            const basicSwagger = {
              "openapi": "3.0.0",
              "info": {
                "title": "Personal Library API",
                "description": "API for managing a personal book collection",
                "version": "1.0.0"
              },
              "servers": [
                {
                  "url": "/api",
                  "description": "API Server"
                }
              ],
              "components": {
                "securitySchemes": {
                  "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                  }
                }
              },
              "paths": {}
            };
            
            fs.writeFileSync(swaggerFile, JSON.stringify(basicSwagger, null, 2));
            console.log('✓ Created basic swagger.json file');
          }
          
          console.log('\nChecking dependencies...');
          try {
            console.log('Installing missing npm packages if needed...');
            execSync('npm install', { stdio: 'inherit' });
            console.log('✓ Dependencies are installed');
          } catch (error) {
            console.error('Error installing dependencies:', error.message);
          }
          
          console.log('\nSetup completed successfully!');
          console.log('\nYou can now start the server with:');
          console.log('npm run dev   # For development');
          console.log('npm start     # For production');
          
          rl.close();
        });
      });
    });
  });
} else {
  console.log('\n.env file already exists. Skipping environment setup.');
  
  // Check for dependencies anyway
  console.log('\nChecking dependencies...');
  try {
    console.log('Installing missing npm packages if needed...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependencies are installed');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
  }
  
  console.log('\nSetup completed successfully!');
  console.log('\nYou can now start the server with:');
  console.log('npm run dev   # For development');
  console.log('npm start     # For production');
  
  rl.close();
}