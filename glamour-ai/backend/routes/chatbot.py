"""
routes/chatbot.py — AI Beauty Chatbot powered by Groq (Llama)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import ChatSession, ChatMessage, Product, Category
from groq import Groq
import os
import uuid
import logging
import re

chatbot_bp = Blueprint('chatbot', __name__)

BEAUTY_SYSTEM_PROMPT = """You are Glamour, an expert AI beauty advisor for Glamour AI — a luxury beauty e-commerce platform. You have deep expertise in:

- Skincare: ingredients, routines, skin types, concerns (acne, aging, hyperpigmentation, sensitivity)
- Makeup: techniques, color theory, application tips, product recommendations
- Haircare: treatments, styling, hair types
- Fragrance: families, notes, seasons, occasions
- Beauty tools: brushes, devices, accessories

Your personality:
- Warm, knowledgeable, and enthusiastic about beauty
- Personalized and attentive — remember context from the conversation
- Evidence-based when discussing skincare ingredients
- Inclusive — you celebrate all skin tones, types, and beauty expressions

Guidelines:
- Keep responses concise but thorough (2-4 paragraphs max)
- Use beauty terminology naturally but explain technical terms
- When recommending products, focus on ingredients/benefits
- If asked about medical conditions, recommend consulting a dermatologist
- You can also help with general questions about the store, orders, and shopping

If the user shares their skin tone or type, tailor advice accordingly."""


def get_groq_client():
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key or api_key == 'your-groq-api-key-here':
        return None
    return Groq(api_key=api_key)


@chatbot_bp.route('/session', methods=['POST'])
def create_session():
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    session = ChatSession(
        user_id=user_id,
        session_token=str(uuid.uuid4())
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({'sessionToken': session.session_token, 'sessionId': str(session.id)})


@chatbot_bp.route('/message', methods=['POST'])
def send_message():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    session_token = data.get('sessionToken')
    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    if not session_token:
        return jsonify({'error': 'Session token is required'}), 400

    session = ChatSession.query.filter_by(session_token=session_token).first()
    if not session:
        return jsonify({'error': 'Invalid session'}), 404

    try:
        user_msg = ChatMessage(session_id=session.id, role='user', content=user_message)
        db.session.add(user_msg)
        db.session.commit()
    except Exception as e:
        logging.error(f'Failed to save user message: {e}')
        db.session.rollback()

    try:
        history = ChatMessage.query.filter_by(session_id=session.id)\
            .order_by(ChatMessage.created_at.asc())\
            .limit(20).all()
        messages = [{'role': msg.role, 'content': msg.content} for msg in history]
    except Exception as e:
        logging.error(f'Failed to load history: {e}')
        messages = [{'role': 'user', 'content': user_message}]

    client = get_groq_client()

    if client:
        try:
            # Groq attend le system prompt dans la liste des messages
            groq_messages = [{'role': 'system', 'content': BEAUTY_SYSTEM_PROMPT}] + messages

            response = client.chat.completions.create(
                model='llama-3.3-70b-versatile',
                max_tokens=1024,
                messages=groq_messages
            )
            assistant_response = response.choices[0].message.content
        except Exception as e:
            logging.error(f'Groq API error: {e}')
            assistant_response = _smart_response(user_message, messages)
    else:
        assistant_response = _smart_response(user_message, messages)

    msg_id = str(uuid.uuid4())
    try:
        assistant_msg = ChatMessage(session_id=session.id, role='assistant', content=assistant_response)
        db.session.add(assistant_msg)
        db.session.commit()
        msg_id = str(assistant_msg.id)
    except Exception as e:
        logging.error(f'Failed to save assistant message: {e}')
        db.session.rollback()

    try:
        suggested_products = _find_relevant_products(user_message, assistant_response)
    except Exception as e:
        logging.error(f'Product suggestion error: {e}')
        suggested_products = []

    return jsonify({
        'message': {
            'role': 'assistant',
            'content': assistant_response,
            'id': msg_id
        },
        'suggestedProducts': suggested_products
    })


@chatbot_bp.route('/history/<session_token>', methods=['GET'])
def get_history(session_token):
    session = ChatSession.query.filter_by(session_token=session_token).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    messages = ChatMessage.query.filter_by(session_id=session.id)\
        .order_by(ChatMessage.created_at.asc()).all()

    return jsonify({'messages': [m.to_dict() for m in messages]})


# ─── Product finder ───────────────────────────────────────────────────────────

CATEGORY_KEYWORDS = [
    ('lip',          [r'\blipstick\b', r'\blip\b', r'\bgloss\b', r'\blip liner\b', r'\blip color\b', r'\bnude lip\b', r'\bred lip\b']),
    ('eyes',         [r'\beyeshadow\b', r'\beye shadow\b', r'\bmascara\b', r'\beyeliner\b', r'\beye palette\b', r'\bsmoky eye\b', r'\bsmokey\b', r'\bbrow\b', r'\beyebrow\b', r'\blashes\b']),
    ('face',         [r'\bfoundation\b', r'\bconcealer\b', r'\bblush\b', r'\bbronzer\b', r'\bhighlighter\b', r'\bcontour\b', r'\bprimer\b', r'\bsetting spray\b', r'\bbb cream\b', r'\bcc cream\b', r'\bbase makeup\b']),
    ('moisturizers', [r'\bmoisturizer\b', r'\bface cream\b', r'\bnight cream\b', r'\bday cream\b', r'\bcreme\b']),
    ('serums',       [r'\bserum\b', r'\bvitamin c\b', r'\bretinol\b', r'\bniacinamide\b', r'\bhyaluronic\b', r'\bpeptide\b']),
    ('cleansers',    [r'\bcleanser\b', r'\bface wash\b', r'\bmicellar\b', r'\bdouble cleanse\b']),
    ('spf',          [r'\bspf\b', r'\bsunscreen\b', r'\bsun protection\b', r'\bsunblock\b']),
    ('eau-de-parfum', [r'\bperfume\b', r'\bfragrance\b', r'\bparfum\b', r'\bcologne\b', r'\bscent\b', r'\beau de\b']),
    ('brushes',      [r'\bbrush\b', r'\bbrushes\b', r'\bsponge\b', r'\bbeautyblender\b', r'\bkabuki\b']),
    ('devices',      [r'\bdevice\b', r'\bfacial tool\b', r'\bmicrocurrent\b', r'\bgua sha\b', r'\broller\b']),
]


def _find_relevant_products(user_message: str, assistant_response: str) -> list:
    user_lower = user_message.lower()
    assistant_lower = assistant_response.lower()

    matched_slug = None
    for cat_slug, patterns in CATEGORY_KEYWORDS:
        if any(re.search(p, user_lower) for p in patterns):
            matched_slug = cat_slug
            break

    if not matched_slug:
        for cat_slug, patterns in CATEGORY_KEYWORDS:
            if any(re.search(p, assistant_lower) for p in patterns):
                matched_slug = cat_slug
                break

    try:
        if matched_slug:
            products = Product.query\
                .join(Category, Product.category_id == Category.id)\
                .filter(
                    Product.is_active == True,
                    Category.slug == matched_slug
                )\
                .order_by(Product.is_featured.desc(), Product.created_at.desc())\
                .limit(3).all()
        else:
            products = Product.query\
                .filter_by(is_active=True, is_featured=True)\
                .order_by(Product.created_at.desc())\
                .limit(3).all()

        return [p.to_dict() for p in products]
    except Exception as e:
        logging.error(f'DB error in _find_relevant_products: {e}')
        return []


# ─── Smart fallback (no API key) ─────────────────────────────────────────────

def _smart_response(message: str, history: list) -> str:
    m = message.lower()

    if re.search(r'\b(hi|hello|hey|bonjour|salut|hola|ciao)\b', m):
        return ("Hello! I'm Glamour, your personal AI beauty advisor. ✨ "
                "I'm here to help you with skincare routines, makeup tips, fragrance advice, "
                "and finding the perfect products for your needs. What can I help you with today?")

    if re.search(r'\b(how are you|how do you do|what\'s up|ca va)\b', m):
        return ("I'm doing wonderfully, thank you for asking! Ready to help you look and feel your best. "
                "Whether it's a skincare concern, a makeup question, or finding the perfect fragrance — "
                "I'm all yours. What are you working on today?")

    if re.search(r'\b(order|shipping|delivery|return|refund|track)\b', m):
        return ("For order tracking, shipping updates, and returns, you can visit your Account page "
                "or reach our support team. We offer complimentary shipping on orders over $75 and "
                "free returns within 30 days. Is there a specific order issue I can help clarify?")

    if re.search(r'\b(price|cost|expensive|cheap|affordable|budget|discount|sale|promo)\b', m):
        return ("We carry products across all price points — from accessible everyday essentials to "
                "luxury investments. Our edit focuses on quality and efficacy. You can filter by "
                "price range on any category page. Looking for something specific? I can point you "
                "toward the best value options in any category.")

    if re.search(r'\b(what.*(skin type|skin kind)|my skin type|identify.*skin|know.*skin)\b', m):
        return ("Identifying your skin type is the first step to a great routine! Here's a simple test: "
                "wash your face, wait 30 minutes without applying anything, then observe. If your skin "
                "feels tight — you likely have **dry skin**. If it's shiny all over — **oily**. "
                "Shiny only in the T-zone (forehead, nose, chin) — **combination**. If it feels "
                "comfortable with no excess oil — **normal**. Easily reactive or red — **sensitive**. "
                "Once you know your type, I can build the perfect routine for you!")

    if re.search(r'\b(dry skin|flaky|dehydrat|tight skin|dry and|very dry)\b', m):
        return ("Dry skin needs a moisture-locking routine. Start with a **gentle cream cleanser** "
                "(avoid foam cleansers that strip oils), follow with a **hyaluronic acid serum** "
                "on damp skin to draw moisture in, then layer a **rich moisturizer** with ceramides, "
                "shea butter, or squalane to seal everything in. At night, a **sleeping mask or "
                "facial oil** like rosehip or marula adds extra nourishment. Avoid harsh toners "
                "with alcohol. Our La Mer and Tatcha collections are specifically formulated for "
                "intense hydration — I'd love to show you some options!")

    if re.search(r'\b(oily skin|acne|breakout|pimple|blemish|pore|shine control|mattif)\b', m):
        return ("For oily or acne-prone skin, the goal is balance — not stripping. Use a **gentle "
                "foaming or gel cleanser** with salicylic acid (BHA) to clear pores. Layer a "
                "**niacinamide serum** (5-10%) to regulate sebum and minimize pores, then finish "
                "with a **lightweight, oil-free moisturizer** — yes, oily skin still needs hydration! "
                "For makeup, look for non-comedogenic foundations and a mattifying primer. "
                "Blotting papers are great for on-the-go shine control.")

    if re.search(r'\b(combination skin|t.zone|oily.*dry|dry.*oily)\b', m):
        return ("Combination skin benefits from a targeted approach. Use a **balanced gel-cream "
                "cleanser** that doesn't strip or over-moisturize. Apply **niacinamide** to the "
                "oilier T-zone and a **richer moisturizer** on dry areas like cheeks.")

    if re.search(r'\b(sensitive skin|redness|rosacea|reactive|irritat|allerg)\b', m):
        return ("Sensitive skin needs minimal, gentle formulations. Stick to **fragrance-free, "
                "dye-free** products with short ingredient lists. Look for calming ingredients: "
                "**centella asiatica (cica), oat extract, allantoin, and bisabolol**.")

    if re.search(r'\b(anti.?aging|wrinkle|fine line|aging|firmness|collagen|retinol)\b', m):
        return ("A solid anti-aging routine centers on three heroes: **SPF**, **Vitamin C serum** "
                "in the morning, and **retinol** at night. Start retinol slowly — 2-3x per week.")

    if re.search(r'\b(dark spot|hyperpigment|uneven|discolor|melasma|sun spot|brightening|glow)\b', m):
        return ("For hyperpigmentation, **Vitamin C**, **alpha arbutin**, and **niacinamide** are "
                "your best allies. Always wear SPF daily — sun exposure will reverse any progress.")

    if re.search(r'\b(routine|skincare routine|steps|order|regimen|morning|night|pm|am)\b', m):
        return ("**Morning:** Cleanser → Vitamin C Serum → Moisturizer → SPF\n\n"
                "**Evening:** Cleanser → Treatment Serum (retinol, acids) → Night Cream\n\n"
                "What's your skin type? I'll refine this for you!")

    if re.search(r'\b(foundation|concealer|coverage|base makeup|bb cream|skin tint)\b', m):
        return ("Finding the perfect foundation starts with undertone, coverage level, and finish. "
                "Always swatch along your jawline in natural daylight — the shade should disappear.")

    if re.search(r'\b(perfume|fragrance|scent|parfum|cologne|smell|notes)\b', m):
        return ("Fragrance interacts with your skin's unique chemistry. Apply to pulse points "
                "(wrists, neck, behind ears). Don't rub wrists together — it crushes the top notes. "
                "Test on skin and wait 30 minutes for the dry-down before deciding.")

    if re.search(r'\b(spf|sunscreen|sun protection|uv|sunblock)\b', m):
        return ("SPF is the single most impactful skincare product you can use. "
                "**SPF 30 minimum daily**, even on cloudy days. Apply as the last skincare step, "
                "before makeup. Reapply every 2 hours if outdoors.")

    if re.search(r'\b(thank|thanks|merci|thx|great|amazing|helpful|love it|perfect)\b', m):
        return ("You're so welcome! That's exactly what I'm here for. ✨ "
                "Feel free to ask anything else — whether it's a specific product, a routine tweak, "
                "or beauty advice for a special occasion.")

    return ("Great question! I'm Glamour, your AI beauty advisor. Could you tell me a little more "
            "about what you're looking for? For example:\n\n"
            "• A skincare routine for your skin type\n"
            "• Foundation or makeup recommendations\n"
            "• Fragrance advice\n"
            "• Ingredient questions\n\n"
            "The more detail you share, the better I can tailor my advice to you!")