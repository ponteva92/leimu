"""Reproduce the checked-in Latin WOFF2 faces from verified upstream files.

Download the files listed in sources.json into source/ (or --source-dir).
Requires fontTools[woff]. This script is never run by the application build.
"""
from pathlib import Path
import argparse
import hashlib
import json

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


def main():
    folder = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=folder / "source")
    args = parser.parse_args()
    manifest = json.loads((folder / "sources.json").read_text(encoding="utf-8"))
    unicodes = set()
    for item in manifest["unicodeRanges"].split(","):
        parts = item.removeprefix("U+").split("-")
        start, end = int(parts[0], 16), int(parts[-1], 16)
        unicodes.update(range(start, end + 1))
    outputs = []
    for entry in manifest["fonts"]:
        source = args.source_dir / entry["source"]
        data = source.read_bytes()
        actual_sha = hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
        if actual_sha != entry["sha"]:
            raise ValueError(f"Upstream hash mismatch: {source.name}")
        font = TTFont(source, recalcTimestamp=False)
        if "fvar" in font:
            limits = {axis.axisTag: (400, 700) if axis.axisTag == "wght" else axis.defaultValue for axis in font["fvar"].axes}
            font = instantiateVariableFont(font, limits, inplace=True)
        options = subset.Options()
        # Keep standard browser shaping and every feature enabled by the
        # site's font-feature-settings. Unused discretionary stylistic sets
        # otherwise pull thousands of unrelated alternate glyphs into Latin.
        options.layout_features = ["kern", "liga", "clig", "calt", "locl", "ccmp", "mark", "mkmk", "rlig"]
        options.name_IDs = ["*"]
        options.name_languages = ["*"]
        options.name_legacy = True
        options.notdef_outline = True
        options.recommended_glyphs = True
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=unicodes)
        subsetter.subset(font)
        font.flavor = "woff2"
        destination = folder / entry["output"]
        font.save(destination)
        check = TTFont(destination)
        cmap = check.getBestCmap()
        required = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÅÄÖåäö0123456789€×←→–—‘’“”…"
        missing = sorted(set(required) - {chr(code) for code in cmap})
        if missing:
            raise ValueError(f"Required Latin characters missing from {destination.name}: {missing}")
        outputs.append({"file": destination.name, "family": entry["family"], "weight": entry["weight"], "style": entry["style"], "bytes": destination.stat().st_size, "sha256": hashlib.sha256(destination.read_bytes()).hexdigest()})
        print(f"{destination.name}: {destination.stat().st_size} bytes")
    (folder / "font-manifest.json").write_text(json.dumps({"fonts": outputs, "totalBytes": sum(item["bytes"] for item in outputs)}, indent=2) + "\n", encoding="utf-8")
    print(f"Total WOFF2: {sum(item['bytes'] for item in outputs)} bytes")


if __name__ == "__main__":
    main()
