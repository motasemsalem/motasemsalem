# Media for the finishing reel (src/finishing): Pexels videos, picked line by line to match the voiceover.
# scripts/prepare-finishing.py downloads them into public/finishing/ (not committed).

# name -> (Pexels video id, in-point in seconds)
CLIPS = {
    "contract": (8814707, 0.5),         # signing a contract in a folder
    "brief": (7646289, 1.0),            # engineer going over a clipboard with the client
    "level-room": (7817047, 1.0),       # engineer with a spirit level in an empty white room
    "listen": (8293004, 1.0),           # couple choosing with the designer
    "designer": (7504761, 4.0),         # designer modelling furniture on screen
    "render-room": (40398039, 0.0),     # finished modern living room, the "3D" reveal
    "samples": (7490437, 2.0),          # tile samples shown to the client
    "porcelain": (4475615, 1.0),        # ceramic tiles laid out
    "marble": (7830742, 1.0),           # marble surface
    "parquet": (19228170, 2.0),         # foyer with hardwood floor
    "colors": (8835702, 3.0),           # paint colour fan
    "quote": (8725953, 0.5),            # signing papers on a desk
    "luxe-white": (40398038, 0.0),      # luxury white living room
    "conduits": (5930434, 0.5),         # conduits and boxes inside an unfinished wall
    "demolition": (12568633, 1.0),      # breaking out a new doorway
    "drilling": (34572318, 0.5),        # drilling a wall for wiring
    "wires": (5090777, 2.0),            # hands sorting cable
    "pipes": (8853520, 0.5),            # joining water pipes
    "wrench": (8853515, 1.0),           # tightening a pipe joint
    "screed": (24906854, 3.0),          # floor prepared before tiling
    "ac": (39936357, 0.0),              # bedroom with a split AC
    "tv": (37296802, 0.0),              # living room with a TV wall
    "cctv": (34106136, 2.0),            # security camera on a facade
    "smart": (39425769, 1.0),           # smart lamp switched by hand
    "straightedge": (6474171, 1.0),     # long level checking a wall
    "luxe-lights": (40398042, 0.0),     # white living room with pendant lights
    "cove": (37674127, 0.0),            # gypsum ceiling with hidden cove lighting
    "tiling": (24906852, 4.0),          # laying large porcelain tiles
    "marble-floor": (37296795, 0.0),    # black and white marble living room
    "roller": (6474137, 2.0),           # painting with a roller
    "panelled": (40187581, 0.0),        # classic panelled walls
    "wood-clad": (34236998, 0.0),       # wood-clad bedroom
    "kitchen": (40187587, 0.0),         # kitchen with a marble island
    "closet": (15887130, 1.0),          # walk-in dressing room
    "door": (10240699, 2.0),            # white panel door
    "slider": (8045174, 2.0),           # sliding glass door to the terrace
    "bath": (40397795, 0.0),            # marble shower with brushed fittings
    "lights": (34317035, 1.0),          # crystal pendant lights
    "villa": (39576501, 0.0),           # modern villa facade by the pool
    "landscape": (34812171, 4.0),       # villa and garden from above
    "skim": (6474181, 1.0),             # skimming a wall, behind the phone
    "cleaning": (6195527, 1.0),         # cleaning the finished kitchen
    "move-in": (7579428, 1.0),          # couple opening the door of their new home
}

