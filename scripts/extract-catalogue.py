#!/usr/bin/env python3
"""Extract part numbers and metadata from Britpart catalogue PDF."""

import json
import re
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Install pdfplumber: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PDF_PATH = Path("/tmp/trillick_catalogue2526.pdf")
if len(sys.argv) > 1:
    PDF_PATH = Path(sys.argv[1])

CONTENTS_CATS = [
    ("exterior-protection", "Exterior Protection", 5, 16),
    ("side-and-rear-steps", "Side & Rear Steps", 17, 22),
    ("racks-and-roll-cages", "Racks & Roll Cages", 23, 36),
    ("wheels", "Wheels", 37, 48),
    ("lighting", "Lighting", 49, 62),
    ("towing", "Towing", 63, 68),
    ("interior-protection", "Interior Protection", 69, 84),
    ("seats-and-trim", "Seats & Trim", 85, 98),
    ("off-road", "Off-Road", 99, 108),
    ("winching", "Winches & Recovery", 109, 118),
    ("performance", "Performance", 119, 136),
    ("suspension-and-axle", "Suspension & Axle", 137, 156),
    ("repair-and-service-parts", "Repair & Service", 157, 180),
    ("lucas-and-girling-classic", "Lucas Classic", 181, 190),
    ("chassis-and-body-components", "Chassis & Body", 191, 212),
    ("service-kits", "Service Kits", 213, 220),
    ("consumables", "Consumables", 221, 234),
    ("tools", "Tools", 235, 246),
    ("enhancements", "Enhancements", 247, 270),
    ("camping", "Camping", 271, 282),
    ("miscellaneous", "Miscellaneous", 283, 296),
]

PART_RE = re.compile(r"\b([A-Z]{2,4}\d{3,7}[A-Z]{0,4})\b")
NOISE_PREFIX = ("ISO", "R112", "CREE", "SAE", "EMC", "ROHS", "IP68", "IP67", "ECE")

# Common Land Rover models for fitment extraction
VEHICLE_KEYWORDS = [
    "Defender 90", "Defender 110", "Defender 130", "Defender",
    "Discovery 1", "Discovery 2", "Discovery 3", "Discovery 4", "Discovery 5",
    "Discovery Sport", "Freelander 1", "Freelander 2",
    "Range Rover Classic", "Range Rover Sport", "Range Rover",
    "Series 1", "Series 2", "Series 2A", "Series 3", "Series",
    "Evoque", "Velar", "P38", "L322", "LR3", "LR4",
]


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def extract_description_line(text: str, part: str) -> str:
    """Try to find description on same line as part number."""
    for line in text.split("\n"):
        if part in line and len(line) > len(part) + 3:
            desc = line.replace(part, "").strip(" -|/")
            desc = re.sub(r"\s+", " ", desc)
            if desc and not desc.isdigit():
                return desc[:200]
    return ""


def extract_vehicles(text: str) -> list[str]:
    found = []
    upper = text
    for v in VEHICLE_KEYWORDS:
        if v in upper and v not in found:
            found.append(v)
    return found


def page_category(page_num: int) -> tuple[str, str]:
    for slug, name, start, end in CONTENTS_CATS:
        if start <= page_num <= end:
            return slug, name
    return "miscellaneous", "Miscellaneous"


def main():
    if not PDF_PATH.exists():
        print(f"PDF not found at {PDF_PATH}. Download with:")
        print("curl -L -o /tmp/trillick_catalogue2526.pdf "
              "https://www.trillickautoparts.com/images/general/trillick_catalogue2526.pdf")
        sys.exit(1)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    parts: dict[str, dict] = {}

    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            page_num = i + 1
            text = page.extract_text() or ""
            if page_num < 5:
                continue
            cat_slug, cat_name = page_category(page_num)

            for match in PART_RE.findall(text):
                if len(match) < 5 or any(match.startswith(p) for p in NOISE_PREFIX):
                    continue
                if match not in parts:
                    desc = extract_description_line(text, match)
                    vehicles = extract_vehicles(text)
                    parts[match] = {
                        "partNumber": match,
                        "title": desc.split("|")[0].strip() if desc else match,
                        "description": desc,
                        "categorySlug": cat_slug,
                        "categoryName": cat_name,
                        "cataloguePage": page_num,
                        "vehicles": vehicles,
                        "fitmentText": ", ".join(vehicles) if vehicles else "",
                    }
                else:
                    # Enrich with vehicle data from later pages
                    existing = parts[match]
                    for v in extract_vehicles(text):
                        if v not in existing["vehicles"]:
                            existing["vehicles"].append(v)
                    existing["fitmentText"] = ", ".join(existing["vehicles"])

    output = {
        "source": str(PDF_PATH),
        "extractedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "count": len(parts),
        "parts": sorted(parts.values(), key=lambda p: p["partNumber"]),
    }

    out_path = DATA_DIR / "catalogue-extract.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Extracted {len(parts)} parts -> {out_path}")


if __name__ == "__main__":
    main()
