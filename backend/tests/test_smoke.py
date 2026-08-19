from django.test import TestCase


class SmokeTest(TestCase):
    def test_settings_carregam(self):
        from django.conf import settings

        self.assertTrue(settings.INSTALLED_APPS)
        self.assertEqual(settings.AUTH_USER_MODEL, "usuarios.Usuario")
