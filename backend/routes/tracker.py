"""
routes/tracker.py — Beauty Journey / Skin Tracker
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import SkinEntry
from sqlalchemy import desc
from datetime import date, datetime, timedelta
from groq import Groq
import os

tracker_bp = Blueprint('tracker', __name__)


@tracker_bp.route('/', methods=['GET'])
@jwt_required()
def get_entries():
    user_id = get_jwt_identity()
    days = request.args.get('days', 30, type=int)
    since = date.today() - timedelta(days=days)
    entries = (
        SkinEntry.query
        .filter_by(user_id=user_id)
        .filter(SkinEntry.date >= since)
        .order_by(desc(SkinEntry.date))
        .all()
    )
    return jsonify({'entries': [e.to_dict() for e in entries]})


@tracker_bp.route('/', methods=['POST'])
@jwt_required()
def create_entry():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    entry_date = data.get('date')
    try:
        entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date() if entry_date else date.today()
    except ValueError:
        entry_date = date.today()

    # One entry per day — upsert
    existing = SkinEntry.query.filter_by(user_id=user_id, date=entry_date).first()
    if existing:
        entry = existing
    else:
        entry = SkinEntry(user_id=user_id, date=entry_date)
        db.session.add(entry)

    entry.photo         = data.get('photo', entry.photo)
    entry.overall       = data.get('overall',   entry.overall)
    entry.hydration     = data.get('hydration', entry.hydration)
    entry.clarity       = data.get('clarity',   entry.clarity)
    entry.texture       = data.get('texture',   entry.texture)
    entry.products_used = data.get('productsUsed', entry.products_used or [])
    entry.notes         = data.get('notes',     entry.notes)

    db.session.commit()
    return jsonify({'entry': entry.to_dict()}), 201


@tracker_bp.route('/<entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    user_id = get_jwt_identity()
    entry = SkinEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    if not entry:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'ok': True})


@tracker_bp.route('/insights', methods=['POST'])
@jwt_required()
def get_insights():
    """Generate AI insights from the last 14 days of entries."""
    user_id = get_jwt_identity()
    since = date.today() - timedelta(days=14)
    entries = (
        SkinEntry.query
        .filter_by(user_id=user_id)
        .filter(SkinEntry.date >= since)
        .order_by(SkinEntry.date)
        .all()
    )
    if not entries:
        return jsonify({'insights': 'Log a few days of skin data to get personalized AI insights.'})

    # Build summary for AI
    lines = []
    for e in entries:
        scores = []
        if e.overall:    scores.append(f'overall {e.overall}/10')
        if e.hydration:  scores.append(f'hydration {e.hydration}/10')
        if e.clarity:    scores.append(f'clarity {e.clarity}/10')
        if e.texture:    scores.append(f'texture {e.texture}/10')
        prods = ', '.join([p.get('name','') for p in (e.products_used or [])]) or 'none'
        line = f"- {e.date}: {', '.join(scores)}. Products: {prods}."
        if e.notes:
            line += f" Notes: {e.notes}"
        lines.append(line)

    summary = '\n'.join(lines)

    try:
        client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))
        resp = client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are a luxury beauty skincare expert. '
                        'Analyze the user\'s skin tracking data and give concise, '
                        'actionable insights in 3-4 sentences. '
                        'Focus on trends, what\'s working, and one specific recommendation. '
                        'Be warm and encouraging. Do not use markdown or bullet points.'
                    )
                },
                {
                    'role': 'user',
                    'content': f'Here is my skin data for the past 2 weeks:\n\n{summary}\n\nWhat do you see and what should I focus on?'
                }
            ],
            max_tokens=200,
            temperature=0.7,
        )
        insights = resp.choices[0].message.content.strip()
    except Exception:
        insights = 'Keep logging daily — trends become clearer after 7+ entries. Focus on consistency with your routine.'

    # Cache on the latest entry
    if entries:
        entries[-1].ai_insights = insights
        db.session.commit()

    return jsonify({'insights': insights})
