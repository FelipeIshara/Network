from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
   followers = models.ManyToManyField('self', blank=True, null=True, related_name="following", symmetrical=False)
   

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=False)
    date = models.DateField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0, blank=False)

    def __str__(self):
        return f"{self.owner} posted: {self.content}"
