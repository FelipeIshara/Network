
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("newpost", views.new_post, name="newpost"),
    path("getposts", views.get_posts, name="allposts"),
    path("getposts/<int:page>", views.get_posts, name="allpostsbypage"),
    path("getposts/<str:pagetype>", views.get_posts, name="followingposts"),
    path("getposts/<str:pagetype>/<int:page>", views.get_posts, name="profilepostsbypage"),
    path("getposts/<str:pagetype>/<str:username>", views.get_posts, name="profileposts"),
    path("profile/<str:username>", views.profileData, name="profile"),
    path("follow/<str:username>", views.follow, name="profile")
]
