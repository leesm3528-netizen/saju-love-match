// 화면 흐름: 시작(솔로/커플 선택) → 입력 → 결과
// #solo  : 나의 정보만 입력 → 어떤 사람을 만나는 사주인지
// #couple: 두 사람 정보 입력 → 궁합 점수

const PEOPLE = ["me", "partner"];
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const RING_C = 2 * Math.PI * 52;
let typingTimer = null;
let mode = null;

const $ = (id) => document.getElementById(id);
const genderText = (g) => (g === "female" ? "여자" : "남자");
const opposite = (g) => (g === "female" ? "male" : "female");

// ---------- 화면 전환 ----------

const MODE_TEXT = {
  solo: { sub: "나의 정보를 입력하면 내 사주가 끌어당기는 인연을 알려드려요", button: "내 인연 보기" },
  couple: { sub: "두 사람의 정보를 입력해 주세요", button: "궁합 보기" },
};

function setMode(next) {
  mode = next === "solo" || next === "couple" ? next : null;
  clearInterval(typingTimer);

  $("startView").hidden = mode !== null;
  $("formView").hidden = mode === null;
  $("homeLink").hidden = mode === null;
  $("result").hidden = true;
  $("result").innerHTML = "";
  if (!mode) {
    if (location.search) history.replaceState(null, "", location.pathname);
    return;
  }

  const solo = mode === "solo";
  $("formSub").textContent = MODE_TEXT[mode].sub;
  $("submitBtn").textContent = MODE_TEXT[mode].button;
  $("people").classList.toggle("single", solo);
  // 숨긴 입력은 disabled 로 만들어 필수 검사에서 빠지게 함
  $("partnerFieldset").hidden = solo;
  $("partnerFieldset").disabled = solo;
  $("targetField").hidden = !solo;
  $("target-gender").disabled = !solo;
}

window.addEventListener("hashchange", () => setMode(location.hash.slice(1)));

// ---------- 입력 ----------

function calcAge(dateStr) {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

document.querySelectorAll(".mbti-select").forEach((sel) => {
  MBTI_TYPES.forEach((t) => sel.add(new Option(t, t)));
});

PEOPLE.forEach((p) => {
  $(`${p}-birth`).addEventListener("change", (e) => {
    if (e.target.value) $(`${p}-age`).value = calcAge(e.target.value);
  });
});

// 내 성별을 고르면 상대 성별을 반대로 미리 채워줌 (변경 가능)
$("me-gender").addEventListener("change", (e) => {
  if (!e.target.value) return;
  for (const id of ["partner-gender", "target-gender"]) {
    if (!$(id).value) $(id).value = opposite(e.target.value);
  }
});

function readPerson(p) {
  const v = (field) => $(`${p}-${field}`).value;
  return {
    gender: v("gender"),
    birth: v("birth"),
    age: Number(v("age")),
    height: Number(v("height")),
    weight: Number(v("weight")),
    blood: v("blood"),
    mbti: v("mbti"),
  };
}

// ---------- 공유 링크 ----------
// 솔로: ?mode=solo&me=f_1995-03-12_162_52_A_ISFP&t=m
// 커플: ?mode=couple&me=...&p=m_1993-08-20_180_74_O_ENTJ
const SHARE_FIELDS = ["gender", "birth", "height", "weight", "blood", "mbti"];

function encodePerson(person) {
  return [person.gender === "female" ? "f" : "m", person.birth, person.height, person.weight, person.blood, person.mbti].join("_");
}

function decodePerson(str) {
  const parts = (str || "").split("_");
  if (parts.length !== SHARE_FIELDS.length) return null;
  const [g, birth, height, weight, blood, mbti] = parts;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || !BLOOD_ORDER.includes(blood) || !MBTI_TYPES.includes(mbti)) return null;
  return { gender: g === "f" ? "female" : "male", birth, height, weight, blood, mbti };
}

function shareQuery(data) {
  const q = new URLSearchParams({ mode, me: encodePerson(data.me) });
  if (mode === "solo") q.set("t", data.target === "female" ? "f" : "m");
  else q.set("p", encodePerson(data.partner));
  return q.toString();
}

function fillPerson(p, person) {
  SHARE_FIELDS.forEach((f) => ($(`${p}-${f}`).value = person[f]));
  $(`${p}-age`).value = calcAge(person.birth);
}

// 공유 링크로 들어오면 입력값을 채우고 결과까지 바로 보여줌
function openFromUrl() {
  const q = new URLSearchParams(location.search);
  const me = decodePerson(q.get("me"));
  const partner = decodePerson(q.get("p"));
  const urlMode = q.get("mode") || (partner ? "couple" : null);
  if (!me || !(urlMode === "solo" || (urlMode === "couple" && partner))) return false;

  history.replaceState(null, "", `?${q}#${urlMode}`);
  setMode(urlMode);
  fillPerson("me", me);
  if (urlMode === "couple") fillPerson("partner", partner);
  else $("target-gender").value = q.get("t") === "f" ? "female" : "male";
  $("matchForm").requestSubmit();
  return true;
}

// ---------- 연출 ----------

const wait = (ms) => new Promise((res) => setTimeout(res, REDUCED ? 0 : ms));

function countUp(el, ring, target, duration) {
  if (REDUCED) {
    el.textContent = target;
    ring.style.strokeDashoffset = RING_C * (1 - target / 100);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / duration, 1);
      const v = Math.round(target * (1 - Math.pow(1 - t, 3)));
      el.textContent = v;
      ring.style.strokeDashoffset = RING_C * (1 - v / 100);
      t < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });
}

function typeLine(el, text, wrap) {
  clearInterval(typingTimer);
  if (REDUCED) { el.textContent = text; return; }
  el.textContent = "";
  wrap.classList.add("talking");
  let i = 0;
  typingTimer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) {
      clearInterval(typingTimer);
      wrap.classList.remove("talking");
    }
  }, 45);
}

function burstHearts(stage, count) {
  if (REDUCED) return;
  const icons = ["💗", "💕", "💖", "✨", "💘"];
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = icons[i % icons.length];
    h.style.left = `${5 + Math.random() * 90}%`;
    h.style.animationDelay = `${Math.random() * 1.2}s`;
    h.style.fontSize = `${16 + Math.random() * 16}px`;
    stage.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }
}

async function revealScore(total) {
  await countUp($("scoreNum"), document.querySelector(".ring-fg"), total, 1600);
  document.querySelector(".grade").classList.add("show");
  document.querySelectorAll(".bar i").forEach((bar) => (bar.style.width = `${bar.dataset.w}%`));
  await wait(700);
}

async function revealAvatar(lines, hearts) {
  const stage = document.querySelector(".stage");
  const wrap = document.querySelector(".avatar-wrap");
  wrap.classList.add("show");
  burstHearts(stage, hearts);

  await wait(800);
  const speech = $("speech");
  const next = $("nextLine");
  document.querySelector(".bubble").classList.add("show");
  let idx = 0;
  typeLine(speech, lines[idx], wrap);
  next.onclick = () => {
    idx = (idx + 1) % lines.length;
    typeLine(speech, lines[idx], wrap);
    next.textContent = idx === lines.length - 1 ? "처음부터 ↺" : "다음 ▶";
    if (idx === lines.length - 1) burstHearts(stage, 10);
  };
}

// ---------- 결과 HTML 조각 ----------

const detail = (title, item) => `
  <div class="detail">
    <div class="detail-head"><strong>${title}</strong><span class="tag">${item.label}</span></div>
    <p>${item.desc}</p>
  </div>`;

const bar = (label, score) =>
  `<div><span>${label}</span><div class="bar"><i data-w="${score}"></i></div><b>${score}</b></div>`;

const stageHTML = (title, avatar, gender, first) => `
  <div class="stage${first ? " first" : ""}">
    <p class="stage-title">${title}</p>
    <p class="charm">매력 포인트 · ${avatar.charm}</p>
    <div class="avatar-wrap">${avatarSVG(avatar, gender)}</div>
    <div class="bubble">
      <p id="speech"></p>
      <button type="button" id="nextLine">다음 ▶</button>
    </div>
  </div>`;

const shareHTML = (link) => `
  <div class="share">
    <input id="shareLink" type="text" readonly value="${link}" aria-label="결과 공유 링크" />
    <button type="button" id="copyLink">🔗 링크 복사</button>
  </div>`;

const styleChapter = (no, style) => `
  <div class="chapter">
    <div class="no">제${no}장 · 나의 연애 스타일 (${ELEMENTS[style.element]} 일간)</div>
    <h4>${style.title}</h4>
    <p>${style.body}</p>
    <p class="tip">⚠️ ${style.caution}</p>
  </div>`;

const luckyChapter = (no, lucky) => `
  <div class="chapter">
    <div class="no">제${no}장 · ${ELEMENTS[lucky.element]} 기운을 채우는 행운의 데이트</div>
    <h4>이렇게 만나 보세요</h4>
    <div class="chips">
      <span class="chip">🎨 ${lucky.color}</span>
      <span class="chip">📍 ${lucky.place}</span>
      <span class="chip">🍽️ ${lucky.food}</span>
      <span class="chip">🎁 ${lucky.item}</span>
    </div>
  </div>`;

const infoTable = (rows, heads) => `
  <table>
    <tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr>
    ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
  </table>`;

function pillarRows(...ps) {
  return [
    ["띠", ...ps.map((p) => ANIMALS[p.year.branch])],
    ["연주", ...ps.map((p) => pillarText(p.year))],
    ["월주", ...ps.map((p) => pillarText(p.month))],
    ["일주", ...ps.map((p) => pillarText(p.day))],
  ];
}

// ---------- 솔로 결과 ----------

function renderSolo(me, target) {
  const pa = getPillars(me.birth);
  const avatar = pickAvatar(target, pa);
  const ideal = idealMatch(me, pa, target);
  const report = buildReport(pa, pa, avatar.element);
  const elKo = `${ELEMENTS[avatar.element]}(${ELEMENTS_KO[avatar.element]})`;

  const html = `
    ${stageHTML(`내 사주가 끌어당기는 인연 · <b>${avatar.type}</b>`, avatar, target, true)}

    <h3>💘 나와 잘 맞는 사람</h3>
    <div class="match-grid">
      <div class="match"><div class="label">끌리는 기운</div><div class="value">${elKo} 기운</div><p class="hint">내 사주에 부족한 기운을 채워주는 사람</p></div>
      <div class="match"><div class="label">잘 맞는 띠</div><div class="value">${ideal.zodiac.map((z) => `${z.animal}띠`).join(" · ")}</div><p class="hint">${ideal.zodiac.map((z) => z.label).join(" · ")}</p></div>
      <div class="match"><div class="label">운명적 끌림</div><div class="value">${ideal.dayMaster}</div><p class="hint">내 일간과 천간합을 이루는 사람</p></div>
      <div class="match"><div class="label">잘 맞는 MBTI</div><div class="value">${ideal.mbti.map((m) => m.type).join(" · ")}</div><p class="hint">MBTI 궁합 상위 3개</p></div>
      <div class="match"><div class="label">잘 맞는 혈액형</div><div class="value">${ideal.blood.type}형</div><p class="hint">혈액형 궁합 ${ideal.blood.score}점</p></div>
      <div class="match"><div class="label">어울리는 키</div><div class="value">${ideal.height}</div><p class="hint">설레는 키 차이 기준</p></div>
    </div>

    ${shareHTML(location.href)}

    <section class="report">
      <h3>💌 나의 연애 리포트</h3>
      ${styleChapter(1, report.style)}
      <div class="chapter">
        <div class="no">제2장 · 내가 만나게 될 사람</div>
        <h4>${avatar.type}</h4>
        <p>‘${avatar.charm}’이 매력인 사람에게 끌리게 돼요. 내 사주에 부족한 ${elKo} 기운을 채워주는 사람이라, 함께 있으면 마음의 균형이 맞춰져요.</p>
        <p class="tip">💡 ${ideal.zodiac.map((z) => z.animal).join("·")}띠, ${ideal.mbti[0].type} 성향의 사람을 만난다면 눈여겨보세요.</p>
      </div>
      ${luckyChapter(3, report.lucky)}
    </section>

    <h3>나의 정보</h3>
    ${infoTable([
      ["성별", genderText(me.gender)],
      ["생년월일", me.birth],
      ["나이", me.age],
      ["키 / 몸무게", `${me.height}cm / ${me.weight}kg`],
      ["혈액형 / MBTI", `${me.blood}형 / ${me.mbti}`],
      ...pillarRows(pa),
    ], ["항목", "나"])}`;

  return { html, run: () => revealAvatar(avatarLines(avatar), 14) };
}

// ---------- 커플 결과 ----------

function renderCouple(me, partner) {
  const r = calcCompatibility(me, partner);
  const [pa, pb] = r.saju.pillars;
  const avatar = pickAvatar(partner.gender, pa);
  const report = buildReport(pa, pb, avatar.element);

  const html = `
    <div class="total">
      <div class="ring">
        <svg viewBox="0 0 120 120">
          <circle class="ring-bg" cx="60" cy="60" r="52" fill="none" stroke-width="10"/>
          <circle class="ring-fg" cx="60" cy="60" r="52" fill="none" stroke-width="10"
            stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}"/>
        </svg>
        <div class="score"><span id="scoreNum">0</span><small>점</small></div>
      </div>
      <div class="grade">${r.grade}</div>
    </div>
    <div class="bars">
      ${bar("사주 궁합", r.saju.score)}
      ${bar("MBTI 궁합", r.mbti.score)}
      ${bar("혈액형 궁합", r.blood.score)}
      ${bar("체격 궁합", r.body.score)}
    </div>

    ${stageHTML(`내 사주에 부족한 <b>${ELEMENTS[avatar.element]}(${ELEMENTS_KO[avatar.element]})</b> 기운을 채워줄 <b>${avatar.type}</b>`, avatar, partner.gender)}

    ${shareHTML(location.href)}

    <section class="report">
      <h3>💌 두 사람의 연애 리포트</h3>
      ${styleChapter(1, report.style)}
      <div class="chapter">
        <div class="no">제2장 · 두 사람의 케미</div>
        <h4>${report.chemistry.title}</h4>
        <p>${report.chemistry.body} ${report.chemistry.hapText}</p>
        <p class="tip">💡 ${report.chemistry.tip}</p>
      </div>
      ${luckyChapter(3, report.lucky)}
    </section>

    <h3>사주 궁합</h3>
    ${detail("띠 궁합", r.saju.zodiac)}
    ${detail("일간 궁합", r.saju.dayMaster)}
    ${detail("오행 보완", r.saju.balance)}

    <h3>MBTI 궁합</h3>
    ${detail(`${me.mbti} × ${partner.mbti}`, { label: `${r.mbti.label} · ${r.mbti.score}점`, desc: r.mbti.notes.join("<br>") })}

    <h3>혈액형 궁합</h3>
    ${detail(`${me.blood}형 × ${partner.blood}형`, { label: `${r.blood.score}점`, desc: r.blood.desc })}

    <h3>체격 궁합</h3>
    ${detail(`키 차이 ${r.body.height.diff}cm`, r.body.height)}
    ${detail(`BMI 차이 ${r.body.bmi.diff}`, r.body.bmi)}

    <h3>두 사람의 정보</h3>
    ${infoTable([
      ["성별", genderText(me.gender), genderText(partner.gender)],
      ["생년월일", me.birth, partner.birth],
      ["나이", me.age, partner.age],
      ["키 (cm)", me.height, partner.height],
      ["몸무게 (kg)", me.weight, partner.weight],
      ["혈액형", me.blood, partner.blood],
      ["MBTI", me.mbti, partner.mbti],
      ...pillarRows(pa, pb),
    ], ["항목", "나", "상대방"])}`;

  return {
    html,
    run: async () => {
      await revealScore(r.total);
      await revealAvatar(avatarLines(avatar, r.total), r.total >= 80 ? 18 : 8);
    },
  };
}

// ---------- 제출 ----------

$("matchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  clearInterval(typingTimer);
  const data = { me: readPerson("me") };
  if (mode === "solo") data.target = $("target-gender").value;
  else data.partner = readPerson("partner");

  // 주소창을 공유 가능한 결과 링크로 바꿈
  try { history.replaceState(null, "", `?${shareQuery(data)}#${mode}`); } catch {}

  const view = mode === "solo" ? renderSolo(data.me, data.target) : renderCouple(data.me, data.partner);
  const result = $("result");
  result.innerHTML = view.html;
  result.hidden = false;
  result.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });

  $("copyLink").onclick = async (ev) => {
    const input = $("shareLink");
    try {
      await navigator.clipboard.writeText(input.value);
    } catch {
      input.select();
      document.execCommand("copy");
    }
    ev.target.textContent = "✅ 복사됐어요";
    setTimeout(() => (ev.target.textContent = "🔗 링크 복사"), 1500);
  };
  view.run();
});

// ---------- 시작 ----------
if (!openFromUrl()) setMode(location.hash.slice(1));
