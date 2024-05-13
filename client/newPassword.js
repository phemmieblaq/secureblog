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

const email= localStorage.getItem('email');
//console.log('Email', email);
async function getUserName() {
    try {
        const response = await fetch(`http://localhost:3000/user/${email}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed the user ' + response.status);
        }

        const data = await response.json();
        return data.username;
       //console.log(data.username )
    } catch (error) {
        console.log('Error during fetching CSRF token:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }

}





async function isValidPassword(password) {
    const username =  await getUserName();
    console.log(username);
    // Check if password is at least 8 characters long
    if (password.length < 8) {
        return false;
    }
    const commonPasswords = new Set([
        "password", "123456", "123456789", "qwerty", "12345678", 
        "111111", "1234567", "sunshine", "qwerty123", "iloveyou"
    ]);

    // Check if password is at least 8 characters long
    if (password.length < 8) {
        showError('passwordError', 'Password must be at least 8 characters long.');
        return false;
    }
    
    // Check if password is a common password
    if (commonPasswords.has(password)) {
        showError('passwordError', 'This password is too common. Please choose a different one.');
        return false;
    }
    
    // Check if password contains repetitive characters
    if (/(\w)\1{2,}/.test(password)) {
        showError('passwordError', 'Password should not contain repetitive characters.');
        return false;
    }
    
    // Check if password contains the username
    if (password.includes(username)) {
        showError('passwordError', 'Password should not contain your username.');
        return false;
    }
    
    // Check if password contains a mix of characters
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
        showError('passwordError', 'Password must contain a mix of uppercase and lowercase letters, numbers, and special characters.');
        return false;
    }
    
    
    

    // Add more checks as per NIST guidelines

    return true;
}


document.addEventListener('DOMContentLoaded', async function() {
    const csrfToken = await getCsrfToken();
  
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        clearErrors();
        let isValid = true;

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const username =  await getUserName();
    
    const commonPasswords = new Set([
        "password", "123456", "123456789", "qwerty", "12345678", 
        "111111", "1234567", "sunshine", "qwerty123", "iloveyou"
    ]);

    // Check if password is at least 8 characters long
    if (password.length < 8) {
        showError('passwordError', 'Password must be at least 8 characters long.');
         isValid = false;
    }
    
    // Check if password is a common password
    if (commonPasswords.has(password)) {
        showError('passwordError', 'This password is too common. Please choose a different one.');
         isValid = false;
    }
    
    // Check if password contains repetitive characters
    if (/(\w)\1{2,}/.test(password)) {
        showError('passwordError', 'Password should not contain repetitive characters.');
         isValid = false;
    }
    
    // Check if password contains the username
    if (password.includes(username)) {
        showError('passwordError', 'Password should not contain your username.');
         isValid = false;
    }
    
    // Check if password contains a mix of characters
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
        showError('passwordError', 'Password must contain a mix of uppercase and lowercase letters, numbers, and special characters.');
        isValid = false;
    }
    
    
    


        if (password !== confirmPassword) {
            event.preventDefault(); // Prevent form from being submitted
            showError('confirmPasswordError', 'Passwords do not match')
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
                    showNotification('Password reset done successfully. Redirecting to login page...', 'success','http://localhost:8000/client/login.html');

                    //window.location.href = 'http://localhost:8000/client/login.html'; 

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



    const showNotification = (message, type,location  ) => {
        var notifier =
          type === "success"
            ? document.getElementById("success")
            : document.getElementById("errorMessage");
            notifier.textContent = message;
            notifier.style.display = "block";
      

        setTimeout(function () {
          notifier.style.display = "none";
      
          if (type === "success") {
            window.location.href = location;
            console.log
          }
        }, 2000); 
      };
      
