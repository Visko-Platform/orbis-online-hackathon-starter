#!/usr/bin/env python3
"""Replay a directed Lifecast story against the live site, exactly as the extension + web app would.
Usage: python3 -I scripts/story_test.py <story: powder|surf|city> <out_dir> [--render]
--render: render the final plan's hero + shots and write <out_dir>/<story>-sheet.jpg (needs Pillow)."""
import os
import base64, json, sys, time, urllib.request, concurrent.futures as cf, uuid

STORY, OUT = sys.argv[1], sys.argv[2]; RENDER = "--render" in sys.argv
B = os.environ.get("BASE_URL", "http://localhost:3000"); A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../public/assets/")
KEY = os.environ.get("SITE_PASSWORD", "")
du = lambda f: "data:image/jpeg;base64," + base64.b64encode(open(A + f, "rb").read()).decode()
USER = du("street-model.jpg")  # stand-in shopper photo

def P(path, title, vertical, img, types, kw, price=None, text=""):
    return {"page": {"url": B + path, "title": title, "siteName": title.split(" | ")[-1], "price": price, "jsonLdTypes": types,
                     "keywords": kw, "vertical": vertical, "text": text}, "img": img}
SUV = P("/shop/cars/trailhead-suv", "Northline Trailhead AWD SUV | Northline Motors", "auto", "car-suv.jpg", ["Car", "Offer"], ["awd", "suv", "snow"], "38990 USD", "AWD SUV with roof rails and snow mode.")
PICKUP = P("/shop/cars/ridge-pickup", "Northline Ridge 4x4 Pickup | Northline Motors", "auto", "car-pickup.jpg", ["Car", "Offer"], ["4x4", "truck", "pickup"], "44500 USD", "Dark green 4x4 pickup with a 6 ft bed and skid plates.")
COUPE = P("/shop/cars/volt-gt", "Northline Volt GT Coupe | Northline Motors", "auto", "car-coupe.jpg", ["Car", "Offer"], ["ev"], "52990 USD", "Dark blue dual-motor electric sports coupe with a glass roof.")
CARS = P("/shop/cars", "New SUVs, Trucks & EVs | Northline Motors", "auto", "car-suv.jpg", ["ItemList"], ["suv", "awd", "4x4", "truck"])
STORIES = {
  "powder": [(P("/shop/p/glacier-jacket", "Glacier Teal Insulated Snowboard Jacket | Summit Supply Co.", "apparel", "jacket-glacier.jpg", ["Product", "Offer"], ["jacket", "snowboard", "powder"], "289.95 USD"), True),
             (P("/shop/stay/powder-peak", "Powder Peak Resort | Powder Peak Resort", "travel", "resort-powder-peak.jpg", ["SkiResort"], ["resort", "gondola", "lift ticket"], None, "Red gondola, timber base village, 18 in fresh powder."), False),
             (CARS, False), (SUV, True)],
  "surf":   [(P("/shop/p/tidal-wetsuit", "Tidal 4/3mm Chest-Zip Wetsuit | Saltline Surf Co.", "apparel", "wetsuit-black.jpg", ["Product", "Offer"], ["wetsuit", "surf"], "349.00 USD"), True),
             (P("/shop/p/seafoam-egg", "Seafoam Retro Egg Surfboard 7'0\" | Saltline Surf Co.", "apparel", "surfboard-retro.jpg", ["Product", "Offer"], ["surfboard", "surf"], "689.00 USD"), True),
             (P("/shop/stay/swell-bay", "Swell Bay Surf Town | Swell Bay", "travel", "stay-swell-bay.jpg", ["TouristDestination"], ["surf", "beach", "surf report"], None, "Crescent beach, clean peeling waves, surf shacks, boardwalk; 4-5 ft offshore."), False),
             (CARS, False), (PICKUP, True)],
  "city":   [(P("/shop/p/camel-trench", "Camel Wool Belted Trench Coat | Fold & Field", "apparel", "trench-coat.jpg", ["Product", "Offer"], ["coat", "trench", "city"], "420.00 USD"), True),
             (P("/shop/homes/downtown-loft", "Downtown Brick Loft · 2 bd · 2 ba · 1,480 sqft | Harbor & Main Realty", "real_estate", "home-downtown-loft.jpg", ["RealEstateListing", "Apartment"], ["for sale", "sqft", "hoa"], "895000 USD", "Exposed brick, steel windows, concrete floors, garage with EV charger."), True),
             (CARS, False), (COUPE, True)],
}

def req(path, data=None, headers=None, raw=False):
    r = urllib.request.urlopen(urllib.request.Request(B + path, data=data, headers={"x-orbis-key": KEY, **(headers or {})}), timeout=180)
    return r.read() if raw else json.load(r)

def multipart(fields, files):
    b = uuid.uuid4().hex; out = b""
    for k, v in fields: out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, n, d in files: out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{n}"\r\nContent-Type: image/jpeg\r\n\r\n'.encode() + d + b"\r\n"
    return out + f"--{b}--\r\n".encode(), {"Content-Type": f"multipart/form-data; boundary={b}"}

history, wardrobe, last = [], [], None
for i, (step, tried) in enumerate(STORIES[STORY]):
    page = step["page"]
    if tried:
        newest = lambda v, n: [h for h in history if h["vertical"] == v and h["url"] != page["url"]][:n]
        hist_imgs = [{"dataUrl": du(h["_img"]), "title": h["title"], "url": h["url"], "vertical": h["vertical"]}
                     for h in newest("apparel", 2) + newest("travel", 1) + newest("real_estate", 1)]
        t = time.time()
        r = req("/api/omni/plan", json.dumps({"page": page, "images": [{"dataUrl": du(step["img"])}],
                 "history": [{k: v for k, v in h.items() if not k.startswith("_")} for h in history], "historyImages": hist_imgs,
                 "wardrobe": wardrobe, "userPhoto": USER}).encode(), {"Content-Type": "application/json"})
        s = r["summary"]; last = r
        print(f"{i+1}. {page['title'][:44]:44} {time.time()-t:4.1f}s → {s['vertical']:11} journey={s.get('journey')} dest={s.get('destinationName')!r} wearing={s['wardrobeUsed']}")
        for n in s["trendNotes"]: print(f"     ✨ {n}")
        if s["vertical"] == "apparel":
            wardrobe = [{"dataUrl": du(step["img"]), "label": s["productName"][:40], "description": r["view"]["options"][0]["text"]}] + wardrobe[:3]
    else:
        print(f"{i+1}. {page['title'][:44]:44} (browsed)")
    history.insert(0, {"url": page["url"], "title": page["title"], "vertical": page["vertical"], "keywords": page["keywords"], "price": page["price"], "ts": i, "_img": step["img"]})

v, s = last["view"], last["summary"]
print("   shots:", [x["label"] for x in v["shots"]])
print("   story:", (v.get("scenarios") or [{}])[0].get("steps"))
print("   chips:", [c["group"][:5] + ":" + c["label"] for c in v["chips"]])
print("   inventory:", [(x["name"][:28], x["kind"], x.get("price")) for x in s.get("inventory", [])])
json.dump(last, open(f"{OUT}/{STORY}.json", "w"), indent=1)
if RENDER:
    pid = last["planId"]
    subj = req(v["subjects"][0]["src"], raw=True) if v["subjects"] else open(A + "street-model.jpg", "rb").read()
    opts = [o for o in v["options"] if o["id"] in (v.get("defaultOptionIds") or []) and o.get("src")]
    body, hdr = multipart([("demoId", pid), ("optionIds", ",".join(o["id"] for o in opts))],
                          [("subject", "s.jpg", subj)] + [("optionImages", o["id"] + ".jpg", req(o["src"], raw=True)) for o in opts])
    t = time.time(); hero = req("/api/hero", body, hdr, raw=True); print(f"   hero {time.time()-t:.1f}s")
    frames = [("hero", hero)]
    def shot(x):
        body, hdr = multipart([("demoId", pid), ("shotId", x["id"])], [("hero", "h.jpg", hero)])
        t = time.time(); return x["label"], req("/api/shot", body, hdr, raw=True), time.time() - t
    with cf.ThreadPoolExecutor(6) as ex:
        res = list(ex.map(shot, v["shots"]))
    print("   shots:", [f"{l} {t:.0f}s" for l, _, t in res]); frames += [(l, d) for l, d, _ in res]
    from io import BytesIO
    from PIL import Image, ImageDraw
    W, H = 640, 360; cols = 3; rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (W + 10) + 10, rows * (H + 34) + 10), (18, 18, 18)); d = ImageDraw.Draw(sheet)
    for k, (label, data) in enumerate(frames):
        x, y = 10 + (k % cols) * (W + 10), 10 + (k // cols) * (H + 34)
        sheet.paste(Image.open(BytesIO(data)).convert("RGB").resize((W, H)), (x, y + 24)); d.text((x, y + 6), label, fill=(255, 200, 160))
    sheet.save(f"{OUT}/{STORY}-sheet.jpg", quality=82); print(f"   sheet: {OUT}/{STORY}-sheet.jpg")
