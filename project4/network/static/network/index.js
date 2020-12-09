document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#allposts').addEventListener('click', () => load_content('allposts'));
    document.querySelector('#following').addEventListener('click', () => load_content('following'));
    document.querySelector('#user').addEventListener('click', () => load_content('user'));
    // By default, load the inbox
    load_content('user');
  });

  function load_content(content){
      if (content === "allposts"){
        console.log("loading all posts")
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "block"
      }
      if (content === "following"){
        document.querySelector('#user-page').style.display = "none"
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "block"
      }
      if (content === "user"){
        document.querySelector('#allposts-page').style.display = "none"
        document.querySelector('#following-page').style.display = "none"
        document.querySelector('#user-page').style.display = "block"
      }
  }