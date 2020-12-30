from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
   followers = models.ManyToManyField('self', blank=True, related_name="following", )
   

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=False)
    date = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField('User', related_name="likedPosts", symmetrical=False, blank=True)
    def __str__(self):
        return f"{self.owner} posted: {self.content}"
