#!/usr/bin/env bash
# Convert the report and the slides to PDF and merge them into the single PDF to submit.
# Intermediate PDFs stay in a temporary directory; only entrega/entrega_tanque.pdf is written.
# Requires: OnlyOffice Desktop Editors (x2t converter) and poppler (pdfunite).
set -euo pipefail

OUT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../entrega" && pwd)"
X2T_DIR="/opt/onlyoffice/desktopeditors/converter"
FONTS="$HOME/.local/share/onlyoffice/desktopeditors/data/fonts"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

to_pdf() {
  local source="$1" target="$2"
  mkdir -p "$WORK/tmp"
  cat > "$WORK/task.xml" <<XML
<?xml version="1.0" encoding="utf-8"?>
<TaskQueueDataConvert>
<m_sFileFrom>$source</m_sFileFrom>
<m_sFileTo>$target</m_sFileTo>
<m_nFormatTo>513</m_nFormatTo>
<m_sTempDir>$WORK/tmp</m_sTempDir>
<m_sFontDir>$FONTS</m_sFontDir>
<m_sAllFontsPath>$FONTS/AllFonts.js</m_sAllFontsPath>
</TaskQueueDataConvert>
XML
  (cd "$X2T_DIR" && timeout 180 ./x2t "$WORK/task.xml" > /dev/null 2>&1)
  [ -s "$target" ] || { echo "conversion failed: $source" >&2; exit 1; }
}

to_pdf "$OUT/informe_tanque.docx" "$WORK/informe.pdf"
to_pdf "$OUT/diapositivas_tanque.pptx" "$WORK/diapositivas.pdf"
pdfunite "$WORK/informe.pdf" "$WORK/diapositivas.pdf" "$OUT/entrega_tanque.pdf"
echo "written entrega/entrega_tanque.pdf"
