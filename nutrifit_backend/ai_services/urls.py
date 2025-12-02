from django.urls import path
from .views import parse_natural_language

urlpatterns = [
    path('parse-natural-language/', parse_natural_language, name='parse-nl'),
]
