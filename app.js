const analysis = window.MOGURI_AUDIO_ANALYSIS || {};

const runOfShow = [
  {
    time: "13:30",
    title: "集合 / セットアップ",
    text: "昼食後に体育館集合。受付、着替え、体力測定の説明までを短く済ませる。",
  },
  {
    time: "13:45",
    title: "Moguri 体力測定",
    text: "安全寄りの種目を4-5個。記録を残して、次回以降は自分との比較にする。",
  },
  {
    time: "15:30",
    title: "パークゴルフ",
    text: "競技というより最後のエンタメ枠。順位より、笑える組み合わせを優先する。",
  },
  {
    time: "17:30",
    title: "BBQ / カラオケへ移動",
    text: "乗り合い、運転、飲酒の切り分けを先に決める。ここからは無理しない。",
  },
];

const decisions = [
  {
    label: "イベント名",
    title: "Moguri Cup",
    text: "内輪の小さな体育祭として扱う。大きく見せすぎず、でも記録は残す。",
  },
  {
    label: "競技方針",
    title: "ガチ 7 : ネタ 3",
    text: "体力測定は成立させる。最後に軽い謎競技を入れて、空気を柔らかくする。",
  },
  {
    label: "採点",
    title: "総合 + 個別賞",
    text: "合計点だけだと強い人に寄るので、個別種目の勝ちも拾う。",
  },
  {
    label: "安全線",
    title: "対人・全力接触なし",
    text: "相撲や無理な全力走は候補から落とす。翌日笑える範囲で終える。",
  },
];

const audioNotes = [
  ["00:00-02:19", "11月開催案。西原町民体育館を起点に、体力測定、パークゴルフ、BBQ/カラオケまでつなぐ。"],
  ["02:19-03:23", "種目・点数・賞品の話。合計点だけでなく、個別種目の勝ちも拾うと盛り上がりそう。"],
  ["03:23-03:50", "40歳の折り返し線として、健康の基準値を取る意味付けが出る。"],
  ["03:54-05:30", "反復横跳び、長座体前屈、腹筋、立ち幅跳び、ボール投げ、謎競技の候補。"],
  ["07:17-08:00", "11月/12月、県外組、参加規模を確認。コアは10人前後の見立て。"],
  ["08:30-09:01", "体育館の借り方と費用感。全面でなく一面利用も検討余地あり。"],
  ["10:18-11:24", "小規模体育祭としての輪郭。初回の数値を次回以降の自分との比較に使える。"],
  ["11:35-12:00", "最大リスクはケガ。走る・投げる・対人要素は安全側に寄せる。"],
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
    text: "体力測定、軽い競技、人数10名前後、町内/町外扱い、全面/一面の料金を確認する。",
  },
  {
    label: "2",
    title: "日程を2案に絞る",
    text: "11月開催なら予約受付は2026年10月1日から。12月開催なら2026年11月1日から。",
  },
  {
    label: "3",
    title: "種目を安全寄りに決める",
    text: "反復横跳び、長座体前屈、腹筋、立ち幅跳び、軽い投げ種目まで。対人接触は外す。",
  },
  {
    label: "4",
    title: "参加者を棚卸し",
    text: "コア8-12人、見学枠、県外組を分ける。無理に大きくしない。",
  },
  {
    label: "5",
    title: "共有範囲を決める",
    text: "このページは公開済み。全文 transcript はローカルのみ、必要ならレビュー後に抜粋する。",
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
    ["長さ", get(["signal", "duration_label"], "11:59")],
    ["文字起こし", `${get(["transcription", "segment_count"], "495")} segments`],
    ["ラウドネス", `${get(["loudness", "input_i"], "-17.61")} LUFS`],
    ["活動比率", `${Math.round(Number(get(["signal", "active_ratio"], 0.112)) * 100)}% active`],
    ["形式", `${get(["source_audio", "codec_name"], "aac")} / ${get(["source_audio", "sample_rate"], "48000")} Hz`],
    ["キーワード", get(["transcript_summary", "keyword_hits"], ["体育館", "西原", "もぐり"]).join(" / ")],
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
