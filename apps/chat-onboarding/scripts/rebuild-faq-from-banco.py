#!/usr/bin/env python3
"""
Regenera las entradas de FAQ para creadores a partir del PDF "Banco de
preguntas y respuestas · Eternity Agency" (formato con WeasyPrint, una
pregunta por bloque: "N.M · ¿pregunta?", línea de fuente ("Slide N ..." o
un nombre de política), variantes opcionales ("También preguntan: ..."),
respuesta corta indentada, y respuesta ampliada).

USO
    pip install --break-system-packages pdfplumber  # no se usa; requiere pdftotext (poppler-utils)
    python3 rebuild-faq-from-banco.py /ruta/al/banco.pdf > generated-entries.ts.fragment

Esto imprime en stdout el bloque de objetos `FaqEntry` (TypeScript) para
TODAS las preguntas de la Parte 1 ("Creadores") que NO estén marcadas
⚠ SIN RESOLVER, junto con estadísticas en stderr para poder verificar los
conteos contra la portada del PDF (total / para creadores / internas / sin
resolver).

Este script NO toca `knowledgeBase.ts` directamente ni reescribe las 5
entradas originales del Programa para Creadores Principiantes (onboarding
de 4 días) — esas son texto validado a mano, aparte del banco. Para
actualizar `knowledgeBase.ts` cuando el banco cambie: correr este script,
revisar el fragmento generado, y reemplazar manualmente el bloque de
entradas "generadas" (todo lo que va después de las 5 entradas originales
en `FAQ_ENTRIES`) con el nuevo fragmento. La Parte 2 (uso interno de la
agencia) y las preguntas ⚠ SIN RESOLVER se descartan a propósito: nunca
deben salir hacia un creador.

Si la estructura del PDF cambia (nuevas secciones, otro formato de fuente,
etc.), hay que revisar `SECTION_NAMES` y los patrones de abajo — este
script asume la plantilla exacta del banco de 1 de septiembre de 2026.
"""

import re
import sys
import json
import subprocess
import unicodedata
import argparse

ENTRY_RE = re.compile(r'^(\d+)\.(\d+)\s*·\s*(.*)$')
SUBSECTION_RE = re.compile(r'^\d+\s*\.\s+[A-ZÁÉÍÓÚÑÜ0-9].*$')
NUMQ_RE = re.compile(r'^\d+\s*preguntas?$')
SLIDE_RE = re.compile(r'^Slide\b')
TAMBIEN_RE = re.compile(r'^Tambi[eé]n preguntan:')
NOISE_INDENT = 6

# Nombres de sección de la Parte 1 ("Creadores") tal como aparecen en el
# banco de 1/sep/2026. Si el equipo agrega/renombra secciones, actualizar
# aquí (y en SECTION_SLUG más abajo, para el id de cada entrada).
SECTION_NAMES = {
    "Programa, bonos y permanencia",
    "Elite: bonos y crecimiento",
    "TikTok LIVE, algoritmo y funciones",
    "Batallas, monetización y club de fans",
    "Mentalidad, constancia y objetivos",
    "Retención, espectadores y donadores",
    "Estrategias de batalla y retos",
    "LIVE room, videos y CapCut",
    "Políticas de TikTok y sanciones",
    # Parte 2 (interna) — se parsean para poder contar/verificar, pero se
    # descartan siempre al filtrar por `part == 1` más abajo.
    "Gobernanza y Health Score",
    "Scouting y captación",
    "Operación, equipos y estudios",
    "Formación, setup y Group LIVE",
}

SECTION_SLUG = {
    "Programa, bonos y permanencia": "programa",
    "Elite: bonos y crecimiento": "elite",
    "TikTok LIVE, algoritmo y funciones": "algoritmo",
    "Batallas, monetización y club de fans": "batallas",
    "Mentalidad, constancia y objetivos": "mentalidad",
    "Retención, espectadores y donadores": "retencion",
    "Estrategias de batalla y retos": "estrategias",
    "LIVE room, videos y CapCut": "liveroom",
    "Políticas de TikTok y sanciones": "politicas",
}

PART_MARKERS = {
    "Parte 1 · Creadores": 1,
    "Parte 2 · Agencia": 2,
}


def pdf_to_text(pdf_path: str) -> str:
    out = subprocess.run(
        ["pdftotext", "-layout", pdf_path, "-"],
        check=True,
        capture_output=True,
    )
    return out.stdout.decode("utf-8")


def is_noise(ln: str) -> bool:
    if ln.strip() == "":
        return False
    indent = len(ln) - len(ln.lstrip(" "))
    return indent >= NOISE_INDENT


def block_text(block):
    return " ".join(l.strip() for l in block)


def is_short_answer_block(block):
    return all(l.startswith("   ") for l in block)


def parse_banco(raw_text: str):
    lines = [ln.replace("\x0c", "").rstrip() for ln in raw_text.split("\n")]

    cleaned = []
    for ln in lines:
        if ln.strip() == "":
            cleaned.append("")
        elif is_noise(ln):
            continue
        else:
            cleaned.append(ln)

    blocks, cur = [], []
    for ln in cleaned:
        if ln == "":
            if cur:
                blocks.append(cur)
                cur = []
        else:
            cur.append(ln)
    if cur:
        blocks.append(cur)

    entries = []
    current_section = None
    current_part = None
    i, n = 0, len(blocks)
    skipped_blocks = []

    while i < n:
        block = blocks[i]
        first = block[0].strip()

        if first in PART_MARKERS:
            current_part = PART_MARKERS[first]
            i += 1
            continue
        if first in SECTION_NAMES:
            current_section = first
            i += 1
            continue
        if NUMQ_RE.match(first):
            i += 1
            continue
        if SUBSECTION_RE.match(first) and not ENTRY_RE.match(first):
            i += 1
            continue

        m = ENTRY_RE.match(first)
        if m:
            qnum = f"{m.group(1)}.{m.group(2)}"
            qtext_lines = [m.group(3)] + [l.strip() for l in block[1:]]
            qtext = " ".join(qtext_lines).strip()
            sin_resolver = "⚠" in qtext or "SIN RESOLVER" in qtext
            qtext = re.sub(r"\s+", " ", qtext.replace("⚠ SIN RESOLVER", "").replace("⚠", "")).strip()

            entry = {
                "num": qnum, "part": current_part, "section": current_section,
                "question": qtext, "sin_resolver": sin_resolver,
                "raw_meta": None, "variants": [], "short_answer": None, "expanded": None,
            }

            i += 1
            expanded_parts = []
            meta_consumed = False
            while i < n:
                nb = blocks[i]
                nfirst = nb[0].strip()

                if (ENTRY_RE.match(nfirst) or nfirst in SECTION_NAMES or nfirst in PART_MARKERS
                        or NUMQ_RE.match(nfirst) or (SUBSECTION_RE.match(nfirst) and not ENTRY_RE.match(nfirst))):
                    break

                if not meta_consumed and not TAMBIEN_RE.match(nfirst) and not is_short_answer_block(nb):
                    full = block_text(nb)
                    if SLIDE_RE.match(nfirst):
                        full = full[len("Slide"):].strip()
                    entry["raw_meta"] = full
                    meta_consumed = True
                    i += 1
                    continue
                meta_consumed = True

                if TAMBIEN_RE.match(nfirst):
                    entry["variants"] = re.findall(r'[“"]([^”"]+)[”"]', block_text(nb))
                    i += 1
                    continue

                if is_short_answer_block(nb):
                    entry["short_answer"] = re.sub(r"\s+", " ", block_text(nb)).strip()
                    i += 1
                    continue

                expanded_parts.append(re.sub(r"\s+", " ", block_text(nb)).strip())
                i += 1

            entry["expanded"] = "\n\n".join(expanded_parts) if expanded_parts else None
            entries.append(entry)
            continue

        skipped_blocks.append(block)
        i += 1

    return entries, skipped_blocks


def norm_len(s: str) -> int:
    s2 = unicodedata.normalize("NFD", s)
    s2 = "".join(c for c in s2 if unicodedata.category(c) != "Mn")
    return len(re.sub(r"[^a-z0-9]+", "", s2.lower()))


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def clean_meta(raw_meta):
    if not raw_meta:
        return None, None
    parts = [p.strip() for p in re.split(r"\s{2,}|\t", raw_meta.strip()) if p.strip()]
    if not parts:
        return None, None
    head = parts[0]
    if re.fullmatch(r"\d+", head):
        return head, None
    return None, head


def build_ts_entries(usable):
    seen_ids = set()
    ts_entries = []
    for e in usable:
        slug = SECTION_SLUG[e["section"]]
        entry_id = f"{slug}-{e['num'].replace('.', '-')}"
        if entry_id in seen_ids:
            raise ValueError(f"duplicate id: {entry_id}")
        seen_ids.add(entry_id)

        question = e["question"].strip()
        variants = [v.strip() for v in e["variants"] if v.strip()]
        slide, source_name = clean_meta(e.get("raw_meta"))

        emb_parts = [question]
        if variants:
            emb_parts.append("También preguntan: " + "; ".join(f'"{v}"' for v in variants))
        embedding_text = " ".join(emb_parts)

        kw_candidates = [question.strip("¿¡?! ").rstrip("?").strip()]
        kw_candidates += [v.strip("¿¡?! ").rstrip("?").strip() for v in variants]
        keywords, seen_kw = [], set()
        for kw in kw_candidates:
            if not kw or norm_len(kw) < 5:
                continue
            key = kw.lower()
            if key in seen_kw:
                continue
            seen_kw.add(key)
            keywords.append(kw)
        if not keywords:
            keywords = [kw_candidates[0]]

        respuesta = (e["short_answer"] or "").strip() + "\n\n¿Tienes alguna otra duda? 😊"
        source_bit = f"Slide {slide}" if slide else source_name
        fuente = " · ".join(b for b in [source_bit, e["section"], e["num"]] if b)

        ts_entries.append({
            "id": entry_id, "embeddingText": embedding_text, "keywords": keywords,
            "respuesta": respuesta, "respuestaAmpliada": (e["expanded"] or "").strip() or None,
            "fuente": fuente,
        })
    return ts_entries


def render_ts(ts_entries):
    lines = []
    for te in ts_entries:
        lines.append("  {")
        lines.append(f'    id: "{te["id"]}",')
        lines.append(f'    embeddingText: `{ts_escape(te["embeddingText"])}`,')
        kw_arr = ", ".join(f"`{ts_escape(k)}`" for k in te["keywords"])
        lines.append(f"    keywords: [{kw_arr}],")
        lines.append(f'    respuesta: `{ts_escape(te["respuesta"])}`,')
        if te["respuestaAmpliada"]:
            lines.append(f'    respuestaAmpliada: `{ts_escape(te["respuestaAmpliada"])}`,')
        lines.append(f'    fuente: `{ts_escape(te["fuente"])}`,')
        lines.append("  },")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pdf_path")
    args = ap.parse_args()

    raw_text = pdf_to_text(args.pdf_path)
    entries, skipped = parse_banco(raw_text)

    usable = [e for e in entries if e["part"] == 1 and not e["sin_resolver"]]
    ts_entries = build_ts_entries(usable)

    print(render_ts(ts_entries))

    part1 = sum(1 for e in entries if e["part"] == 1)
    part2 = sum(1 for e in entries if e["part"] == 2)
    sin_resolver = sum(1 for e in entries if e["sin_resolver"])
    print(
        f"[stats] total={len(entries)} part1={part1} part2={part2} "
        f"sin_resolver={sin_resolver} usable_for_creators={len(usable)} "
        f"skipped_blocks={len(skipped)}",
        file=sys.stderr,
    )
    print(
        "[stats] compara total/part1/part2/sin_resolver contra la portada del PDF "
        "(457 / 352 / 105 / 41 en la versión de 1/sep/2026) antes de usar el resultado.",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
