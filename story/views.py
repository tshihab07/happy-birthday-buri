import re
from django.shortcuts import render
from django.templatetags.static import static

from story.models import BirthdayStory
from story.seed import ensure_story_seeded


def _parse_letter_paragraphs(raw_body):
    """Convert **bold** markers and line breaks in letter paragraphs into structured tokens."""
    paragraphs = []
    for block in raw_body.strip().split('\n\n'):
        lines = []
        for raw_line in block.split('\n'):
            parts = []
            for token in re.split(r'(\*\*.*?\*\*)', raw_line):
                if not token:
                    continue
                if token.startswith('**') and token.endswith('**') and len(token) > 4:
                    parts.append({'text': token[2:-2], 'bold': True})
                else:
                    parts.append({'text': token, 'bold': False})
            lines.append(parts)
        paragraphs.append(lines)
    return paragraphs


def birthday_story_view(request):
    """Render the interactive birthday story for Ripa Khan at the root route."""
    story = (
        BirthdayStory.objects.filter(slug='ripa-khan')
        .prefetch_related('balloons', 'quizzes', 'photos')
        .first()
    )
    if story is None:
        story = ensure_story_seeded()
        story = (
            BirthdayStory.objects.filter(pk=story.pk)
            .prefetch_related('balloons', 'quizzes', 'photos')
            .get()
        )

    balloons = list(story.balloons.all())
    quizzes = list(story.quizzes.all())
    photos = list(story.photos.all())

    memory_lane_photos = [
        {
            'order': photo.order,
            'url': static(f'story/images/{photo.filename}'),
            'filename': photo.filename,
            'quote': photo.quote,
        }
        for photo in photos
        if photo.section == 'memory_lane'
    ]
    finale_photos = [
        {
            'order': photo.order,
            'url': static(f'story/images/{photo.filename}'),
            'filename': photo.filename,
            'quote': photo.quote,
        }
        for photo in photos
        if photo.section == 'finale'
    ]

    letter_paragraphs = _parse_letter_paragraphs(story.text_19_letter_body)

    story_data = {
        'slug': story.slug,
        'recipientName': story.recipient_name,
        'nickname': story.nickname,
        'senderName': story.sender_name,
        'senderAlias': story.sender_alias,
        'monogram': story.monogram,
        'musicTitle': story.music_title,
        'musicUrl': story.music_url,
        'texts': {
            'storyFor': story.text_1_story_for,
            'happyBday': story.text_2_happy_bday,
            'intro': story.text_3_intro,
            'demoBadge': story.text_4_demo_badge,
            'bannerBday': story.text_5_banner_bday,
            'touchHint': story.text_6_touch_hint,
            'balloonPrompt': story.text_7_balloon_prompt,
            'greeting': story.text_13_greeting,
            'continueHint': story.text_14_continue_hint,
            'cutCake': story.text_15_cut_cake,
            'cakeSlice': story.text_16_cake_slice,
            'envelopeFor': story.text_17_envelope_for,
            'letterPrompt': story.text_18_letter_prompt,
            'memoryLane': story.text_20_memory_lane,
            'scratchMsg': story.text_21_scratch_msg,
            'finaleMemories': story.text_22_finale_memories,
        },
        'balloons': [
            {
                'order': b.order,
                'text': b.text,
                'color': b.color,
                'floatOffset': b.float_offset,
                'delay': b.delay,
            }
            for b in balloons
        ],
        'quizzes': [
            {
                'order': q.order,
                'question': q.question,
                'choices': [q.option_a, q.option_b, q.option_c, q.option_d],
                'answerRule': q.answer_rule,
            }
            for q in quizzes
        ],
        'memoryLanePhotos': memory_lane_photos,
        'finalePhotos': finale_photos,
    }

    context = {
        'story': story,
        'balloons': balloons,
        'quizzes': quizzes,
        'memory_lane_photos': memory_lane_photos,
        'finale_photos': finale_photos,
        'letter_paragraphs': letter_paragraphs,
        'story_data': story_data,
    }
    return render(request, 'story/index.html', context)

