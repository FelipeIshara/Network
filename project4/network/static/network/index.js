//teste
// get the logged user
let loggedUser = JSON.parse(document.getElementById('hello-data').textContent);

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    if (loggedUser.username === "AnonymousUser"){
        
        loadPageContent('all');
    } else {
        // Use buttons to toggle between views
        document.querySelector('#allposts').addEventListener('click', () => loadPageContent('all'));
        document.querySelector('#following').addEventListener('click', () => loadPageContent('following'));
        let profileBtn = document.querySelector('#user')
        profileBtn.addEventListener('click', () => loadPageContent('profile', loggedUser.username));
        // By default, load the allposts page
        loadPageContent('all');
    }
});

// load content 
function loadPageContent(page, profileUsername=null){
    if (page === "all"){
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "block"
        if (loggedUser.username == "AnonymousUser"){
            console.log("pinto")
            let pageNumber = 1
            grabPageOfPosts(page, pageNumber) 
        } else {
            //get cookie
            const csrftoken = getCookie('csrftoken');
            
            //clear form and prepare form to post 
            document.querySelector('[name="content"]').value = ''
            document.querySelector('#newpost-form').onsubmit = () => sendPost(csrftoken)
            //generate page 1 by defalt
            let pageNumber = 1
            grabPageOfPosts(page, pageNumber)
        }    
    }
    if (page === "following"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "none"
        document.querySelector('#following-page').style.display = "block"
        //generate page 1 by defalt
        let pageNumber = 1
        grabPageOfPosts(page, pageNumber) 
    }
    if (page === "profile"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#profile-page').style.display = "block"
        
        fetch(`/profile/followers/${profileUsername}`).then(response => response.json()).then(profile => {
            document.querySelector('#profileTitle').innerHTML = `${profileUsername} - Profile`
            //Follow and Unfollow btn event
            const followBtn = document.querySelector('#follow-btn')
            if (loggedUser.username === profileUsername || loggedUser.username === "AnonymousUser"){
                followBtn.style.display = "none";
            }else{
                followBtn.style.display = "block";
                //check if logged user follow the profile
                if (!profile.isFollowing){
                    followBtn.innerHTML = "Follow"
                } else {
                    followBtn.innerHTML = "Unfollow"
                }
                 //get cookie
                 const csrftoken = getCookie('csrftoken');
                 followBtn.onclick = () => follow(csrftoken, profileUsername)
                 document.querySelector('#profile-title').append(followBtn)
            
            }
            
            //Follow and Unfollow btn event
            //Display the number of followers the user has, 
            //the number of people that the user follows.
            document.querySelector('#profile-followers').innerHTML = `Followers: ${profile.followers}`
            document.querySelector('#profile-following').innerHTML = `Following: ${profile.following}`
             //generate page 1 by defalt
            let pageNumber = 1
            grabPageOfPosts(page, pageNumber, profileUsername)

        });
            
    }
    
}

function grabPageOfPosts(pageType, pageNumber, profileUsername=null){
    //clear all posts
    const PostsDiv = document.querySelector(`#${pageType}-posts-div`)
    PostsDiv.innerHTML = ""
    
    
    if (profileUsername){
        fetch(`getposts/${pageType}/${pageNumber}/${profileUsername}`).then(response => response.json()).then(page => {
            page.postsList.forEach(post => {
                    //create html for each post
                    let postDiv = createHtmlforPost(post, pageType)
                    //add the created div to allPostDiv(page)
                    PostsDiv.append(postDiv)
                }
            );
            // set up Pagination
            setPagination(pageType, page.hasNext, page.hasPrevious, pageNumber, profileUsername)
        });
    } else {
        fetch(`getposts/${pageType}/${pageNumber}`).then(response => response.json()).then(page => {
            page.postsList.forEach(post => {
                    //create html for each post
                    let postDiv = createHtmlforPost(post, pageType, profileUsername)
                    //add the created div to allPostDiv(page)
                    PostsDiv.append(postDiv)
                }
            );
            // set up Pagination
            setPagination(pageType, page.hasNext, page.hasPrevious, pageNumber)
        });
    }
}

//create html for each post 
function createHtmlforPost(post, pageType, profileUsername=null){
    //div for post
    postDiv = document.createElement('div')
    postDiv.setAttribute("class", "postDiv")

    const usernameAndDateDiv = document.createElement('div')
    usernameAndDateDiv.setAttribute("class", "username-date")
    //html for username 
    const usernameDiv = document.createElement('div')
    usernameDiv.setAttribute("class", "post-item username-div")
    
    
    //and  date
    const dateDiv = document.createElement('div')
    dateDiv.setAttribute("class", "post-item date-div")
    let newDateTime = post.date.split('T')
    dateparcial = newDateTime[0].split('-')
    timeparcial = newDateTime[1].split('.')[0].split(':')
    dateDiv.innerHTML = `${dateparcial[0]}/${dateparcial[1]} - ${timeparcial[0]}:${timeparcial[1]}`

    //and profile button
    const profileLink = document.createElement('button')
    profileLink.setAttribute("class", "unstyle-btn profilelink")
    profileLink.innerHTML = `@${post.owner}:`
    profileLink.addEventListener("click", () => loadPageContent("profile", post.owner))
    usernameDiv.append(profileLink)

    usernameAndDateDiv.append(usernameDiv, dateDiv)

    
    

    //html for content 
    const contentDiv = document.createElement('div')
    contentDiv.setAttribute("class", "content-div")
    contentDiv.innerHTML = post.content
    
    
    
    //likes 
    const likesDiv = document.createElement('div')
    likesDiv.setAttribute("class", "likes-div")
    likesDiv.innerHTML = `<i class="fas fa-heart"></i> ${post.likes}`
    // if the user is authenticated, give a edit or a like btn
    if(loggedUser.username !== "AnonymousUser"){
        if (post.owner === loggedUser.username){
            const editBtn = document.createElement('button')
            editBtn.setAttribute("class", "btn edit")
            editBtn.innerHTML = "Edit"
            editBtn.onclick = () => {
                contentDiv.innerHTML = ""
                textAreaForPost = document.createElement('textarea')
                textAreaForPost.setAttribute("class", "edit-textarea")
                textAreaForPost.innerHTML = post.content
                contentDiv.append(textAreaForPost)
                editBtn.innerHTML = "Update"
                textAreaForPost.setAttribute('name', 'updatecontent')
                editBtn.onclick = () => updatePost(post.id)
            }
            postDiv.append(usernameAndDateDiv, contentDiv, likesDiv, editBtn)
        } else {
            const likeBtn = document.createElement('button')
            likeBtn.setAttribute("class", "btn unlike unstylebtn")
            if (post.userAlreadyLike){
                likeBtn.innerHTML = `<i class="fas fa-heart"></i> ${post.likes}`
            } else {
                likeBtn.innerHTML = `<i class="far fa-heart"></i> ${post.likes}`
                likeBtn.setAttribute("class", "btn unlike")
            }
            likeBtn.onclick = () => likePost(post.id, pageType, profileUsername)
            postDiv.append(usernameAndDateDiv, contentDiv, likeBtn)
        }
    } else {
        postDiv.append(usernameAndDateDiv, contentDiv, likesDiv)
    }
    
    postDiv.style.display = "flex"
    
    return postDiv
}

// like
//like/unlike 
function likePost(postId, pageType, profileUsername){
    const csrftoken = getCookie('csrftoken');
    const headers = new Headers();
    headers.append('X-CSRFToken', csrftoken)
    fetch(`/likepost/${postId}`, {
        headers: headers,  
        method: 'POST'
    }).then(response => response.json()).then(result => {
        console.log(pageType);
        //reload page posts
        loadPageContent(pageType, profileUsername);
        console.log(result);
    });
}

function updatePost(postId){
    const csrftoken = getCookie('csrftoken');
    content = document.querySelector('[name="updatecontent"]').value
    console.log(content)
    const headers = new Headers();
    headers.append('X-CSRFToken', csrftoken)
    fetch(`/updatepost/${postId}`, {
        headers: headers,  
        method: 'POST',
        body: JSON.stringify({
            content: content,
        })
    }).then(response => response.json()).then(result => {
        loadPageContent('all');
        console.log(result);
    });
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
            loadPageContent('all');
            console.log(result);
        });
        return false  
    
}
function follow(csrftoken, username){
    //fetch(`/follow/${profileUsername}`).then(response => response.json()).then(profile => {})
    const headers = new Headers();
    headers.append('X-CSRFToken', csrftoken)
    fetch(`/follow/${username}`, {
        headers: headers,  
        method: 'POST'
    }).then(response => response.json()).then(result => {
        loadPageContent('profile', username);
        console.log(result.message);
    });
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




function setPagination(pageType, hasNext, hasPrevious, pageNumber, profileUsername=null){
    if (hasPrevious){
        const previousBtn = document.querySelector("#previousBtn")
        previousBtn.style.display = "block"
        previousBtn.onclick = () => grabPageOfPosts(pageType, pageNumber-1, profileUsername)
    } else {
        document.querySelector("#previousBtn").style.display = "none"
    }

    if (hasNext){
        const nextBtn = document.querySelector("#nextBtn")
        nextBtn.style.display = "block"
        nextBtn.onclick = () => grabPageOfPosts(pageType, pageNumber+1, profileUsername)

    } else {
        document.querySelector("#nextBtn").style.display = "none"
    }
}