"""
Comprime todos los PNGs de assets/pictogramas -> assets/pictogramas_compressed
Usa cuantización de color (lossy) para máxima reducción + compresión lossless de nivel 9.
Requiere: pip install pillow
"""

import os
from pathlib import Path
from PIL import Image

SRC_DIR = Path(__file__).parent.parent / "assets" / "pictogramas"
DST_DIR = Path(__file__).parent.parent / "assets" / "pictogramas_compressed"

COLORS = 256       # paleta máxima (1–256)
COMPRESS = 9       # nivel de compresión zlib (0–9)

def fmt_kb(size_bytes: int) -> str:
    return f"{size_bytes / 1024:.1f} KB"

def compress_png(src: Path, dst: Path) -> tuple[int, int]:
    img = Image.open(src).convert("RGBA")
    # Cuantiza a N colores manteniendo transparencia (FASTOCTREE soporta RGBA)
    quantized = img.quantize(colors=COLORS, method=Image.Quantize.FASTOCTREE)
    quantized.save(dst, format="PNG", optimize=True, compress_level=COMPRESS)
    return src.stat().st_size, dst.stat().st_size

def main():
    DST_DIR.mkdir(parents=True, exist_ok=True)

    pngs = sorted(SRC_DIR.glob("*.png"))
    if not pngs:
        print(f"No se encontraron PNGs en {SRC_DIR}")
        return

    total_src = total_dst = 0
    print(f"Comprimiendo {len(pngs)} imágenes...\n")

    for src in pngs:
        dst = DST_DIR / src.name
        src_size, dst_size = compress_png(src, dst)
        saving = (1 - dst_size / src_size) * 100
        total_src += src_size
        total_dst += dst_size
        print(f"  {src.name:<30} {fmt_kb(src_size):>10} -> {fmt_kb(dst_size):>10}  ({saving:+.1f}%)")

    print(f"\n{'Total original:':<30} {fmt_kb(total_src):>10}")
    print(f"{'Total comprimido:':<30} {fmt_kb(total_dst):>10}")
    print(f"{'Ahorro total:':<30} {fmt_kb(total_src - total_dst):>10}  ({(1 - total_dst/total_src)*100:.1f}%)")
    print(f"\nGuardado en: {DST_DIR}")

if __name__ == "__main__":
    main()
