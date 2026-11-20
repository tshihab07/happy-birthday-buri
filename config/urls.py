from django.urls import include, path

urlpatterns = [
    path('', include('story.urls')),
]
