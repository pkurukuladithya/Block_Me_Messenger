from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Same as DRF's SessionAuthentication but skips CSRF enforcement. Useful for
    login/logout endpoints that still rely on session cookies.
    """

    def enforce_csrf(self, request):
        return
