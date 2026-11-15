#!/usr/bin/env python3
"""End-to-end test of the directed Omni flow (jacket -> resort -> cars -> SUV journey), as the extension would send it.
Usage: python3 -I scripts/omni_flow_test.py <out_dir> [--render]
Renders the journey hero + shots with --render (Gemini cost only, no Orbis)."""
import os
import base64, json, sys, time, urllib.request, concurrent.futures as cf, uuid

OUT = sys.argv[1]; RENDER = "--render" in sys.argv
B = os.environ.get("BASE_URL", "http://localhost:3000"); A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../public/assets/")
KEY = os.environ.get("SITE_PASSWORD", "")
du = lambda f: "data:image/jpeg;base64," + base64.b64encode(open(A + f, "rb").read()).decode()
USER = du("street-model.jpg")  # stand-in for the shopper's photo

def req(path, data=None, headers=None, raw=False):
    h = {"x-orbis-key": KEY, **(headers or {})}
    r = urllib.request.urlopen(urllib.request.Request(B + path, data=data, headers=h), timeout=180)
    return r.read() if raw else json.load(r)

def plan(body):
    t = time.time(); r = req("/api/omni/plan", json.dumps(body).encode(), {"Content-Type": "application/json"}); return r, time.time() - t

def multipart(fields, files):
    b = uuid.uuid4().hex; out = b""
    for k, v in fields: out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, name, data in files: out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{name}"\r\nContent-Type: image/jpeg\r\n\r\n'.encode() + data + b"\r\n"
    return out + f"--{b}--\r\n".encode(), {"Content-Type": f"multipart/form-data; boundary={b}"}

jacket = {"url": f"{B}/shop/jacket", "title": "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", "siteName": "Summit Supply Co.", "price": "289.95 USD",
          "jsonLdTypes": ["Product", "Brand", "Offer"], "keywords": ["jacket", "snowboard", "powder"], "vertical": "apparel",
          "text": "20K waterproof, 80g insulated snowboard jacket in glacier teal with a white zipper, color-block chest stripe, powder skirt."}
resort = {"url": f"{B}/shop/resort", "title": "Powder Peak Resort | Lift Tickets, Lodging & Snow Report", "siteName": "Powder Peak Resort", "price": None,
          "jsonLdTypes": ["SkiResort", "PostalAddress"], "keywords": ["resort", "lift ticket", "gondola", "snow report", "snowboard"], "vertical": "travel",
          "text": "3,400 vertical feet, a red base-to-summit gondola, 112 runs, terrain parks, timber base village. 18 inches of fresh powder overnight."}
suv = {"url": f"{B}/shop/cars/trailhead-suv", "title": "Northline Trailhead AWD SUV | Northline Motors", "siteName": "Northline Motors", "price": "38990 USD",
       "jsonLdTypes": ["Car", "Brand", "Offer"], "keywords": ["awd", "suv", "snow", "test drive"], "vertical": "auto",
       "text": "Mid-size all-wheel-drive SUV in silver with roof rails, snow drive mode, heated seats, room for four boards."}
H = lambda p, ts: {"url": p["url"], "title": p["title"], "vertical": p["vertical"], "keywords": p["keywords"], "ts": ts}

# Step 1: jacket
r1, t1 = plan({"page": jacket, "images": [{"dataUrl": du("jacket-glacier.jpg")}], "history": [], "historyImages": [], "wardrobe": [], "userPhoto": USER})
print(f"1 JACKET  {t1:4.1f}s {r1['summary']['vertical']:8} {r1['summary']['productName']} | {r1['summary']['trendNotes']}")
wardrobe = [{"dataUrl": du("jacket-glacier.jpg"), "label": r1["summary"]["productName"][:40], "description": r1["view"]["options"][0]["text"]}]
# Step 2: resort
r2, t2 = plan({"page": resort, "images": [{"dataUrl": du("resort-powder-peak.jpg")}], "history": [H(jacket, 1)],
               "historyImages": [{"dataUrl": du("jacket-glacier.jpg"), "title": jacket["title"], "vertical": "apparel"}], "wardrobe": wardrobe, "userPhoto": USER})
print(f"2 RESORT  {t2:4.1f}s {r2['summary']['vertical']:8} {r2['summary']['productName']} | {r2['summary']['trendNotes']}")
# Step 3: cars list (history only) -> SUV detail
hist = [H(suv, 4), {"url": f"{B}/shop/cars", "title": "New SUVs, Trucks & EVs | Northline Motors", "vertical": "auto", "keywords": ["suv", "awd", "4x4"], "ts": 3}, H(resort, 2), H(jacket, 1)]
r3, t3 = plan({"page": suv, "images": [{"dataUrl": du("car-suv.jpg")}], "history": hist[1:],
               "historyImages": [{"dataUrl": du("jacket-glacier.jpg"), "title": jacket["title"], "vertical": "apparel"},
                                 {"dataUrl": du("resort-powder-peak.jpg"), "title": resort["title"], "vertical": "travel"}],
               "wardrobe": wardrobe, "userPhoto": USER})
s3 = r3["summary"]; v3 = r3["view"]
print(f"3 SUV     {t3:4.1f}s {s3['vertical']:8} journey={s3.get('journey')} dest={s3.get('destinationName')!r} wearing={s3['wardrobeUsed']} | {s3['trendNotes']}")
print("  shots:", [s["label"] for s in v3["shots"]]); print("  story:", v3["scenarios"][0]["steps"] if v3.get("scenarios") else None)
print("  chips:", [c["group"] + ":" + c["label"] for c in v3["chips"]])
json.dump(r3, open(f"{OUT}/journey.json", "w"), indent=1)
if RENDER:
    pid = r3["planId"]
    subj = req(v3["subjects"][0]["src"], raw=True)
    opts = [o for o in v3["options"] if o["id"] in (v3.get("defaultOptionIds") or []) and o.get("src")]
    body, hdr = multipart([("demoId", pid), ("optionIds", ",".join(o["id"] for o in opts))],
                          [("subject", "car.jpg", subj)] + [("optionImages", o["id"] + ".jpg", req(o["src"], raw=True)) for o in opts])
    t = time.time(); hero = req("/api/hero", body, hdr, raw=True); open(f"{OUT}/j0-hero.jpg", "wb").write(hero); print(f"  hero {time.time()-t:.1f}s")
    def shot(s):
        body, hdr = multipart([("demoId", pid), ("shotId", s["id"])], [("hero", "hero.jpg", hero)])
        t = time.time(); img = req("/api/shot", body, hdr, raw=True); open(f"{OUT}/j{v3['shots'].index(s)+1}-{s['id']}.jpg", "wb").write(img)
        return f"{s['label']} {time.time()-t:.1f}s"
    with cf.ThreadPoolExecutor(6) as ex: print("  shots:", list(ex.map(shot, v3["shots"])))
