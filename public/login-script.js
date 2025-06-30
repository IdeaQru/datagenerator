// Hardcoded credentials
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'sukses2024@'
};

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.querySelector('.login-button');
    const buttonText = document.querySelector('.button-text');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    // Show loading state
    buttonText.style.display = 'none';
    loadingSpinner.style.display = 'block';
    loginButton.disabled = true;
    errorMessage.style.display = 'none';
    
    // Simulate API call delay
    setTimeout(() => {
        if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
            // Successful login
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            // Failed login
            errorMessage.textContent = 'Username atau password salah!';
            errorMessage.style.display = 'block';
            
            // Reset form
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
        
        // Reset button state
        buttonText.style.display = 'block';
        loadingSpinner.style.display = 'none';
        loginButton.disabled = false;
    }, 1000);
});

// Handle input events to clear error message
document.getElementById('username').addEventListener('input', clearErrorMessage);
document.getElementById('password').addEventListener('input', clearErrorMessage);

function clearErrorMessage() {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage.style.display !== 'none') {
        errorMessage.style.display = 'none';
    }
}
