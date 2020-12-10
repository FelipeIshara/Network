document.addEventListener('DOMContentLoaded', function() {
    
    // Use buttons to toggle between views
    document.querySelector('#allposts').addEventListener('click', () => load_pagecontent('allposts'));
    document.querySelector('#following').addEventListener('click', () => load_pagecontent('following'));
    document.querySelector('#user').addEventListener('click', () => load_pagecontent('user'));
    // By default, load the inbox
    load_pagecontent('allposts');
});

function load_pagecontent(page){
    
    if (page === "allposts"){
        //get cookie
        const csrftoken = getCookie('csrftoken');
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "block"
        document.querySelector('[name="content"]').value = ''
        document.querySelector('#newpost-form').onsubmit = function(){
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
                load_pagecontent('allposts');
                console.log(result.message);
            });
            
            return false  
          }
    }
    if (page === "following"){
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "block"
    }
    if (page === "user"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#user-page').style.display = "block"
        console.log(document.cookie)
        
        console.log(csrftoken);
    }
}

//send posr


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
