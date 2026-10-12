// 연애 리포트: 사주 계산 결과로 직접 작성한 풀이 문구를 고릅니다.
// compat.js 의 STEM_ELEMENT, pairKey, STEM_HAP 을 사용합니다.

// 1장. 일간 오행별 연애 스타일
const LOVE_STYLE = [
  {
    title: "새싹처럼 천천히 자라는 사랑",
    body: "처음엔 조심스럽지만 한번 마음을 열면 꾸준히 깊어지는 타입이에요. 상대가 더 나은 사람이 되도록 진심으로 응원하고, '함께 성장하는 관계'에서 가장 큰 행복을 느껴요.",
    caution: "상대를 내 방식대로 바꾸려 하기보다 지금 모습 그대로 봐주는 연습이 필요해요.",
  },
  {
    title: "망설임 없는 직진 로맨스",
    body: "좋으면 좋다고 바로 말하는 솔직한 타입이에요. 표현이 풍부하고 이벤트를 좋아해서, 함께 있으면 상대가 '사랑받고 있다'는 걸 확실히 느껴요.",
    caution: "뜨겁게 시작한 만큼 빨리 식을 수 있어요. 처음의 속도보다 오래가는 페이스를 신경 써 주세요.",
  },
  {
    title: "흔들리지 않는 든든한 사랑",
    body: "화려한 말보다 한결같은 행동으로 마음을 보여주는 타입이에요. 약속을 잘 지키고 상대에게 편안한 안식처가 되어 주어서, 오래 만날수록 진가가 드러나요.",
    caution: "마음은 깊은데 표현이 부족해 오해를 살 수 있어요. 가끔은 말로 '좋아해'를 꼭 전해 주세요.",
  },
  {
    title: "선이 분명한 의리파 사랑",
    body: "애매한 관계보다 확실한 관계를 원하는 타입이에요. 한번 내 사람이라 정하면 끝까지 지키는 의리가 있고, 연애에서도 신뢰와 원칙을 가장 중요하게 여겨요.",
    caution: "옳고 그름을 따지다 보면 말이 날카로워질 수 있어요. 맞는 말보다 따뜻한 말이 필요한 순간도 있어요.",
  },
  {
    title: "깊은 바다 같은 감성 사랑",
    body: "상대의 감정을 누구보다 빨리 알아채는 공감형이에요. 대화가 잘 통하는 사람에게 끌리고, 마음이 통했다고 느끼면 아주 깊이 사랑해요.",
    caution: "혼자 생각이 많아져 서운함을 쌓아두기 쉬워요. 고민은 마음속에 두지 말고 상대와 나눠 주세요.",
  },
];

// 2장. 나 → 상대 일간 오행 관계별 케미
const CHEMISTRY = {
  same: {
    title: "친구 같은 연인",
    body: "같은 기운을 가진 두 사람이라 취향과 생각이 비슷해요. 말하지 않아도 통하는 편안함이 가장 큰 장점이에요.",
    tip: "너무 편해서 설렘이 줄어들 수 있으니, 가끔은 새로운 데이트로 분위기를 바꿔 보세요.",
  },
  give: {
    title: "내가 아낌없이 주는 관계",
    body: "내 기운이 상대를 살려주는 관계예요. 상대는 당신 곁에서 힘을 얻고, 당신은 상대가 잘되는 모습에서 보람을 느껴요.",
    tip: "주기만 하다 지치지 않도록, 필요한 건 솔직하게 부탁해도 괜찮아요.",
  },
  receive: {
    title: "상대가 나를 채워주는 관계",
    body: "상대의 기운이 당신을 살려주는 관계예요. 함께 있으면 마음이 안정되고, 상대 덕분에 더 좋은 사람이 되어 가요.",
    tip: "받는 사랑에 익숙해지지 않도록 고마움을 자주 표현해 주세요.",
  },
  lead: {
    title: "내가 이끄는 관계",
    body: "당신의 기운이 상대를 다잡아 주는 관계예요. 결정이 필요할 때 당신이 방향을 잡아 주면 관계가 단단해져요.",
    tip: "리드가 강요가 되지 않도록 상대의 의견을 먼저 물어봐 주세요.",
  },
  follow: {
    title: "상대가 이끄는 관계",
    body: "상대의 기운이 당신을 다잡아 주는 관계예요. 상대의 추진력 덕분에 혼자서는 못 하던 일에 도전하게 돼요.",
    tip: "서운한 점이 생기면 참지 말고 부드럽게 말해야 균형이 맞아요.",
  },
};
const STEM_HAP_TEXT = "게다가 두 사람의 일간이 천간합을 이뤄요. 처음 만났을 때부터 묘하게 끌리는 인연이에요.";

// 3장. 부족한 오행을 채우는 행운의 데이트
const LUCKY_DATE = [
  { color: "초록", place: "공원·식물원 산책", food: "샐러드 브런치", item: "작은 화분" },
  { color: "레드·핑크", place: "야경 명소, 루프탑", food: "바비큐·매운 음식", item: "향초" },
  { color: "베이지·옐로", place: "도자기 공방, 시골 카페", food: "따뜻한 한식", item: "손편지" },
  { color: "화이트·실버", place: "전시회·미술관", food: "깔끔한 오마카세", item: "실버 액세서리" },
  { color: "네이비·블랙", place: "바다·수족관", food: "해산물, 따뜻한 차", item: "향수" },
];

function elementRelation(me, partner) {
  if (me === partner) return "same";
  if ((me + 1) % 5 === partner) return "give";
  if ((partner + 1) % 5 === me) return "receive";
  if ((me + 2) % 5 === partner) return "lead";
  return "follow";
}

function buildReport(pa, pb, avatarElement) {
  const myEl = STEM_ELEMENT[pa.day.stem];
  const partnerEl = STEM_ELEMENT[pb.day.stem];

  const chem = CHEMISTRY[elementRelation(myEl, partnerEl)];
  const hap = STEM_HAP.has(pairKey(pa.day.stem, pb.day.stem));

  return {
    style: { element: myEl, ...LOVE_STYLE[myEl] },
    chemistry: { ...chem, hap, hapText: hap ? STEM_HAP_TEXT : "" },
    lucky: { element: avatarElement, ...LUCKY_DATE[avatarElement] },
  };
}

// ---------- 솔로: 나와 잘 맞는 사람 ----------
// compat.js 의 YUKHAP, SAMHAP, ANIMALS, STEMS, STEMS_KO, mbtiCompat, bloodCompat, MBTI_TYPES, BLOOD_ORDER 를 사용합니다.

function idealMatch(me, pa, targetGender) {
  const myBranch = pa.year.branch;
  const zodiac = [];
  for (let b = 0; b < 12; b++) {
    if (b === myBranch) continue;
    if (YUKHAP.has(pairKey(myBranch, b))) zodiac.unshift({ animal: ANIMALS[b], label: "육합" });
    else if (SAMHAP.some((g) => g.includes(myBranch) && g.includes(b))) zodiac.push({ animal: ANIMALS[b], label: "삼합" });
  }

  const hapStem = (pa.day.stem + 5) % 10; // 천간합 짝
  const mbti = MBTI_TYPES
    .map((t) => ({ type: t, score: mbtiCompat(me.mbti, t).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const blood = BLOOD_ORDER
    .map((t) => ({ type: t, score: bloodCompat(me.blood, t).score }))
    .sort((a, b) => b.score - a.score)[0];

  // 황금 키 차이(8~15cm) 기준. 같은 성별이거나 반대 방향이면 ±8cm
  let height;
  if (me.gender === "female" && targetGender === "male") height = `${me.height + 8}~${me.height + 15}cm`;
  else if (me.gender === "male" && targetGender === "female") height = `${me.height - 15}~${me.height - 8}cm`;
  else height = `${me.height - 8}~${me.height + 8}cm`;

  return {
    zodiac,
    dayMaster: `${STEMS[hapStem]}(${STEMS_KO[hapStem]}) 일간`,
    mbti,
    blood,
    height,
  };
}

// ---------- 솔로: 인연 매력 지수 ----------
// 연·월·일주 6글자의 오행 분포와 도화(子午卯酉)로 계산. 솔로 등급 문구는 모두 긍정적으로.
// 점수 범위는 대략 61~87점이라 등급 기준을 분포(상위 15% / 35% / 35% / 15%)에 맞춤.
const DOHWA = [0, 6, 3, 9]; // 子 午 卯 酉

function soloCharm(pa) {
  const c = countElements(pa);
  const dohwa = [pa.year, pa.month, pa.day].filter((p) => DOHWA.includes(p.branch)).length;
  const distinct = c.filter((n) => n > 0).length;
  const score = (v) => Math.max(40, Math.min(100, v));

  const items = [
    { label: "매력", score: score(55 + dohwa * 12 + c[1] * 6) },
    { label: "다정함", score: score(50 + (c[0] + c[4]) * 10) },
    { label: "안정감", score: score(50 + (c[2] + c[3]) * 10) },
    { label: "오행 균형", score: score(25 + distinct * 15) },
  ];
  const total = Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);

  let grade = "숨은 매력이 많은 사주 🌱";
  if (total >= 81) grade = "인연이 줄을 서는 사주 💘";
  else if (total >= 76) grade = "매력이 넘치는 사주 💖";
  else if (total >= 71) grade = "천천히 빛나는 사주 💗";

  return { total, grade, items, dohwa };
}
