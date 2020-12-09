from django import forms

class CreatePostForm(forms.Form):
    content = forms.CharField(label="New Post", widget=forms.Textarea(attrs={
        "rows": 10,
    }))