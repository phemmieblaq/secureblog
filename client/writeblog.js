document.addEventListener('DOMContentLoaded', function() {
    
        
});



document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('messageForm');
    const titleInput = document.getElementById('title');
    const messageBodyInput = document.getElementById('messageBody');
    
     form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearErrors();
        let isValid = true;

        

        // Validate title
        if (titleInput.value.trim() === '') {
            showError('titleError', 'Title is required.');
            isValid = false;
        } 

        // Validate message body
        if (messageBodyInput.value.trim() === '') {
            showError('messageBodyError', 'Body of the message is required.');
            isValid = false;
        } 

        if (!isValid) {
            event.preventDefault(); // Prevent form submission
        }
    

        if (isValid) {
            const formData = {
           
                title: document.getElementById('title').value.trim(),
              
                content: document.getElementById('messageBody').value.trim()
            };

            console.log('Form Data:', formData); // Data to be sent

            // Fetch request
            fetch('http://localhost:3000/blog', {
                method: 'POST',
                credentials: 'include',
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
                    window.location.href = 'http://localhost:8000/myblog.html'; 

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



