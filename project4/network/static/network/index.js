document.addEventListener('DOMContentLoaded', function() {
    
    // Use buttons to toggle between views
    document.querySelector('#allposts').addEventListener('click', () => loadPageContent('allposts'));
    document.querySelector('#following').addEventListener('click', () => loadPageContent('following'));
    document.querySelector('#user').addEventListener('click', () => loadPageContent('user'));
    // By default, load the inbox
    loadPageContent('allposts');
});

function loadPageContent(page, ownerUsername=null){
    
    if (page === "allposts"){
        //get cookie
        const csrftoken = getCookie('csrftoken');
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "block"
        
        
        //clear form to post
        document.querySelector('[name="content"]').value = ''
        //prepare form to post 
        console.log(csrftoken)
        document.querySelector('#newpost-form').onsubmit = () => sendPost(csrftoken)
        
        //clear posts
        const allPostsDiv = document.querySelector("#allposts-div")
        allPostsDiv.innerHTML = ""
        //Grab posts
        fetch(`/allposts`).then(response => response.json()).then(posts => {
            posts.forEach(post => {
                    let postDiv = createHtmlforPost(post)
                    allPostsDiv.append(postDiv)
                });
            });
        
        }



    if (page === "following"){
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#following-page').style.display = "block"
    }
    if (page === "user"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#user-page').style.display = "block"
    }
    if (page === "user-profile"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "block"
        fetch(`/profile/${ownerUsername}`).then(response => response.json()).then(posts => {
            document.querySelector('#profileTitle').innerHTML = ownerUsername
        })
    }
    
}


//create html for each post 
function createHtmlforPost(post){
    const postText = `${post.owner__username} posted: ${post.content} on ${post.date} and has ${post.likes} likes`
    //div for post
    postDiv = document.createElement('div')

    //html for username and profile button
    const usernameDiv = document.createElement('div')
    const profileLink = document.createElement('button')
    
    profileLink.setAttribute("class", "unstyle-btn profilelink")
    profileLink.innerHTML = post.owner__username
    profileLink.addEventListener("click", () => loadPageContent("user-profile", post.owner__username))
    usernameDiv.append(profileLink)
    


    //html for content, date and likes
    const contentDiv = document.createElement('div')
    contentDiv.innerHTML = post.content
    const dateDiv = document.createElement('div')
    dateDiv.innerHTML = post.date
    const likesDiv = document.createElement('div')
    likesDiv.innerHTML = post.likes

    postDiv.append(usernameDiv, contentDiv, dateDiv, likesDiv)
    
    postDiv.style.display = "flex"
    
    return postDiv

}



//set up post form
function sendPost(csrftoken){
        console.log(csrftoken)
        content = document.querySelector('[name="content"]').value
        const headers = new Headers();
        headers.append('X-CSRFToken', csrftoken)
        fetch('/newpost', {
          headers: headers,  
          method: 'POST',
          body: JSON.stringify({
              content: content,
          })
        }).then(response => response.json()).then(result => {
            loadPageContent('allposts');
            console.log(result);
        });
        return false  
    
}




//get cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
