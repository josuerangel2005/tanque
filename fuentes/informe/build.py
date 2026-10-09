#!/usr/bin/env python3
"""Build the report .docx from informe.md on top of the university template.

Usage: python3 fuentes/informe/build.py
Requires: pandoc. Output: entrega/informe_tanque.docx
"""
import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
TEMPLATE = ROOT / "fuentes/plantillas/plantilla_carta_portada.docx"
CAPTURES = ROOT / "fuentes/capturas"
ASSIGNMENT = ROOT / "docs/Modelo matematico del Tanque.docx"
OUTPUT = ROOT / "entrega/informe_tanque.docx"

COVER_TITLE = "MODELADO Y SIMULACIÓN DE UN TANQUE DE DISTRIBUCIÓN DE AGUA"
COVER_DESCRIPTION = "Trabajo 3. Modelado y simulación de sistemas continuos"
COVER_DATE = "9 de octubre de 2026"

# Capture file -> name used in informe.md
IMAGES = {
    "diagrama_bloques.jpeg": "diagrama.jpeg",
    "scope_no_lineal.jpeg": "scope_no_lineal.jpeg",
    "scope_no_lineal_y_func_trans.jpeg": "scope_ambas.jpeg",
    "respuesta_analitica_matlab.jpeg": "analitica.jpeg",
    "variables_ventana_comandos.jpeg": "variables_matlab.jpeg",
    "variables_espacio_trabajo.jpeg": "variables.jpeg",
}


def bold_table_headers(md: str) -> str:
    """Bold the header cells of every pipe table."""
    lines = md.split("\n")
    for i in range(len(lines) - 1):
        if re.fullmatch(r"\|[-| ]+\|", lines[i + 1]) and lines[i].startswith("|"):
            cells = [c.strip() for c in lines[i].strip("|").split("|")]
            lines[i] = "| " + " | ".join(f"**{c}**" if c else "" for c in cells) + " |"
    return "\n".join(lines)


def patch_styles(xml: str) -> str:
    """Define the pandoc styles the template lacks: left-aligned cells and code, centered figures."""
    mono = '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="18"/>'
    styles = {
        "Compact": ("paragraph", "Compact", '<w:pPr><w:spacing w:before="36" w:after="36"/><w:jc w:val="left"/></w:pPr>'),
        "SourceCode": ("paragraph", "Source Code", f'<w:pPr><w:spacing w:after="0"/><w:jc w:val="left"/></w:pPr><w:rPr>{mono}</w:rPr>'),
        "CaptionedFigure": ("paragraph", "Captioned Figure", '<w:pPr><w:keepNext/><w:jc w:val="center"/></w:pPr>'),
        "ImageCaption": ("paragraph", "Image Caption", '<w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr>'),
        "VerbatimChar": ("character", "Verbatim Char", f"<w:rPr>{mono}</w:rPr>"),
    }
    for style_id, (kind, name, props) in styles.items():
        xml = re.sub(rf'<w:style [^>]*w:styleId="{style_id}"[^>]*>.*?</w:style>', "", xml, flags=re.S)
        based_on = '<w:basedOn w:val="Normal"/>' if kind == "paragraph" else ""
        style = (
            f'<w:style w:type="{kind}" w:customStyle="1" w:styleId="{style_id}">'
            f'<w:name w:val="{name}"/>{based_on}{props}</w:style>'
        )
        xml = xml.replace("</w:styles>", style + "</w:styles>", 1)
    return xml


def collect_assets(work: Path):
    for source, name in IMAGES.items():
        shutil.copy(CAPTURES / source, work / name)
    with zipfile.ZipFile(ASSIGNMENT) as z:
        (work / "figura1.png").write_bytes(z.read("word/media/image1.png"))


def cover_from_template():
    """Return (root open tag, cover paragraphs) from the template, with texts filled in."""
    with zipfile.ZipFile(TEMPLATE) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    root = re.search(r"<w:document [^>]*>", xml).group(0)
    body = xml[xml.index("<w:body>") + len("<w:body>"):]
    first_heading = body.index('w:val="Ttulo1"')
    cover = body[: body.rindex("<w:p ", 0, first_heading)]

    def set_text(xml_part, old_runs_pattern, new_text):
        replaced, count = re.subn(old_runs_pattern, lambda m: m.group(1) + new_text + m.group(2), xml_part, flags=re.S)
        if count == 0:
            raise SystemExit(f"cover placeholder not found: {old_runs_pattern}")
        return replaced

    cover = set_text(cover, r"(<w:t>)TÍTULO DEL DOCUMENTO(</w:t>)", COVER_TITLE)
    # "Descripción" and " del documento" live in two consecutive runs.
    cover = set_text(cover, r"(<w:t>)Descripción(</w:t>)", COVER_DESCRIPTION)
    cover = cover.replace('<w:t xml:space="preserve"> del documento</w:t>', "<w:t></w:t>")
    cover = set_text(cover, r"(<w:t>)Fecha(</w:t>)", COVER_DATE)
    return root, cover


def inject_cover(docx: Path):
    root, cover = cover_from_template()
    tmp = docx.with_suffix(".tmp")
    with zipfile.ZipFile(docx) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "word/document.xml":
                xml = data.decode("utf-8")
                own_root = re.search(r"<w:document [^>]*>", xml).group(0)
                # Keep pandoc's namespaces and add the ones the cover drawings need.
                declared = set(re.findall(r"xmlns:(\w+)=", own_root))
                extra = "".join(
                    f' xmlns:{p}="{u}"'
                    for p, u in re.findall(r'xmlns:(\w+)="([^"]*)"', root)
                    if p not in declared
                )
                ignorable = re.search(r' mc:Ignorable="[^"]*"', root).group(0)
                new_root = own_root[:-1] + extra + ignorable + ">"
                xml = xml.replace(own_root, new_root, 1)
                xml = xml.replace("<w:body>", "<w:body>" + cover, 1)
                xml = re.sub(r'<w:tblStyle w:val="Table" ?/>', '<w:tblStyle w:val="Tablaconcuadrcula"/>', xml)
                data = xml.encode("utf-8")
            elif item.filename == "word/styles.xml":
                data = patch_styles(data.decode("utf-8")).encode("utf-8")
            zout.writestr(item, data)
    tmp.replace(docx)


def main():
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        collect_assets(work)
        md = (HERE / "informe.md").read_text(encoding="utf-8")
        md = bold_table_headers(md)
        (work / "informe.md").write_text(md, encoding="utf-8")
        subprocess.run(
            [
                "pandoc", "informe.md", "-f", "markdown", "-t", "docx",
                "--reference-doc", str(TEMPLATE),
                "--syntax-highlighting=none", "-M", "lang=es",
                "-o", str(OUTPUT),
            ],
            cwd=work, check=True,
        )
    inject_cover(OUTPUT)
    print(f"written {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
