from django.db import migrations

from story.seed import ensure_story_seeded


def seed_story(apps, schema_editor):
    BirthdayStory = apps.get_model('story', 'BirthdayStory')
    BalloonReason = apps.get_model('story', 'BalloonReason')
    QuizQuestion = apps.get_model('story', 'QuizQuestion')
    StoryPhoto = apps.get_model('story', 'StoryPhoto')
    ensure_story_seeded(
        story_model=BirthdayStory,
        balloon_model=BalloonReason,
        quiz_model=QuizQuestion,
        photo_model=StoryPhoto,
    )


def unseed_story(apps, schema_editor):
    BirthdayStory = apps.get_model('story', 'BirthdayStory')
    BirthdayStory.objects.filter(slug='ripa-khan').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('story', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_story, reverse_code=unseed_story),
    ]

