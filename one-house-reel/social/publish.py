# Publishes the One House feed (social/posts.py) to the Facebook page and Instagram on its calendar
# (social/calendar.json), and reads comments and numbers back.
#
#   python3 social/publish.py plan --start 2026-10-27      date the posts not on the calendar yet (two a day, 14:00 and 21:00)
#   python3 social/publish.py respace --start 2026-10-26   move every post not yet out onto the two-a-day slots
#   python3 social/publish.py run            publish what is due, and hand Facebook its posts for the next 4 weeks
#   python3 social/publish.py now <post id>  publish one post right away, on both
#   python3 social/publish.py cancel <post id>   take a post off the calendar (and Facebook's queue)
#   python3 social/publish.py sync           forget Facebook ids that left the page's queue (then `run` re-queues them)
#   python3 social/publish.py status         the calendar, and where each post stands
#   python3 social/publish.py inbox          comments from the last 7 days that the page hasn't answered
#   python3 social/publish.py reply <comment id> <text> [--ig]   public reply under a comment
#   python3 social/publish.py dm <comment id> <text> [--ig]      private reply: a message to the commenter's inbox
#   python3 social/publish.py messages       Messenger / Instagram chats where the customer wrote last
#   python3 social/publish.py send <to> <text> [--ig]            reply in one of those chats
#   python3 social/publish.py report         page numbers for the last 7 and 28 days, and each recent post
#
# Needs META_PAGE_TOKEN in the environment (a user token with the page permissions, or the page's own token).
# Never write a token into this repo. Times are Cairo time. Run from one-house-reel/.
import json, os, subprocess, sys, time
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(__file__))
from posts import POSTS

PAGE_ID = "111210318028466"
IG_ID = "17841456046087917"
API = "https://graph.facebook.com/v21.0"
CAIRO = ZoneInfo("Africa/Cairo")
CALENDAR = os.path.join(os.path.dirname(__file__), "calendar.json")
# Facebook holds scheduled posts itself, so they go out even if no session runs; Instagram is posted when due.
FB_AHEAD = timedelta(days=28)
BY_ID = {p["id"]: p for p in POSTS}


def graph(method, path, token=None, files=None, headers=None, data=None, **params):
    """Calls the Graph API with curl and returns the JSON, raising on an error."""
    cmd = ["curl", "-sS", "-X", method, "--retry", "3", path if path.startswith("http") else f"{API}/{path}"]
    if token:
        params["access_token"] = token
    if method == "GET":
        cmd[-1] += "?" + "&".join(f"{k}={v}" for k, v in params.items())
    else:
        for k, v in params.items():
            cmd += ["--form-string", f"{k}={v}"]
    for k, v in (files or {}).items():
        cmd += ["-F", f"{k}=@{v}"]
    for k, v in (headers or {}).items():
        cmd += ["-H", f"{k}: {v}"]
    if data:
        cmd += ["--data-binary", f"@{data}"]
    out = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout or "{}")
    if "error" in out:
        raise RuntimeError(f"{path}: {out['error'].get('message')}")
    return out


_token = None


def page_token():
    global _token
    if _token:
        return _token
    t = os.environ.get("META_PAGE_TOKEN")
    if not t:
        raise SystemExit("META_PAGE_TOKEN is not set: add it in the environment's settings.")
    try:
        _token = graph("GET", PAGE_ID, t, fields="access_token")["access_token"]
    except (RuntimeError, KeyError):
        _token = t  # already the page's own token
    return _token


def load():
    return json.load(open(CALENDAR)) if os.path.exists(CALENDAR) else []


def save(cal):
    json.dump(cal, open(CALENDAR, "w"), ensure_ascii=False, indent=1)


def when(item):
    # Stored times are Cairo wall-clock times; re-attach the zone so the offset follows daylight saving.
    return datetime.fromisoformat(item["at"]).replace(tzinfo=None).replace(tzinfo=CAIRO)


# --- Facebook ---------------------------------------------------------------------------------------------


def fb_photo(post, at=None):
    extra = {"published": "false", "scheduled_publish_time": int(at.timestamp())} if at else {}
    r = graph("POST", f"{PAGE_ID}/photos", page_token(), files={"source": post["file"]}, message=post["caption"], **extra)
    return r.get("post_id") or r["id"]


def fb_reel(post, at=None):
    t = page_token()
    vid = graph("POST", f"{PAGE_ID}/video_reels", t, upload_phase="start")["video_id"]
    size = os.path.getsize(post["file"])
    graph("POST", f"https://rupload.facebook.com/video-upload/v21.0/{vid}", headers={"Authorization": f"OAuth {t}", "offset": "0", "file_size": str(size)}, data=post["file"])
    state = {"video_state": "SCHEDULED", "scheduled_publish_time": int(at.timestamp())} if at else {"video_state": "PUBLISHED"}
    graph("POST", f"{PAGE_ID}/video_reels", t, upload_phase="finish", video_id=vid, description=post["caption"], **state)
    return vid


# --- Instagram --------------------------------------------------------------------------------------------


def ig_wait(container):
    for _ in range(60):
        s = graph("GET", container, page_token(), fields="status_code,status")
        if s["status_code"] == "FINISHED":
            return
        if s["status_code"] in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"Instagram rejected the media: {s.get('status')}")
        time.sleep(10)
    raise RuntimeError("Instagram is still processing the media after 10 minutes")


def ig_photo(post):
    # Instagram fetches images from a public URL: park the image on the page as an unpublished photo,
    # hand Instagram its CDN link, and remove it once Instagram has its copy.
    t = page_token()
    tmp = graph("POST", f"{PAGE_ID}/photos", t, files={"source": post["file"]}, published="false")["id"]
    try:
        url = graph("GET", tmp, t, fields="images")["images"][0]["source"]
        c = graph("POST", f"{IG_ID}/media", t, image_url=url, caption=post["caption"])["id"]
        ig_wait(c)
        return graph("POST", f"{IG_ID}/media_publish", t, creation_id=c)["id"]
    finally:
        graph("DELETE", tmp, t)


def ig_file(path):
    """A lighter copy of a reel for Instagram (its upload processing stalls on big files): H.264 at about 6 Mbit/s."""
    if os.path.getsize(path) < 20_000_000:
        return path
    out = os.path.join("/tmp", "ig-" + os.path.basename(path))
    if not os.path.exists(out):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-maxrate", "6M", "-bufsize", "12M",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out], check=True)
    return out


def ig_reel(post, container=None):
    """Uploads and publishes a reel. Returns the media id, or ("processing", container) if Instagram is still on it:
    the next run picks it up from there instead of uploading again."""
    t = page_token()
    if not container:
        f = ig_file(post["file"])
        container = graph("POST", f"{IG_ID}/media", t, media_type="REELS", upload_type="resumable", caption=post["caption"], share_to_feed="true")["id"]
        graph("POST", f"https://rupload.facebook.com/ig-api-upload/v21.0/{container}", headers={"Authorization": f"OAuth {t}", "offset": "0", "file_size": str(os.path.getsize(f))}, data=f)
    try:
        ig_wait(container)
    except RuntimeError as e:
        if "still processing" in str(e):
            return ("processing", container)
        raise
    return graph("POST", f"{IG_ID}/media_publish", t, creation_id=container)["id"]


# --- Commands ---------------------------------------------------------------------------------------------


# Two posts a day: lunch break and the evening peak (Cairo). Reels always take the evening slot.
SLOTS = (14, 21)


def slots(start):
    day = datetime.fromisoformat(start).replace(tzinfo=None).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=CAIRO)
    while True:
        for h in SLOTS:
            yield day.replace(hour=h)
        day += timedelta(days=1)


def fill(items, start):
    """Gives `items` (in order) consecutive slots from `start`, moving a reel to the next evening slot."""
    queue = list(items)
    first = datetime.fromisoformat(start)
    first = first if first.tzinfo else first.replace(tzinfo=CAIRO)
    for slot in slots(start):
        if not queue:
            return
        if slot < first:
            continue
        pick = next((x for x in queue if slot.hour == SLOTS[-1] or not BY_ID[x["id"]].get("video")), queue[0])
        queue.remove(pick)
        pick["at"] = slot.isoformat()


def plan(start):
    """Dates the posts in posts.py that aren't on the calendar yet, after the last one already there."""
    cal = load()
    have = {i["id"] for i in cal}
    new = [{"id": p["id"], "facebook": None, "instagram": None} for p in POSTS if p["id"] not in have]
    if cal:
        last = max(when(i) for i in cal) + timedelta(hours=1)
        start = max(datetime.fromisoformat(start).replace(tzinfo=None).replace(tzinfo=CAIRO), last).isoformat()
    fill(new, start)
    cal += new
    save(cal)
    status()


def respace(start):
    """Re-dates every post that hasn't gone out yet onto the two-a-day slots from `start`, moving Facebook's copies."""
    cal = load()
    now = datetime.now(CAIRO)
    pending = sorted((i for i in cal if not (i["facebook"] or {}).get("state") == "published" and not i["instagram"]), key=when)
    fill(pending, start)
    pending = [i for i in pending if when(i) > now]
    t = page_token()
    for item in pending:
        fb = item["facebook"]
        if fb and fb["state"] == "scheduled":
            # Facebook won't move a scheduled photo post, so it is dropped and `run` schedules it again.
            # A reel can be moved in place.
            try:
                if not BY_ID[item["id"]].get("video"):
                    raise RuntimeError("photo posts can't be rescheduled")
                graph("POST", fb["id"], t, scheduled_publish_time=int(when(item).timestamp()))
            except RuntimeError:
                graph("DELETE", fb["id"], t)
                item["facebook"] = None
        save(cal)
    status()


_live = None


def key(text):
    return " ".join((text or "").split())[:80]


def live():
    """What is already on the page and the account, by caption: {"facebook": {key: (id, state)}, "instagram": {key: id}}.
    The calendar can miss a post (a run that published but couldn't save), so nothing goes out twice."""
    global _live
    if _live is None:
        t = page_token()
        fb, ig = {}, {}
        for x in graph("GET", f"{PAGE_ID}/published_posts", t, fields="id,message", limit=50).get("data", []):
            fb[key(x.get("message"))] = (x["id"], "published")
        after = ""
        while True:
            r = graph("GET", f"{PAGE_ID}/scheduled_posts", t, fields="id,message", limit=100, **({"after": after} if after else {}))
            for x in r.get("data", []):
                fb.setdefault(key(x.get("message")), (x["id"], "scheduled"))
            after = r.get("paging", {}).get("cursors", {}).get("after") if r.get("paging", {}).get("next") else ""
            if not after:
                break
        for x in graph("GET", f"{PAGE_ID}/video_reels", t, fields="id,description,status", limit=50).get("data", []):
            st = x.get("status", {}).get("publishing_phase", {}).get("publish_status")
            if st in ("published", "scheduled"):
                fb.setdefault(key(x.get("description")), (x["id"], st))
        for x in graph("GET", f"{IG_ID}/media", t, fields="id,caption", limit=50).get("data", []):
            ig[key(x.get("caption"))] = x["id"]
        _live = {"facebook": fb, "instagram": ig}
    return _live


def publish(item, now):
    post = BY_ID[item["id"]]
    at = when(item)
    if not item["facebook"] and key(post["caption"]) in live()["facebook"]:
        pid, state = live()["facebook"][key(post["caption"])]
        item["facebook"] = {"id": pid, "state": state}
        print("facebook already has", item["id"], flush=True)
    if not item["instagram"] and key(post["caption"]) in live()["instagram"]:
        item["instagram"] = {"id": live()["instagram"][key(post["caption"])], "state": "published"}
        print("instagram already has", item["id"], flush=True)
    if not item["facebook"]:
        if at <= now + timedelta(minutes=15):
            pid = (fb_reel if post.get("video") else fb_photo)(post)
            item["facebook"] = {"id": pid, "state": "published"}
        elif at <= now + FB_AHEAD:
            pid = (fb_reel if post.get("video") else fb_photo)(post, at)
            item["facebook"] = {"id": pid, "state": "scheduled"}
        if item["facebook"]:
            print("facebook", item["facebook"]["state"], item["id"], flush=True)
    elif item["facebook"]["state"] == "scheduled" and at <= now:
        item["facebook"]["state"] = "published"
    # A link goes in the first comment, not the caption, so the post keeps its reach.
    if post.get("comment") and item["facebook"] and item["facebook"]["state"] == "published" and not item.get("commented"):
        graph("POST", f"{item['facebook']['id']}/comments", page_token(), message=post["comment"])
        item["commented"] = True
    ig = item["instagram"]
    if (not ig or ig.get("state") == "processing") and at <= now + timedelta(minutes=15):
        if post.get("video"):
            mid = ig_reel(post, ig.get("container") if ig else None)
        else:
            mid = ig_photo(post)
        if isinstance(mid, tuple):
            item["instagram"] = {"container": mid[1], "state": "processing"}
            print("instagram still processing", item["id"], flush=True)
        else:
            item["instagram"] = {"id": mid, "state": "published"}
            print("instagram published", item["id"], flush=True)


def run():
    cal = load()
    now = datetime.now(CAIRO)
    failed = []
    for item in sorted(cal, key=when):
        try:
            publish(item, now)
        except RuntimeError as e:
            failed.append(f"{item['id']}: {e}")
        save(cal)  # keep what went out even if a later post fails
    for f in failed:
        print("FAILED", f)
    sys.exit(1 if failed else 0)


def now_(pid):
    cal = load()
    item = next((i for i in cal if i["id"] == pid), None)
    if not item:
        item = {"id": pid, "facebook": None, "instagram": None}
        cal.append(item)
    if BY_ID.get(pid) is None:
        raise SystemExit(f"No post {pid} in social/posts.py")
    now = datetime.now(CAIRO).replace(microsecond=0)
    item["at"] = now.isoformat()
    publish(item, now)
    save(cal)


def cancel(pid):
    """Takes a post off the calendar, and out of Facebook's scheduled queue if it is waiting there."""
    cal = load()
    item = next((i for i in cal if i["id"] == pid), None)
    if not item:
        raise SystemExit(f"{pid} is not on the calendar")
    for side in ("facebook", "instagram"):
        if item[side] and item[side]["state"] == "published":
            raise SystemExit(f"{pid} is already live on {side}; delete it there by hand if you mean to")
    if item["facebook"]:
        graph("DELETE", item["facebook"]["id"], page_token())
    cal.remove(item)
    save(cal)
    print("cancelled", pid)


def sync():
    """Drops Facebook ids that no longer exist in the page's queue, so `run` schedules those posts again."""
    t = page_token()
    queued = set()
    after = ""
    while True:
        r = graph("GET", f"{PAGE_ID}/scheduled_posts", t, fields="id", limit=100, **({"after": after} if after else {}))
        queued |= {p["id"] for p in r.get("data", [])}
        after = r.get("paging", {}).get("cursors", {}).get("after") if r.get("paging", {}).get("next") else ""
        if not after:
            break
    cal = load()
    now = datetime.now(CAIRO)
    for item in cal:
        fb = item.get("facebook")
        if not fb or fb["state"] != "scheduled":
            continue
        if when(item) <= now:
            # Its time has come, so it left the queue by going out: it is live, not lost.
            fb["state"] = "published"
            continue
        if BY_ID[item["id"]].get("video"):
            try:
                ok = graph("GET", fb["id"], t, fields="status")["status"]["publishing_phase"].get("publish_status") == "scheduled"
            except RuntimeError:
                ok = False
        else:
            ok = fb["id"] in queued or fb["id"].split("_")[-1] in {q.split("_")[-1] for q in queued}
        if not ok:
            print("not in Facebook's queue any more:", item["id"])
            item["facebook"] = None
    save(cal)


def status():
    for i in sorted(load(), key=when):
        fb = i["facebook"]["state"] if i["facebook"] else "-"
        ig = i["instagram"]["state"] if i["instagram"] else "-"
        print(f"{when(i):%a %d %b %H:%M}  fb:{fb:<9} ig:{ig:<9} {i['id']}")


def inbox():
    t = page_token()
    since = datetime.now(CAIRO) - timedelta(days=7)
    posts = graph("GET", f"{PAGE_ID}/posts", t, fields="id,message,comments.limit(50)%7Bid,from,message,created_time,comments%7Bfrom%7D%7D", since=int(since.timestamp()), limit=25)
    for p in posts.get("data", []):
        for c in p.get("comments", {}).get("data", []):
            answered = any(r.get("from", {}).get("id") == PAGE_ID for r in c.get("comments", {}).get("data", []))
            if c.get("from", {}).get("id") != PAGE_ID and not answered:
                print(json.dumps({"platform": "facebook", "comment": c["id"], "post": (p.get("message") or "")[:60], "text": c["message"]}, ensure_ascii=False))
    media = graph("GET", f"{IG_ID}/media", t, fields="id,caption,timestamp,comments%7Bid,text,username,replies%7Busername%7D%7D", limit=25)
    me = graph("GET", IG_ID, t, fields="username")["username"]
    for m in media.get("data", []):
        if datetime.fromisoformat(m["timestamp"].replace("+0000", "+00:00")) < since:
            continue
        for c in m.get("comments", {}).get("data", []):
            answered = any(r.get("username") == me for r in c.get("replies", {}).get("data", []))
            if c.get("username") != me and not answered:
                print(json.dumps({"platform": "instagram", "comment": c["id"], "post": (m.get("caption") or "")[:60], "text": c["text"]}, ensure_ascii=False))


def messages():
    """Chats waiting on the page, on Messenger and Instagram: the customer wrote last, in the last 3 days.
    Prints each with its recent messages, so a reply can follow the conversation, and whether the owner
    wrote in it in the last 2 hours (then he is handling it: leave it to him)."""
    t = page_token()
    now = datetime.now(timezone.utc)
    for platform in ("messenger", "instagram"):
        try:
            chats = graph("GET", f"{PAGE_ID}/conversations", t, platform=platform, fields="updated_time,participants", limit=25)
        except RuntimeError as e:
            print(json.dumps({"platform": platform, "error": str(e)[:200]}))
            continue
        me = {PAGE_ID, IG_ID}
        for c in chats.get("data", []):
            if datetime.fromisoformat(c["updated_time"].replace("+0000", "+00:00")) < now - timedelta(days=3):
                continue
            msgs = graph("GET", f"{c['id']}/messages", t, fields="message,from,created_time", limit=8).get("data", [])
            if not msgs or msgs[0].get("from", {}).get("id") in me:
                continue
            owner_recent = any(m.get("from", {}).get("id") in me and datetime.fromisoformat(m["created_time"].replace("+0000", "+00:00")) > now - timedelta(hours=2) for m in msgs)
            print(json.dumps({
                "platform": platform,
                "to": msgs[0]["from"]["id"],
                "name": msgs[0]["from"].get("name") or msgs[0]["from"].get("username"),
                "owner_recent": owner_recent,
                "thread": [f"{'ون هاوس' if m.get('from', {}).get('id') in me else 'العميل'}: {m.get('message', '')}" for m in reversed(msgs)],
            }, ensure_ascii=False))


def send(to, text, ig=False):
    """Replies in a Messenger or Instagram chat (within 24 hours of the customer's last message)."""
    graph("POST", f"{IG_ID if ig else PAGE_ID}/messages", page_token(), recipient=json.dumps({"id": to}), message=json.dumps({"text": text}, ensure_ascii=False), messaging_type="RESPONSE")
    print("sent", to)


def dm(cid, text, ig=False):
    """Private reply: one message to the inbox of whoever wrote the comment (once per comment, within 7 days)."""
    graph("POST", f"{IG_ID if ig else PAGE_ID}/messages", page_token(), recipient=json.dumps({"comment_id": cid}), message=json.dumps({"text": text}, ensure_ascii=False))
    print("messaged", cid)


def reply(cid, text, ig=False):
    if ig:
        graph("POST", f"{cid}/replies", page_token(), message=text)
    else:
        graph("POST", f"{cid}/comments", page_token(), message=text)
    print("replied", cid)


def report():
    t = page_token()
    for period in ("week", "days_28"):
        row = []
        for m in ("page_media_view", "page_post_engagements", "page_views_total", "page_daily_follows_unique"):
            try:
                v = graph("GET", f"{PAGE_ID}/insights", t, metric=m, period=period)["data"][0]["values"][-1]["value"]
            except (RuntimeError, IndexError, KeyError):
                v = "?"
            row.append(f"{m}={v}")
        print(period, " ".join(row))
    fans = graph("GET", PAGE_ID, t, fields="followers_count,fan_count")
    ig = graph("GET", IG_ID, t, fields="followers_count,media_count")
    print("facebook followers", fans.get("followers_count"), "· instagram followers", ig.get("followers_count"))
    for i in sorted(load(), key=when):
        fb = i.get("facebook") or {}
        if fb.get("state") != "published":
            continue
        try:
            p = graph("GET", fb["id"], t, fields="reactions.summary(true).limit(0),comments.summary(true).limit(0),shares")
            print(f"{when(i):%d %b} {i['id']}: reactions {p['reactions']['summary']['total_count']}, comments {p['comments']['summary']['total_count']}, shares {p.get('shares', {}).get('count', 0)}")
        except (RuntimeError, KeyError):
            pass


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        raise SystemExit(__doc__ or "see the comment at the top of social/publish.py")
    cmd = a[0]
    if cmd == "plan":
        plan(dict(zip(a[1::2], a[2::2]))["--start"])
    elif cmd == "respace":
        respace(dict(zip(a[1::2], a[2::2]))["--start"])
    elif cmd == "run":
        run()
    elif cmd == "now":
        now_(a[1])
    elif cmd == "cancel":
        cancel(a[1])
    elif cmd == "sync":
        sync()
    elif cmd == "status":
        status()
    elif cmd == "inbox":
        inbox()
    elif cmd == "messages":
        messages()
    elif cmd == "send":
        send(a[1], a[2], "--ig" in a)
    elif cmd == "dm":
        dm(a[1], a[2], "--ig" in a)
    elif cmd == "reply":
        reply(a[1], a[2], "--ig" in a)
    elif cmd == "report":
        report()
    else:
        raise SystemExit(f"unknown command {cmd}")
