const API_URL = '/api/auth/login'; // Adjust this to your actual login endpoint
const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Show message function
function showMessage(element, message, isSuccess = false) {
    element.textContent = message;
    element.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Hide all messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Hide previous messages
    hideMessages();
    
    // Get form data
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
        showMessage(errorMessage, 'Please fill in all fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage(errorMessage, 'Please enter a valid email address.');
        return;
    }
    
    // Password validation
    if (password.length < 6) {
        showMessage(errorMessage, 'Password must be at least 6 characters long.');
        return;
    }
    
    // Disable submit button during request
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
        // Send request to server
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            showMessage(successMessage, 'Login successful! Redirecting...', true);
            
            // Redirect to home page or dashboard after successful login
            setTimeout(() => {
                // Check user role and redirect accordingly
                if (data.user.role === 'dalali') {
                    window.location.href = 'dalali_dashboard.html';
                } else if (data.user.role === 'mpangaji') {
                    window.location.href = 'mpangaji-dashboard.html';
                } else {
                    window.location.href = 'payment.html';
                }
            }, 1500);
        } else {
            const error = await response.json();
            console.error('Login failed:', error);
            showMessage(errorMessage, 'Login failed: ' + (error.error || 'Invalid credentials'));
        }
    } catch (err) {
        console.error('Network error:', err);
        showMessage(errorMessage, 'Network error. Please try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});