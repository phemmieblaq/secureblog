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




document.addEventListener('DOMContentLoaded',  async function() {
    const csrfToken = await getCsrfToken();
    const form = document.getElementById('otpForm');
    

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        clearErrors();
        let isValid = true;

        
       
    
        const otp = document.getElementById('otp').value;
        console.log(otp);
        if (otp.length < 6) {
            showError('otpError', 'incorrect OTP');
            isValid = false;
        }
       
        
        

        if (isValid) {
            
            const otp = document.getElementById('otp').value; // Get the OTP from the input field
          
                const response = await fetch('http://localhost:3000/auth/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ otp: otp }),
                    credentials: 'include'   // Necessary to include cookies in the request
                });
        
                const data = await response.json(); // Parse the JSON response
        
                if (response.ok) {
                    console.log('Success:', data.message);
                    // alert('login sucessfully')
                    // Redirect user or update UI as needed
                    showNotification('login succesfully', 'success','http://localhost:8000/client/dashboard.html');
                     // Redirect to dashboard
                } else {
                    showError('serverError',data.error); // Throw an error if the server responded with an error
                }
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
      
        // Hide the notification after a certain duration (e.g., 3 seconds)
        setTimeout(function () {
          notifier.style.display = "none";
      
          if (type === "success") {
            window.location.href = location;
            console.log
          }
        }, 3000); // 3000 milliseconds = 3 seconds
      };
      

