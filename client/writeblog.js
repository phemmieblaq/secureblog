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
    const form = document.getElementById('messageForm');
    const titleInput = document.getElementById('title');
    const messageBodyInput = document.getElementById('messageBody');
    const submitButton = document.getElementById('SubmitPost');
    let blog = JSON.parse(localStorage.getItem('blog'));


    document.querySelector('.imageContainer').addEventListener('click', function() {
        window.location.href='http://localhost:8000/client/dashboard.html'; 
       
    });
    document.querySelector('.logout').addEventListener('click', async function(e){
       
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to log out: ' + response.status);
            }
            console.log(response.json);
    
            // If the logout was successful, redirect to the login page
            window.location.href = 'http://localhost:8000/client/login.html'; 
        } catch (error) {
            console.error('Error during logout:', error);
            // Handle the error appropriately, e.g., show an error message to the user
        }
    });
    

    // If a blog post exists, prefill the form with its data and change the button text to 'Update'
    if(blog !== null){
        titleInput.value = blog.title;
        messageBodyInput.value = blog.content;
        submitButton.textContent = 'Update';
    }

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
                title: titleInput.value.trim(),
                content: messageBodyInput.value.trim()
            };

            console.log('Form Data:', formData); // Data to be sent

            // If a blog post exists, update it. Otherwise, create a new one.
            let url = 'http://localhost:3000/blog';
            let method = 'POST';

            if(blog !== null && blog.id !== null){
                url += `/${blog.id}`;
                method = 'PUT';
            }

            // Fetch request
            fetch(url, {
                method: method,
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
                    console.log('Success:', data);
                    window.location.href = 'http://localhost:8000/client/myblog.html'; 

                    // If a blog post was updated, remove it from the local storage
                    if(method === 'PUT'){
                        localStorage.removeItem('blog');
                    }

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



