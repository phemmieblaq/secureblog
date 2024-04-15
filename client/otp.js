
document.addEventListener('DOMContentLoaded',  function() {
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
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ otp: otp }),
                    credentials: 'include'   // Necessary to include cookies in the request
                });
        
                const data = await response.json(); // Parse the JSON response
        
                if (response.ok) {
                    console.log('Success:', data.message);
                    alert('login sucessfully')
                    // Redirect user or update UI as needed
                    window.location.href = 'http://localhost:8000/homepage.html'; // Redirect to dashboard
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



