#!/usr/bin/env python3
"""Generate demo sample images with Gemini image models (Nano Banana).

Usage: python3 -I scripts/gen_assets.py <out_dir> [name ...]
Reads GEMINI_API_KEY from the environment. Skips files that exist.
"""
import base64, json, os, sys, urllib.request, urllib.error, concurrent.futures as cf

KEY = os.environ["GEMINI_API_KEY"]
MODELS = ["gemini-3.1-flash-image", "gemini-2.5-flash-image"]

WIDE = "Photorealistic, 16:9 landscape composition, natural light, high detail, no text, no logos, no watermarks."
PRODUCT = "Studio e-commerce product photo on a clean pure white background, centered, soft shadow, no text, no logos, no watermarks, square composition."

ASSETS = {
    # --- Fashion / snow apparel try-on ---
    "snow-rider": f"Real on-location photo at a ski resort: a snowboarder standing on a sunny snowy ridge holding a plain snowboard, wearing a plain heather-gray snowboard jacket, black snow pants, beanie, full body visible, facing camera, alpine peaks behind. Real alpine snow with fine granular powder texture, boot prints and wind ripples, sun glinting off snow crystals, crisp blue-tinted shadows, true-to-life exposure, shot on a full-frame camera like professional action-sports photography. {WIDE}",
    "street-model": f"A fashion model standing on a city street at golden hour wearing a plain white t-shirt and blue jeans, full body visible, facing camera. {WIDE}",
    "jacket-sunset": f"A snowboard jacket in sunset orange with black shoulder panels and a high collar, hanging flat. {PRODUCT}",
    "jacket-glacier": f"A snowboard jacket in glacier teal with white zipper and color-block chest stripe. {PRODUCT}",
    "jacket-camo": f"A snowboard anorak in white arctic camo pattern with half zip and kangaroo pocket. {PRODUCT}",
    "board-aurora": f"A snowboard with a bold aurora-borealis graphic in green and violet gradients, shown flat top view. {PRODUCT}",
    "board-tiger": f"A snowboard with a stylized orange and black tiger stripe graphic, shown flat top view. {PRODUCT}",
    "trench-coat": f"A camel colored long wool trench coat with belt. {PRODUCT}",
    # --- Real estate interior staging ---
    "room-living-empty": f"Real estate listing photo of an empty, unfurnished modern living room with light oak hardwood floors, white walls, large floor-to-ceiling windows with afternoon sun, wide angle from the doorway. {WIDE}",
    "room-bedroom-empty": f"Real estate listing photo of an empty, unfurnished primary bedroom with carpet, a large window with tree views, soft daylight, wide angle. {WIDE}",
    "room-kitchen-dated": f"Real estate listing photo of a dated 1990s kitchen with oak cabinets, beige tile countertops and an island, daylight, wide angle. {WIDE}",
    # --- Automotive ---
    "car-suv": f"A generic unbranded modern silver mid-size SUV parked on an empty coastal highway pull-out at golden hour, three-quarter front view, ocean cliffs behind, no badges. {WIDE}",
    "car-coupe": f"A generic unbranded sleek dark blue electric sports coupe parked in a minimalist concrete studio, three-quarter front view, no badges. {WIDE}",
    # --- Omni demo storefront (fictional brands) ---
    "resort-powder-peak": f"Real on-location photo of a fictional ski resort base village on a bluebird powder day: timber lodges with snowy roofs, a red gondola rising up the mountain, groomed runs and snowboarders on the slopes, a snowy parking area with a few cars, jagged alpine peaks behind. Real alpine snow with fine powder texture, crisp shadows, true-to-life exposure. {WIDE}",
    "car-pickup": f"A generic unbranded dark green modern pickup truck parked on a gravel mountain road in autumn, three-quarter front view, no badges, no logos. {WIDE}",
    "wetsuit-black": f"A black and charcoal 4/3mm full-length surf wetsuit with a chest zip and teal stitched seams, laid flat. {PRODUCT}",
    "surfboard-retro": f"A 7 ft retro egg surfboard with a cream deck, a seafoam green rail band and a single fin, shown standing upright. {PRODUCT}",
    "stay-swell-bay": f"Real on-location photo of a fictional small surf town called Swell Bay: a crescent sandy beach with clean peeling waves, surfers in the water, colorful surf shacks and a wooden boardwalk, a coastal road on the bluff, golden afternoon light. {WIDE}",
    "home-downtown-loft": f"Real estate listing photo of a lightly staged downtown loft interior: exposed brick wall, tall black steel-framed windows, polished concrete floors, high ceilings with timber beams, an open kitchen with an island, a leather sofa and a rug, soft daylight, wide angle from the entry. {WIDE}",
    "home-loft-kitchen": f"Real estate listing photo of the open kitchen in a converted downtown brick loft: black cabinets, butcher-block island with three stools, open shelving, stainless appliances, exposed brick and timber beams, soft daylight. {WIDE}",
    "home-loft-bedroom": f"Real estate listing photo of the primary bedroom in a converted downtown brick loft: exposed brick wall, tall black steel windows, a platform bed with linen bedding, concrete floor with a wool rug, soft daylight. {WIDE}",
    "home-alpine-chalet": f"Real estate listing photo of the great room of a modern alpine chalet near a ski resort: double-height timber beams, a stone fireplace with a fire, a big sectional sofa, wide floor-to-ceiling windows with soft bright daylight, warm wood floors, wide angle from the entry. {WIDE}",
    "home-chalet-kitchen": f"Real estate listing photo of the open kitchen of a modern alpine chalet: walnut cabinets, a long stone island with stools, timber ceiling, pendant lights, soft daylight. {WIDE}",
    "home-chalet-bedroom": f"Real estate listing photo of the primary bedroom of a modern alpine chalet: timber walls, a king bed with wool throws, a reading chair, a big window with soft bright daylight. {WIDE}",
    # --- Disaster Lab: isometric miniature city dioramas (original city-builder look) ---
    **{f"city-{slug}": f"Isometric miniature diorama of {desc}, seen from a high three-quarter aerial angle like a city-building strategy game, tilt-shift depth of field, tiny cars and people on the streets, crisp daylight, highly detailed. 16:9 landscape composition, no text, no logos, no UI." for slug, desc in {
        "la": "downtown Los Angeles with its skyscrapers, freeway interchanges, palm-lined streets and the Hollywood hills behind",
        "sf": "San Francisco with the Golden Gate Bridge, hilly streets, Victorian houses and the bay",
        "nyc": "Midtown Manhattan with dense skyscrapers, yellow taxis, Central Park edge and the Hudson River",
        "tokyo": "central Tokyo with Tokyo Tower, dense neon-signed blocks, elevated train lines and a river",
        "miami": "Miami Beach with art-deco hotels, a long sandy beach, turquoise ocean and high-rise condos",
        "venice": "Venice, Italy with canals, gondolas, terracotta roofs, bridges and a grand domed basilica",
    }.items()},
}


def generate(name, prompt, out_dir):
    path = os.path.join(out_dir, f"{name}.jpg")
    if os.path.exists(path):
        return f"skip {name}"
    last = ""
    for model in MODELS:
        body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]},
        }).encode()
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            data=body, headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = json.load(r)
            for part in data["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    with open(path, "wb") as f:
                        f.write(base64.b64decode(part["inlineData"]["data"]))
                    return f"ok   {name} ({model}, {part['inlineData'].get('mimeType')})"
            last = f"{model}: no image part"
        except urllib.error.HTTPError as e:
            last = f"{model}: HTTP {e.code} {e.read()[:200]!r}"
        except Exception as e:  # noqa: BLE001
            last = f"{model}: {e}"
    return f"FAIL {name}: {last}"


if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    names = sys.argv[2:] or list(ASSETS)
    with cf.ThreadPoolExecutor(max_workers=5) as ex:
        for res in ex.map(lambda n: generate(n, ASSETS[n], out), names):
            print(res, flush=True)
