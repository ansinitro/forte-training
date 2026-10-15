#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Forte Business Quest — Training Battle Server (Kahoot-style live platform)
Standard Python 3 (zero external dependencies).
Supports live filial ranking, bank median calculation, lobby controls, and HR CSV export.
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import json
import time
import uuid
import mimetypes
import statistics
from datetime import datetime
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get('PORT', 8000))
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'forte2026')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
SESSION_FILE = os.path.join(DATA_DIR, 'live_session.json')

# ─────────────────────────────────────────────────────────────
# IN-MEMORY STATE
# ─────────────────────────────────────────────────────────────
class GameState:
    def __init__(self):
        self.session_id = str(uuid.uuid4())[:8]
        self.status = 'lobby'  # 'lobby', 'active', 'finished'
        self.title = 'Forte Business: Банковские гарантии'
        self.started_at = None
        self.players = {}  # id -> { id, name, avatar, filial, xp, stage, finished, updated_at }
        self.recent_events = []
        self.load_disk()

    def load_disk(self):
        if os.path.exists(SESSION_FILE):
            try:
                with open(SESSION_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.session_id = data.get('session_id', self.session_id)
                    self.status = data.get('status', 'lobby')
                    self.title = data.get('title', self.title)
                    self.started_at = data.get('started_at')
                    self.players = data.get('players', {})
                    self.recent_events = data.get('recent_events', [])
            except Exception as e:
                print("Failed to load session:", e)

    def save_disk(self):
        try:
            with open(SESSION_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'session_id': self.session_id,
                    'status': self.status,
                    'title': self.title,
                    'started_at': self.started_at,
                    'players': self.players,
                    'recent_events': self.recent_events[-50:]
                }, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Failed to save session:", e)

    def reset(self, title=None):
        self.session_id = str(uuid.uuid4())[:8]
        self.status = 'lobby'
        if title:
            self.title = title
        self.started_at = None
        self.players = {}
        self.recent_events = []
        self.save_disk()

    def start(self):
        self.status = 'active'
        self.started_at = time.time()
        self.add_event('Тренер дал старт тестированию!', 'system')
        self.save_disk()

    def finish(self):
        self.status = 'finished'
        self.add_event('Тестирование завершено тренером!', 'system')
        self.save_disk()

    def add_player(self, name, avatar, filial):
        # Check if already exists by name + filial
        for p_id, p in self.players.items():
            if p['name'].strip().lower() == name.strip().lower() and p['filial'] == filial:
                p['avatar'] = avatar
                p['updated_at'] = time.time()
                self.save_disk()
                return p_id

        p_id = str(uuid.uuid4())[:8]
        self.players[p_id] = {
            'id': p_id,
            'name': name.strip(),
            'avatar': avatar or '👤',
            'filial': filial or 'Алматы',
            'xp': 0,
            'stage': 1,
            'finished': False,
            'created_at': time.time(),
            'updated_at': time.time()
        }
        self.add_event(f"{name} ({filial}) подключился к тренингу", 'join')
        self.save_disk()
        return p_id

    def update_progress(self, p_id, xp, stage, finished=False):
        if p_id in self.players:
            p = self.players[p_id]
            old_xp = p['xp']
            p['xp'] = max(p['xp'], int(xp))
            p['stage'] = max(p['stage'], int(stage))
            if finished:
                p['finished'] = True
            p['updated_at'] = time.time()

            diff = p['xp'] - old_xp
            if diff > 0:
                self.add_event(f"{p['name']} ({p['filial']}) +{diff} XP", 'score')
            elif finished:
                self.add_event(f"🎯 {p['name']} ({p['filial']}) завершил кейс с {p['xp']} XP!", 'finish')

            self.save_disk()
            return True
        return False

    def add_event(self, text, kind='info'):
        self.recent_events.append({
            'text': text,
            'kind': kind,
            'time': datetime.now().strftime('%H:%M:%S')
        })
        if len(self.recent_events) > 50:
            self.recent_events.pop(0)

    def get_stats(self):
        players_list = list(self.players.values())
        total_count = len(players_list)
        finished_count = sum(1 for p in players_list if p.get('finished'))
        all_xp = [p['xp'] for p in players_list]

        bank_median = round(statistics.median(all_xp), 1) if all_xp else 0
        bank_avg = round(sum(all_xp) / total_count, 1) if total_count else 0
        max_xp = max(all_xp) if all_xp else 0

        # Filials aggregation
        filials_dict = {}
        for p in players_list:
            f_name = p['filial']
            if f_name not in filials_dict:
                filials_dict[f_name] = []
            filials_dict[f_name].append(p['xp'])

        filials_stats = []
        for f_name, scores in filials_dict.items():
            f_med = round(statistics.median(scores), 1) if scores else 0
            f_avg = round(sum(scores) / len(scores), 1) if scores else 0
            f_tot = sum(scores)
            filials_stats.append({
                'filial': f_name,
                'name': f_name,
                'count': len(scores),
                'medianXP': f_med,
                'median_xp': f_med,
                'avgXP': f_avg,
                'avg_xp': f_avg,
                'totalXP': f_tot,
                'total_xp': f_tot
            })

        # Rank filials primarily by median XP, secondary by total XP
        filials_stats.sort(key=lambda x: (x['medianXP'], x['avgXP'], x['totalXP']), reverse=True)
        for idx, item in enumerate(filials_stats):
            item['rank'] = idx + 1

        # Leaderboard players
        leaderboard = sorted(players_list, key=lambda x: x['xp'], reverse=True)[:30]

        return {
            'status': self.status,
            'sessionId': self.session_id,
            'session_id': self.session_id,
            'title': self.title,
            'startedAt': self.started_at,
            'started_at': self.started_at,
            'totalPlayers': total_count,
            'total_players': total_count,
            'finishedPlayers': finished_count,
            'finished_players': finished_count,
            'bankMedianXP': bank_median,
            'bank_median_xp': bank_median,
            'bankAvgXP': bank_avg,
            'bank_avg_xp': bank_avg,
            'maxXP': max_xp,
            'max_xp': max_xp,
            'filials': filials_stats,
            'leaderboard': leaderboard,
            'recentEvents': self.recent_events[-15:],
            'recent_events': self.recent_events[-15:]
        }

STATE = GameState()

# ─────────────────────────────────────────────────────────────
# HTTP HANDLER
# ─────────────────────────────────────────────────────────────
class ForteTrainingHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent caching for live API and JSON files
        if self.path.startswith('/api') or self.path.endswith('.json'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Route /admin to admin.html
        if path == '/admin' or path == '/admin/':
            self.path = '/admin.html'
            return super().do_GET()

        # API: Session status
        if path == '/api/session':
            return self.send_json({
                'status': STATE.status,
                'sessionId': STATE.session_id,
                'title': STATE.title,
                'startedAt': STATE.started_at,
                'totalPlayers': len(STATE.players)
            })

        # API: Live stats
        if path == '/api/stats':
            return self.send_json(STATE.get_stats())

        # API: CSV Export
        if path == '/api/admin/export':
            params = parse_qs(parsed.query)
            pwd = params.get('pwd', [''])[0]
            if pwd != ADMIN_PASSWORD:
                return self.send_json({'error': 'Unauthorized'}, 401)

            # Generate CSV with UTF-8 BOM for Excel compatibility
            lines = ['\ufeff"Имя";"Филиал (Город)";"Баллы XP";"Текущий этап";"Завершил";"Подключился"']
            players = sorted(STATE.players.values(), key=lambda p: p['xp'], reverse=True)
            for p in players:
                created = datetime.fromtimestamp(p.get('created_at', time.time())).strftime('%d.%m.%Y %H:%M')
                fin = 'Да' if p.get('finished') else 'В процессе'
                lines.append(f'"{p["name"]}";"{p["filial"]}";{p["xp"]};{p["stage"]};"{fin}";"{created}"')

            csv_data = '\r\n'.join(lines).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv; charset=utf-8')
            self.send_header('Content-Disposition', 'attachment; filename="forte_training_results.csv"')
            self.send_header('Content-Length', str(len(csv_data)))
            self.end_headers()
            self.wfile.write(csv_data)
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        # API: Join Game
        if path == '/api/join':
            name = data.get('name', '').strip()
            avatar = data.get('avatar', '👤')
            filial = data.get('filial', 'Алматы')
            if not name or len(name) < 2:
                return self.send_json({'error': 'Имя должно содержать минимум 2 символа'}, 400)

            p_id = STATE.add_player(name, avatar, filial)
            return self.send_json({
                'ok': True,
                'playerId': p_id,
                'status': STATE.status,
                'sessionId': STATE.session_id,
                'player': STATE.players[p_id]
            })

        # API: Progress update
        if path == '/api/progress':
            p_id = data.get('playerId') or data.get('id')
            xp = data.get('xp', 0)
            stage = data.get('stage', 1)
            finished = data.get('finished', False)
            if not p_id or p_id not in STATE.players:
                return self.send_json({'error': 'Участник не найден'}, 404)

            STATE.update_progress(p_id, xp, stage, finished)
            return self.send_json({'ok': True, 'status': STATE.status})

        # API: Admin Start
        if path == '/api/admin/start':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            STATE.start()
            return self.send_json({'ok': True, 'status': STATE.status})

        # API: Admin Finish
        if path == '/api/admin/finish':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            STATE.finish()
            return self.send_json({'ok': True, 'status': STATE.status})

        # API: Admin Reset
        if path == '/api/admin/reset':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            title = data.get('title')
            STATE.reset(title)
            return self.send_json({'ok': True, 'status': STATE.status})

        return self.send_json({'error': 'Not found'}, 404)

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def run():
    # Make sure we serve from the repository directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    server = ThreadingHTTPServer(('0.0.0.0', PORT), ForteTrainingHandler)
    print(f"[FORTE SERVER] Server running on http://0.0.0.0:{PORT}")
    print(f"[FORTE SERVER] Player interface: http://localhost:{PORT}/")
    print(f"[FORTE SERVER] Admin dashboard: http://localhost:{PORT}/admin")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()

if __name__ == '__main__':
    run()
