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
        //console.log('Error during fetching protected route:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
}




document.addEventListener('DOMContentLoaded', async function() {
    getSession();
    const csrfToken = await getCsrfToken();
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
    let cardData;

    try {
        const response = await fetch('http://localhost:3000/blogs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch blogs: ' + response.status);
        }

        cardData = await response.json();
        console.log('Blogs:', cardData);
    } catch (error) {
        console.log('Error fetching blogs:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }

    const container = document.querySelector('.blogPostCard');
    const searchInput = document.getElementById('searchInput');

    // Function to populate or filter blog cards based on the search term
    function populateOrFilterBlogs(searchTerm = '') {
        if (!cardData) return; // Ensure cardData is populated before proceeding

        const filteredBlogs = cardData.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        container.innerHTML = '';

        filteredBlogs.forEach(blog => {
            const card = document.createElement('div');
            card.className = 'innerCard';
            card.innerHTML = `
                <div class="userContainer">
                    <div class="profile">
                        <p class="profileinitial">
                            ${blog.username.charAt(0).toUpperCase()}
                        </p>
                    </div>
                    <p class="profileUsername">
                        ${blog.username}
                    </p>
                </div>
                <p class="blogTitle">
                    ${blog.title}
                </p>
                <p class="blogPost">
                    ${reduceString(blog.content)}
                </p>
                <div class="blogFooter">
                    <!-- You can add more footer content here if needed -->
                </div>
            `;

            card.dataset.blog = JSON.stringify(blog);
            card.addEventListener('click',  async function(event) {
                // Retrieve the blog object from the data attribute
                var blog = JSON.parse(card.dataset.blog);
                
                let jsonBlog=JSON.stringify(blog)
                console.log('clickedBlog', jsonBlog);
            
                const response = await fetch('http://localhost:3000/store-blog', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken
                    },
                    body: jsonBlog,
                    credentials: 'include'   // Necessary to include cookies in the request
                });
        
                const data = await response.json(); // Parse the JSON response
                console.log(data);
             
                    // console.log('Success:', data.message);
                    // Navigate to the writeBlog page
                     window.location.href = "detailsBlog.html";

                
            });


            container.appendChild(card);
        });
    }

    // Display all cards initially
    populateOrFilterBlogs();

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value;
            populateOrFilterBlogs(searchTerm);
        });
    } 
});

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

  const reduceString =(content) => {
    // Check if the length of the string is greater than the maximum number
    if (content.length > 30) {
      // Return the substring from the beginning to the max length and add '...'
      return content.substring(0, 30) + '...';
    } else {
      // Return the content as it is if it's shorter than the max length
      return content;
    }
  }

 