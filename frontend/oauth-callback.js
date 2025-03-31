// This is an example implementation of an OAuth callback page for your frontend
// This would be the page that Google redirects to after successful authentication

document.addEventListener('DOMContentLoaded', function() {
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Display success message
      document.getElementById('message').textContent = 'Successfully authenticated with Google!';
      document.getElementById('status').textContent = 'Redirecting to home page...';
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      // Display error message if no token was received
      document.getElementById('message').textContent = 'Authentication failed!';
      document.getElementById('status').textContent = 'No authentication token received.';
      document.getElementById('message').style.color = 'red';
    }
  });