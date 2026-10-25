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
    # slab-pour reel (src/slab)
    "slab-pump": (33407985, 1.0),         # concrete pump boom over a rebar slab
    "slab-mesh-wide": (34587145, 0.5),    # rebar slab framework, wide
    "slab-formwork": (34199757, 6.0),     # slab formwork and starter bars, wide
    "slab-level": (8482308, 6.0),         # spirit level bubble, close-up
    "slab-tying": (34528813, 0.0),        # worker tying a rebar cage
    "slab-grid": (39924250, 0.5),         # rebar grid on the slab, close-up
    "slab-ruler": (8853467, 2.0),         # measuring with a ruler, close-up
    "slab-stirrups": (39924255, 0.5),     # column stirrups, close-up
    "slab-beam": (34701532, 2.0),         # beam cage on spacers, concrete going in
    "slab-plans": (35168473, 1.0),        # engineers checking the drawings on site
    "slab-pour": (34587229, 2.0),         # pouring the slab from the pump
    "slab-mixer": (26288499, 1.0),        # concrete from the mixer
    "slab-curing": (39432610, 1.0),       # spraying water on fresh concrete
    "slab-aerial": (35631527, 0.5),       # aerial: big slab, crane
    "slab-building": (36515303, 0.0),     # finished concrete frame against the sky
    # structure and finishing reels (src/reels)
    "str-excavator": (34521511, 1.0),     # excavator digging the pit
    "str-dig-aerial": (36052050, 0.5),    # excavation from above
    "str-footings": (34199756, 1.0),      # rows of footings being formed
    "str-footings2": (34199758, 1.0),     # footings and starter bars, wide
    "str-site-aerial": (34199773, 0.5),   # foundation site from above
    "str-crack": (7830152, 0.5),          # crack in a concrete wall
    "str-rust": (7829485, 0.5),           # rusted steel, close-up
    "str-cutting": (39909407, 1.0),       # cutting steel bars
    "str-coating": (6473942, 1.0),        # rolling a coating onto concrete
    "str-pump2": (34587146, 2.0),         # pouring from the pump over rebar
    "str-night-mix": (35379337, 2.0),     # concrete mixer at night
    "str-form-worker": (34664557, 1.0),   # worker setting formwork
    "str-breaking": (37994475, 1.0),      # breaking into a finished wall
    # Every clip below belongs to one reel only (scripts/check-media.py checks it). A third value cuts a
    # landscape clip to portrait around that fraction of its width.
    # reel: rebar-check
    "rc-slab": (32244802, 1.0, 0.45),     # worker checking rebar on the slab
    "rc-mesh": (34831845, 1.0, 0.5),      # workers on a wide rebar mat
    "rc-cut": (9084346, 1.0, 0.45),       # cutting bars, sparks
    "rc-bars": (16106453, 1.0, 0.4),      # bars stacked by size
    "rc-cage": (10294764, 1.0, 0.3),      # two men inside a column cage
    "rc-beam": (39924273, 0.5, 0.5),      # beam cage, close-up
    "rc-rust": (39924242, 0.5, 0.5),      # rusty bars, close-up
    "rc-tie": (39933087, 0.5, 0.6),       # tying an overlap with pliers
    "rc-eng": (8487108, 1.0),             # engineer in a yellow helmet
    "rc-pour": (39924258, 0.5, 0.4),      # concrete going onto the rebar
    "rc-aerial": (35631525, 0.5),         # slab and crane from above
    "rc-end": (31018605, 0.5),            # building site from above
    # reel: slab-mistakes
    "sm-hook": (33388930, 0.5),           # slab under way, from above
    "sm-joint": (39924271, 0.5, 0.5),     # edge of a pour beside open rebar
    "sm-truck": (34587143, 1.0),          # mixer truck on site
    "sm-props": (36601732, 1.0),          # worker among the slab props
    "sm-pump": (35039427, 0.5),           # pump pouring, from above
    "sm-pour": (39924276, 0.5, 0.5),      # fresh concrete going in
    "sm-spray": (2887457, 1.0, 0.5),      # spraying a slab
    "sm-trucks": (35039422, 0.5),         # mixer trucks from above
    "sm-end": (30911707, 0.5),            # tower going up, from above
    # reel: foundation
    "fd-soil": (37786216, 1.0),           # digging into the soil
    "fd-spacer": (11478662, 0.5, 0.5),    # spacer block under the rebar
    "fd-house": (20743390, 0.5),          # house frame from above
    "fd-end": (34199774, 0.5),            # excavator from above
    # reel: finishing-order
    "fo-room": (36516358, 0.0),           # finished minimalist living room
    "fo-wires": (5090783, 1.0),           # electrical work
    "fo-drain": (8293298, 1.0),           # checking the drainage
    "fo-insul": (37538325, 1.0),          # applying a waterproof coat
    "fo-skim": (6474186, 1.0),            # skimming a wall
    "fo-ceiling": (6473925, 1.0),         # working on the ceiling
    "fo-floor": (40187011, 0.0),          # stone-tiled bathroom
    "fo-paint": (7216718, 1.0),           # painting at home
    "fo-tour": (8482300, 1.0),            # showing the work to the clients
    "fo-luxe": (36030664, 0.0),           # living room, finished
    "fo-end": (34231477, 0.0),            # dark kitchen and dining
    # reel: choose-company
    "cc-plans": (10375455, 1.0),          # client over the floor plans
    "cc-couple": (7646760, 1.0),          # couple with the floor plan
    "cc-engineer": (7817164, 1.0),        # engineer holding the drawings
    "cc-quote": (7841623, 1.0, 0.5),      # going through a contract line by line
    "cc-3d": (40397833, 0.0),             # finished staircase, like a 3D render
    "cc-sign": (8471105, 1.0, 0.4),       # signing
    "cc-site": (6473961, 1.0),            # engineer on site with the plan
    "cc-think": (7491315, 1.0),           # client thinking it over
    "cc-luxe": (38413518, 0.0),           # bright living room
    "cc-end": (7646456, 1.0),             # family in their new home
}
