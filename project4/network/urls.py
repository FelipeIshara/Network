
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
    path("getposts/<str:profile>", views.get_posts, name="profileposts"),
    path("profile/<str:username>", views.profileData, name="profile")
]
