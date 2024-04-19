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
                    ${blog.content}
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


            card.addEventListener('click', function(event) {
                // Retrieve the update button
                var button = card.querySelector('#update');
            
                // Retrieve the blog object from the data attribute
                var blog = JSON.parse(button.dataset.blog);

                localStorage.setItem('blog', JSON.stringify(blog));
            
                // Navigate to the writeBlog page
                window.location.href = 'detailsBlog.html'; 
                console.log('a',blog);
            });


            card.querySelector('#update').addEventListener('click', function(event) {
                // Stop the propagation of the click event
                event.stopPropagation();
                // 'event.target' is the button that was clicked
                var button = event.target;

                // Retrieve the blog object from the data attribute
                var blog = JSON.parse(button.dataset.blog);
            
                // Store the blog data in localStorage
                localStorage.setItem('blog', JSON.stringify(blog));
            
                // Navigate to the writeBlog page
                window.location.href = 'writeBlog.html'; 
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
                    window.location.href = 'http://localhost:8000/client/myblog.html'; 
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
    } else {
        // Create a card to inform the user that the search functionality is not available
        const card = document.createElement('div');
        card.className = 'innerCard';
        card.innerHTML = `
            <div class="userContainer">
                <p class="profileUsername">
                    Search functionality is not available.
                </p>
            </div>
            <p class="blogTitle">
                Please check your browser or contact support.
            </p>
        `;
        container.appendChild(card);
    }
});