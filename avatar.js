// 사주 기반 아바타: 내 사주에서 가장 부족한 오행을 채워줄 매력의 이성(상대 성별) 아바타가 등장해 멘트를 합니다.
// compat.js 의 STEM_ELEMENT, countElements, ELEMENTS 를 사용합니다.

const AVATARS = {
  male: [
    {
      element: 0, type: "다정한 문학 소년", charm: "따뜻한 눈빛과 섬세한 배려",
      hair: "#5b3a29", outfit: "#6fbf73", bg: "#e3f5e1", accessory: "leaf",
      intro: "안녕하세요. 오늘 하늘이 예뻐서… 당신 생각이 났어요.",
      high: "궁합 {score}점이래요. 이 숫자, 시집 첫 페이지에 적어두고 싶어요.",
      mid: "{score}점이네요. 천천히 서로를 읽어가면 더 좋은 이야기가 될 거예요.",
      low: "{score}점… 괜찮아요. 좋은 책도 처음엔 어렵잖아요.",
      outro: "당신에게 부족한 목(木) 기운, 제가 봄바람처럼 채워줄게요.",
    },
    {
      element: 1, type: "열정적인 리더형", charm: "자신감 넘치는 추진력",
      hair: "#2b1b17", outfit: "#e8574a", bg: "#fde3df", accessory: "none",
      intro: "어이, 거기! 그래, 너. 오늘부터 나랑 같이 가자.",
      high: "{score}점? 역시 내 눈은 틀리지 않았어. 우린 무조건 된다!",
      mid: "{score}점이면 충분해. 나머지는 내가 열정으로 채울게!",
      low: "{score}점? 숫자는 숫자일 뿐. 난 포기 같은 거 몰라.",
      outro: "네게 부족한 화(火) 기운, 내가 활활 불태워 줄게!",
    },
    {
      element: 2, type: "듬직한 곰돌이형", charm: "한결같은 믿음직함",
      hair: "#4a3424", outfit: "#c9945a", bg: "#f6ead9", accessory: "none",
      intro: "어… 안녕. 밥은 먹었어? 안 먹었으면 같이 먹자.",
      high: "{score}점이래. 나 원래 말 잘 못하는데… 진짜 좋다.",
      mid: "{score}점. 나는 오래 보는 사람이라, 점점 더 좋아질 거야.",
      low: "{score}점이어도 괜찮아. 내가 묵묵히 옆에 있을게.",
      outro: "너한테 부족한 토(土) 기운, 내가 든든한 땅이 되어줄게.",
    },
    {
      element: 3, type: "시크한 차도남", charm: "말보다 행동으로 보여주는 반전 매력",
      hair: "#1e1e24", outfit: "#8a93a6", bg: "#e8ebf1", accessory: "earring",
      intro: "…뭘 그렇게 봐. 그냥, 신경 쓰여서 와봤어.",
      high: "{score}점. …뭐, 나쁘지 않네. 아니, 사실 꽤 좋아.",
      mid: "{score}점이면 해볼 만하지. 난 대충 하는 거 안 해.",
      low: "{score}점? 상관없어. 내가 정한 사람은 내가 지켜.",
      outro: "네게 부족한 금(金) 기운. 날카롭게, 확실하게 채워줄게.",
    },
    {
      element: 4, type: "지적인 감성남", charm: "깊은 대화와 차분한 공감",
      hair: "#2a2f3d", outfit: "#4f7fd1", bg: "#e0eafb", accessory: "glasses",
      intro: "흥미롭네요. 당신 같은 사람은 처음 분석해봐요.",
      high: "궁합 {score}점. 통계적으로도 운명이라 부를 만한 수치예요.",
      mid: "{score}점이군요. 변수가 많을수록 결과는 더 흥미로워지죠.",
      low: "{score}점. 하지만 데이터가 전부는 아니라는 걸, 당신이 증명해줬으면 해요.",
      outro: "당신에게 부족한 수(水) 기운, 깊은 바다처럼 채워줄게요.",
    },
  ],
  female: [
    {
      element: 0, type: "싱그러운 청순형", charm: "맑은 미소와 다정한 말투",
      hair: "#4a2e22", outfit: "#7ccf87", bg: "#e3f5e1", accessory: "leaf",
      intro: "안녕하세요! 오늘 날씨 같은 분이 오셨네요. 🌿",
      high: "우리 궁합 {score}점이래요! 꽃이 피는 것 같은 기분이에요.",
      mid: "{score}점이에요. 물 주고 햇빛 주면 쑥쑥 자랄 거예요!",
      low: "{score}점… 그래도 새싹은 원래 작게 시작하잖아요?",
      outro: "부족한 목(木) 기운, 제가 싱그럽게 채워드릴게요.",
    },
    {
      element: 1, type: "밝은 에너지 걸", charm: "주변을 환하게 만드는 텐션",
      hair: "#7a2e1f", outfit: "#ff7a6b", bg: "#fde3df", accessory: "ribbon",
      intro: "짜잔~! 기다렸지? 나 왔어! ✨",
      high: "꺄 {score}점!! 우리 완전 찰떡이잖아! 오늘 축하 파티 해!",
      mid: "{score}점! 좋아좋아, 나머진 내가 텐션으로 올려줄게!",
      low: "{score}점? 에이~ 재미는 지금부터라구!",
      outro: "네 부족한 화(火) 기운, 내가 반짝반짝 채워줄게!",
    },
    {
      element: 2, type: "따뜻한 힐링형", charm: "곁에 있으면 편안해지는 포근함",
      hair: "#6b4a33", outfit: "#e0b27a", bg: "#f6ead9", accessory: "none",
      intro: "오늘 하루 고생 많았죠? 이리 와서 좀 쉬어요.",
      high: "{score}점이래요. 같이 있으면 마음이 편해지는 이유가 있었네요.",
      mid: "{score}점이에요. 천천히, 따뜻하게 맞춰가요 우리.",
      low: "{score}점이어도 괜찮아요. 제가 기다려줄게요.",
      outro: "부족한 토(土) 기운, 제가 포근하게 감싸드릴게요.",
    },
    {
      element: 3, type: "도도한 시크형", charm: "쉽게 다가갈 수 없는 우아함",
      hair: "#141418", outfit: "#9aa3b5", bg: "#e8ebf1", accessory: "earring",
      intro: "…당신이 그 사람이에요? 생각보다 괜찮네.",
      high: "{score}점. 흠, 인정할게. 우리 꽤 잘 어울려.",
      mid: "{score}점이라… 나쁘지 않아. 나를 더 알아볼 기회를 줄게.",
      low: "{score}점? 그럼 나를 설득해봐. 기대할게.",
      outro: "당신에게 부족한 금(金) 기운, 내가 반짝이게 채워줄게.",
    },
    {
      element: 4, type: "신비로운 지성형", charm: "알면 알수록 깊어지는 매력",
      hair: "#26324a", outfit: "#5a8be0", bg: "#e0eafb", accessory: "glasses",
      intro: "당신을 기다리고 있었어요. 별자리가 그렇게 말하더라고요.",
      high: "{score}점. 이건 우연이 아니라 필연이에요.",
      mid: "{score}점이네요. 아직 모르는 당신이 더 궁금해져요.",
      low: "{score}점. 하지만 운명은 숫자보다 깊은 곳에 있어요.",
      outro: "부족한 수(水) 기운, 제가 잔잔한 물결처럼 채워드릴게요.",
    },
  ],
};

// 내 사주(연·월·일주)에서 가장 적은 오행. 동률이면 일간을 생(生)해주는 오행을 우선.
function pickAvatarElement(pillars) {
  const counts = countElements(pillars);
  const min = Math.min(...counts);
  const candidates = counts.map((c, i) => (c === min ? i : -1)).filter((i) => i >= 0);
  const supporter = (STEM_ELEMENT[pillars.day.stem] + 4) % 5;
  return candidates.includes(supporter) ? supporter : candidates[0];
}

function pickAvatar(gender, pillars) {
  const element = pickAvatarElement(pillars);
  return AVATARS[gender].find((a) => a.element === element);
}

function avatarLines(avatar, score) {
  const tier = score >= 80 ? "high" : score >= 60 ? "mid" : "low";
  return [avatar.intro, avatar[tier].replace("{score}", score), avatar.outro];
}

function avatarSVG(avatar, gender) {
  const skin = "#ffe0c7";
  const longHairBack = gender === "female"
    ? `<path d="M42 112 Q36 36 100 34 Q164 36 158 112 L164 196 Q134 206 120 178 L80 178 Q66 206 36 196 Z" fill="${avatar.hair}"/>`
    : "";
  const fringe = gender === "female"
    ? `<path d="M50 104 Q46 42 100 40 Q154 42 150 104 Q136 66 104 70 Q78 62 50 104 Z" fill="${avatar.hair}"/>`
    : `<path d="M50 106 Q44 36 100 34 Q156 36 150 106 Q146 76 128 68 Q110 82 80 72 Q60 80 50 106 Z" fill="${avatar.hair}"/>`;

  const accessories = {
    none: "",
    leaf: `<path d="M134 52 q14 -16 26 -6 q-10 16 -26 6 Z" fill="#4caf50"/><path d="M134 52 l20 -8" stroke="#2e7d32" stroke-width="1.5"/>`,
    ribbon: `<path d="M120 46 l18 -12 l2 20 Z M120 46 l22 6 l-14 12 Z" fill="#ff4d6d"/><circle cx="122" cy="48" r="5" fill="#d6334f"/>`,
    earring: `<circle cx="52" cy="126" r="4" fill="#d9dde6" stroke="#7a8296" stroke-width="1.5"/><circle cx="148" cy="126" r="4" fill="#d9dde6" stroke="#7a8296" stroke-width="1.5"/>`,
    glasses: `<g fill="none" stroke="#2b2b33" stroke-width="3"><circle cx="80" cy="110" r="13"/><circle cx="120" cy="110" r="13"/><path d="M93 110 h14"/></g>`,
  };

  return `
  <svg viewBox="0 0 200 240" class="avatar-svg" aria-hidden="true">
    <circle cx="100" cy="120" r="96" fill="${avatar.bg}"/>
    ${longHairBack}
    <path d="M40 240 Q44 178 100 176 Q156 178 160 240 Z" fill="${avatar.outfit}"/>
    <rect x="88" y="150" width="24" height="30" rx="10" fill="${skin}"/>
    <ellipse cx="100" cy="108" rx="48" ry="54" fill="${skin}"/>
    ${fringe}
    <g class="eyes">
      <ellipse cx="80" cy="112" rx="5" ry="7" fill="#2b2b33"/>
      <ellipse cx="120" cy="112" rx="5" ry="7" fill="#2b2b33"/>
      <circle cx="82" cy="109" r="1.8" fill="#fff"/>
      <circle cx="122" cy="109" r="1.8" fill="#fff"/>
    </g>
    <ellipse cx="70" cy="130" rx="8" ry="4.5" fill="#ff9aa8" opacity="0.6"/>
    <ellipse cx="130" cy="130" rx="8" ry="4.5" fill="#ff9aa8" opacity="0.6"/>
    <path class="mouth" d="M90 136 Q100 146 110 136" fill="none" stroke="#c0504d" stroke-width="3" stroke-linecap="round"/>
    ${accessories[avatar.accessory]}
  </svg>`;
}
