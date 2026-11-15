#!/bin/zsh
# Renders a deck the way the presenter will see it: Keynote opens the .pptx and exports a PDF,
# then PDFKit rasterizes each page to a 1920 x 1080 PNG.
# usage: ./render-slides.sh deck.pptx outDir
set -euo pipefail
deck=${1:A}
out=${2:A}
here=${0:A:h}
pdf="$out/${deck:t:r}.pdf"  # Keynote uses the file name as the PDF title
mkdir -p "$out"
osascript <<EOF
tell application id "com.apple.Keynote"
  set d to open POSIX file "$deck"
  delay 2
  export d to POSIX file "$pdf" as PDF
  close d saving no
end tell
EOF
swift "$here/pdf-to-png.swift" "$pdf" "$out" 1920
