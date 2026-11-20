from django.urls import path

from story.views import birthday_story_view

urlpatterns = [
    path('', birthday_story_view, name='birthday_story'),
]

