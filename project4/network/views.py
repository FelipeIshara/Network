from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .forms import CreatePostForm
from django.core.serializers import serialize
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Post
import json



def index(request):
    if request.user.is_authenticated:
        create_form = CreatePostForm()
        return render(request, "network/index.html", {
            "createform": create_form
        })
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


def get_posts(request, pagetype=None, username=None, page=1):
    if pagetype == "following":
        #grab user 
        user = User.objects.get(username=request.user)
        print(user)
        #grab following user
        followingquery = list(user.following.all().values('username'))
        q = Post.objects.all()
        following = [follower['username'] for follower in followingquery]
        print(following)
        postsList = list(Post.objects.filter(owner__username__in=following).order_by("-date").values('id', 'owner__username', 'content', 'date', 'likes'))
        page = posts.page(page)
        return JsonResponse(page.object_list, safe=False)
    elif pagetype == "profile":
        postsList = list(Post.objects.filter(owner__username=username).order_by("-date").values('id', 'owner__username', 'content', 'date', 'likes'))
        posts = Paginator(postsList, 10)
        postPage = posts.page(page)
        return JsonResponse(postPage.object_list, safe=False)
    #IF NOT PROFILE RETURN ALL POSTS
    else: 
        postsQuery = list(Post.objects.order_by("-date").values('id', 'owner__username', 'content', 'date', 'likes'))
        posts = Paginator(postsQuery, 10)
        if page not in posts.page_range:
            print(f'page: {page} not valid !!!!')
        else:
            postsPage = posts.page(page)
            postsList = postsPage.object_list
            hasNext = postsPage.has_next()
            hasPrevious = postsPage.has_previous() 
            
            print(f'{hasNext} and {hasPrevious}')
            
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
