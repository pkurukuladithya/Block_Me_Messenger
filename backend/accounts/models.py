from django.conf import settings
from django.db import models


def user_avatar_path(instance, filename):
    return f"avatars/user_{instance.user_id}/{filename}"


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    avatar = models.ImageField(upload_to=user_avatar_path, blank=True, null=True)
    bio = models.CharField(max_length=160, blank=True)

    def __str__(self):
        return f"Profile({self.user.username})"
