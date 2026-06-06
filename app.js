const analysis = window.MOGURI_AUDIO_ANALYSIS || {};

const runOfShow = [
  {
    time: "13:30",
    title: "体育館に集合",
    text: "昼食後に集合。受付、着替え、当日の説明をしてから始める。",
  },
  {
    time: "13:45",
    title: "体力測定をする",
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

const audioNotes = [
  ["00:00-02:19", "11月開催案が出る。体育館で体力測定、その後パークゴルフ、最後に打ち上げという流れ。"],
  ["02:19-03:23", "種目、点数、賞品の話。総合順位だけでなく、種目ごとの勝ちも拾うと楽しそう。"],
  ["03:23-03:50", "40歳の折り返しとして、今の健康や体力を測る意味づけが出る。"],
  ["03:54-05:30", "候補種目は、反復横跳び、長座体前屈、腹筋、立ち幅跳び、ボール投げなど。"],
  ["07:17-08:00", "開催は11月か12月。県外組を呼ぶか、まず内輪でやるかを相談。"],
  ["08:30-09:01", "体育館の借り方と費用感を確認。一面利用でも足りるかもしれない。"],
  ["10:18-11:24", "小規模な体育祭として見えてくる。初回の記録を、次回以降の比較に使える。"],
  ["11:35-12:00", "最後に安全面の話。ケガしそうな種目は避ける方針。"],
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

function get(path, fallback = "") {
  return path.reduce((value, key) => (value && value[key] !== undefined ? value[key] : fallback), analysis);
}

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

function renderTimeline() {
  const target = document.getElementById("audioTimeline");
  if (!target) return;
  target.innerHTML = audioNotes
    .map(
      ([time, text]) => `
        <article class="timeline-item">
          <time>${time}</time>
          <p>${text}</p>
        </article>
      `
    )
    .join("");
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

function renderMetrics() {
  const metrics = [
    ["音源の長さ", get(["signal", "duration_label"], "11:59")],
    ["文字起こし", `${get(["transcription", "segment_count"], "495")}区切り`],
    ["音量目安", `${get(["loudness", "input_i"], "-17.61")} LUFS`],
    ["話している割合", `${Math.round(Number(get(["signal", "active_ratio"], 0.112)) * 100)}%くらい`],
    ["音源形式", `${get(["source_audio", "codec_name"], "aac")} / ${get(["source_audio", "sample_rate"], "48000")} Hz`],
    ["よく出た言葉", get(["transcript_summary", "keyword_hits"], ["体育館", "西原", "もぐり"]).join(" / ")],
  ];

  const target = document.getElementById("metricGrid");
  if (!target) return;
  target.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="audio-metric">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");
}

renderRunList();
renderDecisionGrid();
renderTimeline();
renderFeeTable();
renderTasks();
renderMetrics();
