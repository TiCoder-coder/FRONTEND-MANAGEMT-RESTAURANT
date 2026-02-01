#!/usr/bin/env bash
set -euo pipefail

DIR="assets/icons/flag"
QUALITY=92

MAX_W=96
MAX_H=64

if [[ ! -d "$DIR" ]]; then
  echo "❌ Folder not found: $DIR"
  echo "   Hãy chạy từ ROOT project:"
  echo "   cd /media/voanhnhat/SDD_OUTSIDE5/FRONTEND-MANAGEMT-RESTAURANT"
  exit 1
fi

if command -v magick >/dev/null 2>&1; then
  CONVERT=(magick convert)
elif command -v convert >/dev/null 2>&1; then
  CONVERT=(convert)
elif [[ -x /usr/bin/convert ]]; then
  CONVERT=(/usr/bin/convert)
else
  echo "❌ Please install imagemagick (need convert/magick)"
  exit 1
fi

echo "✅ Normalizing + RESIZING flags in: $DIR"
echo "Using: ${CONVERT[*]}"
echo "Max size: ${MAX_W}x${MAX_H}"
echo

count=0

while IFS= read -r -d '' f; do
  ext="${f##*.}"
  ext_lc="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
  base="$(basename "${f%.*}")"

  tmp="/tmp/${base}_fixed.${ext_lc}"

  if [[ "$ext_lc" == "jpg" || "$ext_lc" == "jpeg" ]]; then
    "${CONVERT[@]}" "$f" \
      -auto-orient \
      -strip \
      -colorspace sRGB \
      -resize "${MAX_W}x${MAX_H}>" \
      -interlace none \
      -quality "$QUALITY" \
      "$tmp"
  elif [[ "$ext_lc" == "png" ]]; then
    "${CONVERT[@]}" "$f" \
      -auto-orient \
      -strip \
      -colorspace sRGB \
      -resize "${MAX_W}x${MAX_H}>" \
      -alpha on \
      -interlace none \
      "PNG32:$tmp"
  else
    continue
  fi

  mv "$tmp" "$f"
  echo "fixed: $f"
  count=$((count+1))
done < <(find "$DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0)

echo
echo "✅ Done. Fixed $count file(s)."
echo "👉 Restart Expo cache:"
echo "   npx expo start -c"
