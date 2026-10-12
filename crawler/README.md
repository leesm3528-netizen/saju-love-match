# 크롤러 (연습용)

운세의신(unsin.co.kr) 무료 운세 결과를 수집합니다. 비상업 학습 목적으로만 사용하세요.

- robots.txt: 전체 허용 (`Allow: /`)
- 요청 간격 2초, 받은 HTML은 `data/unsin/raw/`에 캐시 (같은 요청 재전송 안 함)
- 결과 페이지가 폼 POST 응답이라 Firecrawl 대신 Python 표준 라이브러리로 요청합니다. 추가 설치는 필요 없습니다.

## 사용법 (`saju-love-match` 폴더에서)

```bash
# 평생사주
py crawler/unsin_crawler.py saju 1995-03-12 1990-05-15 --sex 여
py crawler/unsin_crawler.py saju --sample 60 --start 2000-01-01 --sex 남   # 연속 60일 = 일주 60갑자

# 신통방통 궁합
py crawler/unsin_crawler.py gunghap 1995-03-12:여 1993-08-20:남
py crawler/unsin_crawler.py gunghap --csv crawler/pairs_sample.csv

# 사이트 사주명식 vs compat.js 계산 비교
node crawler/validate_pillars.js
```

한글 출력이 깨지면 먼저 `set PYTHONIOENCODING=utf-8`(cmd) 또는 `$env:PYTHONIOENCODING="utf-8"`(PowerShell)을 실행하세요.

## 출력

| 파일 | 내용 |
|---|---|
| `data/unsin/saju/<생일>_<성별>.json` | `pillars`(연·월·일주), `elements`(오행 막대 %), `sections`(초년운·애정운 등 17개 섹션 `{title, text}`) |
| `data/unsin/gunghap/<나>__<상대>.json` | `score`(궁합 점수), `pillars`·`elements`([나, 상대]), `sections`(총평·애정운·결혼운 등, `texts`는 [나, 상대]) |

## 주의

- 태어난 시간을 "모름"(`--hour 0`)으로 보내면 사이트가 **일주를 하루 전날로** 계산합니다. 그래서 기본값은 午시(`12`)입니다.
- 혈액형 궁합 페이지(`/unse/free/bloodgunghap`)는 사이트 자체의 "결과보기" 버튼이 동작하지 않아 수집하지 않습니다.
- 사이트 HTML 구조가 바뀌면 `parse_sections` / `parse_pillars`를 수정해야 합니다.
