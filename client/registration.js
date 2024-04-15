
document.addEventListener('DOMContentLoaded', function() {
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

        const phoneInput = document.getElementById('tel').value;
        const phoneRegex = /^\+?(\d{1,4}|\(\d{1,4}\))([-. ]?\d{1,3}){1,4}$/;

        if (!phoneRegex.test(phoneInput)) {
            showError('telError', 'invalid phone number');
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
    
        if (password.length < 8) {
            showError('passwordError', 'Password must be at least 8 characters long.');
            isValid = false;
        }
        if (commonPasswords.has(password)) {
            showError('passwordError', 'This password is too common. Please choose a different one.');
            return false;
        }
    
        if (/(\w)\1{2,}/.test(password)) {
            showError('passwordError', 'Password should not contain repetitive characters.');
            return false;
        }
    
        if (password.includes(username)) {
            showError('passwordError', 'Password should not contain your username.');
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
                phone: document.getElementById('tel').value.trim(),
                password_hash: document.getElementById('password').value.trim()
            };

            console.log('Form Data:', formData); // Data to be sent

            // Fetch request
            fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                return response.json();  // Only parse as JSON if the response was okay
            })
            .then(data => {
                if (data.error) {
                    
                    showError('serverError', data.error);  // Display the error message on the UI
                } else {
                    console.log('Success:', data);
                    window.location.href = 'login.html'; 
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



