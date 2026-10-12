// 애니메이션풍 캐릭터 일러스트 (직접 그린 SVG, 외부 이미지 없음)
// animeAvatarSVG(style, id) — style: { gender, backHair, bangs, hair, hairLight, eye, outfit, outfitLight, bg, accessory }

const SKIN = "#ffe6d5";
const SKIN_SHADE = "#f6cdb6";
const LINE = "#4a2c2a";

// ---------- 머리카락 ----------
// 뒷머리 (얼굴 뒤)
const BACK_HAIR = {
  short: "M50 118 C42 64 64 34 100 32 C136 34 158 64 150 118 C146 96 140 84 100 82 C60 84 54 96 50 118 Z",
  long: "M46 112 C38 58 62 30 100 30 C138 30 162 58 154 112 L164 212 C152 220 138 216 132 206 L128 158 L72 158 L68 206 C62 216 48 220 36 212 Z",
  bob: "M44 114 C38 58 62 30 100 30 C138 30 162 58 156 114 L160 156 C152 166 138 166 132 156 L68 156 C62 166 48 166 40 156 Z",
  twin: "M50 116 C42 62 64 32 100 32 C136 32 158 62 150 116 Z",
  braid: "M48 114 C40 60 64 32 100 32 C136 32 160 60 152 114 L150 150 L50 150 Z",
};

// 앞머리 (얼굴 위)
const BANGS = {
  // 남: 부드러운 앞머리
  soft: "M52 112 C46 66 70 40 100 40 C130 40 154 66 148 112 L142 92 L134 104 L128 84 L118 100 L110 80 L100 98 L90 80 L82 100 L72 84 L66 104 L58 92 Z",
  // 남: 뾰족 올린 머리
  spiky: "M52 112 C44 74 50 50 60 42 L56 18 L76 36 L82 10 L98 32 L110 6 L118 34 L136 14 L136 42 L158 36 C156 60 154 84 148 112 L142 90 L132 100 L126 80 L114 92 L104 76 L94 92 L84 78 L74 98 L64 86 Z",
  // 남: 덥수룩한 곱슬
  fluffy: "M48 114 C36 84 44 50 66 40 C70 28 90 22 100 30 C112 22 132 28 136 40 C158 50 164 84 152 114 L146 96 L138 106 L132 88 C126 96 120 98 114 90 C108 100 92 100 86 90 C80 98 74 96 68 88 L62 106 L54 96 Z",
  // 남: 한쪽으로 넘긴 앞머리
  side: "M50 114 C44 66 68 38 102 38 C134 38 156 64 150 114 L146 122 L140 98 L132 112 L126 90 C112 98 92 96 74 88 L66 100 L60 92 L56 106 Z",
  // 남: 가르마
  part: "M50 114 C44 64 68 38 100 38 C132 38 156 64 150 114 L146 98 C140 82 126 70 104 68 L100 60 L96 68 C74 70 60 82 54 98 Z",
  // 여: 시스루 앞머리
  seethrough: "M48 116 C42 64 66 36 100 36 C134 36 158 64 152 116 L146 96 C144 88 140 82 136 78 L132 100 L124 78 L116 96 L108 76 L100 94 L92 76 L84 96 L76 78 L68 100 L64 78 C60 82 56 88 54 96 Z",
  // 여: 일자 앞머리 (히메컷)
  hime: "M46 118 C40 64 64 34 100 34 C136 34 160 64 154 118 L148 118 L148 98 L138 100 L132 96 L120 100 L112 96 L100 100 L88 96 L80 100 L68 96 L62 100 L52 98 L52 118 Z",
  // 여: 옆으로 흐르는 앞머리
  swept: "M48 116 C42 62 66 34 100 34 C134 34 158 62 152 116 L148 92 C140 76 126 70 112 72 C104 86 84 98 62 104 L58 96 L54 108 Z",
};

const HAIR_STRANDS = {
  // 머리 윤기 하이라이트
  default: "M72 56 C80 51 88 49 96 49 M110 50 C116 51 122 53 127 57",
};

function hairExtras(style, c) {
  switch (style.backHair) {
    case "twin": // 양갈래
      return `
        <path d="M54 92 C24 104 18 160 30 204 C36 218 50 214 48 200 C42 168 46 130 62 106 Z" fill="url(#${c}hair)" stroke="${LINE}" stroke-width="1.5"/>
        <path d="M146 92 C176 104 182 160 170 204 C164 218 150 214 152 200 C158 168 154 130 138 106 Z" fill="url(#${c}hair)" stroke="${LINE}" stroke-width="1.5"/>`;
    case "braid": // 옆으로 땋은 머리
      return [0, 1, 2, 3, 4].map((i) =>
        `<ellipse cx="${146 + (i % 2 ? 4 : 0)}" cy="${136 + i * 18}" rx="12" ry="11" fill="url(#${c}hair)" stroke="${LINE}" stroke-width="1.5"/>`
      ).join("") + `<path d="M140 222 l10 10 l6 -12 Z" fill="url(#${c}hair)"/>`;
    default:
      return "";
  }
}

// ---------- 소품 ----------
function accessorySVG(style) {
  switch (style.accessory) {
    case "leaf":
      return `<g transform="translate(130 50) rotate(-20)"><path d="M0 0 C8 -14 24 -14 28 -4 C20 8 6 8 0 0 Z" fill="#6cc68a" stroke="#3f8f5c" stroke-width="1.5"/><path d="M2 -1 L24 -6" stroke="#3f8f5c" stroke-width="1.2"/></g>`;
    case "ribbon":
      return `<g transform="translate(64 44)"><path d="M0 0 L-18 -12 L-16 10 Z M0 0 L18 -12 L16 10 Z" fill="#ff6f91" stroke="#d94a6e" stroke-width="1.5"/><circle r="5" fill="#ff8fab" stroke="#d94a6e" stroke-width="1.5"/></g>`;
    case "flower":
      return `<g transform="translate(140 66)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="5" ry="8" transform="rotate(${a}) translate(0 -7)" fill="#ffd1dc" stroke="#e58aa3" stroke-width="1"/>`).join("")}<circle r="4" fill="#ffe08a"/></g>`;
    case "earring":
      return `<g fill="#fff" stroke="#9aa3b5" stroke-width="1.5"><circle cx="56" cy="138" r="3.5"/><circle cx="144" cy="138" r="3.5"/></g><path d="M56 141 l0 6 M144 141 l0 6" stroke="#c7ccd8" stroke-width="2"/>`;
    case "glasses":
      return `<g fill="rgba(255,255,255,.18)" stroke="#3b3550" stroke-width="2.5"><rect x="66" y="106" width="28" height="22" rx="9"/><rect x="106" y="106" width="28" height="22" rx="9"/></g><path d="M94 116 Q100 112 106 116" fill="none" stroke="#3b3550" stroke-width="2.5"/>`;
    case "hairpin":
      return `<g transform="translate(126 62) rotate(-25)"><rect x="-14" y="-3" width="28" height="6" rx="3" fill="#7fb2ff" stroke="#4f7fd1" stroke-width="1.2"/><circle cx="12" r="4" fill="#bcd7ff" stroke="#4f7fd1" stroke-width="1.2"/></g>`;
    default:
      return "";
  }
}

// ---------- 얼굴 ----------
function eyeSVG(cx, c, female, side) {
  const lash = female
    ? `<path d="M${cx - 14} ${108} Q${cx} ${95} ${cx + 14} ${106}" fill="none" stroke="${LINE}" stroke-width="3.6" stroke-linecap="round"/><path d="M${cx + 13 * side} ${106} l${4 * side} -4 M${cx + 10 * side} ${103} l${3 * side} -5" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`
    : `<path d="M${cx - 13} ${107} Q${cx} ${97} ${cx + 13} ${105}" fill="none" stroke="${LINE}" stroke-width="3.2" stroke-linecap="round"/>`;
  return `
    <g class="eye">
      <ellipse cx="${cx}" cy="118" rx="12.5" ry="14.5" fill="#fff"/>
      <ellipse cx="${cx}" cy="119.5" rx="10.5" ry="13" fill="url(#${c}iris)"/>
      <ellipse cx="${cx}" cy="121" rx="4.8" ry="6.5" fill="#2a1d2e"/>
      <circle cx="${cx - 4}" cy="112.5" r="4" fill="#fff"/>
      <circle cx="${cx + 4.2}" cy="125" r="2" fill="#fff" opacity=".9"/>
      ${lash}
    </g>`;
}

function animeAvatarSVG(style, id = "a") {
  const c = `av${id}`;
  const female = style.gender === "female";
  const mouth = female
    ? `<path class="mouth" d="M94 146 Q100 152 106 146 Q100 149 94 146 Z" fill="#e8737f" stroke="#c4505e" stroke-width="1.2" stroke-linejoin="round"/>`
    : `<path class="mouth" d="M93 146 Q100 151 107 146" fill="none" stroke="#b5545e" stroke-width="2.2" stroke-linecap="round"/>`;
  const brows = female
    ? `<path d="M68 98 Q79 93 90 97 M110 97 Q121 93 132 98" fill="none" stroke="${style.hair}" stroke-width="2.4" stroke-linecap="round"/>`
    : `<path d="M66 97 Q78 91 91 96 M109 96 Q122 91 134 97" fill="none" stroke="${style.hair}" stroke-width="3.2" stroke-linecap="round"/>`;
  const collar = female
    ? `<path d="M82 188 L100 206 L118 188" fill="#fff" stroke="${LINE}" stroke-width="1.5"/><circle cx="100" cy="206" r="4" fill="${style.outfitLight}"/>`
    : `<path d="M80 186 L100 214 L120 186 L112 184 L100 198 L88 184 Z" fill="#fff" stroke="${LINE}" stroke-width="1.5"/>`;

  return `
  <svg viewBox="0 0 200 240" class="avatar-svg" role="img" aria-label="캐릭터 일러스트">
    <defs>
      <radialGradient id="${c}bg" cx="50%" cy="40%" r="65%">
        <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${style.bg}"/>
      </radialGradient>
      <linearGradient id="${c}hair" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${style.hairLight}"/><stop offset=".55" stop-color="${style.hair}"/>
      </linearGradient>
      <linearGradient id="${c}iris" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a1d2e"/><stop offset=".55" stop-color="${style.eye}"/><stop offset="1" stop-color="#fff6c8"/>
      </linearGradient>
      <linearGradient id="${c}outfit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${style.outfitLight}"/><stop offset="1" stop-color="${style.outfit}"/>
      </linearGradient>
      <radialGradient id="${c}blush"><stop offset="0" stop-color="#ff8fa3" stop-opacity=".55"/><stop offset="1" stop-color="#ff8fa3" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="100" cy="120" r="98" fill="url(#${c}bg)"/>

    <path d="${BACK_HAIR[style.backHair]}" fill="url(#${c}hair)" stroke="${LINE}" stroke-width="1.5"/>
    ${hairExtras(style, c)}

    <path d="M28 240 C32 200 62 184 100 184 C138 184 168 200 172 240 Z" fill="url(#${c}outfit)" stroke="${LINE}" stroke-width="1.5"/>
    <path d="M88 160 L88 186 Q100 194 112 186 L112 160 Z" fill="${SKIN_SHADE}"/>
    ${collar}

    <ellipse cx="57" cy="126" rx="7" ry="10" fill="${SKIN}" stroke="${LINE}" stroke-width="1.2"/>
    <ellipse cx="143" cy="126" rx="7" ry="10" fill="${SKIN}" stroke="${LINE}" stroke-width="1.2"/>
    <path d="M56 104 C56 140 74 164 100 170 C126 164 144 140 144 104 C144 72 124 56 100 56 C76 56 56 72 56 104 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="1.5"/>

    <ellipse cx="74" cy="136" rx="10" ry="6" fill="url(#${c}blush)"/>
    <ellipse cx="126" cy="136" rx="10" ry="6" fill="url(#${c}blush)"/>
    ${brows}
    <g class="eyes">${eyeSVG(79, c, female, -1)}${eyeSVG(121, c, female, 1)}</g>
    <path d="M100 132 l-2 4 l3 0" fill="none" stroke="#d9a08a" stroke-width="1.4" stroke-linecap="round"/>
    ${mouth}

    <path d="${BANGS[style.bangs]}" fill="url(#${c}hair)" stroke="${LINE}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="${HAIR_STRANDS.default}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="2.5" stroke-linecap="round"/>
    ${accessorySVG(style)}
  </svg>`;
}
