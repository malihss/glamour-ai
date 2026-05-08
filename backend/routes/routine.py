"""
routes/routine.py — AI Beauty Routine Generator (rule-based, no external API)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import User, Product, Category
from sqlalchemy import func
from datetime import datetime
import os, json, random

routine_bp = Blueprint('routine', __name__)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _fetch_products_by_category(slugs: list, limit: int = 3):
    cats = Category.query.filter(Category.slug.in_(slugs)).all()
    cat_ids = [c.id for c in cats]
    if not cat_ids:
        return []
    return (
        Product.query
        .filter(Product.category_id.in_(cat_ids), Product.is_active == True)
        .order_by(func.random())
        .limit(limit)
        .all()
    )


def _product_snippet(p) -> dict:
    return {
        'id':    str(p.id),
        'name':  p.name,
        'slug':  p.slug,
        'brand': p.brand.name if p.brand else '',
        'price': float(p.price),
        'image': p.primary_image(),
    }


# ── Routine templates per skin type ───────────────────────────────────────────

MORNING_STEPS = {
    'dry': [
        {'category': 'Cleanser',    'instruction': 'Use a gentle cream cleanser with lukewarm water — avoid hot water which strips moisture.',  'tip': 'Pat dry, never rub.'},
        {'category': 'Essence',     'instruction': 'Press an hydrating essence into skin to prep and boost absorption of next steps.',           'tip': 'Layering thin textures maximises hydration.'},
        {'category': 'Serum',       'instruction': 'Apply a hyaluronic acid or nourishing serum to damp skin for deeper absorption.',           'tip': 'Use 2–3 drops and press in with palms, not fingers.'},
        {'category': 'Moisturiser', 'instruction': 'Lock in hydration with a rich cream moisturiser — focus on cheeks and any tight areas.',    'tip': 'Apply while skin is still slightly damp.'},
        {'category': 'SPF',         'instruction': 'Finish with at least SPF 30 — the single most anti-ageing step in any routine.',            'tip': 'Reapply every 2 hours when outdoors.'},
    ],
    'oily': [
        {'category': 'Cleanser',    'instruction': 'Cleanse with a gel or foaming formula to remove overnight sebum without over-stripping.', 'tip': 'Over-washing triggers more oil — once is enough.'},
        {'category': 'Toner',       'instruction': 'Apply a balancing toner with niacinamide or BHA to minimise pores and control shine.',    'tip': 'Use a cotton pad with light strokes.'},
        {'category': 'Serum',       'instruction': 'Use a lightweight, oil-free serum targeting pores or blemishes — niacinamide works well.','tip': 'Avoid heavy oils in your serum at this step.'},
        {'category': 'Moisturiser', 'instruction': 'Even oily skin needs moisture — opt for a gel or fluid formula that won\'t block pores.',  'tip': 'Skipping moisturiser causes your skin to produce more oil.'},
        {'category': 'SPF',         'instruction': 'Use a matte or invisible SPF formula to protect without adding shine.',                    'tip': 'Mineral SPF often works better on oily skin.'},
    ],
    'combination': [
        {'category': 'Cleanser',    'instruction': 'Cleanse with a gentle balancing formula that respects both oily and dry zones.',           'tip': 'Focus the cleanser on the T-zone.'},
        {'category': 'Toner',       'instruction': 'Apply a balancing toner to the whole face, concentrating on the T-zone.',                  'tip': 'Use a gentle swipe — no harsh rubbing.'},
        {'category': 'Serum',       'instruction': 'Apply a lightweight hydrating or brightening serum across the full face.',                 'tip': 'A Vitamin C serum works great for combination skin in the AM.'},
        {'category': 'Moisturiser', 'instruction': 'Use a lightweight gel-cream moisturiser — heavier on dry areas, lighter on the T-zone.',  'tip': 'You can use two different moisturisers if needed.'},
        {'category': 'SPF',         'instruction': 'Apply broad-spectrum SPF 30+ as the final step before any makeup.',                       'tip': 'SPF is non-negotiable — rain or shine.'},
    ],
    'sensitive': [
        {'category': 'Cleanser',    'instruction': 'Use a fragrance-free, ultra-gentle micellar or cream cleanser with cool water.',          'tip': 'Always patch-test new products before full use.'},
        {'category': 'Essence',     'instruction': 'Apply a soothing essence with centella, aloe, or oat extract to calm inflammation.',      'tip': 'Press gently — no tugging on reactive skin.'},
        {'category': 'Serum',       'instruction': 'Use a barrier-strengthening serum with ceramides or peptides.',                           'tip': 'Introduce only one new product at a time.'},
        {'category': 'Moisturiser', 'instruction': 'Apply a fragrance-free, hypoallergenic moisturiser to strengthen the skin barrier.',     'tip': 'Look for "for sensitive skin" labels.'},
        {'category': 'SPF',         'instruction': 'Use a mineral SPF (zinc oxide/titanium dioxide) — gentler on reactive skin.',             'tip': 'Avoid chemical filters if your skin is very reactive.'},
    ],
    'normal': [
        {'category': 'Cleanser',    'instruction': 'Cleanse with a gentle pH-balanced formula to maintain your naturally balanced skin.',     'tip': 'Enjoy your balanced skin — keep the routine simple.'},
        {'category': 'Serum',       'instruction': 'Apply an antioxidant Vitamin C serum to protect from environmental damage and brighten.', 'tip': 'Store Vitamin C serum away from light.'},
        {'category': 'Moisturiser', 'instruction': 'Use a lightweight moisturiser to maintain hydration and skin health.',                    'tip': 'Normal skin can handle most textures well.'},
        {'category': 'SPF',         'instruction': 'Always finish with broad-spectrum SPF — prevention is better than correction.',           'tip': 'Make SPF the non-negotiable last step.'},
    ],
}

EVENING_STEPS = {
    'dry': [
        {'category': 'Cleanser',    'instruction': 'Double cleanse: micellar water first, then a cream cleanser to remove all traces of SPF.', 'tip': 'The second cleanse is the real skin prep.'},
        {'category': 'Treatment',   'instruction': 'Apply a treatment serum with peptides or retinol (if tolerated) to support overnight repair.', 'tip': 'Start retinol 2x per week, then build up.'},
        {'category': 'Serum',       'instruction': 'Layer a deeply hydrating serum over the treatment — hyaluronic acid or squalane.',          'tip': 'Skin absorbs 8x more actives at night.'},
        {'category': 'Eye Cream',   'instruction': 'Tap eye cream gently around the orbital bone with your ring finger.',                       'tip': 'The ring finger applies the least pressure.'},
        {'category': 'Moisturiser', 'instruction': 'Seal with a rich night cream or sleeping mask — the richer, the better for dry skin.',      'tip': 'Slugging with a balm on top works wonders.'},
    ],
    'oily': [
        {'category': 'Cleanser',    'instruction': 'Double cleanse to fully remove sunscreen and pollution — use an oil cleanser then a gel.', 'tip': 'An oil cleanser won\'t make oily skin worse.'},
        {'category': 'Treatment',   'instruction': 'Apply a BHA exfoliant (salicylic acid) 2–3x per week to unclog pores.',                   'tip': 'Don\'t use BHA and retinol the same night.'},
        {'category': 'Serum',       'instruction': 'Use a niacinamide or azelaic acid serum to regulate sebum and fade blemishes overnight.', 'tip': 'Niacinamide is safe to use every night.'},
        {'category': 'Moisturiser', 'instruction': 'Apply a lightweight gel or fluid moisturiser — oily skin still needs nightly hydration.',  'tip': 'Skip heavy creams at night if you\'re oily.'},
        {'category': 'Eye Cream',   'instruction': 'Use a lightweight eye gel to hydrate the under-eye area without clogging milia.',          'tip': 'Avoid rich eye creams if you\'re prone to milia.'},
    ],
    'combination': [
        {'category': 'Cleanser',    'instruction': 'Remove all makeup and SPF with a gentle balancing cleanser.',                             'tip': 'Oil cleansers dissolve sunscreen most effectively.'},
        {'category': 'Treatment',   'instruction': 'Apply a mild retinol or AHA serum 2–3x per week to refine texture and pores.',           'tip': 'Always follow actives with a moisturiser.'},
        {'category': 'Serum',       'instruction': 'Use a hydrating serum across the face — paying extra attention to drier cheeks.',         'tip': 'Layer thinner textures under thicker ones.'},
        {'category': 'Eye Cream',   'instruction': 'Apply eye cream to the under-eye and brow bone area for full-eye nourishment.',           'tip': 'Be consistent — eye cream works over months.'},
        {'category': 'Moisturiser', 'instruction': 'Apply a night cream to balance overnight and wake up with an even complexion.',           'tip': 'Use a richer formula on cheeks, lighter on T-zone.'},
    ],
    'sensitive': [
        {'category': 'Cleanser',    'instruction': 'Use a very gentle, non-foaming cleanser to remove the day without triggering sensitivity.','tip': 'Micellar water alone is fine on calm nights.'},
        {'category': 'Treatment',   'instruction': 'Apply a barrier repair serum with ceramides, cholesterol and fatty acids.',               'tip': 'A damaged barrier is the root of most sensitivity.'},
        {'category': 'Serum',       'instruction': 'Use a calming serum with centella asiatica, madecassoside or niacinamide.',               'tip': 'Less is more — 2 steps is often enough.'},
        {'category': 'Eye Cream',   'instruction': 'Pat a fragrance-free eye cream to hydrate and repair the delicate eye area.',             'tip': 'Avoid fragrance near the eyes — it\'s very sensitising.'},
        {'category': 'Moisturiser', 'instruction': 'Apply a rich, fragrance-free overnight cream to repair the skin barrier while you sleep.','tip': 'Sensitive skin loves thick, simple formulas at night.'},
    ],
    'normal': [
        {'category': 'Cleanser',    'instruction': 'Cleanse once in the evening to remove SPF and pollutants from the day.',                  'tip': 'Evening is the most important cleanse of the day.'},
        {'category': 'Treatment',   'instruction': 'Use a retinol or AHA treatment 2–3x a week to maintain skin quality and glow.',          'tip': 'Normal skin tolerates most actives well.'},
        {'category': 'Serum',       'instruction': 'Apply a hydrating or repairing serum to support overnight regeneration.',                 'tip': 'Peptides work especially well at night.'},
        {'category': 'Eye Cream',   'instruction': 'Gently tap eye cream around the orbital bone before moisturiser.',                       'tip': 'Prevention is easier than correction.'},
        {'category': 'Moisturiser', 'instruction': 'Finish with a nourishing night moisturiser to let your skin recover overnight.',          'tip': 'Your skin cell turnover peaks between 11pm–2am.'},
    ],
}

WEEKLY_STEPS = {
    'dry': [
        {'category': 'Hydrating Mask', 'frequency': '2× per week', 'instruction': 'Apply a thick hydrating mask and leave for 15 minutes, then remove excess.', 'tip': 'Leave a thin layer on as a sleeping mask for extra hydration.'},
        {'category': 'Gentle Exfoliant', 'frequency': '1× per week', 'instruction': 'Use a mild enzyme or lactic acid exfoliant to remove dead skin without irritation.', 'tip': 'Never use physical scrubs on dry skin — they cause micro-tears.'},
        {'category': 'Face Oil', 'frequency': '2–3× per week', 'instruction': 'Warm 2–3 drops of face oil between palms and press into skin after moisturiser.', 'tip': 'Rosehip and marula oils are excellent for dry skin.'},
    ],
    'oily': [
        {'category': 'Clay Mask', 'frequency': '1–2× per week', 'instruction': 'Apply a kaolin or bentonite clay mask to the T-zone for 10 minutes, then rinse.', 'tip': 'Don\'t let the mask fully dry — it dehydrates skin.'},
        {'category': 'BHA Exfoliant', 'frequency': '2× per week', 'instruction': 'Apply a salicylic acid exfoliant to unclog pores and reduce breakouts.', 'tip': 'Apply on clean, dry skin and wait 20 minutes before moisturiser.'},
        {'category': 'Sheet Mask', 'frequency': '1× per week', 'instruction': 'Use a brightening or pore-minimising sheet mask for a weekly skin reset.', 'tip': 'Refrigerate sheet masks for a pore-tightening effect.'},
    ],
    'combination': [
        {'category': 'Multi-Masking', 'frequency': '1–2× per week', 'instruction': 'Apply a clay mask on the T-zone and a hydrating mask on cheeks simultaneously.', 'tip': 'Multi-masking solves different zone needs at once.'},
        {'category': 'AHA Exfoliant', 'frequency': '1–2× per week', 'instruction': 'Use a glycolic or lactic acid exfoliant to refine skin texture and unify tone.', 'tip': 'Start with 1× per week and build tolerance.'},
        {'category': 'Hydrating Mask', 'frequency': '1× per week', 'instruction': 'Apply a hydrating mask focusing on cheeks and any dry patches.', 'tip': 'Even combination skin benefits from weekly hydration boosts.'},
    ],
    'sensitive': [
        {'category': 'Calming Mask', 'frequency': '1–2× per week', 'instruction': 'Apply a soothing oat or centella mask to reduce redness and calm reactivity.', 'tip': 'Cool masks (refrigerated) feel more calming on reactive skin.'},
        {'category': 'Enzyme Exfoliant', 'frequency': '1× per week (optional)', 'instruction': 'Use a very gentle papaya or pineapple enzyme mask to mildly exfoliate.', 'tip': 'Skip if your skin is currently inflamed or reactive.'},
    ],
    'normal': [
        {'category': 'Brightening Mask', 'frequency': '1× per week', 'instruction': 'Use a Vitamin C or AHA sheet mask to boost radiance and even skin tone.', 'tip': 'Follow with your full routine to lock in the benefits.'},
        {'category': 'Exfoliant', 'frequency': '2× per week', 'instruction': 'Apply a chemical exfoliant (AHA/BHA) to maintain smooth, clear skin.', 'tip': 'Normal skin tolerates most exfoliants — start low, build up.'},
        {'category': 'Overnight Mask', 'frequency': '1–2× per week', 'instruction': 'Apply a sleeping mask as the last step to amplify overnight repair.', 'tip': 'Great to do on weekends for a glow boost.'},
    ],
}

INSIGHTS = {
    'dry': "Your skin barrier needs consistent reinforcement — focus on humectants (hyaluronic acid) to draw in water and occlusives (ceramides, oils) to lock it in. Never skip moisturiser, even on days you feel lazy, and always apply to slightly damp skin for maximum absorption.",
    'oily': "Oily skin is often misunderstood — the goal isn't to dry it out, but to balance sebum production through consistent hydration. Skipping moisturiser signals your skin to produce more oil; use lightweight, non-comedogenic formulas and your skin will regulate itself over time.",
    'combination': "Combination skin benefits most from targeted care: treat each zone according to its needs rather than using one product for everything. A gel moisturiser for the T-zone and a richer cream for the cheeks is a simple upgrade that makes a significant difference.",
    'sensitive': "Sensitive skin thrives on simplicity — fewer products, fragrance-free formulas, and a strong focus on barrier repair with ceramides and fatty acids. Introduce any new product slowly (patch test, then every other day for a week) and your skin will thank you.",
    'normal': "Lucky you — normal skin is forgiving and responsive to most formulas. Focus on prevention: consistent SPF use, antioxidant protection, and a weekly exfoliant will keep your skin in its best condition for years to come.",
}

CONCERN_TIPS = {
    'acne':          'Incorporate niacinamide and salicylic acid into your routine — they address breakouts without the dryness of benzoyl peroxide.',
    'dark spots':    'Vitamin C in the morning and a gentle AHA at night is the gold standard for fading hyperpigmentation over 8–12 weeks.',
    'fine lines':    'Retinol (evenings, 2–3× per week) combined with peptides and SPF is the most evidence-backed approach to visible line reduction.',
    'dryness':       'Look for hyaluronic acid, glycerin, and ceramides across your routine — layer them from thinnest to thickest texture.',
    'sensitivity':   'Centella asiatica, madecassoside, and azelaic acid are your allies — effective yet gentle enough for the most reactive skin.',
    'pores':         'Niacinamide tightens the appearance of pores; BHA (salicylic acid) keeps them clean from the inside. Use both consistently.',
    'uneven tone':   'Chemical exfoliation (AHA 2× per week) plus daily SPF is more effective than any brightening serum alone.',
    'dullness':      'Vitamin C serum every morning + weekly glycolic acid mask will transform dull skin within 4–6 weeks.',
    'oiliness':      'Clay masks 1–2× per week + niacinamide daily will visibly reduce oil within 2–3 weeks.',
    'redness':       'Green-tinted primers, centella creams, and azelaic acid serum are practical solutions for visible redness.',
}


def _build_routine(skin_type: str, concerns: list, goals: list,
                   cleansers, serums, moisturizers, eye_care, treatments) -> dict:
    st = skin_type.lower() if skin_type else 'combination'
    if st not in MORNING_STEPS:
        st = 'combination'

    # Build product pools
    cleanser_pool   = [_product_snippet(p) for p in cleansers]
    serum_pool      = [_product_snippet(p) for p in serums]
    moisturizer_pool= [_product_snippet(p) for p in moisturizers]
    eye_pool        = [_product_snippet(p) for p in eye_care]

    def pick(pool):
        return pool[0] if pool else None

    cleanser_prod   = pick(cleanser_pool)
    serum_prod      = pick(serum_pool)
    moisturizer_prod= pick(moisturizer_pool)
    eye_prod        = pick(eye_pool)

    # Build morning steps
    morning = []
    for i, tmpl in enumerate(MORNING_STEPS[st], 1):
        step = {
            'step': i,
            'category':    tmpl['category'],
            'instruction': tmpl['instruction'],
            'tip':         tmpl['tip'],
            'productId':   None,
            'productName': None,
            'product':     None,
        }
        cat = tmpl['category'].lower()
        if 'cleanser' in cat and cleanser_prod:
            step['product'] = cleanser_prod
            step['productId'] = cleanser_prod['id']
            step['productName'] = cleanser_prod['name']
        elif 'serum' in cat and serum_prod:
            step['product'] = serum_prod
            step['productId'] = serum_prod['id']
            step['productName'] = serum_prod['name']
        elif 'moistur' in cat and moisturizer_prod:
            step['product'] = moisturizer_prod
            step['productId'] = moisturizer_prod['id']
            step['productName'] = moisturizer_prod['name']
        morning.append(step)

    # Build evening steps
    # Use second serum/moisturizer if available
    serum_eve_prod = serum_pool[1] if len(serum_pool) > 1 else serum_prod
    moist_eve_prod = moisturizer_pool[1] if len(moisturizer_pool) > 1 else moisturizer_prod

    evening = []
    for i, tmpl in enumerate(EVENING_STEPS[st], 1):
        step = {
            'step': i,
            'category':    tmpl['category'],
            'instruction': tmpl['instruction'],
            'tip':         tmpl['tip'],
            'productId':   None,
            'productName': None,
            'product':     None,
        }
        cat = tmpl['category'].lower()
        if 'cleanser' in cat and cleanser_prod:
            step['product'] = cleanser_prod
            step['productId'] = cleanser_prod['id']
            step['productName'] = cleanser_prod['name']
        elif ('serum' in cat or 'treatment' in cat) and serum_eve_prod:
            step['product'] = serum_eve_prod
            step['productId'] = serum_eve_prod['id']
            step['productName'] = serum_eve_prod['name']
        elif 'eye' in cat and eye_prod:
            step['product'] = eye_prod
            step['productId'] = eye_prod['id']
            step['productName'] = eye_prod['name']
        elif 'moistur' in cat and moist_eve_prod:
            step['product'] = moist_eve_prod
            step['productId'] = moist_eve_prod['id']
            step['productName'] = moist_eve_prod['name']
        evening.append(step)

    # Build weekly steps
    weekly = []
    for i, tmpl in enumerate(WEEKLY_STEPS[st], 1):
        weekly.append({
            'step': i,
            'category':    tmpl['category'],
            'instruction': tmpl['instruction'],
            'frequency':   tmpl['frequency'],
            'tip':         tmpl['tip'],
            'productId':   None,
            'productName': None,
            'product':     None,
        })

    # Build insight
    base_insight = INSIGHTS.get(st, INSIGHTS['combination'])
    concern_additions = []
    for c in (concerns or []):
        for key, tip in CONCERN_TIPS.items():
            if key in c.lower():
                concern_additions.append(tip)
                break
    insight = base_insight
    if concern_additions:
        insight += ' ' + concern_additions[0]

    return {
        'morning': morning,
        'evening': evening,
        'weekly':  weekly,
        'insight': insight,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@routine_bp.route('/generate', methods=['POST'])
def generate_routine():
    user = None
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            user = User.query.get(uid)
    except Exception:
        pass

    data = request.get_json() or {}

    skin_type    = data.get('skinType')   or (user.skin_type if user else 'combination')
    skin_tone    = data.get('skinTone')   or (user.skin_tone if user else None)
    concerns     = data.get('concerns',  [])
    goals        = data.get('goals',     [])
    time_morning = data.get('timeMorning', '10 min')
    time_evening = data.get('timeEvening', '15 min')

    cleansers    = _fetch_products_by_category(['cleansers'], 2)
    serums       = _fetch_products_by_category(['serums'],    4)
    moisturizers = _fetch_products_by_category(['moisturizers'], 3)
    eye_care     = _fetch_products_by_category(['eye-care'],  2)
    treatments   = _fetch_products_by_category(['face'],      3)

    routine = _build_routine(
        skin_type, concerns, goals,
        cleansers, serums, moisturizers, eye_care, treatments,
    )

    if user:
        prefs = user.preferences or {}
        prefs['saved_routine'] = {
            'routine':     routine,
            'profile':     {'skinType': skin_type, 'skinTone': skin_tone, 'concerns': concerns, 'goals': goals},
            'generatedAt': datetime.utcnow().isoformat(),
        }
        user.preferences = prefs
        db.session.commit()

    return jsonify({'routine': routine})


@routine_bp.route('/saved', methods=['GET'])
@jwt_required()
def get_saved():
    user = User.query.get(get_jwt_identity())
    saved = (user.preferences or {}).get('saved_routine')
    return jsonify({'saved': saved})
