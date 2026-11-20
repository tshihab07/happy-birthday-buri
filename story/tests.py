import json
import re
from pathlib import Path

from django.conf import settings
from django.contrib.staticfiles import finders
from django.test import TestCase
from django.urls import reverse

from story.models import BalloonReason, BirthdayStory, QuizQuestion, StoryPhoto
from story.seed import BALLOON_ITEMS, PHOTO_ITEMS, QUIZ_ITEMS, STORY_DEFAULTS


class BirthdayStoryTests(TestCase):
    def test_database_seeded_with_story_balloons_quizzes_and_photos(self):
        self.assertEqual(BirthdayStory.objects.count(), 1)
        story = BirthdayStory.objects.get(slug='ripa-khan')
        self.assertEqual(story.recipient_name, 'Ripa Khan')
        self.assertEqual(story.sender_name, 'Tshihab')
        self.assertEqual(story.monogram, 'R')

        self.assertEqual(BalloonReason.objects.filter(story=story).count(), 5)
        self.assertEqual(QuizQuestion.objects.filter(story=story).count(), 5)
        self.assertEqual(StoryPhoto.objects.filter(story=story).count(), 16)
        self.assertEqual(
            StoryPhoto.objects.filter(story=story, section='memory_lane').count(),
            5,
        )
        self.assertEqual(
            StoryPhoto.objects.filter(story=story, section='finale').count(),
            11,
        )

    def test_root_route_renders_all_custom_content_and_excludes_removed_parts(self):
        response = self.client.get(reverse('birthday_story'))
        self.assertEqual(response.status_code, 200)
        html = response.content.decode('utf-8')

        # Dedicated CSS and JS linked
        self.assertIn('/static/story/css/style.css', html)
        self.assertIn('/static/story/js/story.js', html)

        # No inline styles or inline JS blocks in template
        template_text = Path(settings.BASE_DIR / 'templates/story/index.html').read_text(
            encoding='utf-8'
        )
        self.assertNotIn('<style', template_text.lower())
        self.assertIsNone(re.search(r'\sstyle=["\']', template_text))
        # Only JSON data script (via json_script) and external script src are allowed
        script_tags = re.findall(r'<script\b[^>]*>', template_text, flags=re.I)
        for tag in script_tags:
            self.assertIn('src=', tag)

        # Ensure Elena and Jason are completely absent
        self.assertNotIn('elena', html.lower())
        self.assertNotIn('jason', html.lower())

        # Ensure removed features are absent
        self.assertNotIn('Memory book', html)
        self.assertNotIn('Some things are better', html)
        self.assertNotIn('said out loud', html)
        self.assertNotIn('FgKc9G_link', html)
        self.assertNotIn('<time', html)
        self.assertNotIn('2023-02-11', html)

        # Check key custom texts (#1 - #22)
        for key in (
            'text_1_story_for',
            'text_2_happy_bday',
            'text_3_intro',
            'text_4_demo_badge',
            'text_5_banner_bday',
            'text_6_touch_hint',
            'text_7_balloon_prompt',
            'text_13_greeting',
            'text_14_continue_hint',
            'text_16_cake_slice',
            'text_17_envelope_for',
            'text_18_letter_prompt',
            'text_20_memory_lane',
            'text_21_scratch_msg',
            'text_22_finale_memories',
        ):
            self.assertIn(STORY_DEFAULTS[key], html)

        # Letter phrases
        self.assertIn('Dear Buri', html)
        self.assertIn('Mr. Engineer', html)
        self.assertIn('To the one who holds my heart', html)
        self.assertIn('With all my love,', html)

        # All 5 balloon texts
        for item in BALLOON_ITEMS:
            self.assertIn(item['text'], html)

        # All 5 quizzes + options
        for q in QUIZ_ITEMS:
            self.assertIn(q['question'], html)
            self.assertIn(q['option_a'], html)
            self.assertIn(q['option_b'], html)
            self.assertIn(q['option_c'], html)
            self.assertIn(q['option_d'], html)

        # All 16 images and quotes
        for _order, _section, filename, quote in PHOTO_ITEMS:
            self.assertIn(f'/static/story/images/{filename}', html)
            self.assertIn(quote, html)

    def test_story_json_payload_and_static_assets_resolve(self):
        response = self.client.get(reverse('birthday_story'))
        html = response.content.decode('utf-8')
        match = re.search(
            r'<script id="story-data" type="application/json">(.*?)</script>',
            html,
            flags=re.S,
        )
        self.assertIsNotNone(match)
        payload = json.loads(match.group(1))
        self.assertEqual(len(payload['balloons']), 5)
        self.assertEqual(len(payload['quizzes']), 5)
        self.assertEqual(payload['quizzes'][2]['answerRule'], 'only_c_dodge')
        self.assertEqual(len(payload['memoryLanePhotos']), 5)
        self.assertEqual(len(payload['finalePhotos']), 11)

        # Verify separate views and exact chapter ordering
        self.assertIn('<section id="scene-wishes"', html)
        self.assertIn('<section id="scene-scratch"', html)
        self.assertIn('<section id="scene-finale"', html)
        self.assertIn('id="btn-bow-shoot"', html)
        self.assertEqual(html.count('class="story-wish-card"'), 1)
        self.assertNotIn('<span>Next Chapter</span>', html)
        self.assertIn('<span>Birthday Wish</span>', html)
        self.assertIn('class="F0xIHa_hint story-memory-singleline"', html)
        self.assertIn('class="story-memory-focusRow"', html)
        self.assertNotIn('id="btn-cake-continue"', html)
        self.assertIn('id="btn-cut-cake"', html)
        self.assertLess(html.index('id="scene-gift"'), html.index('id="scene-arrival"'))
        self.assertLess(html.index('id="scene-arrival"'), html.index('id="scene-candles"'))
        self.assertLess(html.index('id="scene-candles"'), html.index('id="scene-balloons"'))
        self.assertLess(html.index('id="scene-balloons"'), html.index('id="scene-wishes"'))
        self.assertLess(html.index('id="scene-wishes"'), html.index('id="scene-cake"'))
        self.assertLess(html.index('id="scene-cake"'), html.index('id="scene-letter"'))
        self.assertLess(html.index('id="scene-letter"'), html.index('id="scene-memories"'))
        self.assertLess(html.index('id="scene-memories"'), html.index('id="scene-quiz"'))
        self.assertLess(html.index('id="scene-quiz"'), html.index('id="scene-scratch"'))
        self.assertLess(html.index('id="scene-scratch"'), html.index('id="scene-finale"'))

        # Verify portrait image box, slice-only cake cut, rising wish card, centered single-line prompt, and bow flight in style.css
        css_text = Path(settings.BASE_DIR / 'static/story/css/style.css').read_text(
            encoding='utf-8'
        )
        js_text = Path(settings.BASE_DIR / 'static/story/js/story.js').read_text(
            encoding='utf-8'
        )
        self.assertIn('aspect-ratio: 3 / 4;', css_text)
        self.assertIn('object-fit: contain !important;', css_text)
        self.assertIn('.qJsu-W_moment[data-cake-cut="cut"] .qJsu-W_wholeCake', css_text)
        self.assertIn('#scene-memories > p.story-memory-singleline', css_text)
        self.assertIn('white-space: nowrap;', css_text)
        self.assertIn('storyWishRiseFromGround', css_text)
        self.assertIn('storyArrowFlight', css_text)
        self.assertIn('quizAutoTimer', js_text)
        self.assertNotIn('.F0xIHa_feature img {\n  object-fit: cover', css_text)
        self.assertNotIn(
            '.story-finale-gallery-card .B6fPla_photoFrame img {\n  object-fit: cover',
            css_text,
        )

        # Verify staticfiles finders locate CSS, JS, and all 16 images
        self.assertIsNotNone(finders.find('story/css/style.css'))
        self.assertIsNotNone(finders.find('story/js/story.js'))
        for _order, _section, filename, _quote in PHOTO_ITEMS:
            self.assertIsNotNone(
                finders.find(f'story/images/{filename}'),
                f'Missing static image: {filename}',
            )

