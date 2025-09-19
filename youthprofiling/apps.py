# apps.py

from django.apps import AppConfig

class YouthprofilingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'youthprofiling'

    def ready(self):
        import youthprofiling.signals  
