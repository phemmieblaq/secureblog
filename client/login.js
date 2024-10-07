
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
    const form = document.getElementById('loginForm');
    

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearErrors();
        let isValid = true;

        
        const email = document.getElementById('email').value;
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address.');
            isValid = false;
        }

        const password = document.getElementById('password').value;

        
    
       
        
        

        if (isValid) {
            const formData = {
           
                email: document.getElementById('email').value.trim().toLowerCase(),
              
                password_hash: document.getElementById('password').value.trim()
            };

            console.log('Form Data:', formData); // Data to be sent

            // Fetch request
            fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
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
                    //console.log('Success:', data);
                    showNotification('Check your mail for the one time password ', 'success','http://localhost:8000/client/otp.html');



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
      
        // Hide the notification after a certain duration (e.g., 3 seconds)
        setTimeout(function () {
          notifier.style.display = "none";
      
          if (type === "success") {
            window.location.href = location;
         
          }
        }, 3000); // 3000 milliseconds = 3 seconds
      };
      
