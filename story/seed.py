from django.db import transaction

STORY_DEFAULTS = {
    'recipient_name': 'Ripa Khan',
    'nickname': 'Buri',
    'sender_name': 'Tshihab',
    'sender_alias': 'Mr. Engineer',
    'monogram': 'R',
    'music_title': 'Classic Birthday Celebration',
    'music_url': 'https://www.wishhappybdayto.me/music/happy-birthday-357371.mp3',
    'text_1_story_for': 'A birthday story for my Beautiful Buri',
    'text_2_happy_bday': 'Happy Birthday My Lovely Lady',
    'text_3_intro': (
        'Dearest Buri, Your Mr. Engineer has woven this birthday tale solely for you. '
        'Now, draw a gentle breath, let the world fall quiet for a moment, and savour '
        'each little surprise as though it were a verse written just for your heart'
    ),
    'text_4_demo_badge': 'To the Prettiest Lady',
    'text_5_banner_bday': 'Happy Birthday to the Dreamiest of Souls!',
    'text_6_touch_hint': 'Your touch alone turns these written into something wondrous',
    'text_7_balloon_prompt': (
        'Each balloon cradles a little whisper of my heart, a tender reminder of all '
        'the reasons you are cherished. Pop one, and let love unfold, one sweet secret at a time'
    ),
    'text_13_greeting': (
        'Many Many Happy Returns of the Day, Buri! May this day unfold like a beautiful poem, '
        'with every verse devoted to you'
    ),
    'text_14_continue_hint': (
        'To my favourite plot twist, the engineer awaits your signal to turn the next page. '
        "Select Continue Story whenever you're ready"
    ),
    'text_15_cut_cake': (
        'One final chapter awaits.\n'
        'Now, let the sweetest slice of this story begin—cut the cake!'
    ),
    'text_16_cake_slice': (
        'A sweet little masterpiece awaits, baked with love and served with a wish'
    ),
    'text_17_envelope_for': 'For Ripa Khan, with love',
    'text_18_letter_prompt': 'A little letter to my loveliest Buri',
    'text_19_letter_body': (
        '**Dear Buri**,\n\n'
        'Many, many happy returns of the day, my love. 🤍\n\n'
        'May Allah bless you abundantly, keep your heart free from worries, and give you '
        'endless reasons to smile. May He take away all your troubles and make every step '
        'of this new year smoother and more beautiful than you could ever imagine.\n\n'
        "My Buri, I know I haven't always been the best at making your moments special, "
        "I'm sorry for every time I've hurt you and ruined some of your special moments, "
        'even when all I ever wanted was to make them beautiful. But every heartbeat of '
        'mine celebrates you today. Thank you for filling my life with love, laughter, '
        'and endless happiness. You are my sweetest blessing, always.\n\n'
        'Thank you for all the little things that mean the world to me, especially for '
        'always letting me touch your hair and for making even the simplest moments of '
        'my life feel extraordinary.\n\n'
        '**To the one who holds my heart 💕**\n\n'
        'May your birthday be as beautiful as your soul and as special as the place you '
        "hold in my life. I hope we keep sharing life's sweetest moments, turning every "
        'passing page into another beautiful memory.\n\n'
        'After all, the engineer may know how to build things, but you have built a home '
        'in his heart.\n\n'
        '**With all my love,\n'
        'Mr. Engineer**'
    ),
    'text_20_memory_lane': 'A Portrait of You, Through Moments Frozen in Time.',
    'text_21_scratch_msg': (
        'Dear Ripa Khan, no matter how many birthdays we celebrate, '
        'you will always be my favorite person. Love, Tshihab.'
    ),
    'text_22_finale_memories': (
        "Here's to the countless beautiful chapters yet to unfold in your story"
    ),
}

BALLOON_ITEMS = [
    {
        'order': 1,
        'text': (
            'Your love weaves my days with endless joy, and turns every fleeting '
            'moment into a melody of laughter.'
        ),
        'color': '#e49ab0',
        'float_offset': '0px',
        'delay': '0s',
    },
    {
        'order': 2,
        'text': (
            'With you, even the simplest moments bloom into a thousand little '
            'celebrations.'
        ),
        'color': '#e6be72',
        'float_offset': '-12px',
        'delay': '-1.1s',
    },
    {
        'order': 3,
        'text': (
            "To share life's tenderest moments with you is a gift more precious "
            'than all the treasures time could bestow.'
        ),
        'color': '#b69fd1',
        'float_offset': '4px',
        'delay': '-2.2s',
    },
    {
        'order': 4,
        'text': (
            'Building a lifetime of beautiful moments with you is the finest '
            'project my heart could ever undertake.'
        ),
        'color': '#8ebcb4',
        'float_offset': '-8px',
        'delay': '-0.7s',
    },
    {
        'order': 5,
        'text': "Sharing life's sweetest moments with you is my favorite gift.",
        'color': '#d98ea7',
        'float_offset': '6px',
        'delay': '-1.7s',
    },
]

QUIZ_ITEMS = [
    {
        'order': 1,
        'question': 'What is the most beautiful day on earth?',
        'option_a': '21st November',
        'option_b': 'After 20th November and Before 22nd November',
        'option_c': 'The day you born',
        'option_d': '21st Day of November',
        'answer_rule': 'any',
    },
    {
        'order': 2,
        'question': 'Who is the Asmaner Chand?',
        'option_a': 'Glamorous Buri',
        'option_b': 'Prettiest Buri',
        'option_c': 'Beautiful Buri',
        'option_d': 'Gorgeous Buri',
        'answer_rule': 'any',
    },
    {
        'order': 3,
        'question': 'Who do you love?',
        'option_a': 'Shakib Al Hasan',
        'option_b': 'Eun Woo',
        'option_c': 'Tushar Shihab',
        'option_d': 'Louis partridge',
        'answer_rule': 'only_c_dodge',
    },
    {
        'order': 4,
        'question': 'What is the scientific explanation for Ripa’s glow today?',
        'option_a': 'Good skincare',
        'option_b': 'The birthday sun reflected off your face',
        'option_c': 'The sheer radiance of being fabulous',
        'option_d': 'All of the above',
        'answer_rule': 'c',
    },
    {
        'order': 5,
        'question': 'What does Tshihab wish for her Buri today?',
        'option_a': 'Endless joy and laughter',
        'option_b': 'All your dreams coming true',
        'option_c': 'Long enough time to watch a movie, eat dinner, and walk together a mile',
        'option_d': 'All of the above',
        'answer_rule': 'd',
    },
]

PHOTO_ITEMS = [
    (
        1,
        'memory_lane',
        '1.jpg',
        'May your life always be gentle with the heart that makes the world so beautiful.',
    ),
    (
        2,
        'memory_lane',
        '2.png',
        'You deserve a lifetime of happiness, a thousand reasons to smile, and endless moments worth remembering.',
    ),
    (
        3,
        'memory_lane',
        '3.jpg',
        'If I could make one wish for you, it would be that life gives you back all the happiness you bring into mine.',
    ),
    (
        4,
        'memory_lane',
        '4.jpg',
        'May every dream your heart secretly holds find its way into reality.',
    ),
    (
        5,
        'memory_lane',
        '5.jpg',
        'You are not just a beautiful chapter; you are my favourite story.',
    ),
    (
        6,
        'finale',
        '6.jpg',
        'May your eyes never lose their sparkle, your heart never lose its warmth, and your smile never fade.',
    ),
    (
        7,
        'finale',
        '7.jpg',
        'You make my life beautiful simply by existing.',
    ),
    (
        8,
        'finale',
        '8.jpg',
        'I hope the universe conspires to make all your little wishes come true.',
    ),
    (
        9,
        'finale',
        '9.jpg',
        'May your days be filled with unexpected blessings and your nights with peaceful dreams.',
    ),
    (
        10,
        'finale',
        '10.jpg',
        'If happiness had a face, I would wish to see yours every single day.',
    ),
    (
        11,
        'finale',
        '11.jpg',
        'You deserve flowers on ordinary days, laughter on difficult ones, and love in every second of life.',
    ),
    (
        12,
        'finale',
        '12.jpg',
        'May time bring you wisdom, life bring you adventures, and Allah bless you with everything your heart longs for.',
    ),
    (
        13,
        'finale',
        '13.jpg',
        'Among all the beautiful things life has written, meeting you remains one of my favourite lines.',
    ),
    (
        14,
        'finale',
        '14.jpg',
        'I wish to see you grow, flourish, dream fearlessly, and become everything your heart aspires to be.',
    ),
    (
        15,
        'finale',
        '15.jpg',
        'No matter how many pages life turns, I hope you keep finding beautiful reasons to be cherished.',
    ),
    (
        16,
        'finale',
        '16.jpg',
        'And if I could gift you something beyond all the treasures of this world, it would be the ability to see yourself through my eyes, just to know how precious you truly are.',
    ),
]


def ensure_story_seeded(
    story_model=None,
    balloon_model=None,
    quiz_model=None,
    photo_model=None,
):
    """Idempotently seed the fixed Ripa Khan birthday story into SQLite."""
    if story_model is None:
        from story.models import (
            BalloonReason,
            BirthdayStory,
            QuizQuestion,
            StoryPhoto,
        )

        story_model = BirthdayStory
        balloon_model = BalloonReason
        quiz_model = QuizQuestion
        photo_model = StoryPhoto

    with transaction.atomic():
        story, _ = story_model.objects.update_or_create(
            slug='ripa-khan',
            defaults=STORY_DEFAULTS,
        )

        balloon_orders = []
        for item in BALLOON_ITEMS:
            balloon_orders.append(item['order'])
            balloon_model.objects.update_or_create(
                story=story,
                order=item['order'],
                defaults={
                    'text': item['text'],
                    'color': item['color'],
                    'float_offset': item['float_offset'],
                    'delay': item['delay'],
                },
            )
        balloon_model.objects.filter(story=story).exclude(
            order__in=balloon_orders
        ).delete()

        quiz_orders = []
        for item in QUIZ_ITEMS:
            quiz_orders.append(item['order'])
            quiz_model.objects.update_or_create(
                story=story,
                order=item['order'],
                defaults={
                    'question': item['question'],
                    'option_a': item['option_a'],
                    'option_b': item['option_b'],
                    'option_c': item['option_c'],
                    'option_d': item['option_d'],
                    'answer_rule': item['answer_rule'],
                },
            )
        quiz_model.objects.filter(story=story).exclude(
            order__in=quiz_orders
        ).delete()

        photo_orders = []
        for order, section, filename, quote in PHOTO_ITEMS:
            photo_orders.append(order)
            photo_model.objects.update_or_create(
                story=story,
                order=order,
                defaults={
                    'section': section,
                    'filename': filename,
                    'quote': quote,
                },
            )
        photo_model.objects.filter(story=story).exclude(
            order__in=photo_orders
        ).delete()

        return story

