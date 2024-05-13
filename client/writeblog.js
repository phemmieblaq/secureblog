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

async function clearStoredBlog() {
    try {
        const response = await fetch('http://localhost:3000/clear-blog', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token: ' + response.status);
        }

        const data = await response.json();
        return data
    } catch (error) {
        console.error('Failed to fetch blog:', error);
        return null;
    }
}


async function getStoredBlog() {
    try {
        const response = await fetch('http://localhost:3000/store-blog', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token: ' + response.status);
        }

        const data = await response.json();
        return data
    } catch (error) {
        //console.log('Error during fetching get stored data:', error);
        return null; 
    }
}


async function getSession() {
    try {
        const response = await fetch('http://localhost:3000/protected-route', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            showNotification('Session timed out. redirecting to login lage ','error','http://localhost:8000/client/login.html')
        }

        const data = await response.json();
        return data
    } catch (error) {
        console.log('Error during fetching protected route:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
}





document.addEventListener('DOMContentLoaded', async function() {
    getSession();
    const csrfToken = await getCsrfToken();
    const form = document.getElementById('messageForm');
    const titleInput = document.getElementById('title');
    const messageBodyInput = document.getElementById('messageBody');
    const submitButton = document.getElementById('SubmitPost');
    let blog = await getStoredBlog() ;
    console.log(blog);
    

    
    


    document.querySelector('.imageContainer').addEventListener('click', function() {
        window.location.href='http://localhost:8000/client/dashboard.html'; 
       
    });
  

    // If a blog post exists, prefill the form with its data and change the button text to 'Update'
    if(blog !== null){
        titleInput.value = blog.title;
        messageBodyInput.value = blog.content;
        submitButton.textContent = 'Update';
    }

    form.addEventListener('submit', async function(event) {
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
                    showNotification(`Blog ${method==='PUT'?'updated':'posted'}  succesfully`, 'success','http://localhost:8000/client/myblog.html');

                    window.location.href = 'http://localhost:8000/client/myblog.html'; 

                    // If a blog post was updated, remove it from the local storage
                    if(method === 'PUT'){
                        clearStoredBlog();
                        //localStorage.removeItem('blog');
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
          else if(type === "error") {
            window.location.href = location;
          }
        }, 3000); 
      };





