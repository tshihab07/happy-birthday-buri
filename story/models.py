from django.db import models


class BirthdayStory(models.Model):
    slug = models.SlugField(unique=True, default='ripa-khan')
    recipient_name = models.CharField(max_length=120, default='Ripa Khan')
    nickname = models.CharField(max_length=120, default='Buri')
    sender_name = models.CharField(max_length=120, default='Tshihab')
    sender_alias = models.CharField(max_length=120, default='Mr. Engineer')
    monogram = models.CharField(max_length=5, default='R')
    music_title = models.CharField(
        max_length=200,
        default='Classic Birthday Celebration',
    )
    music_url = models.CharField(
        max_length=500,
        default='https://www.wishhappybdayto.me/music/happy-birthday-357371.mp3',
    )

    text_1_story_for = models.TextField()
    text_2_happy_bday = models.TextField()
    text_3_intro = models.TextField()
    text_4_demo_badge = models.CharField(max_length=200)
    text_5_banner_bday = models.TextField()
    text_6_touch_hint = models.TextField()
    text_7_balloon_prompt = models.TextField()
    text_13_greeting = models.TextField()
    text_14_continue_hint = models.TextField()
    text_15_cut_cake = models.TextField()
    text_16_cake_slice = models.TextField()
    text_17_envelope_for = models.CharField(max_length=200)
    text_18_letter_prompt = models.TextField()
    text_19_letter_body = models.TextField()
    text_20_memory_lane = models.TextField()
    text_21_scratch_msg = models.TextField()
    text_22_finale_memories = models.TextField()

    class Meta:
        verbose_name = 'Birthday Story'
        verbose_name_plural = 'Birthday Stories'

    def __str__(self):
        return f"{self.recipient_name} ({self.slug})"


class BalloonReason(models.Model):
    story = models.ForeignKey(
        BirthdayStory,
        related_name='balloons',
        on_delete=models.CASCADE,
    )
    order = models.PositiveSmallIntegerField()
    text = models.TextField()
    color = models.CharField(max_length=32)
    float_offset = models.CharField(max_length=16, default='0px')
    delay = models.CharField(max_length=16, default='0s')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Balloon {self.order}: {self.text[:40]}"


class QuizQuestion(models.Model):
    ANSWER_RULE_CHOICES = [
        ('any', 'Any Option Correct'),
        ('only_c_dodge', 'Only C Selectable (A/B/D Dodge)'),
        ('c', 'Option C Correct'),
        ('d', 'Option D Correct'),
    ]

    story = models.ForeignKey(
        BirthdayStory,
        related_name='quizzes',
        on_delete=models.CASCADE,
    )
    order = models.PositiveSmallIntegerField()
    question = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    answer_rule = models.CharField(max_length=32, choices=ANSWER_RULE_CHOICES)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Quiz {self.order:02d}: {self.question[:40]}"


class StoryPhoto(models.Model):
    SECTION_CHOICES = [
        ('memory_lane', 'Memory Lane'),
        ('finale', 'Finale Gallery'),
    ]

    story = models.ForeignKey(
        BirthdayStory,
        related_name='photos',
        on_delete=models.CASCADE,
    )
    order = models.PositiveSmallIntegerField()
    section = models.CharField(max_length=32, choices=SECTION_CHOICES)
    filename = models.CharField(max_length=100)
    quote = models.TextField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Photo {self.order} ({self.filename})"

