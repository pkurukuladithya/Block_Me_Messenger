from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "avatar")

    def get_avatar(self, obj):
        profile = getattr(obj, "profile", None)
        if profile and profile.avatar:
            url = profile.avatar.url
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(url)
            return url
        return ""


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    email = serializers.EmailField(source="user.email")
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ("username", "email", "bio", "avatar", "avatar_url")
        extra_kwargs = {
            "avatar": {"write_only": True},
        }

    def get_avatar_url(self, obj):
        profile_avatar = obj.avatar
        if profile_avatar:
            request = self.context.get("request")
            url = profile_avatar.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return ""

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        username = user_data.get("username")
        email = user_data.get("email")

        if username:
            instance.user.username = username
        if email:
            instance.user.email = email
        instance.user.save()

        avatar = validated_data.get("avatar")
        if avatar is not None:
            instance.avatar = avatar

        if "bio" in validated_data:
            instance.bio = validated_data["bio"]

        instance.save()
        return instance
