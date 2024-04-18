document.addEventListener('DOMContentLoaded', function() {
    let blogData;

    const blog = JSON.parse(localStorage.getItem('blog'));

    if(blog !== null){
        fetch(`http://localhost:3000/blog/${blog.id}`, {
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