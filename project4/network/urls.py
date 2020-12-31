
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("newpost", views.new_post, name="newpost"),
    path("updatepost/<int:postid>", views.update_post, name="updatepost"),
    path("likepost/<int:postid>", views.like_post, name="likepost"),
    path("getposts/<str:pagetype>/<int:pagenumber>", views.get_posts, name="getposts"),
    path("getposts/<str:pagetype>/<int:pagenumber>/<str:profileusername>", views.get_posts, name="getprofileposts"),
    path("profile/followers/<str:username>", views.followers_data, name="followers"),
    path("follow/<str:username>", views.follow, name="follow")
]
