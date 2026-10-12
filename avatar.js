// 사주 기반 아바타: 내 사주에서 가장 부족한 오행을 채워줄 매력의 캐릭터가 등장해 멘트를 합니다.
// compat.js 의 STEM_ELEMENT, countElements 와 anime-avatar.js 의 animeAvatarSVG 를 사용합니다.

const AVATARS = {
  male: [
    {
      element: 0, type: "다정한 문학 소년", charm: "따뜻한 눈빛과 섬세한 배려",
      art: { backHair: "short", bangs: "soft", hair: "#6b4630", hairLight: "#a87a58", eye: "#3f9a6a", outfit: "#6fbf8a", outfitLight: "#a6e0b8", bg: "#cdeed6", accessory: "leaf" },
      intro: "안녕하세요. 오늘 하늘이 예뻐서… 당신 생각이 났어요.",
      high: "궁합 {score}점이래요. 이 숫자, 시집 첫 페이지에 적어두고 싶어요.",
      mid: "{score}점이네요. 천천히 서로를 읽어가면 더 좋은 이야기가 될 거예요.",
      low: "{score}점… 괜찮아요. 좋은 책도 처음엔 어렵잖아요.",
      solo: "당신 사주가 부르는 사람은 조용히 곁을 지켜주는 사람이에요. 저처럼요.",
      outro: "당신에게 부족한 목(木) 기운, 제가 봄바람처럼 채워줄게요.",
    },
    {
      element: 1, type: "열정적인 리더형", charm: "자신감 넘치는 추진력",
      art: { backHair: "short", bangs: "spiky", hair: "#5a1f1f", hairLight: "#b0403a", eye: "#d9534f", outfit: "#e8574a", outfitLight: "#ff9a8a", bg: "#ffd6d0", accessory: "none" },
      intro: "어이, 거기! 그래, 너. 오늘부터 나랑 같이 가자.",
      high: "{score}점? 역시 내 눈은 틀리지 않았어. 우린 무조건 된다!",
      mid: "{score}점이면 충분해. 나머지는 내가 열정으로 채울게!",
      low: "{score}점? 숫자는 숫자일 뿐. 난 포기 같은 거 몰라.",
      solo: "네 사주엔 확 끌어당겨 줄 사람이 필요해. 망설이는 너 대신 먼저 손 내밀 사람!",
      outro: "네게 부족한 화(火) 기운, 내가 활활 불태워 줄게!",
    },
    {
      element: 2, type: "듬직한 곰돌이형", charm: "한결같은 믿음직함",
      art: { backHair: "short", bangs: "fluffy", hair: "#7a5232", hairLight: "#c08c5a", eye: "#a8722f", outfit: "#c9945a", outfitLight: "#ecc797", bg: "#f6e4c8", accessory: "none" },
      intro: "어… 안녕. 밥은 먹었어? 안 먹었으면 같이 먹자.",
      high: "{score}점이래. 나 원래 말 잘 못하는데… 진짜 좋다.",
      mid: "{score}점. 나는 오래 보는 사람이라, 점점 더 좋아질 거야.",
      low: "{score}점이어도 괜찮아. 내가 묵묵히 옆에 있을게.",
      solo: "네 사주엔 흔들릴 때 기댈 수 있는 사람이 맞대. 말보다 행동으로 챙겨주는 사람.",
      outro: "너한테 부족한 토(土) 기운, 내가 든든한 땅이 되어줄게.",
    },
    {
      element: 3, type: "시크한 차도남", charm: "말보다 행동으로 보여주는 반전 매력",
      art: { backHair: "short", bangs: "side", hair: "#26262e", hairLight: "#6b6f82", eye: "#7d86a8", outfit: "#5b6275", outfitLight: "#9aa3b5", bg: "#e1e5ef", accessory: "earring" },
      intro: "…뭘 그렇게 봐. 그냥, 신경 쓰여서 와봤어.",
      high: "{score}점. …뭐, 나쁘지 않네. 아니, 사실 꽤 좋아.",
      mid: "{score}점이면 해볼 만하지. 난 대충 하는 거 안 해.",
      low: "{score}점? 상관없어. 내가 정한 사람은 내가 지켜.",
      solo: "네 사주엔 선이 분명한 사람이 맞아. 무심한 척해도 결국 네 편인 사람.",
      outro: "네게 부족한 금(金) 기운. 날카롭게, 확실하게 채워줄게.",
    },
    {
      element: 4, type: "지적인 감성남", charm: "깊은 대화와 차분한 공감",
      art: { backHair: "short", bangs: "part", hair: "#2a3550", hairLight: "#56709e", eye: "#3f7fd8", outfit: "#4f7fd1", outfitLight: "#9ec0f5", bg: "#d6e5fb", accessory: "glasses" },
      intro: "흥미롭네요. 당신 같은 사람은 처음 분석해봐요.",
      high: "궁합 {score}점. 통계적으로도 운명이라 부를 만한 수치예요.",
      mid: "{score}점이군요. 변수가 많을수록 결과는 더 흥미로워지죠.",
      low: "{score}점. 하지만 데이터가 전부는 아니라는 걸, 당신이 증명해줬으면 해요.",
      solo: "당신 사주는 밤새 이야기 나눌 수 있는 사람을 원해요. 마음의 결이 닮은 사람이요.",
      outro: "당신에게 부족한 수(水) 기운, 깊은 바다처럼 채워줄게요.",
    },
  ],
  female: [
    {
      element: 0, type: "싱그러운 청순형", charm: "맑은 미소와 다정한 말투",
      art: { backHair: "long", bangs: "seethrough", hair: "#6b4630", hairLight: "#b5876a", eye: "#3f9a6a", outfit: "#7ccf87", outfitLight: "#c4f0cb", bg: "#cdeed6", accessory: "flower" },
      intro: "안녕하세요! 오늘 날씨 같은 분이 오셨네요. 🌿",
      high: "우리 궁합 {score}점이래요! 꽃이 피는 것 같은 기분이에요.",
      mid: "{score}점이에요. 물 주고 햇빛 주면 쑥쑥 자랄 거예요!",
      low: "{score}점… 그래도 새싹은 원래 작게 시작하잖아요?",
      solo: "당신 사주에는 곁에 있으면 마음이 맑아지는 사람이 어울려요. 저 같은 사람이요!",
      outro: "부족한 목(木) 기운, 제가 싱그럽게 채워드릴게요.",
    },
    {
      element: 1, type: "밝은 에너지 걸", charm: "주변을 환하게 만드는 텐션",
      art: { backHair: "twin", bangs: "seethrough", hair: "#c2462e", hairLight: "#ff8a5c", eye: "#e0574f", outfit: "#ff7a6b", outfitLight: "#ffc2b8", bg: "#ffd6d0", accessory: "ribbon" },
      intro: "짜잔~! 기다렸지? 나 왔어! ✨",
      high: "꺄 {score}점!! 우리 완전 찰떡이잖아! 오늘 축하 파티 해!",
      mid: "{score}점! 좋아좋아, 나머진 내가 텐션으로 올려줄게!",
      low: "{score}점? 에이~ 재미는 지금부터라구!",
      solo: "네 사주엔 매일을 축제로 만들어 줄 사람이 필요해! 웃음 많은 사람 꼭 잡아!",
      outro: "네 부족한 화(火) 기운, 내가 반짝반짝 채워줄게!",
    },
    {
      element: 2, type: "따뜻한 힐링형", charm: "곁에 있으면 편안해지는 포근함",
      art: { backHair: "braid", bangs: "swept", hair: "#8a5a36", hairLight: "#d4a274", eye: "#b07a3c", outfit: "#e0b27a", outfitLight: "#f7dfba", bg: "#f6e4c8", accessory: "none" },
      intro: "오늘 하루 고생 많았죠? 이리 와서 좀 쉬어요.",
      high: "{score}점이래요. 같이 있으면 마음이 편해지는 이유가 있었네요.",
      mid: "{score}점이에요. 천천히, 따뜻하게 맞춰가요 우리.",
      low: "{score}점이어도 괜찮아요. 제가 기다려줄게요.",
      solo: "당신 사주엔 지친 하루 끝에 '수고했어' 말해줄 사람이 어울려요.",
      outro: "부족한 토(土) 기운, 제가 포근하게 감싸드릴게요.",
    },
    {
      element: 3, type: "도도한 시크형", charm: "쉽게 다가갈 수 없는 우아함",
      art: { backHair: "long", bangs: "hime", hair: "#1c1c24", hairLight: "#5a5a72", eye: "#8a8fb8", outfit: "#7d8598", outfitLight: "#c3c8d6", bg: "#e1e5ef", accessory: "earring" },
      intro: "…당신이 그 사람이에요? 생각보다 괜찮네.",
      high: "{score}점. 흠, 인정할게. 우리 꽤 잘 어울려.",
      mid: "{score}점이라… 나쁘지 않아. 나를 더 알아볼 기회를 줄게.",
      low: "{score}점? 그럼 나를 설득해봐. 기대할게.",
      solo: "당신 사주엔 자기 기준이 확실한 사람이 맞아. 쉽게 넘어오진 않겠지만, 그만큼 진심일 거야.",
      outro: "당신에게 부족한 금(金) 기운, 내가 반짝이게 채워줄게.",
    },
    {
      element: 4, type: "신비로운 지성형", charm: "알면 알수록 깊어지는 매력",
      art: { backHair: "bob", bangs: "swept", hair: "#2c3a5e", hairLight: "#6a86c2", eye: "#3f7fd8", outfit: "#5a8be0", outfitLight: "#b4cdf7", bg: "#d6e5fb", accessory: "glasses" },
      intro: "당신을 기다리고 있었어요. 별자리가 그렇게 말하더라고요.",
      high: "{score}점. 이건 우연이 아니라 필연이에요.",
      mid: "{score}점이네요. 아직 모르는 당신이 더 궁금해져요.",
      low: "{score}점. 하지만 운명은 숫자보다 깊은 곳에 있어요.",
      solo: "당신 사주는 대화가 깊어질수록 빠져드는 사람을 원해요. 알면 알수록 궁금한 사람이요.",
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

// 커플: 인사 → 점수 반응 → 마무리 / 솔로: 인사 → 어떤 인연인지 → 마무리
function avatarLines(avatar, score) {
  if (score == null) return [avatar.intro, avatar.solo, avatar.outro];
  const tier = score >= 80 ? "high" : score >= 60 ? "mid" : "low";
  return [avatar.intro, avatar[tier].replace("{score}", score), avatar.outro];
}

function avatarSVG(avatar, gender) {
  return animeAvatarSVG({ ...avatar.art, gender }, `${gender}${avatar.element}`);
}
