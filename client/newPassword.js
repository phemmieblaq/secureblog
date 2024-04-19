async function getCsrfToken() {
    try {
        const response = await fetch('http://localhost:3000/csrf-token', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token: ' + response.status);
        }

        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.log('Error during fetching CSRF token:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
}






function isValidPassword(password) {
    // Check if password is at least 8 characters long
    if (password.length < 8) {
        return false;
    }

    // Add more checks as per NIST guidelines

    return true;
}


document.addEventListener('DOMContentLoaded', async function() {
    const csrfToken = await getCsrfToken();
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearErrors();
        let isValid = true;

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            event.preventDefault(); // Prevent form from being submitted
            showError('confirmPasswordError', 'Passwords do not match')
            isValid = false;
        }
        if (!isValidPassword(password)) {
            showError('passwordError', 'Password must be at least 8 characters long.');
            isValid = false;
        }

        if (isValid) {
            const formData = {
                newPassword: document.getElementById('password').value.trim(),
            };

            console.log('Form Data:', formData); // Data to be sent

            // Fetch request
            fetch('http://localhost:3000/reset-password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                return response.json(); // Only parse as JSON if the response was okay
            })
            .then(data => {
                if (data.error) {
                    showError('serverError', data.error); // Display the error message on the UI
                } else {
                    console.log('Success:', data);
                    window.location.href = 'http://localhost:8000/client/login.html'; 

                    // Proceed with handling the successful response, e.g., redirect or update UI
                }
            })
            .catch((error) => {
                showError('serverError', error); // Improved error handling
            });
        }
    }); 
}); 
    

    function showError(id, message) {
        const errorDiv = document.getElementById(id);
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function clearErrors() {
        const errorDivs = document.querySelectorAll('.error');
        errorDivs.forEach(div => {
            div.textContent = '';
            div.style.display = 'none';
        });
    }



