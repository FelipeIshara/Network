from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.serializers import serialize
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Post
import json



def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")
    else:
        return HttpResponseRedirect(reverse("login"))

@login_required
def new_post(request):
    #convert json to dict
    data = json.loads(request.body)
    content = data.get("content")
    owner = request.user
    new_post = Post(
        owner=owner,
        content=content
    )
    new_post.save()
    print(f"create post for {owner}")
    return JsonResponse({"message": f"{owner} post: {content}"}, status=201)

def update_post(request, postid):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    content = data.get("content")
    post = Post.objects.filter(pk=postid).update(content=content)
    return JsonResponse({"message": f"{request.user} updated post content to: {content}"}, status=201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



def get_posts(request, pagetype, pagenumber, profileusername = None):
    if pagetype == "all":
        postsQuery = list(Post.objects.order_by("-date"))
        formatedPosts = formate_posts(postsQuery, request.user)
        
            
            

    if pagetype == "following":
        #grab following Users
        user = User.objects.get(username=request.user)
        followingUsersQuery = list(user.following.all().values('username'))
        followingUsersList = [user['username'] for user in followingUsersQuery]
        postsQuery = list(Post.objects.filter(owner__username__in=followingUsersList).order_by("-date").values('id', 'owner__username', 'content', 'date', 'likes')) 
    if pagetype == "profile":
        postsQuery = list(Post.objects.filter(owner__username=profileusername).order_by("-date").values('id', 'owner__username', 'content', 'date', 'likes'))
    
    
    posts = Paginator(formatedPosts, 10)
    if pagenumber not in posts.page_range:
        print(f'page: {page} not valid !!!!')
        return JsonResponse({'message': "No content for this page"})
    postsPage = posts.page(pagenumber)
    postsList = postsPage.object_list
    hasNext = postsPage.has_next()
    hasPrevious = postsPage.has_previous()
    return JsonResponse({'postsList': postsList, 'hasNext': hasNext, 'hasPrevious': hasPrevious}) 

        



def profileData(request, username):
    #querying user
    profile = User.objects.get(username=username)
    # query following = list(profile.following.all().values())
    # query followers = list(profile.followers.all().values())
    followers = profile.followers.all().count()
    following = profile.following.all().count()
    #check if request.user follow the profile
     
    userIsFollowingTheProfile = profile.followers.filter(username=request.user).first()
    if userIsFollowingTheProfile:
        isFollowing = True
    else:
        isFollowing = False
            
    return JsonResponse({"followers": followers, "following": following, "isFollowing": isFollowing})


def follow(request, username):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    user = User.objects.get(username=username)
    
    userAlreadyfollowed = user.followers.filter(username=request.user).first()
    if userAlreadyfollowed:
        message = f"Unfollowing {username}"
        #unfollow
        user.followers.remove(request.user)
    else:
        message = f"Following {username}"
        user.followers.add(request.user)
    return JsonResponse({"message": message}, status=201)


def like_post(request, postid):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post = Post.objects.get(pk=postid)
    print(post.id)

    userAlreadyLiked = post.likes.filter(username=request.user).first()
    if userAlreadyLiked:
        message = f'UnLiking Post'
        post.likes.remove(request.user)
    else:
        message = f'Liking Post'
        post.likes.add(request.user)
    return JsonResponse({"message": message}, status=201)
 


def formate_posts(postsQuery, user):
    listOfPosts = []
    for post in postsQuery:
        userAlreadyLike = ""
        likes = post.likes.all()
        if user in list(likes):
            userAlreadyLike = True
        else:
            userAlreadyLike = False
        ownerusername = post.owner.username
        formatedPost = {
            'owner': post.owner.username,
            'id': post.id,
            'content': post.content,
            'date': post.date,
            'likes': likes.count(),
            'userAlreadyLike': userAlreadyLike
        }
        listOfPosts.append(formatedPost)
    return listOfPosts
    