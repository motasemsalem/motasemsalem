"""Renders the company profile pages (src/brand/Profile.tsx) and joins them into renders/identity/one-house-profile.pdf."""
import subprocess
from pathlib import Path

from PIL import Image

out = Path("renders/identity/profile")
out.mkdir(parents=True, exist_ok=True)
pages = []
for n in range(1, 7):
    png = out / f"page-{n}.png"
    subprocess.run(["npx", "remotion", "still", "src/index.ts", f"profile-{n}", str(png), "--log=error"], check=True)
    pages.append(Image.open(png).convert("RGB"))
pages[0].save("renders/identity/one-house-profile.pdf", save_all=True, append_images=pages[1:], resolution=150)
print("renders/identity/one-house-profile.pdf")
