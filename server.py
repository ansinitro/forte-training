#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Forte Business Quest — Training Battle Server (Kahoot-style live platform)
Standard Python 3 (zero external dependencies).
Supports live filial ranking, backend-authoritative timers, locked round-by-round flow,
PIN-based joining, filial scope filtering, and HR Excel CSV export.
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
import random
import statistics
from datetime import datetime
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get('PORT', 8000))
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'forte2026')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
SESSION_FILE = os.path.join(DATA_DIR, 'live_session.json')

ALL_FILIALS = [
    'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Атырау',
    'Актау', 'Павлодар', 'Усть-Каменогорск', 'Костанай', 'Уральск',
    'Петропавловск', 'Кызылорда', 'Тараз', 'Семей', 'Туркестан',
    'Талдыкорган', 'ЦБО / Головной офис'
]

# ─────────────────────────────────────────────────────────────
# IN-MEMORY STATE
# ─────────────────────────────────────────────────────────────
class GameState:
    def __init__(self):
        self.session_id = str(uuid.uuid4())[:8]
        self.pin = str(random.randint(100000, 999999))
        self.title = 'Forte Business: Банковские гарантии'
        self.mode = 'synchronized'  # 'synchronized' (round-by-round) or 'freeroam'
        self.status = 'lobby'        # 'lobby', 'active', 'finished'
        self.selected_filials = list(ALL_FILIALS)

        # Round synchronizer state
        self.current_case_id = None
        self.round_status = 'waiting'  # 'waiting', 'countdown', 'active', 'review', 'finished'
        self.round_duration = 90       # seconds (0 for unlimited)
        self.round_ends_at = None      # timestamp float
        self.round_started_at = None
        self.countdown_until = None    # timestamp float for 3s dramatic countdown

        # Players and Submissions
        self.players = {}              # id -> { id, name, avatar, filial, xp, stage, finished, updated_at, rounds: {} }
        self.round_submissions = {}    # case_id -> { player_id -> { score, answers, finished_at, duration } }
        self.recent_events = []

        self.load_disk()

    def load_disk(self):
        if os.path.exists(SESSION_FILE):
            try:
                with open(SESSION_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.session_id = data.get('session_id', self.session_id)
                    self.pin = data.get('pin', self.pin)
                    self.title = data.get('title', self.title)
                    self.mode = data.get('mode', self.mode)
                    self.status = data.get('status', 'lobby')
                    self.selected_filials = data.get('selected_filials', self.selected_filials)
                    self.current_case_id = data.get('current_case_id')
                    self.round_status = data.get('round_status', 'waiting')
                    self.round_duration = data.get('round_duration', 90)
                    self.round_ends_at = data.get('round_ends_at')
                    self.players = data.get('players', {})
                    self.round_submissions = data.get('round_submissions', {})
                    self.recent_events = data.get('recent_events', [])
            except Exception as e:
                print("Failed to load session:", e)

    def save_disk(self):
        try:
            with open(SESSION_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'session_id': self.session_id,
                    'pin': self.pin,
                    'title': self.title,
                    'mode': self.mode,
                    'status': self.status,
                    'selected_filials': self.selected_filials,
                    'current_case_id': self.current_case_id,
                    'round_status': self.round_status,
                    'round_duration': self.round_duration,
                    'round_ends_at': self.round_ends_at,
                    'players': self.players,
                    'round_submissions': self.round_submissions,
                    'recent_events': self.recent_events[-50:]
                }, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Failed to save session:", e)

    def reset(self, title=None, mode='synchronized', filials=None):
        self.session_id = str(uuid.uuid4())[:8]
        self.pin = str(random.randint(100000, 999999))
        self.status = 'lobby'
        self.mode = mode or 'synchronized'
        if title:
            self.title = title
        self.selected_filials = filials if filials else list(ALL_FILIALS)
        self.current_case_id = None
        self.round_status = 'waiting'
        self.round_duration = 90
        self.round_ends_at = None
        self.countdown_until = None
        self.players = {}
        self.round_submissions = {}
        self.recent_events = []
        self.add_event(f'Создана новая сессия тренинга! PIN-код: {self.pin}', 'system')
        self.save_disk()

    def update_setup(self, title=None, filials=None, mode=None, pin=None):
        if title:
            self.title = title
        if filials and isinstance(filials, list):
            self.selected_filials = filials
        if mode:
            self.mode = mode
        if pin and len(str(pin).strip()) >= 4:
            self.pin = str(pin).strip()
        self.save_disk()

    def start_round(self, case_id, duration_sec=90):
        now = time.time()
        self.status = 'active'
        self.current_case_id = int(case_id)
        self.round_duration = int(duration_sec)
        self.round_status = 'countdown'
        self.countdown_until = now + 3.5  # 3-second visual countdown

        if duration_sec > 0:
            self.round_ends_at = now + 3.5 + int(duration_sec)
        else:
            self.round_ends_at = None

        self.round_started_at = now + 3.5
        str_cid = str(self.current_case_id)
        if str_cid not in self.round_submissions:
            self.round_submissions[str_cid] = {}

        dur_text = f"{duration_sec} сек" if duration_sec > 0 else "без лимита"
        self.add_event(f"Тренер запустил Кейс {case_id}! Время: {dur_text}", 'round_start')
        self.save_disk()

    def stop_round(self):
        self.round_status = 'review'
        self.round_ends_at = None
        self.countdown_until = None
        cid = self.current_case_id
        self.add_event(f"Раунд по Кейсу {cid} завершён! Подведение итогов.", 'round_end')
        self.save_disk()

    def finish_session(self):
        self.status = 'finished'
        self.round_status = 'finished'
        self.add_event("Тренинг полностью завершён! Итоговые результаты зафиксированы.", 'system')
        self.save_disk()

    def add_player(self, name, avatar, filial):
        # Match existing player by name & filial
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
            'updated_at': time.time(),
            'rounds': {}
        }
        self.add_event(f"Присоединился участник: {name} ({filial})", 'join')
        self.save_disk()
        return p_id

    def submit_round_result(self, player_id, case_id, score, is_passed, answers=None):
        if player_id not in self.players:
            return False

        now = time.time()
        p = self.players[player_id]
        cid = str(case_id)

        # Store in player round record
        p['rounds'][cid] = {
            'score': score,
            'passed': is_passed,
            'submitted_at': now,
            'answers': answers or []
        }

        # Update total XP (sum of best scores per round)
        p['xp'] = sum(r['score'] for r in p['rounds'].values())
        p['updated_at'] = now

        # Store in round submissions aggregation
        if cid not in self.round_submissions:
            self.round_submissions[cid] = {}

        self.round_submissions[cid][player_id] = {
            'playerId': player_id,
            'name': p['name'],
            'filial': p['filial'],
            'avatar': p['avatar'],
            'score': score,
            'passed': is_passed,
            'submitted_at': now
        }

        self.add_event(f"{p['name']} ({p['filial']}) завершил Кейс {case_id} на {score}%!", 'submit')
        self.save_disk()
        return True

    def add_event(self, text, ev_type='info'):
        self.recent_events.append({
            'id': str(uuid.uuid4())[:6],
            'time': datetime.now().strftime('%H:%M:%S'),
            'text': text,
            'type': ev_type
        })
        if len(self.recent_events) > 50:
            self.recent_events = self.recent_events[-50:]

    def get_session_summary(self):
        now = time.time()

        # Auto-advance from countdown to active
        if self.round_status == 'countdown' and self.countdown_until and now >= self.countdown_until:
            self.round_status = 'active'
            self.countdown_until = None

        # Auto-advance from active to review when server timer hits 0
        time_left = None
        if self.round_status == 'active':
            if self.round_ends_at:
                time_left = max(0, int(self.round_ends_at - now))
                if time_left == 0:
                    self.round_status = 'review'
                    self.add_event(f"Время раунда вышло! Сервер зафиксировал ответы.", 'timeout')
                    self.save_disk()

        countdown_left = max(0, int(self.countdown_until - now)) if (self.round_status == 'countdown' and self.countdown_until) else 0

        # Submissions count for current round
        cid_str = str(self.current_case_id) if self.current_case_id else None
        round_subs = len(self.round_submissions.get(cid_str, {})) if cid_str else 0

        return {
            'status': self.status,
            'sessionId': self.session_id,
            'pin': self.pin,
            'title': self.title,
            'mode': self.mode,
            'selectedFilials': self.selected_filials,
            'currentCaseId': self.current_case_id,
            'roundStatus': self.round_status,
            'roundDuration': self.round_duration,
            'timeLeft': time_left,
            'countdownLeft': countdown_left,
            'totalPlayers': len(self.players),
            'roundSubmissions': round_subs
        }

    def get_stats(self):
        # Auto-update timer state
        self.get_session_summary()

        players_list = list(self.players.values())
        total_count = len(players_list)

        scores = [p['xp'] for p in players_list]
        bank_median = round(statistics.median(scores), 1) if scores else 0
        bank_avg = round(sum(scores) / len(scores), 1) if scores else 0
        max_xp = max(scores) if scores else 0

        # Filials aggregation
        filials_dict = {f: [] for f in self.selected_filials}
        for p in players_list:
            f_name = p['filial']
            if f_name not in filials_dict:
                filials_dict[f_name] = []
            filials_dict[f_name].append(p['xp'])

        filials_stats = []
        for f_name, scores_arr in filials_dict.items():
            f_med = round(statistics.median(scores_arr), 1) if scores_arr else 0
            f_avg = round(sum(scores_arr) / len(scores_arr), 1) if scores_arr else 0
            f_tot = sum(scores_arr)
            filials_stats.append({
                'filial': f_name,
                'name': f_name,
                'count': len(scores_arr),
                'medianXP': f_med,
                'median_xp': f_med,
                'avgXP': f_avg,
                'avg_xp': f_avg,
                'totalXP': f_tot,
                'total_xp': f_tot
            })

        # Rank filials primarily by median XP, then count
        filials_stats.sort(key=lambda x: (x['medianXP'], x['count'], x['totalXP']), reverse=True)
        for idx, item in enumerate(filials_stats):
            item['rank'] = idx + 1

        leaderboard = sorted(players_list, key=lambda x: x['xp'], reverse=True)[:30]

        summary = self.get_session_summary()

        return {
            **summary,
            'bankMedianXP': bank_median,
            'bank_median_xp': bank_median,
            'bankAvgXP': bank_avg,
            'bank_avg_xp': bank_avg,
            'maxXP': max_xp,
            'max_xp': max_xp,
            'filials': filials_stats,
            'leaderboard': leaderboard,
            'recentEvents': self.recent_events[-20:]
        }

    def get_round_stats(self, case_id=None):
        cid = str(case_id or self.current_case_id or 1)
        subs = list(self.round_submissions.get(cid, {}).values())

        scores = [s['score'] for s in subs]
        round_median = round(statistics.median(scores), 1) if scores else 0
        round_avg = round(sum(scores) / len(scores), 1) if scores else 0

        # Filial performance for this specific case
        f_map = {}
        for s in subs:
            f = s['filial']
            if f not in f_map:
                f_map[f] = []
            f_map[f].append(s['score'])

        filial_round_list = []
        for f, scs in f_map.items():
            filial_round_list.append({
                'filial': f,
                'count': len(scs),
                'medianScore': round(statistics.median(scs), 1),
                'avgScore': round(sum(scs) / len(scs), 1)
            })
        filial_round_list.sort(key=lambda x: (x['medianScore'], x['count']), reverse=True)

        return {
            'caseId': int(cid),
            'totalSubmissions': len(subs),
            'totalConnected': len(self.players),
            'roundMedian': round_median,
            'roundAvg': round_avg,
            'filials': filial_round_list,
            'topPerformers': sorted(subs, key=lambda s: s['score'], reverse=True)[:10]
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

        # API: Session status & summary
        if path == '/api/session':
            return self.send_json(STATE.get_session_summary())

        # API: Live stats & Leaderboard
        if path == '/api/stats':
            return self.send_json(STATE.get_stats())

        # API: Round specific analytics
        if path == '/api/round/stats':
            params = parse_qs(parsed.query)
            cid = params.get('case', [None])[0]
            return self.send_json(STATE.get_round_stats(cid))

        # API: CSV Export (Excel Compatible UTF-8 BOM)
        if path == '/api/admin/export':
            params = parse_qs(parsed.query)
            pwd = params.get('pwd', [''])[0]
            if pwd != ADMIN_PASSWORD:
                return self.send_json({'error': 'Unauthorized'}, 401)

            lines = ['\ufeff"Имя";"Филиал";"Суммарный XP";"Кейсов пройдено";"Подключился"']
            players = sorted(STATE.players.values(), key=lambda p: p['xp'], reverse=True)
            for p in players:
                created = datetime.fromtimestamp(p.get('created_at', time.time())).strftime('%d.%m.%Y %H:%M')
                rounds_done = len(p.get('rounds', {}))
                lines.append(f'"{p["name"]}";"{p["filial"]}";{p["xp"]};{rounds_done};"{created}"')

            # Append filial median table summary at bottom
            lines.append('')
            lines.append('"--- РЕЙТИНГ БИТВЫ ФИЛИАЛОВ ПО МЕДИАНЕ ---"')
            lines.append('"Место";"Филиал";"Медиана XP";"Участников";"Средний балл"')
            f_stats = STATE.get_stats().get('filials', [])
            for f in f_stats:
                lines.append(f'{f["rank"]};"{f["filial"]}";{f["medianXP"]};{f["count"]};{f["avgXP"]}')

            csv_data = '\r\n'.join(lines).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv; charset=utf-8')
            self.send_header('Content-Disposition', f'attachment; filename="forte_session_{STATE.pin}_results.csv"')
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
            pin = str(data.get('pin', '')).strip()

            if pin and pin != STATE.pin:
                return self.send_json({'error': f'Неверный PIN сессии! Актуальный PIN у тренера.'}, 400)

            if not name or len(name) < 2:
                return self.send_json({'error': 'Имя должно содержать минимум 2 символа'}, 400)

            p_id = STATE.add_player(name, avatar, filial)
            summary = STATE.get_session_summary()
            return self.send_json({
                'ok': True,
                'playerId': p_id,
                'player': STATE.players[p_id],
                **summary
            })

        # API: Submit Round Result
        if path == '/api/round/submit':
            p_id = data.get('playerId') or data.get('id')
            cid = data.get('caseId') or data.get('case_id')
            score = int(data.get('score', 0))
            is_passed = bool(data.get('passed', score >= 70))
            answers = data.get('answers', [])

            if not p_id or p_id not in STATE.players:
                return self.send_json({'error': 'Участник не найден'}, 404)

            ok = STATE.submit_round_result(p_id, cid, score, is_passed, answers)
            return self.send_json({'ok': ok, 'summary': STATE.get_session_summary()})

        # API: Admin Setup Session
        if path == '/api/admin/setup':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            title = data.get('title')
            filials = data.get('selectedFilials') or data.get('filials')
            mode = data.get('mode')
            pin = data.get('pin')
            STATE.update_setup(title, filials, mode, pin)
            return self.send_json({'ok': True, 'session': STATE.get_session_summary()})

        # API: Admin Start Round
        if path == '/api/admin/start_round':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            case_id = int(data.get('caseId') or data.get('case_id') or 1)
            duration = int(data.get('duration', 90))
            STATE.start_round(case_id, duration)
            return self.send_json({'ok': True, 'session': STATE.get_session_summary()})

        # API: Admin Stop Round Early
        if path == '/api/admin/stop_round':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            STATE.stop_round()
            return self.send_json({'ok': True, 'session': STATE.get_session_summary()})

        # API: Admin Finish Entire Session
        if path == '/api/admin/finish':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            STATE.finish_session()
            return self.send_json({'ok': True, 'session': STATE.get_session_summary()})

        # API: Admin Reset Session
        if path == '/api/admin/reset':
            if data.get('password') != ADMIN_PASSWORD:
                return self.send_json({'error': 'Неверный пароль'}, 401)
            title = data.get('title')
            mode = data.get('mode', 'synchronized')
            filials = data.get('selectedFilials')
            STATE.reset(title, mode, filials)
            return self.send_json({'ok': True, 'session': STATE.get_session_summary()})

        return self.send_json({'error': 'Not found'}, 404)

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def run():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    server = ThreadingHTTPServer(('0.0.0.0', PORT), ForteTrainingHandler)
    print(f"[FORTE SERVER] Server running on http://0.0.0.0:{PORT}")
    print(f"[FORTE SERVER] Active Session PIN: {STATE.pin}")
    print(f"[FORTE SERVER] Player interface: http://localhost:{PORT}/")
    print(f"[FORTE SERVER] Admin dashboard: http://localhost:{PORT}/admin")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()

if __name__ == '__main__':
    run()
