#!/usr/bin/env bash
# Replays the UI's Gemini-side flows against the live site to generate profiling data (no Orbis cost).
# Usage: scripts/profile_run.sh [base_url]
set -uo pipefail
BASE=${1:-${BASE_URL:-http://localhost:3000}}
A="$(cd "$(dirname "${BASH_SOURCE[0]}")/../public/assets" && pwd)"
OUT=$(mktemp -d)
ms() { date +%s%3N; }
# timed LABEL cmd...  -> prints "<ms> LABEL <http-status>"
timed() { local label=$1; shift; local s=$(ms); local code; code=$("$@"); echo "$(( $(ms)-s ))ms  $label  http=$code"; }
KEY="${SITE_PASSWORD:-}"
post() { curl -s -H "x-orbis-key: $KEY" -o "$1" -w '%{http_code}' "${@:2}"; }

run_demo() { # demo subject optionId optionImage("" if none) shot...
  local d=$1 subj=$2 opt=$3 optimg=$4; shift 4
  local extra=(); [ -n "$optimg" ] && extra=(-F "optionImages=@$A/$optimg;type=image/jpeg")
  timed "$d hero (2K)" post "$OUT/$d-hero.jpg" -F demoId=$d -F "subject=@$A/$subj;type=image/jpeg" -F optionIds=$opt "${extra[@]}" "$BASE/api/hero"
  local s=$(ms)
  for sh in "$@"; do post "$OUT/$d-$sh.jpg" -F demoId=$d -F "hero=@$OUT/$d-hero.jpg;type=image/jpeg" -F shotId=$sh "$BASE/api/shot" >/dev/null & done; wait
  echo "$(( $(ms)-s ))ms  $d shot list x$# parallel (wall clock)"
  timed "$d prompt opening" post /dev/null -F demoId=$d -F mode=opening -F "image=@$OUT/$d-hero.jpg;type=image/jpeg" "$BASE/api/prompt"
  timed "$d prompt change" post /dev/null -F demoId=$d -F mode=change -F "request=make the light warmer, like late afternoon" -F "scene=opening scene" "$BASE/api/prompt"
  timed "$d prompt shot(morph)" post /dev/null -F demoId=$d -F mode=shot -F "image=@$OUT/$d-$1.jpg;type=image/jpeg" -F "scene=opening scene" "$BASE/api/prompt"
}
run_demo tryon snow-rider.jpg jacket-sunset jacket-sunset.jpg action-carve air detail lodge storm > "$OUT/log-tryon" &
run_demo staging room-living-empty.jpg scandi "" doorway center lookback layout-b layout-c > "$OUT/log-staging" &
wait
run_demo drive car-suv.jpg coast "" aerial rear wheel night snow > "$OUT/log-drive" &
run_demo disaster city-la.jpg diorama "" quake flood fire tsunami blast depot blackout > "$OUT/log-disaster" &
wait
cat "$OUT"/log-*
timed "tryon prompt swap" post /dev/null -F demoId=tryon -F mode=swap -F optionId=jacket-glacier -F "image=@$A/jacket-glacier.jpg;type=image/jpeg" -F "scene=opening scene" "$BASE/api/prompt"
echo "images produced: $(find "$OUT" -name '*.jpg' -size +10k | wc -l) (expect 26)"
rm -rf "$OUT"
