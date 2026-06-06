const runOfShow = [
  {
    time: "13:30",
    title: "体育館に集合",
    text: "昼食後に集合。受付、着替え、当日の説明をしてから始める。",
  },
  {
    time: "13:45",
    title: "体力測定",
    text: "安全にできる種目を4-5個に絞る。記録は残して、次回の基準にする。",
  },
  {
    time: "15:30",
    title: "パークゴルフ",
    text: "体力測定のあとに軽く遊ぶ枠。順位より、笑える組み合わせを優先する。",
  },
  {
    time: "17:30",
    title: "打ち上げへ移動",
    text: "BBQやカラオケに行く場合は、運転する人と飲む人を先に分けておく。",
  },
];

const decisions = [
  {
    label: "目的",
    title: "今の体力を残す",
    text: "40歳前後のいまを、笑いながら数字で残す。次回は前回の自分と比べられる。",
  },
  {
    label: "雰囲気",
    title: "ちゃんと測る、でも重くしない",
    text: "体力測定としては成立させる。最後に軽いネタ種目を入れて、空気を柔らかくする。",
  },
  {
    label: "表彰",
    title: "総合だけでなく個別賞も作る",
    text: "合計点だけだと強い人に寄るので、種目ごとの勝ちや珍記録も拾う。",
  },
  {
    label: "安全",
    title: "ケガしそうな種目はやらない",
    text: "対人接触、無理な全力走、危ない投げ方は外す。翌日も笑える範囲で終える。",
  },
];

const memoItems = [
  {
    title: "軸は体力測定",
    text: "ただの飲み会ではなく、体を動かす理由がある会にする。",
  },
  {
    title: "人数は小さく始める",
    text: "まずは内輪の8-12人くらいで成立する設計にする。",
  },
  {
    title: "一面利用も検討",
    text: "全面貸し切りにこだわらず、料金と人数に合う使い方を確認する。",
  },
  {
    title: "安全第一",
    text: "盛り上がりそうでも、ケガの可能性が高い種目は外す。",
  },
];

const eventCandidates = [
  {
    label: "測る",
    title: "反復横跳び",
    text: "短時間でできて、年齢差も出やすい。床の滑りと靴だけ確認する。",
  },
  {
    label: "伸ばす",
    title: "長座体前屈",
    text: "安全寄り。道具が必要なら代替方法を体育館に確認する。",
  },
  {
    label: "跳ぶ",
    title: "立ち幅跳び",
    text: "盛り上がりやすいが、着地で無理しないルールを先に決める。",
  },
  {
    label: "投げる",
    title: "軽いボール投げ",
    text: "重すぎる物は使わない。周囲の安全距離を取れる場合だけ実施。",
  },
  {
    label: "ゆる枠",
    title: "謎競技を1つ",
    text: "笑える枠。ケガしない、壊さない、説明が短いものに限定する。",
  },
];

const venueQuestions = [
  "10名前後で体力測定と軽い競技をする場合、どの利用区分になるか",
  "全面ではなく一面利用で足りるか、使える範囲はどこまでか",
  "道具の持ち込み、ボール投げ、計測系の種目が可能か",
  "予約開始日、仮押さえ可否、本申請と支払いの締切",
];

const fees = [
  ["アリーナ全面", "町内 2,800円 / 町外 5,600円"],
  ["バドミントン", "町内 500円 / 町外 1,000円"],
  ["バレーコート", "町内 1,400円 / 町外 2,800円"],
  ["バスケット", "町内 500円 / 町外 1,000円"],
  ["柔・剣道場", "町内 500円 / 町外 700円"],
  ["会議室AC", "700円"],
];

const tasks = [
  {
    label: "1",
    title: "体育館へ電話",
    text: "体力測定と軽い競技で使えるか、10名前後ならどの区分になるか、料金はいくらか確認する。",
  },
  {
    label: "2",
    title: "日程を2案に絞る",
    text: "11月開催なら予約受付は2026年10月1日から。12月開催なら2026年11月1日から。",
  },
  {
    label: "3",
    title: "体力測定の種目を決める",
    text: "反復横跳び、長座体前屈、腹筋、立ち幅跳び、軽い投げ種目などから選ぶ。対人接触は外す。",
  },
  {
    label: "4",
    title: "参加人数を確認する",
    text: "参加する人、見学だけの人、県外から呼ぶ人を分ける。最初から大きくしすぎない。",
  },
  {
    label: "5",
    title: "共有する内容を決める",
    text: "このページは公開済み。音源全文や文字起こしは出さず、必要なら確認済みの抜粋だけ載せる。",
  },
];

function renderRunList() {
  const target = document.getElementById("runList");
  if (!target) return;
  target.innerHTML = runOfShow
    .map(
      (item) => `
        <article class="run-card">
          <time>${item.time}</time>
          <div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderDecisionGrid() {
  const target = document.getElementById("decisionGrid");
  if (!target) return;
  target.innerHTML = decisions
    .map(
      (item) => `
        <article class="decision-card">
          <span>${item.label}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function renderMemoGrid() {
  const target = document.getElementById("memoGrid");
  if (!target) return;
  target.innerHTML = memoItems
    .map(
      (item) => `
        <article class="memo-card">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function renderEventGrid() {
  const target = document.getElementById("eventGrid");
  if (!target) return;
  target.innerHTML = eventCandidates
    .map(
      (item) => `
        <article class="event-card">
          <span>${item.label}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function renderVenueQuestions() {
  const target = document.getElementById("venueQuestions");
  if (!target) return;
  target.innerHTML = `
    <h3>電話で聞くこと</h3>
    <ul>
      ${venueQuestions.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderFeeTable() {
  const target = document.getElementById("feeTable");
  if (!target) return;
  target.innerHTML = fees
    .map(
      ([label, value]) => `
        <div class="fee-row">
          <strong>${label}</strong>
          <span>${value}</span>
        </div>
      `
    )
    .join("");
}

function renderTasks() {
  const target = document.getElementById("taskList");
  if (!target) return;
  target.innerHTML = tasks
    .map(
      (item) => `
        <article class="task-card">
          <span class="task-number">${item.label}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </div>
        </article>
      `
    )
    .join("");
}

renderRunList();
renderDecisionGrid();
renderMemoGrid();
renderEventGrid();
renderVenueQuestions();
renderFeeTable();
renderTasks();
