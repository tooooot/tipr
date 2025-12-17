from PIL import Image
import shutil
import os
import sys

# Hardcoded path from generation step
src = r"C:/Users/HP/.gemini/antigravity/brain/61fb8f1b-d4c1-4b87-9a06-06166e4464df/pwa_icon_gold_1765960994446.png"
dest_dir = r"c:/Users/HP/Desktop/Apps/Tipr/frontend/public"

try:
    if not os.path.exists(src):
        print(f"Error: Source image not found at {src}")
        sys.exit(1)

    img = Image.open(src)

    # Save 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    path192 = os.path.join(dest_dir, "pwa-192x192.png")
    img_192.save(path192)
    print(f"Saved {path192}")

    # Save 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    path512 = os.path.join(dest_dir, "pwa-512x512.png")
    img_512.save(path512)
    print(f"Saved {path512}")

except ImportError:
    print("Pillow not installed, copying raw file...")
    shutil.copy(src, os.path.join(dest_dir, "pwa-512x512.png"))
    shutil.copy(src, os.path.join(dest_dir, "pwa-192x192.png"))
except Exception as e:
    print(f"Error: {e}")
