const SHEET_ID = "16M7nRooOCL64B25zJI8CXBeX6TEbcLz82OIvaIkGTFs";
const SHEET_NAME = "イベント一覧";
const SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=838173949`;

const fallbackEvents = [
  {
    イベントID: "EV-001",
    イベント名: "西原体育祭（仮）",
    種類: "体育祭・運動計測",
    開催候補地: "西原",
    日程メモ: "このイベント単独で日付を調整",
    次に決めること: "前泊の共有内容を受けて、種目と候補日を決める",
    状態: "情報待ち",
    公開区分: "公開",
  },
  {
    イベントID: "EV-002",
    イベント名: "クルーザー釣り",
    種類: "釣り",
    開催候補地: "未定",
    日程メモ: "他イベントと別の日付で調整",
    次に決めること: "船・海域・人数・費用・候補日を確認する",
    状態: "アイデア",
    公開区分: "公開",
  },
  {
    イベントID: "EV-003",
    イベント名: "ターだきのアドベンチャー",
    種類: "アドベンチャー",
    開催候補地: "未定",
    日程メモ: "他イベントと別の日付で調整",
    次に決めること: "内容・場所・人数・候補日を確認する",
    状態: "アイデア",
    公開区分: "公開",
  },
  {
    イベントID: "EV-004",
    イベント名: "植樹",
    種類: "植樹・環境",
    開催候補地: "未定",
    日程メモ: "他イベントと別の日付で調整",
    次に決めること: "場所・樹種・本数・必要人数・候補日を確認する",
    状態: "構想中",
    公開区分: "公開",
  },
];

function getCellText(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null) return String(cell.f);
  if (cell.v === undefined || cell.v === null) return "";
  if (cell.v instanceof Date) {
    return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(cell.v);
  }
  return String(cell.v);
}

function rowsFromGviz(payload) {
  const table = payload?.table;
  if (!table?.rows?.length) return [];

  const columnCount = table.cols?.length || Math.max(...table.rows.map((row) => row.c?.length || 0));
  const matrix = table.rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => getCellText(row.c?.[index]))
  );

  let headerIndex = matrix.findIndex(
    (row) => row.includes("イベントID") && row.includes("イベント名")
  );
  let headers;

  if (headerIndex >= 0) {
    headers = matrix[headerIndex];
  } else {
    headers = (table.cols || []).map((column) => column.label || column.id || "");
    headerIndex = -1;
  }

  return matrix.slice(headerIndex + 1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]))
  );
}

function appendFact(list, label, value) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value || "未定";
  row.append(term, description);
  list.append(row);
}

function createEventCard(event) {
  const article = document.createElement("article");
  article.className = "live-event-card";

  const head = document.createElement("div");
  head.className = "event-card-head";

  const type = document.createElement("span");
  type.className = "event-type";
  type.textContent = event.種類 || "イベント";

  const state = document.createElement("span");
  state.className = "state-chip";
  state.textContent = event.状態 || "検討中";
  head.append(type, state);

  const title = document.createElement("h3");
  title.textContent = event.イベント名 || "名称未定";

  const facts = document.createElement("dl");
  facts.className = "event-facts";
  appendFact(facts, "候補地", event.開催候補地);
  appendFact(facts, "日程", event.開催日 || event.日程メモ || "イベント別に調整");
  appendFact(facts, "次の一手", event.次に決めること);

  const action = document.createElement("a");
  action.className = "card-action";
  action.href = SHEET_EDIT_URL;
  action.textContent = "共有シートで更新する →";

  article.append(head, title, facts, action);
  return article;
}

function renderEvents(events) {
  const target = document.getElementById("liveEventGrid");
  if (!target) return;

  target.replaceChildren();
  target.setAttribute("aria-busy", "false");

  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "現在、公開指定のイベントはありません。";
    target.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  events.forEach((event) => fragment.append(createEventCard(event)));
  target.append(fragment);
}

function setSyncStatus(message, state) {
  const status = document.getElementById("sheetStatus");
  const bar = status?.closest(".sync-bar");
  if (!status || !bar) return;
  status.textContent = message;
  bar.classList.remove("ok", "fallback");
  if (state) bar.classList.add(state);
}

function loadSheetData() {
  return new Promise((resolve, reject) => {
    const callbackName = "moguriReceiveEvents";
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timer);
      script.remove();
      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }
    };

    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      handler(value);
    };

    window[callbackName] = (payload) => finish(resolve, payload);
    script.onerror = () => finish(reject, new Error("Google Sheets script failed to load"));

    const tqx = encodeURIComponent(`out:json;responseHandler:${callbackName}`);
    const sheet = encodeURIComponent(SHEET_NAME);
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=${tqx}&sheet=${sheet}&headers=0&_=${Date.now()}`;
    document.head.append(script);

    const timer = window.setTimeout(
      () => finish(reject, new Error("Google Sheets request timed out")),
      9000
    );
  });
}

async function initialiseEventHub() {
  try {
    const payload = await loadSheetData();
    if (payload?.status === "error") throw new Error("Google Sheets returned an error");

    const publicEvents = rowsFromGviz(payload).filter(
      (event) => event.イベント名 && event.公開区分 === "公開"
    );
    renderEvents(publicEvents);
    setSyncStatus(`Google Sheetsの公開行を表示中 · ${publicEvents.length}件`, "ok");
  } catch (error) {
    console.warn("Moguri event sync fallback:", error);
    renderEvents(fallbackEvents);
    setSyncStatus("シート取得に失敗したため、保存済みの公開内容を表示中", "fallback");
  }
}

initialiseEventHub();
