"""운세의신(unsin.co.kr) 무료 사주/궁합 결과 크롤러 — 학습·연습용.

태어난 시간을 '모름'(0)으로 보내면 사이트가 일주를 하루 전날로 계산하므로 기본값은 午시(12)입니다.
사이트 폼이 POST 로 결과를 돌려주기 때문에 Firecrawl 대신 표준 라이브러리 HTTP 요청을 씁니다.
요청 사이에 DELAY 초 쉬고, 받은 HTML 은 raw/ 에 캐시해서 같은 요청을 반복하지 않습니다.

사용법 (saju-love-match 폴더에서):
  py crawler/unsin_crawler.py saju 1995-03-12 1990-05-15 --sex 여
  py crawler/unsin_crawler.py saju --sample 60 --start 2000-01-01   # 연속 60일 = 일주 60갑자 전부
  py crawler/unsin_crawler.py gunghap 1995-03-12:여 1993-08-20:남
  py crawler/unsin_crawler.py gunghap --csv pairs.csv              # 열: me_birth,me_sex,partner_birth,partner_sex
"""

import argparse
import csv
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://www.unsin.co.kr"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
DELAY = 2.0
TARGET_YEAR = dt.date.today().year
HOUR = "12"  # 午시. 0=모름, 01=子 ... 22=亥 (사이트 select 값)

ROOT = Path(__file__).resolve().parent.parent / "data" / "unsin"
RAW = ROOT / "raw"

STEMS = "甲乙丙丁戊己庚辛壬癸"
# 사이트 지지 이미지 번호는 寅=1 부터 시작
BRANCHES_FROM_IN = "寅卯辰巳午未申酉戌亥子丑"

_last_request = 0.0


def post(path, fields, cache_name):
    """폼 POST. 캐시가 있으면 네트워크 요청 없이 반환."""
    global _last_request
    RAW.mkdir(parents=True, exist_ok=True)
    cache = RAW / f"{cache_name}.html"
    if cache.exists():
        return cache.read_text(encoding="utf-8")

    wait = DELAY - (time.time() - _last_request)
    if wait > 0:
        time.sleep(wait)
    body = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(
        BASE + path,
        data=body,
        headers={"User-Agent": UA, "Referer": BASE + path.split("/result")[0] + "/form"},
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        text = res.read().decode("utf-8", errors="ignore")
    _last_request = time.time()
    cache.write_text(text, encoding="utf-8")
    return text


def birth_fields(date_str, sex, prefix=""):
    y, m, d = date_str.split("-")
    return {
        f"{prefix}sex": sex,
        f"{prefix}birth_yyyy": y,
        f"{prefix}birth_mm": m.zfill(2),
        f"{prefix}birth_dd": d.zfill(2),
        f"{prefix}birth_hh": HOUR,
        f"{prefix}birth_solunar": "S_C",  # 양력
    }


def common_fields(cate1, cate2):
    return {
        "cate1": cate1, "cate2": cate2, "free_yn": "N", "login_yn": "N",
        "payment_type": "", "ticket_idx": "", "target_yyyy": str(TARGET_YEAR),
    }


# ---------- 파싱 ----------

def clean(fragment):
    fragment = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"<[^>]+>", "", fragment)
    lines = [html.unescape(l).strip() for l in fragment.split("\n")]
    return "\n".join(l for l in lines if l)


def parse_pillars(page):
    """사주명식 이미지(a=천간, b=지지)를 사람별로 [{year, month, day}] 로 변환. 시주는 '모름'이라 제외."""
    imgs = re.findall(r'images/star/([ab])(\d+)\.gif["\'][^>]*alt=["\'](생시|생일|생월|생년)', page)
    people = []
    for i in range(0, len(imgs) - 7, 8):  # 사람당 천간 4 + 지지 4
        chunk = imgs[i:i + 8]
        stems = {alt: STEMS[int(n) - 1] for kind, n, alt in chunk if kind == "a"}
        branches = {alt: BRANCHES_FROM_IN[int(n) - 1] for kind, n, alt in chunk if kind == "b"}
        people.append({
            "year": stems["생년"] + branches["생년"],
            "month": stems["생월"] + branches["생월"],
            "day": stems["생일"] + branches["생일"],
        })
    return people


def parse_elements(page):
    """오행분석 막대 너비(%) — 사람마다 木火土金水 순."""
    vals = re.findall(r'<div class="tit">([木火土金水])</div>\s*<div class="progress">\s*<div[^>]*width:\s*([\d.]+)%', page)
    people = []
    for i in range(0, len(vals) - 4, 5):
        people.append({el: float(w) for el, w in vals[i:i + 5]})
    return people


def div_inner(text, start):
    """text[start] 의 <div> 에 짝이 맞는 </div> 까지의 내부 HTML."""
    open_end = text.index(">", start) + 1
    depth = 1
    for m in re.finditer(r"<div\b|</div>", text[open_end:], re.I):
        depth += 1 if m.group(0).lower().startswith("<div") else -1
        if depth == 0:
            return text[open_end:open_end + m.start()]
    return text[open_end:]


def parse_sections(page):
    """<div class="sub-title"><h2>제목</h2></div><div class="bg-box">본문</div> 구조."""
    sections = []
    page = re.sub(r"<(script|style|ins)\b.*?</\1>", "", page, flags=re.S | re.I)
    end = min(i for i in (page.find("<!-- SNS"), page.find("</main>"), len(page)) if i >= 0)
    starts = [m.start() for m in re.finditer(r'<div class="sub-title">\s*<h2>', page[:end])]
    for a, b in zip(starts, starts[1:] + [end]):
        chunk = page[a:b]
        title = re.search(r"<h2>(.*?)</h2>", chunk, re.S).group(1)
        box = chunk.find('<div class="bg-box">')
        if box < 0:
            continue
        body = div_inner(chunk, box)
        body = re.sub(r'<div class="line-box">.*?</div>', "", body, flags=re.S)  # 궁합 점수 줄 (score 로 따로 저장)
        # 궁합 결과는 한 섹션에 '님의 궁합정리' 블록이 사람 수만큼 있음
        parts = re.split(r'<div class="sub-txt">.*?</div>', body, flags=re.S)
        texts = [clean(p) for p in parts if clean(p)]
        sections.append({"title": clean(title).rstrip("!"), "texts": texts})
    return sections


# ---------- 크롤링 ----------

def crawl_saju(date_str, sex):
    fields = {**common_fields("saju", "total"), "user_name": "", **birth_fields(date_str, sex)}
    page = post("/unse/saju/total/result", fields, f"saju_{date_str}_{sex}_h{HOUR}")
    return {
        "source": BASE + "/unse/saju/total/form",
        "input": {"birth": date_str, "sex": sex, "calendar": "solar", "hour": HOUR},
        "pillars": (parse_pillars(page) or [None])[0],
        "elements": (parse_elements(page) or [None])[0],
        "sections": [{"title": s["title"], "text": "\n".join(s["texts"])} for s in parse_sections(page)],
    }


def crawl_gunghap(me, partner):
    (b1, s1), (b2, s2) = me, partner
    fields = {
        **common_fields("gunghap", "sintong"), "user_name": "", "your_name": "",
        **birth_fields(b1, s1), **birth_fields(b2, s2, prefix="your_"),
    }
    page = post("/unse/gunghap/sintong/result/Y", fields, f"gunghap_{b1}_{s1}__{b2}_{s2}_h{HOUR}")
    score = re.search(r"궁합 점수는\s*(\d+)\s*점", page)
    sections = parse_sections(page)
    return {
        "source": BASE + "/unse/gunghap/sintong/form",
        "input": {"me": {"birth": b1, "sex": s1}, "partner": {"birth": b2, "sex": s2}, "hour": HOUR},
        "score": int(score.group(1)) if score else None,
        "pillars": parse_pillars(page),  # [나, 상대]
        "elements": parse_elements(page),
        "sections": sections,  # texts: [나, 상대] (총평은 1개)
    }


def save(kind, name, data):
    out = ROOT / kind / f"{name}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def check_sex(sex):
    if sex not in ("남", "여"):
        sys.exit(f"성별은 '남' 또는 '여' 여야 합니다: {sex}")
    return sex


def main():
    global HOUR
    ap = argparse.ArgumentParser(description="운세의신 사주/궁합 크롤러 (연습용)")
    ap.add_argument("--hour", default=HOUR, help="출생 시 select 값 (기본 12=午시, 0=모름)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("saju", help="평생사주")
    sp.add_argument("dates", nargs="*", help="YYYY-MM-DD")
    sp.add_argument("--sex", default="여")
    sp.add_argument("--sample", type=int, help="--start 부터 연속 N일")
    sp.add_argument("--start", default="2000-01-01")

    gp = sub.add_parser("gunghap", help="신통방통 궁합")
    gp.add_argument("pair", nargs="*", help="YYYY-MM-DD:성별 YYYY-MM-DD:성별")
    gp.add_argument("--csv", help="me_birth,me_sex,partner_birth,partner_sex")

    args = ap.parse_args()
    HOUR = args.hour

    if args.cmd == "saju":
        sex = check_sex(args.sex)
        dates = list(args.dates)
        if args.sample:
            start = dt.date.fromisoformat(args.start)
            dates += [(start + dt.timedelta(days=i)).isoformat() for i in range(args.sample)]
        if not dates:
            sys.exit("날짜를 입력하거나 --sample 을 지정하세요.")
        for i, d in enumerate(dates, 1):
            data = crawl_saju(d, sex)
            out = save("saju", f"{d}_{sex}", data)
            p = data["pillars"] or {}
            print(f"[{i}/{len(dates)}] {d} {sex} → {p.get('year')} {p.get('month')} {p.get('day')} · 섹션 {len(data['sections'])}개 → {out.name}")

    else:
        pairs = []
        if args.pair:
            if len(args.pair) != 2:
                sys.exit("두 사람을 'YYYY-MM-DD:성별' 형식으로 입력하세요.")
            pairs.append(tuple(tuple(p.split(":")) for p in args.pair))
        if args.csv:
            with open(args.csv, encoding="utf-8-sig") as f:
                for row in csv.DictReader(f):
                    pairs.append(((row["me_birth"], row["me_sex"]), (row["partner_birth"], row["partner_sex"])))
        if not pairs:
            sys.exit("궁합을 볼 두 사람을 입력하거나 --csv 를 지정하세요.")
        for i, (me, partner) in enumerate(pairs, 1):
            check_sex(me[1]), check_sex(partner[1])
            data = crawl_gunghap(me, partner)
            out = save("gunghap", f"{me[0]}_{me[1]}__{partner[0]}_{partner[1]}", data)
            print(f"[{i}/{len(pairs)}] {me[0]}({me[1]}) × {partner[0]}({partner[1]}) → {data['score']}점 · 섹션 {len(data['sections'])}개 → {out.name}")


if __name__ == "__main__":
    main()
