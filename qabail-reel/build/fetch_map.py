"""Download Sentinel-2 cloudless 2016 tiles (EOX, CC BY 4.0) and stitch mosaics."""
import math, os, sys, time, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HERE, "..", "assets", "map")
URL = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"
MOSAICS = {  # name: (zoom, lon_min, lat_min, lon_max, lat_max)
    "egypt_z8": (8, 24.0, 21.0, 37.5, 33.0),
    "mid_z7": (7, 17.0, 12.0, 46.0, 38.0),
    "region_z6": (6, -10.0, 10.0, 52.0, 40.0),
    "world_z5": (5, -25.0, -20.0, 65.0, 62.0),
}


def tile_xy(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def build(name, z, lon0, lat0, lon1, lat1):
    x0, y0 = tile_xy(lon0, lat1, z)
    x1, y1 = tile_xy(lon1, lat0, z)
    tx0, ty0, tx1, ty1 = int(x0), int(y0), int(x1), int(y1)
    img = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    cache = os.path.join(MAP, "tiles")
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            p = os.path.join(cache, f"{z}_{ty}_{tx}.jpg")
            if not os.path.exists(p):
                for attempt in range(4):
                    try:
                        req = urllib.request.Request(URL.format(z=z, y=ty, x=tx), headers={"User-Agent": "QabailReel/1.0"})
                        open(p, "wb").write(urllib.request.urlopen(req, timeout=60).read())
                        break
                    except Exception:
                        time.sleep(2 + attempt * 3)
                time.sleep(0.05)
            img.paste(Image.open(p).convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
    img.save(os.path.join(MAP, f"{name}.jpg"), quality=90)
    # origin in global tile-pixel coordinates, so lon/lat can be projected later
    with open(os.path.join(MAP, f"{name}.txt"), "w") as f:
        f.write(f"{z} {tx0 * 256} {ty0 * 256}\n")
    print(name, img.size)


if __name__ == "__main__":
    for name in sys.argv[1:] or MOSAICS:
        build(name, *MOSAICS[name])
