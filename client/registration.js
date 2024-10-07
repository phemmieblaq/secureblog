
// script.js
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



document.addEventListener('DOMContentLoaded', async function() {
    const csrfToken = await getCsrfToken();
    console.log(csrfToken)
    const form = document.getElementById('registrationForm');
    const mathQuestion = document.getElementById('mathQuestion');
    let correctAnswer;  // Variable to store the correct answer for the CAPTCHA

    
    function generateMathProblem() {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        correctAnswer = num1 + num2;
        mathQuestion.textContent = `${num1} + ${num2}`;
    }

    generateMathProblem();

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearErrors();
        let isValid = true;

        const username = document.getElementById('username').value;
        if (username.length < 3) {
            showError('usernameError', 'Username must be at least 3 characters long.');
            isValid = false;
        }

       
       
        const email = document.getElementById('email').value;
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address.');
            isValid = false;
        }

        const password = document.getElementById('password').value;

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
        
        
        
      
        
        const userAnswer = parseInt(document.getElementById('captcha').value, 10);
        if (userAnswer !== correctAnswer) {
            showError('captchaError', 'Incorrect answer. Please try again.');
            isValid = false;
        }

        if (isValid) {
            const formData = {
                username: document.getElementById('username').value.trim().toLowerCase(),
                email: document.getElementById('email').value.trim().toLowerCase(),
                password_hash: document.getElementById('password').value.trim()
            };

            console.log('Form Data:', formData); // Data to be sent

            // Fetch request
            
            fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify(formData),
                credentials: 'include'  
            })
            .then(response => {
                return response.json();  // Only parse as JSON if the response was okay
            })
            .then(data => {
                if (data.error) {
                    
                    showError('serverError', data.error);  // Display the error message on the UI
                } else {
                    showNotification('Account created successfully. Redirecting to login page...', 'success','http://localhost:8000/client/login.html');

                    // console.log('Success:', data);
                    // window.location.href = 'login.html'; 
                    // Proceed with handling the successful response, e.g., redirect or update UI
                }
            })
            .catch((error) => {
                
                showError('serverError', error); // Improved error handling
            });
            
        }
    });
});

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

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
      
