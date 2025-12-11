"""
Export current sqlite database into static JSON files for hosting on GitHub Pages.

Outputs:
- webapp/data/novels.json                  : list of novels (metadata only)
- webapp/data/novels/<novel_id_sanitized>.json : detail + chapters (with content)

Usage:
    python export_static_json.py
"""

import json
import re
from pathlib import Path

from database import SessionLocal, Novel, Chapter

ROOT_DIR = Path(__file__).parent.parent
OUTPUT_DIR = ROOT_DIR / "webapp" / "data"
NOVELS_DIR = OUTPUT_DIR / "novels"


def _sanitize_filename(value: str) -> str:
    """Sanitize a value to be used as filename (keep id inside JSON untouched)."""
    if not value:
        return "unknown"
    # Replace invalid chars with underscore
    return re.sub(r"[^\w\-\.]", "_", value)


def export_static_json():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    NOVELS_DIR.mkdir(parents=True, exist_ok=True)

    session = SessionLocal()
    try:
        novels = (
            session.query(Novel)
            .order_by(Novel.created_at.desc())
            .all()
        )

        novel_list = []

        for novel in novels:
            novel_id = novel.novel_id or str(novel.id)
            safe_name = _sanitize_filename(novel_id)

            # Fetch chapters
            chapters = (
                session.query(Chapter)
                .filter(Chapter.novel_id == novel.id)
                .order_by(Chapter.chapter_number.asc())
                .all()
            )

            total_chapters = novel.total_chapters or len(chapters)

            # Append to list metadata
            novel_list.append({
                "id": novel_id,
                "title": novel.title,
                "author": novel.author,
                "description": novel.description,
                "coverImage": novel.cover_image,
                "totalChapters": total_chapters,
                "status": novel.status,
            })

            # Detail with chapters (include content for reader)
            detail = {
                "id": novel_id,
                "title": novel.title,
                "author": novel.author,
                "description": novel.description,
                "coverImage": novel.cover_image,
                "totalChapters": total_chapters,
                "status": novel.status,
                "chapters": [
                    {
                        "id": ch.chapter_number or ch.id,
                        "number": ch.chapter_number or ch.id,
                        "title": ch.title,
                        "content": ch.content or "",
                    }
                    for ch in chapters
                ],
            }

            (NOVELS_DIR / f"{safe_name}.json").write_text(
                json.dumps(detail, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

        # Write novel list
        (OUTPUT_DIR / "novels.json").write_text(
            json.dumps(novel_list, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        print(f"Exported {len(novel_list)} novels to {OUTPUT_DIR}")

    finally:
        session.close()


if __name__ == "__main__":
    export_static_json()

