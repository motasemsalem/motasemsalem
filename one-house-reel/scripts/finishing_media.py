# Media for the finishing reel (src/finishing). Photos are Pixabay ids, clips are Mixkit ids; credits in CREDITS.md.
# scripts/prepare-finishing.py downloads them into public/finishing/.

# name -> Pixabay photo id
PHOTOS = {
    "bare-room": 682484,       # empty room with a ladder, before finishing
    "sign-keys": 3701777,      # signing a contract next to house keys
    "luxe-apartment": 6572403, # finished modern apartment, glossy floor
    "plan-tape": 3152429,      # floor plan and tape measure
    "level-hands": 1080599,    # spirit level on a tiled floor
    "render-lounge": 2685521,  # 3D render of a lounge
    "marble": 1006628,         # white marble
    "porcelain": 1478497,      # large porcelain floor
    "wood": 2857073,           # wood planks
    "swatches": 1744624,       # paint colour cards
    "handshake": 4131482,      # handshake in an office
    "wires-wall": 1696757,     # cables in conduits inside a wall
    "wall-hole": 540830,       # broken-through wall
    "chisel-tiles": 2668410,   # chiselling off old tiles
    "electrician": 1080554,    # electrician fitting a socket
    "panel-hands": 4198293,    # hands wiring a distribution board
    "hoses-plan": 7689068,     # plumbing hoses on a plan
    "bath-stripped": 3248474,  # bathroom stripped for renovation
    "ac-lounge": 4148894,      # lounge with split AC and cove lighting
    "cctv": 7267551,           # security cameras on a wall
    "smart-tablet": 3920905,   # smart-home app on a tablet
    "linear-lights": 7300384,  # linear ceiling lights
    "tv-wall": 998265,         # TV wall with gypsum ceiling and spots
    "tiler": 1080596,          # tiler laying a large tile
    "marble-bath": 1737171,    # black marble bathroom
    "herringbone": 7437972,    # herringbone parquet and stairs
    "wood-bedroom": 2929723,   # bedroom with wood wall cladding
    "kitchen": 10508073,       # modern kitchen with island
    "walk-in": 3615613,        # walk-in dressing room
    "double-door": 3117027,    # white double doors
    "big-windows": 10517295,   # lounge with large black window frames
    "shower-dark": 8323836,    # dark tiled shower
    "villa-pool": 4955087,     # villa with pool at dusk
    "villa-dusk": 5102547,     # modern villa facade at dusk
    "cleaning": 2799475,       # gloved hand cleaning a counter
    "keys-house": 4503738,     # house model and keys
}

# name -> (Mixkit clip id, horizontal centre of the 9:16 crop)
CLIPS = {
    "plumbing": (49023, 0.42),  # plumber at a manifold
    "paint": (2296, 0.62),      # painting a wall
    "tablet": (41185, 0.50),    # scrolling interiors on a tablet (already vertical)
}
