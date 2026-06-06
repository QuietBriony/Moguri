const analysis = window.MOGURI_AUDIO_ANALYSIS || {};

const runOfShow = [
  ["13:30", "体育館集合 / 体力測定。安全な種目に絞り、基準値を残す。"],
  ["15:30", "パークゴルフへ移動。競技というより最後のエンタメ枠。"],
  ["17:30", "BBQ / カラオケ方面へ移動。運転と飲酒の切り分けを先に決める。"],
];

const audioNotes = [
  ["00:00-02:19", "11月開催案。西原町民体育館を起点に、体力測定、パークゴルフ、BBQ/カラオケまでつなぐ。"],
  ["02:19-03:23", "種目・点数・賞品の話。合計点だけでなく個別種目の勝ちも拾うと盛り上がりそう。"],
  ["03:23-03:50", "40歳の折り返し線として、健康の基準値を取る意味付けが出る。"],
  ["03:54-05:30", "反復横跳び、長座体前屈、腹筋、立ち幅跳び、ボール投げ、謎競技の候補。"],
  ["07:17-08:00", "11月/12月、県外組、参加規模を確認。コアは10人前後の見立て。"],
  ["08:30-09:01", "体育館の借り方と費用感。全面でなく一面利用も検討余地あり。"],
  ["10:18-11:24", "Moguri Cup / 小規模体育祭としての輪郭。初回の数値を次回以降の自分との比較に使える。"],
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
  ["日程", "2026年11月開催なら予約受付は2026年10月1日から。12月開催なら2026年11月1日から。"],
  ["会場", "西原町民体育館へ電話し、体力測定・遊技・大会扱いの費用差を確認する。"],
  ["種目", "安全寄りの体力測定 4-5 種目と、笑える軽い種目 1 つに絞る。"],
  ["人数", "コア 8-12 人、オブザーバー、県外組を分けて見積もる。"],
  ["公開", "GitHub Pages を public にするか、repo/private sharing に寄せるかを決める。"],
];

function get(path, fallback = "") {
  return path.reduce((value, key) => (value && value[key] !== undefined ? value[key] : fallback), analysis);
}

function renderPairs(targetId, rows, className, labelTag = "strong") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = rows
    .map(([label, text]) => {
      return `<div class="${className}"><${labelTag}>${label}</${labelTag}><span>${text}</span></div>`;
    })
    .join("");
}

renderPairs("runList", runOfShow, "run-item", "time");
renderPairs("audioTimeline", audioNotes, "timeline-item", "time");
renderPairs("feeTable", fees, "fee-row");
renderPairs("taskList", tasks, "task");

const metrics = [
  ["Duration", get(["signal", "duration_label"], "11:59")],
  ["Loudness", `${get(["loudness", "input_i"], "-17.61")} LUFS`],
  ["LRA", `${get(["loudness", "input_lra"], "6.80")} LU`],
  ["Transcript", `${get(["transcription", "segment_count"], "495")} segments`],
  ["Codec", `${get(["source_audio", "codec_name"], "aac")} / ${get(["source_audio", "sample_rate"], "48000")} Hz`],
  ["Channels", `${get(["source_audio", "channels"], "2")}`],
  ["RMS", `${get(["signal", "rms_dbfs"], "-21.99")} dBFS`],
  ["Activity", `${Math.round(Number(get(["signal", "active_ratio"], 0.112)) * 100)}% active`],
];

const metricGrid = document.getElementById("metricGrid");
if (metricGrid) {
  metricGrid.innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

const keywords = get(["transcript_summary", "keyword_hits"], ["体育館", "西原", "メンバー", "もぐり"]);
const keywordRow = document.getElementById("keywordRow");
if (keywordRow && Array.isArray(keywords)) {
  keywordRow.innerHTML = keywords.map((word) => `<span>${word}</span>`).join("");
}
