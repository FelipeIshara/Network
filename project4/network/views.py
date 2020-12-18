from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .forms import CreatePostForm
from django.core.serializers import serialize
from django.contrib.auth.decorators import login_required

from .models import User, Post
import json



def index(request):
    
    print(request.user)
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


def all_posts(request):
    posts = list(Post.objects.order_by("-date").values('id', 'owner__username', 'content', 'date', 'likes'))
    return JsonResponse(posts, safe=False)

def profileData(request, username):
    print("opa")
    return JsonResponse({"message": username})