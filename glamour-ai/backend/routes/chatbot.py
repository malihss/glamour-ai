"""
routes/chatbot.py — AI Beauty Chatbot powered by Anthropic Claude
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import ChatSession, ChatMessage, Product, Category
import anthropic
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


def get_anthropic_client():
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key or api_key == 'your-anthropic-api-key-here':
        return None
    return anthropic.Anthropic(api_key=api_key)


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

    client = get_anthropic_client()

    if client:
        try:
            response = client.messages.create(
                model='claude-opus-4-7',
                max_tokens=1024,
                system=BEAUTY_SYSTEM_PROMPT,
                messages=messages
            )
            assistant_response = response.content[0].text
        except Exception as e:
            logging.error(f'Claude API error: {e}')
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
    # Match on user message first (precise), fall back to assistant response
    user_lower = user_message.lower()
    assistant_lower = assistant_response.lower()

    matched_slug = None
    for cat_slug, patterns in CATEGORY_KEYWORDS:
        if any(re.search(p, user_lower) for p in patterns):
            matched_slug = cat_slug
            break

    # If no match in user message, check assistant response
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

    # ── Greetings ──
    if re.search(r'\b(hi|hello|hey|bonjour|salut|hola|ciao)\b', m):
        return ("Hello! I'm Glamour, your personal AI beauty advisor. ✨ "
                "I'm here to help you with skincare routines, makeup tips, fragrance advice, "
                "and finding the perfect products for your needs. What can I help you with today?")

    if re.search(r'\b(how are you|how do you do|what\'s up|ca va)\b', m):
        return ("I'm doing wonderfully, thank you for asking! Ready to help you look and feel your best. "
                "Whether it's a skincare concern, a makeup question, or finding the perfect fragrance — "
                "I'm all yours. What are you working on today?")

    # ── Store / Shopping ──
    if re.search(r'\b(order|shipping|delivery|return|refund|track)\b', m):
        return ("For order tracking, shipping updates, and returns, you can visit your Account page "
                "or reach our support team. We offer complimentary shipping on orders over $75 and "
                "free returns within 30 days. Is there a specific order issue I can help clarify?")

    if re.search(r'\b(price|cost|expensive|cheap|affordable|budget|discount|sale|promo)\b', m):
        return ("We carry products across all price points — from accessible everyday essentials to "
                "luxury investments. Our edit focuses on quality and efficacy. You can filter by "
                "price range on any category page. Looking for something specific? I can point you "
                "toward the best value options in any category.")

    # ── Skin Type Identification ──
    if re.search(r'\b(what.*(skin type|skin kind)|my skin type|identify.*skin|know.*skin)\b', m):
        return ("Identifying your skin type is the first step to a great routine! Here's a simple test: "
                "wash your face, wait 30 minutes without applying anything, then observe. If your skin "
                "feels tight — you likely have **dry skin**. If it's shiny all over — **oily**. "
                "Shiny only in the T-zone (forehead, nose, chin) — **combination**. If it feels "
                "comfortable with no excess oil — **normal**. Easily reactive or red — **sensitive**. "
                "Once you know your type, I can build the perfect routine for you!")

    # ── Dry Skin ──
    if re.search(r'\b(dry skin|flaky|dehydrat|tight skin|dry and|very dry)\b', m):
        return ("Dry skin needs a moisture-locking routine. Start with a **gentle cream cleanser** "
                "(avoid foam cleansers that strip oils), follow with a **hyaluronic acid serum** "
                "on damp skin to draw moisture in, then layer a **rich moisturizer** with ceramides, "
                "shea butter, or squalane to seal everything in. At night, a **sleeping mask or "
                "facial oil** like rosehip or marula adds extra nourishment. Avoid harsh toners "
                "with alcohol. Our La Mer and Tatcha collections are specifically formulated for "
                "intense hydration — I'd love to show you some options!")

    # ── Oily / Acne-Prone Skin ──
    if re.search(r'\b(oily skin|acne|breakout|pimple|blemish|pore|shine control|mattif)\b', m):
        return ("For oily or acne-prone skin, the goal is balance — not stripping. Use a **gentle "
                "foaming or gel cleanser** with salicylic acid (BHA) to clear pores. Layer a "
                "**niacinamide serum** (5-10%) to regulate sebum and minimize pores, then finish "
                "with a **lightweight, oil-free moisturizer** — yes, oily skin still needs hydration! "
                "For makeup, look for non-comedogenic foundations and a mattifying primer. "
                "Blotting papers are great for on-the-go shine control. Avoid heavy occlusives like "
                "mineral oil. Consistency is key — most actives take 4-6 weeks to show results.")

    # ── Combination Skin ──
    if re.search(r'\b(combination skin|t.zone|oily.*dry|dry.*oily)\b', m):
        return ("Combination skin benefits from a targeted approach. Use a **balanced gel-cream "
                "cleanser** that doesn't strip or over-moisturize. Apply **niacinamide** to the "
                "oilier T-zone and a **richer moisturizer** on dry areas like cheeks. A lightweight "
                "hyaluronic acid serum works beautifully for the whole face. For makeup, focus "
                "long-wear or mattifying products on the T-zone while using a dewy or satin finish "
                "on the rest of your face. Multi-masking is also a great technique for combination skin.")

    # ── Sensitive Skin ──
    if re.search(r'\b(sensitive skin|redness|rosacea|reactive|irritat|allerg)\b', m):
        return ("Sensitive skin needs minimal, gentle formulations. Stick to **fragrance-free, "
                "dye-free** products with short ingredient lists. Look for calming ingredients: "
                "**centella asiatica (cica), oat extract, allantoin, and bisabolol**. Avoid "
                "essential oils, high-percentage acids, and alcohol denat. Always patch test new "
                "products on your inner arm for 24-48 hours. Introduce actives slowly — never "
                "layer multiple new products at once. For rosacea specifically, azelaic acid "
                "is excellent and well-tolerated. Always consult a dermatologist for persistent redness.")

    # ── Anti-Aging ──
    if re.search(r'\b(anti.?aging|wrinkle|fine line|aging|firmness|collagen|retinol)\b', m):
        return ("A solid anti-aging routine centers on three heroes: **SPF** (the #1 anti-aging "
                "step — UV damage causes up to 80% of visible aging), **Vitamin C serum** in the "
                "morning for brightening and collagen support, and **retinol** at night to speed "
                "cell turnover and stimulate collagen. Start retinol slowly — 2-3x per week, "
                "low percentage (.025%), always on dry skin after moisturizer if you're sensitive. "
                "Add **peptide serums** for extra firming. Around eyes, use a dedicated eye cream "
                "with peptides or caffeine. Remember: hydrated skin shows fewer lines, so keep "
                "your moisture barrier strong with ceramides and hyaluronic acid.")

    # ── Hyperpigmentation / Dark Spots ──
    if re.search(r'\b(dark spot|hyperpigment|uneven|discolor|melasma|sun spot|brightening|glow)\b', m):
        return ("For hyperpigmentation and dark spots, consistency with the right ingredients is key. "
                "**Vitamin C** (ascorbic acid, 10-20%) is the gold standard for brightening — use "
                "it in the morning. **Alpha arbutin** and **niacinamide** are gentler alternatives "
                "that work well for all skin tones. **AHA exfoliants** (glycolic or lactic acid) "
                "accelerate cell turnover to fade discoloration. **Tranexamic acid** is particularly "
                "effective for melasma. Always wear SPF daily — sun exposure will reverse any progress. "
                "Results take 8-12 weeks of consistent use. Our Skinceuticals CE Ferulic serum is "
                "one of the most validated Vitamin C formulas available.")

    # ── Skincare Routine ──
    if re.search(r'\b(routine|skincare routine|steps|order|regimen|morning|night|pm|am)\b', m):
        return ("A complete skincare routine follows this order:\n\n"
                "**Morning:** Cleanser → Toner/Essence → Vitamin C Serum → Eye Cream → "
                "Moisturizer → SPF (never skip!)\n\n"
                "**Evening:** Cleanse (double cleanse if wearing makeup) → Exfoliant (2-3x/week) "
                "→ Treatment Serum (retinol, acids) → Eye Cream → Night Cream or Sleeping Mask\n\n"
                "The golden rules: apply thinnest to thickest, wait 60 seconds between actives, "
                "and never mix retinol with Vitamin C or AHAs/BHAs in the same step. "
                "What's your skin type? I'll refine this for you!")

    # ── Foundation / Concealer ──
    if re.search(r'\b(foundation|concealer|coverage|base makeup|bb cream|skin tint|full coverage|light coverage)\b', m):
        return ("Finding the perfect foundation starts with three factors: **undertone** (warm, cool, "
                "or neutral), **coverage level** (sheer, medium, full), and **finish** (matte, satin, "
                "dewy). Always swatch along your jawline in natural daylight — the shade should "
                "disappear. For long-wear, prime first and set with a powder or spray. "
                "Dry skin → dewy or satin finish, hydrating formula. "
                "Oily skin → matte or semi-matte, oil-free. "
                "Normal skin → almost anything works! Our Charlotte Tilbury Airbrush Flawless and "
                "NARS Sheer Glow are bestsellers across skin types. For concealer, go 1-2 shades "
                "lighter than your foundation for under-eyes.")

    # ── Eyeshadow / Eye Makeup ──
    if re.search(r'\b(eyeshadow|eye shadow|smoky|smokey|eye look|eye makeup|cut crease|blending)\b', m):
        return ("Eye makeup is all about blending and building color gradually. For a beginner-friendly "
                "approach: apply a **transition shade** (matte, slightly deeper than your skin tone) "
                "in the crease to create depth, then pat your **lid color** on, blend where they "
                "meet, and add a **highlight** on the inner corner and brow bone. "
                "For a smoky eye: deep shade in the outer corner, blend in windshield-wiper motions "
                "into the crease, then smudge the same shade along your lower lash line. "
                "Always prime your lids — it extends wear by hours. Our Charlotte Tilbury Luxury "
                "Palettes and NARS Narsissist Palette are beautifully curated for both everyday and "
                "bold looks.")

    # ── Mascara / Lashes ──
    if re.search(r'\b(mascara|lashes|lash|volumiz|lengthen)\b', m):
        return ("The trick to great lashes: start at the root and wiggle the wand upward in a "
                "zigzag motion — this prevents clumps and coats every lash. For volume, apply "
                "2-3 coats letting each dry slightly between applications. For length, a thinner "
                "wand and lengthening formula works best. Curl your lashes before mascara, never "
                "after — it prevents breakage. Remove with an oil-based cleanser or dedicated "
                "eye makeup remover (never rub!). Our NARS Velvet Noir and Dior Overcurl are "
                "exceptional formulas with beautiful brushes.")

    # ── Lipstick / Lip Products ──
    if re.search(r'\b(lipstick|lip color|lip gloss|lip liner|lip stain|lip balm|nude lip|red lip|bold lip)\b', m):
        return ("For long-lasting lip color: exfoliate lips gently with a lip scrub, apply a "
                "hydrating balm, blot, then line with a lip liner (match to your lipstick or go "
                "slightly darker for definition). Fill in with liner before applying lipstick for "
                "extra longevity. Blot with a tissue, reapply, and set with a tiny dusting of "
                "translucent powder through a tissue for all-day wear. "
                "For finding your perfect nude: match to your natural lip color or go one shade "
                "darker. Warm undertones suit peachy-coral nudes; cool undertones look beautiful "
                "in pink-mauve nudes. Our Charlotte Tilbury Matte Revolution in Pillow Talk is "
                "universally flattering — a genuine icon.")

    # ── Blush / Bronzer / Contour ──
    if re.search(r'\b(blush|bronzer|contour|highlight|sculpt|cheek|rosy|flush|sun.?kiss)\b', m):
        return ("For a natural, sculpted look: apply **bronzer** in the hollows of your cheeks, "
                "along your temples, and lightly on your jaw using a fluffy brush in a '3' shape "
                "on each side. **Blush** goes on the apples of the cheeks, blended upward toward "
                "the temples — smile to find the right placement. **Highlight** on the tops of "
                "cheekbones, bridge of nose, cupid's bow, and inner corner of eyes. "
                "Key tip: blend everything thoroughly — harsh lines read as unnatural. "
                "Cream products are more forgiving and glow-y; powders give more control and "
                "longevity. Layer cream under powder for extra dimension.")

    # ── Fragrance ──
    if re.search(r'\b(perfume|fragrance|scent|parfum|cologne|smell|notes|floral|woody|musky|oriental|fresh)\b', m):
        return ("Fragrance is deeply personal — it interacts with your skin's unique chemistry. "
                "Here's how to navigate it:\n\n"
                "**Fragrance families:** Floral (feminine, romantic), Woody/Earthy (warm, sensual), "
                "Fresh/Citrus (light, energetic), Oriental (rich, spicy, exotic), Aquatic (clean, light).\n\n"
                "**Concentration guide:** Parfum (15-40% oils, longest lasting), "
                "Eau de Parfum (10-20%, 6-8 hours), Eau de Toilette (5-15%, 4-6 hours).\n\n"
                "**Tips:** Apply to pulse points (wrists, neck, behind ears, inner elbows). "
                "Don't rub wrists together — it crushes the top notes. Test on skin, not paper, "
                "and wait 30 minutes for the dry-down before deciding. Our collection includes "
                "Chanel N°5, YSL Black Opium, Tom Ford Lost Cherry, and many more iconic fragrances.")

    # ── SPF / Sun Protection ──
    if re.search(r'\b(spf|sunscreen|sun protection|uv|sunblock|tanning|protect)\b', m):
        return ("SPF is the single most impactful skincare product you can use — it prevents "
                "premature aging, hyperpigmentation, and of course skin cancer. "
                "**SPF 30 minimum daily**, even on cloudy days and indoors (UVA penetrates glass). "
                "Apply as the last skincare step, before makeup. Reapply every 2 hours if outdoors.\n\n"
                "**Mineral vs Chemical:** Mineral (zinc oxide, titanium dioxide) sits on top of "
                "skin, ideal for sensitive skin. Chemical (avobenzone, octinoxate) absorbs UV — "
                "more cosmetically elegant, better for darker skin tones. "
                "Hybrid formulas offer the best of both. Look for broad-spectrum (UVA + UVB) coverage.")

    # ── Makeup Brushes / Tools ──
    if re.search(r'\b(brush|sponge|beautyblender|applicator|tools|kabuki|blending)\b', m):
        return ("The right tools make a significant difference in makeup application. Essential brushes:\n\n"
                "• **Flat foundation brush or beauty sponge** — sponge (damp) gives the most "
                "skin-like finish; brush allows more coverage control\n"
                "• **Fluffy powder brush** — for setting powder and bronzer\n"
                "• **Angled blush brush** — for precise blush/highlight placement\n"
                "• **Fluffy blending brush** — for eyeshadow diffusion\n"
                "• **Small flat brush** — for packing color on lids\n\n"
                "Clean brushes weekly with gentle shampoo or brush cleaner — dirty brushes cause "
                "breakouts and patchy application. Our MAC and Charlotte Tilbury brush collections "
                "offer excellent quality at different price points.")

    # ── Hair / Haircare ──
    if re.search(r'\b(hair|shampoo|conditioner|frizz|curly|straight|color|bleach|heat|damage)\b', m):
        return ("Healthy hair starts at the scalp. For most hair types: shampoo the scalp only, "
                "let the lather rinse through lengths, and apply conditioner mid-length to ends "
                "(not the scalp). **Protein and moisture** must be balanced — if hair feels gummy, "
                "it needs protein; if it feels dry and brittle, it needs moisture. "
                "Heat protection is non-negotiable before any hot tool — it prevents permanent "
                "damage to the cuticle. For color-treated hair, use sulfate-free shampoo and "
                "a weekly bond treatment. What's your hair type or concern? I can give "
                "more targeted advice!")

    # ── Makeup for specific occasions ──
    if re.search(r'\b(wedding|prom|event|party|date|night out|work|natural|no makeup|everyday)\b', m):
        if re.search(r'\b(natural|no makeup|everyday|work)\b', m):
            return ("For a natural 'your skin but better' look: start with a lightweight tinted "
                    "moisturizer or skin tint for an even base, dab a creamy concealer only where "
                    "needed (under eyes, around nose), set with a light dusting of translucent powder. "
                    "A cream blush in a soft pink or peach adds life to the face. One coat of "
                    "mascara, a touch of brow gel, and a tinted lip balm completes the look in "
                    "under 5 minutes. The secret is glowing, prepped skin — a good skincare "
                    "routine makes 'no makeup' look effortless.")
        else:
            return ("For a special event look, the key is longevity and dimension. Prime everything — "
                    "face, eyes, and lips — for all-day wear. Go slightly more pigmented than usual "
                    "as flash photography can wash out color. A false lash or lash serum elevates "
                    "any eye look. Set your face with a setting spray after all powder products for "
                    "a more natural finish. For weddings specifically: avoid matte white eyeshadow "
                    "(photographs harshly), opt for soft champagne golds, and use waterproof mascara "
                    "and liner. Always do a trial run before the big day!")

    # ── General beauty / product recommendation ──
    if re.search(r'\b(recommend|suggest|best|top|favourite|love|should i|what.*buy|what.*use)\b', m):
        return ("I'd love to make a personalized recommendation! To point you in the right direction, "
                "it helps to know a bit more about you. Could you tell me:\n\n"
                "1. Your **skin type** (dry, oily, combination, normal, sensitive)?\n"
                "2. Your main **skin concern** (hydration, anti-aging, acne, brightness, etc.)?\n"
                "3. Any **ingredients you love or avoid**?\n"
                "4. Your **budget** range?\n\n"
                "With those details I can give you genuinely tailored picks from our collection!")

    # ── Ingredients ──
    if re.search(r'\b(ingredient|hyaluronic|niacinamide|retinol|vitamin c|aha|bha|peptide|ceramide|salicylic|glycolic|bakuchiol)\b', m):
        ingredient_info = {
            'hyaluronic': "Hyaluronic acid is a humectant that holds up to 1000x its weight in water. Apply to damp skin and seal with moisturizer for maximum benefit. Works for all skin types.",
            'niacinamide': "Niacinamide (Vitamin B3) at 5-10% reduces pores, controls sebum, brightens dark spots, and strengthens the skin barrier. One of the most versatile and well-tolerated actives — pairs well with almost everything.",
            'retinol': "Retinol speeds cell turnover, stimulates collagen, and fades hyperpigmentation. Start at .025%, 2-3x per week at night. Expect 6-12 weeks before results. Always wear SPF during the day.",
            'vitamin c': "Vitamin C (L-ascorbic acid) brightens, protects against free radicals, and boosts collagen. Use in the morning at 10-20%. Store in a dark, cool place — it oxidizes quickly.",
            'aha': "AHAs (glycolic, lactic acid) exfoliate the skin's surface, improving texture and fading dark spots. Use 2-3x per week at night. Start low (5-7%) and build up.",
            'bha': "BHAs (salicylic acid) are oil-soluble, meaning they penetrate pores to clear congestion — ideal for oily, acne-prone skin. Use 1-2% in cleansers or treatments.",
            'ceramide': "Ceramides are lipids that form the skin barrier. They lock in moisture and protect against environmental damage. Essential for dry and sensitive skin.",
            'peptide': "Peptides are amino acid chains that signal the skin to produce more collagen. Great for anti-aging routines — gentle and suitable for sensitive skin.",
        }
        for key, info in ingredient_info.items():
            if key in m:
                return info
        return ("Skincare ingredients are fascinating! The most impactful ones to know: "
                "**Hyaluronic acid** (hydration), **Niacinamide** (multi-tasking), "
                "**Retinol** (anti-aging), **Vitamin C** (brightening), **AHAs** (exfoliation), "
                "**BHAs** (pore clearing), **Ceramides** (barrier repair). Ask me about any "
                "specific ingredient and I'll give you the full breakdown!")

    # ── Thank you / Compliment ──
    if re.search(r'\b(thank|thanks|merci|thx|great|amazing|helpful|love it|perfect)\b', m):
        return ("You're so welcome! That's exactly what I'm here for. ✨ "
                "Feel free to ask anything else — whether it's a specific product, a routine tweak, "
                "or beauty advice for a special occasion. Happy to help!")

    # ── Default ──
    return ("Great question! I'm Glamour, your AI beauty advisor, and I'm here to help with "
            "skincare, makeup, fragrance, and all things beauty. Could you tell me a little more "
            "about what you're looking for? For example:\n\n"
            "• A skincare routine for your skin type\n"
            "• Foundation or makeup recommendations\n"
            "• Fragrance advice\n"
            "• Ingredient questions\n"
            "• Help finding a specific product\n\n"
            "The more detail you share, the better I can tailor my advice to you!")
