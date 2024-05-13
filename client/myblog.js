

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
   
    

    document.querySelector('.imageContainer').addEventListener('click', function() {
        window.location.href='http://localhost:8000/client/dashboard.html'; 
       
    });
    
    let cardData;

    try {
        const response = await fetch('http://localhost:3000/user/blogs', {
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
        console.log('myBlogs:', cardData);
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
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) 
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
                

                
                </div>
                <div class="buttonWrapper"> 
                <button id ='delete' type="buton">delete</button>
                <button id ='update' type="button">update</button>
                </div>
              
            `;
                                    // Store the blog object in a data attribute of the "update" button
        card.querySelector('#update').dataset.blog = JSON.stringify(blog);

        card.querySelector('#delete').dataset.blog = JSON.stringify(blog);
     

        card.addEventListener('click', async function(event) {
            // Retrieve the update button
            var button = card.querySelector('#update');
        
            // Retrieve and parse the blog object from the data attribute
            var blog = JSON.parse(button.dataset.blog);
            console.log(blog);
        
            const response = await fetch('http://localhost:3000/store-blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify(blog),
                credentials: 'include'   // Necessary to include cookies in the request
            });
        
            const data = await response.json(); // Parse the JSON response
                if (response.ok) {
                    console.log('Success:', data.message);
                    // Navigate to the writeBlog page
                     window.location.href = "detailsBlog.html";

                }


            
          
           
        
        });

            card.querySelector('#update').addEventListener('click', async function(event) {
                // Stop the propagation of the click event
                event.stopPropagation();
                // 'event.target' is the button that was clicked
                var button = event.target;

                // Retrieve the blog object from the data attribute
                
                var blog = JSON.parse(button.dataset.blog);
                const response = await fetch('http://localhost:3000/store-blog', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken
                    },
                    body: JSON.stringify(blog),
                    credentials: 'include'   // Necessary to include cookies in the request
                });
        
                const data = await response.json(); // Parse the JSON response
        
                if (response.ok) {
                    console.log('Success:', data.message);
                    // Navigate to the writeBlog page
                     window.location.href = "writeBlog.html";

                }


             
                

            
                // Store the blog data in localStorage
                //localStorage.setItem('blog', JSON.stringify(encryptedBlog));
            
                // Navigate to the writeBlog page
                //window.location.href = 'writeBlog.html'; 
            });


            card.querySelector('#delete').addEventListener('click', async function(event) {

                event.stopPropagation();
                // 'event.target' is the button that was clicked
                var button = event.target;
                // Retrieve the blog object from the data attribute
                var blog = JSON.parse(button.dataset.blog);
                // Now you can do whatever you want with the button
                // console.log(blog);

                try {
                    const response = await fetch(`http://localhost:3000/blog/${blog.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'CSRF-Token': csrfToken
                        },
                        credentials: 'include'
                    });
            
                    if (!response.ok) {
                        throw new Error('Failed to fetch blogs: ' + response.status);
                    }
            
                    const deleteBlog = await response.json();
                
                    showNotification('Blog deleted successfully.', 'success','http://localhost:8000/client/myblog.html');
                
                    //window.location.href = 'http://localhost:8000/client/myblog.html'; 
                    console.log('deleteBlog:', deleteBlog);
                } catch (error) {
                    console.log('Error Deleting blogs:', error);
                    // Handle the error appropriately, e.g., show an error message to the user
                }
            });
            
            container.appendChild(card);
        });
    }
    // Add the event listener to the "delete" button
    

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

 


//   function encrypt(plaintext, secret) {
//     var key = CryptoJS.enc.Utf8.parse(secret);
//     let iv = CryptoJS.lib.WordArray.create(key.words.slice(0, 4));
//     console.log("IV : " + CryptoJS.enc.Base64.stringify(iv));

//     // Encrypt the plaintext
//     var cipherText = CryptoJS.AES.encrypt(plaintext, key, {
//       iv: iv,
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7
//     });
//     return cipherText.toString();
// }

