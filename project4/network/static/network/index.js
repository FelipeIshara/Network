document.addEventListener('DOMContentLoaded', function() {
    
    // Use buttons to toggle between views
    document.querySelector('#allposts').addEventListener('click', () => loadPageContent('allposts'));
    document.querySelector('#following').addEventListener('click', () => loadPageContent('following'));
    let profileBtn = document.querySelector('#user')
    const username = profileBtn.innerHTML 
    profileBtn.addEventListener('click', () => loadPageContent('user-profile', username));
    // By default, load the allposts page
    loadPageContent('allposts');
});

/* to acess profile pages, this function has to be called with
user-profile as an argument and the username as second argument*/
function loadPageContent(page, ownerUsername=null){
    
    if (page === "allposts"){
        //get cookie
        const csrftoken = getCookie('csrftoken');
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "block"
        
        
        //clear form to post
        document.querySelector('[name="content"]').value = ''
        //prepare form to post 
        document.querySelector('#newpost-form').onsubmit = () => sendPost(csrftoken)
        
        //clear all posts
        const allPostsDiv = document.querySelector("#allposts-div")
        allPostsDiv.innerHTML = ""
        
        //Grab posts
        fetch(`getposts`).then(response => response.json()).then(posts => {
            posts.forEach(post => {
                    //create html for each post
                    let postDiv = createHtmlforPost(post)
                    //add the created div to allPostDiv(page)
                    allPostsDiv.append(postDiv)
                });
            });
        
        }



    if (page === "following"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#following-page').style.display = "block"
    }
    if (page === "user-profile"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "block"
        fetch(`/profile/${ownerUsername}`).then(response => response.json()).then(profile => {
            console.log(profile)
            document.querySelector('#profileTitle').innerHTML = `${ownerUsername} - Profile`
            document.querySelector('#profile-followers').innerHTML = `Followers: ${profile.followers}`
            document.querySelector('#profile-following').innerHTML = `Following: ${profile.following}`
            profilePostsDiv = document.querySelector('#profile-posts')
            //clear all posts
            
            profilePostsDiv.innerHTML = ""
            
            //Grab profile posts
            fetch(`/getposts/${ownerUsername}`).then(response => response.json()).then(posts => {
                posts.forEach(post => {
                        //create html for each post
                        let postDiv = createHtmlforPost(post)
                        //add the created div to allPostDiv(page)
                        profilePostsDiv.append(postDiv)
                    }
                )
            });
        });
            
            
            

        //Display the number of followers the user has, 
        //the number of people that the user follows.


    }
    
}


//create html for each post 
function createHtmlforPost(post){
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
