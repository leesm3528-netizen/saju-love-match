// 크롤링한 운세의신 사주명식과 compat.js 의 연주·월주·일주 계산을 비교합니다.
// 사용법 (saju-love-match 폴더에서): node crawler/validate_pillars.js
const fs = require("fs");
const path = require("path");
const { getPillars } = require("../compat.js");

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const text = (p) => STEMS[p.stem] + BRANCHES[p.branch];

const dir = path.join(__dirname, "..", "data", "unsin");
const cases = new Map(); // birth → 사이트 사주명식

const sajuDir = path.join(dir, "saju");
if (fs.existsSync(sajuDir)) {
  for (const f of fs.readdirSync(sajuDir)) {
    const d = JSON.parse(fs.readFileSync(path.join(sajuDir, f), "utf8"));
    if (d.pillars) cases.set(d.input.birth, d.pillars);
  }
}
const gunghapDir = path.join(dir, "gunghap");
if (fs.existsSync(gunghapDir)) {
  for (const f of fs.readdirSync(gunghapDir)) {
    const d = JSON.parse(fs.readFileSync(path.join(gunghapDir, f), "utf8"));
    [d.input.me, d.input.partner].forEach((p, i) => d.pillars[i] && cases.set(p.birth, d.pillars[i]));
  }
}

let ok = 0;
const fails = [];
for (const [birth, site] of [...cases].sort()) {
  const mine = getPillars(birth);
  const diff = ["year", "month", "day"].filter((k) => text(mine[k]) !== site[k]);
  if (diff.length === 0) ok++;
  else fails.push(`${birth}: ` + diff.map((k) => `${k} 사이트 ${site[k]} / 내 계산 ${text(mine[k])}`).join(", "));
}

console.log(`비교 ${cases.size}건 · 일치 ${ok}건 · 불일치 ${fails.length}건`);
fails.forEach((f) => console.log("  ✗ " + f));
