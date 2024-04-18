// script.js
document.addEventListener('DOMContentLoaded', async function() {
    document.querySelector('.logout').addEventListener('click', async function(e){
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
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
                    ${blog.content}
                </p>
                <div class="blogFooter">
                    <!-- You can add more footer content here if needed -->
                </div>
            `;

            card.dataset.blog = JSON.stringify(blog);
            card.addEventListener('click', function(event) {
                // Retrieve the blog object from the data attribute
                var blog = JSON.parse(card.dataset.blog);
            
                localStorage.setItem('blog', JSON.stringify(blog));
            
                // Navigate to the writeBlog page
                window.location.href = 'detailsBlog.html'; 
                console.log('a',blog);
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