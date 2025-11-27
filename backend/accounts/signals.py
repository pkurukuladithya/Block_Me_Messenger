from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver

from .models import Profile


@receiver(post_save, sender=get_user_model())
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_migrate)
def ensure_profiles(sender, **kwargs):
    if sender.name != "accounts":
        return
    User = get_user_model()
    for user in User.objects.filter(profile__isnull=True):
        Profile.objects.create(user=user)
