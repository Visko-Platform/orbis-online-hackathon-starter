#!/usr/bin/env python3
"""Summarize profiling logs: which operation takes the longest?

Usage:
  (copy PROFILE_DIR/*.jsonl to ./logs/ first)
  python3 -I scripts/profile_report.py logs/server.jsonl logs/client.jsonl [logs/caddy-access.log]
"""
import json, sys, statistics
from collections import defaultdict

def pct(values, p):
    values = sorted(values)
    k = (len(values) - 1) * p / 100
    f = int(k); c = min(f + 1, len(values) - 1)
    return values[f] + (values[c] - values[f]) * (k - f)

rows = defaultdict(list)
fails = defaultdict(int)
for path in sys.argv[1:]:
    try:
        lines = open(path, encoding="utf-8", errors="replace").read().splitlines()
    except FileNotFoundError:
        continue
    for line in lines:
        try:
            e = json.loads(line)
        except ValueError:
            continue
        if "op" in e and "ms" in e:  # app profile events
            key = e["op"]
            if e["op"].startswith("gemini.") and e.get("model"):
                key += f" [{e['model']}]"
            if e["op"] in ("api.prompt", "client.prompt") and e.get("mode"):
                key += f" [{e['mode']}]"
            if e.get("ok") is False:
                fails[key] += 1
                continue
            rows[key].append(float(e["ms"]))
        elif str(e.get("logger", "")).startswith("http.log.access") and "duration" in e:  # caddy access log
            uri = e.get("request", {}).get("uri", "?").split("?")[0]
            if uri.startswith("/api/") or uri in ("/",):
                rows[f"http {e['request'].get('method')} {uri}"].append(e["duration"] * 1000)

if not rows:
    print("no events yet"); sys.exit(0)
print(f"{'operation':58} {'n':>4} {'p50 ms':>9} {'p95 ms':>9} {'max ms':>9} {'total s':>8} {'fail':>4}")
for key, v in sorted(rows.items(), key=lambda kv: -statistics.median(kv[1])):
    print(f"{key[:58]:58} {len(v):>4} {statistics.median(v):>9.0f} {pct(v,95):>9.0f} {max(v):>9.0f} {sum(v)/1000:>8.1f} {fails.get(key,0):>4}")
for key, n in fails.items():
    if key not in rows:
        print(f"{key[:58]:58} {'-':>4} {'':>9} {'':>9} {'':>9} {'':>8} {n:>4}")
