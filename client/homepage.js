// script.js
document.addEventListener('DOMContentLoaded', async function() {
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