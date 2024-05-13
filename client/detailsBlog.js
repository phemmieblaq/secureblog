

 
  
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
        console.log('Error during fetching get stored data:', error);
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
        console.log('Error during fetching get stored data:', error);
        // Handle the error appropriately, e.g., show an error message to the user
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
    
    const blog=  await getStoredBlog();
    console.log(blog)
    
    if(blog !== null){
        fetch(`http://localhost:3000/blog/${blog.user_id}/${blog.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        
        })
        .then(response => {
            return response.json();  // Only parse as JSON if the response was okay
        })
        .then(data => {
            if (data.error) {
               console.log(data.error) // Display the error message on the UI
            } else {
                
                blogData = data;
                console.log('Success:', blogData);

                const container = document.querySelector('.blogPost');

                container.innerHTML = '';
                const blogDetails = document.createElement('div');
                blogDetails.className = 'detailsBlog';
                blogDetails.innerHTML = `
                        <h2 class="title">
                        ${blogData.title}
                         </h2>

                         <p class="blogPost">
                            ${blogData.content} </p>

                            <div class="blogFooter">
                            <p class="timestamp">written by ${blogData.username}</p>
                          
                            <p class="timestamp">${getTimestamp(blogData.updated_at) }</p>
                            </div>
                        `;

                container.appendChild(blogDetails);

                // Proceed with handling the successful response, e.g., redirect or update UI
            }
        })
        .catch((error) => {
            console.log(error) // Improved error handling
        });
    }
    
    document.querySelector('.subHeader').addEventListener('click', function() {
        clearStoredBlog()
        window.history.back();
        localStorage.removeItem('blog');
    });
});

const getTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZone: 'Europe/London' 
    };

    return date.toLocaleString('en-GB', options);
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
  
  
function decrypt(cipherText, secret, iv) {
    // IV is a base64 string
    let iv1 = CryptoJS.enc.Base64.parse(iv);
    
    var key = CryptoJS.enc.Utf8.parse(secret);
    var cipherBytes = CryptoJS.enc.Base64.parse(cipherText);

    var decrypted = CryptoJS.AES.decrypt({ciphertext: cipherBytes}, key, {
        iv: iv1,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}
