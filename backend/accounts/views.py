from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import CsrfExemptSessionAuthentication
from .models import Profile
from .serializers import ProfileSerializer, RegisterSerializer, UserSerializer


@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)  # creates a session
            return Response(UserSerializer(user, context={"request": request}).data)
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def post(self, request):
        """
        Always return success so the client can clear its state even if the
        session already expired. When authenticated we call Django's logout,
        otherwise we flush the anonymous session to rotate the ID.
        """
        if request.user.is_authenticated:
            logout(request)
        else:
            request.session.flush()

        response = Response({"detail": "Logged out"})
        # Clear CSRF cookie to avoid stale values after logout.
        response.delete_cookie("csrftoken")
        return response

    delete = post  # allow DELETE semantics if desired


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@method_decorator(csrf_exempt, name="dispatch")
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
