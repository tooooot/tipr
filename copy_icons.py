import shutil
import os
import sys

src = r"C:/Users/HP/.gemini/antigravity/brain/61fb8f1b-d4c1-4b87-9a06-06166e4464df/pwa_icon_gold_1765960994446.png"
dest_dir = r"c:/Users/HP/Desktop/Apps/Tipr/frontend/public"

try:
    if not os.path.exists(src):
        print(f"Error: Source image not found at {src}")
        sys.exit(1)

    # Just copy the file since we can't resize
    shutil.copy(src, os.path.join(dest_dir, "pwa-512x512.png"))
    shutil.copy(src, os.path.join(dest_dir, "pwa-192x192.png"))
    print("Copied icons successfully (without resizing)")

except Exception as e:
    print(f"Error: {e}")
