// 연애 궁합 계산 로직 (혈액형 + 사주)
// 생년월일만 사용하므로 연주·월주·일주(6글자)로 계산합니다. 시주는 제외.
// 절기 경계는 평균 날짜로 근사하므로 절기 당일 전후 출생자는 월주/연주가 하루 정도 어긋날 수 있습니다.

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const STEMS_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCHES_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

// 오행: 0 木, 1 火, 2 土, 3 金, 4 水 (상생 순서)
const ELEMENTS = ["木", "火", "土", "金", "水"];
const ELEMENTS_KO = ["목", "화", "토", "금", "수"];
const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

// 절입일 근사값: [월, 일, 해당 월지 인덱스] — 소한(丑)부터
const SOLAR_TERMS = [
  [1, 6, 1], [2, 4, 2], [3, 6, 3], [4, 5, 4], [5, 6, 5], [6, 6, 6],
  [7, 7, 7], [8, 8, 8], [9, 8, 9], [10, 8, 10], [11, 7, 11], [12, 7, 0],
];

// ---------- 사주 (연주·월주·일주) ----------

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

function getPillars(dateStr) {
  const { y, m, d } = parseDate(dateStr);

  // 연주: 입춘(2/4) 이전이면 전년도
  const beforeIpchun = m < 2 || (m === 2 && d < 4);
  const sajuYear = beforeIpchun ? y - 1 : y;
  const yearIdx = (((sajuYear - 4) % 60) + 60) % 60; // 1984 = 甲子
  const yearStem = yearIdx % 10;
  const yearBranch = yearIdx % 12;

  // 월주: 가장 최근에 지난 절기의 월지
  let monthBranch = 0; // 1/1~1/5 는 전년 12월의 子월
  for (const [tm, td, br] of SOLAR_TERMS) {
    if (m > tm || (m === tm && d >= td)) monthBranch = br;
  }
  const monthOffset = (monthBranch - 2 + 12) % 12; // 寅월 = 0
  const firstMonthStem = ((yearStem % 5) * 2 + 2) % 10; // 甲己년 → 丙寅월
  const monthStem = (firstMonthStem + monthOffset) % 10;

  // 일주: 2000-01-01 = 戊午(54)
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2000, 0, 1)) / 86400000);
  const dayIdx = (((54 + days) % 60) + 60) % 60;

  return {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayIdx % 10, branch: dayIdx % 12 },
  };
}

function pillarText(p) {
  return `${STEMS[p.stem]}${BRANCHES[p.branch]}(${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]})`;
}

function countElements(pillars) {
  const counts = [0, 0, 0, 0, 0];
  for (const p of [pillars.year, pillars.month, pillars.day]) {
    counts[STEM_ELEMENT[p.stem]]++;
    counts[BRANCH_ELEMENT[p.branch]]++;
  }
  return counts;
}

const pairKey = (a, b) => [a, b].sort((x, y) => x - y).join("-");
const pairSet = (pairs) => new Set(pairs.map(([a, b]) => pairKey(a, b)));

const YUKHAP = pairSet([[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]]); // 육합
const CHUNG = pairSet([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]); // 충
const WONJIN = pairSet([[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]]); // 원진
const SAMHAP = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]]; // 申子辰, 寅午戌, 巳酉丑, 亥卯未
const STEM_HAP = pairSet([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]); // 천간합

function zodiacCompat(a, b) {
  const key = pairKey(a, b);
  if (a === b) return { score: 5, label: "같은 띠", desc: "가치관이 비슷해 편안하지만 고집이 부딪힐 수 있어요." };
  if (YUKHAP.has(key)) return { score: 20, label: "육합", desc: "서로 끌어당기는 최고의 띠 궁합이에요." };
  if (SAMHAP.some((g) => g.includes(a) && g.includes(b)))
    return { score: 15, label: "삼합", desc: "목표가 같아 함께할수록 힘이 되는 사이예요." };
  if (CHUNG.has(key)) return { score: -15, label: "충", desc: "성향이 정반대라 부딪히기 쉬워요. 서로의 다름을 인정하는 게 중요해요." };
  if (WONJIN.has(key)) return { score: -10, label: "원진", desc: "이유 없이 서운함이 쌓일 수 있어요. 대화로 자주 풀어주세요." };
  return { score: 0, label: "보통", desc: "특별한 합도 충도 없는 무난한 관계예요." };
}

function dayMasterCompat(a, b) {
  const ea = STEM_ELEMENT[a];
  const eb = STEM_ELEMENT[b];
  if (STEM_HAP.has(pairKey(a, b)))
    return { score: 20, label: "천간합", desc: "본성이 서로 맞물리는 인연이에요. 자연스럽게 마음이 통해요." };
  if ((ea + 1) % 5 === eb || (eb + 1) % 5 === ea)
    return { score: 10, label: "상생", desc: `${ELEMENTS[ea]}와 ${ELEMENTS[eb]}가 서로를 살려주는 관계예요.` };
  if (ea === eb) return { score: 5, label: "비화", desc: "같은 기운이라 친구처럼 편한 사이예요." };
  return { score: -10, label: "상극", desc: `${ELEMENTS[ea]}와 ${ELEMENTS[eb]}가 서로를 누르는 관계라 배려가 필요해요.` };
}

function elementBalance(ca, cb) {
  let score = 0;
  const filled = [];
  for (let i = 0; i < 5; i++) {
    if ((ca[i] === 0 && cb[i] >= 2) || (cb[i] === 0 && ca[i] >= 2)) {
      score += 5;
      filled.push(ELEMENTS[i]);
    }
  }
  score = Math.min(score, 15);
  const desc = filled.length
    ? `상대에게 부족한 ${filled.join("·")} 기운을 서로 채워줘요.`
    : "오행을 서로 보완해주는 부분은 크지 않아요.";
  return { score, label: filled.length ? "보완" : "보통", desc };
}

function sajuCompat(dateA, dateB) {
  const pa = getPillars(dateA);
  const pb = getPillars(dateB);
  const zodiac = zodiacCompat(pa.year.branch, pb.year.branch);
  const dayMaster = dayMasterCompat(pa.day.stem, pb.day.stem);
  const balance = elementBalance(countElements(pa), countElements(pb));
  const score = clamp(50 + zodiac.score + dayMaster.score + balance.score);
  return { score, pillars: [pa, pb], zodiac, dayMaster, balance };
}

// ---------- 혈액형 ----------

const BLOOD_TABLE = {
  "A-A": [80, "섬세하고 배려심 깊은 두 사람. 안정적이지만 속마음을 표현하는 연습이 필요해요."],
  "A-B": [50, "계획적인 A와 자유로운 B. 서로 답답해할 수 있지만 맞춰가면 좋은 자극이 돼요."],
  "A-O": [90, "든든한 O가 섬세한 A를 리드해주는 찰떡 궁합이에요."],
  "A-AB": [70, "이성적인 대화가 잘 통해요. 감정 표현을 조금 더 해주면 좋아요."],
  "B-B": [75, "취미와 텐션이 잘 맞는 친구 같은 커플. 서로 자유를 존중해요."],
  "B-O": [80, "O의 포용력이 B의 자유로움을 받아줘서 편안한 관계예요."],
  "B-AB": [85, "개성 강한 두 사람이 서로를 흥미롭게 여겨요."],
  "O-O": [70, "둘 다 리더형이라 주도권 다툼만 조심하면 든든한 커플이에요."],
  "O-AB": [60, "현실적인 O와 독특한 AB. 서로의 방식을 이해하는 시간이 필요해요."],
  "AB-AB": [75, "말하지 않아도 통하는 4차원 커플. 둘만의 세계가 확실해요."],
};
const BLOOD_ORDER = ["A", "B", "O", "AB"];

function bloodCompat(a, b) {
  const key = [a, b].sort((x, y) => BLOOD_ORDER.indexOf(x) - BLOOD_ORDER.indexOf(y)).join("-");
  const [score, desc] = BLOOD_TABLE[key];
  return { score, desc };
}

// ---------- 체격 (키·몸무게) ----------
// 성별을 받지 않으므로 키는 차이의 크기만, 몸무게는 BMI 차이로 생활 패턴의 비슷함을 봅니다.

const HEIGHT_TABLE = [
  // [최대 키 차이(cm), 점수, 라벨, 설명]
  [3, 80, "눈높이 커플", "눈높이가 거의 같아 친구처럼 편하게 마주 볼 수 있어요."],
  [8, 90, "다정한 키 차이", "나란히 걸을 때 보기 좋은 자연스러운 키 차이예요."],
  [15, 100, "황금 키 차이", "포옹하기 딱 좋은 설렘 가득한 키 차이예요."],
  [20, 85, "든든한 키 차이", "한쪽이 든든하게 감싸주는 느낌을 주는 키 차이예요."],
  [25, 75, "확실한 키 차이", "키 차이가 커서 사진 찍을 때 각도 연구가 필요해요."],
  [Infinity, 65, "개성 있는 키 차이", "눈에 띄는 키 차이만큼 서로를 특별하게 기억할 거예요."],
];

const BMI_TABLE = [
  // [최대 BMI 차이, 점수, 라벨, 설명]
  [2, 95, "닮은 생활 리듬", "식습관과 활동량이 비슷할 가능성이 높아 데이트 코스 고르기가 쉬워요."],
  [4, 85, "비슷한 생활 리듬", "생활 패턴이 대체로 잘 맞아 함께하는 시간이 편해요."],
  [6, 75, "조금 다른 리듬", "먹는 것, 노는 것 취향이 조금 달라 서로에게 새로운 경험을 줘요."],
  [Infinity, 65, "서로 다른 리듬", "생활 패턴이 달라 맞춰가는 재미가 있는 커플이에요."],
];

function bmi(height, weight) {
  const m = height / 100;
  return weight / (m * m);
}

function lookup(table, value) {
  const [, score, label, desc] = table.find(([max]) => value <= max);
  return { score, label, desc };
}

function bodyCompat(a, b) {
  const heightDiff = Math.abs(a.height - b.height);
  const bmiDiff = Math.abs(bmi(a.height, a.weight) - bmi(b.height, b.weight));
  const height = { ...lookup(HEIGHT_TABLE, heightDiff), diff: Math.round(heightDiff * 10) / 10 };
  const bmiResult = { ...lookup(BMI_TABLE, bmiDiff), diff: Math.round(bmiDiff * 10) / 10 };
  const score = Math.round(height.score * 0.6 + bmiResult.score * 0.4);
  return { score, height, bmi: bmiResult };
}

// ---------- MBTI ----------
// 지표별 점수: 대화 코드(S/N)는 같을수록, 에너지(E/I)·판단(T/F)은 다를수록 보완된다고 봅니다.

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
];

// 흔히 알려진 MBTI 천생연분 조합
const MBTI_BEST = new Set(
  [
    ["INFP", "ENFJ"], ["INFP", "ENTJ"], ["ENFP", "INFJ"], ["ENFP", "INTJ"],
    ["INFJ", "ENTP"], ["INTJ", "ENTP"], ["INTP", "ENTJ"], ["INTP", "ESTJ"],
    ["ISFP", "ENFJ"], ["ISFP", "ESFJ"], ["ISFP", "ESTJ"], ["ISTP", "ESFJ"],
    ["ISTP", "ESTJ"], ["ESFP", "ISFJ"], ["ESFP", "ISTJ"], ["ESTP", "ISFJ"],
    ["ESTP", "ISTJ"],
  ].map((p) => p.sort().join("-"))
);

// 가장 높은 점수(100점)를 주는 조합
const MBTI_TOP = ["ISFP", "ENTJ"].sort().join("-");

const MBTI_DIMENSIONS = [
  // [인덱스, 같을 때 점수, 다를 때 점수, 같을 때 설명, 다를 때 설명]
  [1, 15, -15, "세상을 보는 방식이 같아 대화가 잘 통해요", "관심사가 달라 대화 주제를 맞춰가는 노력이 필요해요"],
  [0, 0, 10, "에너지 쓰는 방식이 비슷해 데이트 취향이 맞아요", "한 명은 이끌고 한 명은 들어주는 균형 잡힌 사이예요"],
  [2, 5, 8, "판단 기준이 같아 갈등이 적어요", "이성과 감성이 서로를 보완해줘요"],
  [3, 4, 3, "생활 방식이 비슷해 함께 지내기 편해요", "계획파와 즉흥파라 여행 스타일은 미리 맞춰보세요"],
];

function mbtiCompat(a, b) {
  let score = 60;
  const notes = [];
  for (const [i, same, diff, sameDesc, diffDesc] of MBTI_DIMENSIONS) {
    const isSame = a[i] === b[i];
    score += isSame ? same : diff;
    notes.push(isSame ? sameDesc : diffDesc);
  }
  const key = [a, b].sort().join("-");
  const top = key === MBTI_TOP;
  const best = MBTI_BEST.has(key);
  if (top) score = 100;
  else if (best) score = Math.max(score, 95);
  score = clamp(score);

  let label = "보통";
  if (top) label = "최고의 궁합";
  else if (best) label = "천생연분";
  else if (score >= 85) label = "잘 맞음";
  else if (score >= 70) label = "좋음";
  else if (score < 60) label = "노력 필요";

  return { score, label, desc: notes.slice(0, 2).join(". ") + ".", notes };
}

// ---------- 종합 ----------

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function grade(score) {
  if (score >= 85) return "천생연분 💘";
  if (score >= 70) return "아주 좋은 궁합 💖";
  if (score >= 55) return "무난한 궁합 💗";
  if (score >= 40) return "노력이 필요한 궁합 🤝";
  return "서로의 이해가 중요한 궁합 🌱";
}

// 가중치: 사주 45%, MBTI 25%, 혈액형 15%, 체격 15%
function calcCompatibility(me, partner) {
  const saju = sajuCompat(me.birth, partner.birth);
  const mbti = mbtiCompat(me.mbti, partner.mbti);
  const blood = bloodCompat(me.blood, partner.blood);
  const body = bodyCompat(me, partner);
  let total = Math.round(saju.score * 0.45 + mbti.score * 0.25 + blood.score * 0.15 + body.score * 0.15);
  // MBTI_TOP 조합은 다른 항목과 관계없이 종합 100점 (다른 조합의 최대치는 97점)
  if ([me.mbti, partner.mbti].sort().join("-") === MBTI_TOP) total = 100;
  return { total, grade: grade(total), saju, mbti, blood, body };
}

if (typeof module !== "undefined") {
  module.exports = { MBTI_TYPES, getPillars, pillarText, sajuCompat, mbtiCompat, bloodCompat, bodyCompat, calcCompatibility };
}
