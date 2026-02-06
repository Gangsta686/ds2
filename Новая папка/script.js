const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("is-active"));
    tabPanels.forEach((panel) => panel.classList.remove("is-active"));
    button.classList.add("is-active");
    const targetId = button.dataset.tab;
    document.getElementById(targetId).classList.add("is-active");
    if (targetId === "task2") {
      requestAnimationFrame(resizeCanvas);
    }
  });
});

const capacityInput = document.getElementById("capacity");
const itemsInput = document.getElementById("itemsInput");
const knapsackResult = document.getElementById("knapsackResult");
const calcKnapsackButton = document.getElementById("calcKnapsack");

const parseItems = (raw) => {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const items = [];
  lines.forEach((line, index) => {
    const parts = line.split(/[\s,;]+/).map(Number);
    if (parts.length < 2 || parts.some((n) => Number.isNaN(n) || n <= 0)) {
      throw new Error(`Ошибка в строке ${index + 1}`);
    }
    items.push({ weight: parts[0], value: parts[1] });
  });
  return items;
};

const solveKnapsack = (capacity, items) => {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () =>
    Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i += 1) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w += 1) {
      if (weight > w) {
        dp[i][w] = dp[i - 1][w];
      } else {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
      }
    }
  }

  const chosen = [];
  let remaining = capacity;
  for (let i = n; i > 0; i -= 1) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      chosen.push(i);
      remaining -= items[i - 1].weight;
    }
  }

  return { maxValue: dp[n][capacity], chosen: chosen.reverse() };
};

calcKnapsackButton.addEventListener("click", () => {
  const capacity = Number(capacityInput.value);
  if (!capacity || capacity <= 0) {
    knapsackResult.textContent = "Введите корректную вместимость.";
    return;
  }

  let items;
  try {
    items = parseItems(itemsInput.value);
  } catch (error) {
    knapsackResult.textContent = error.message;
    return;
  }

  if (items.length === 0) {
    knapsackResult.textContent = "Добавьте хотя бы один слиток.";
    return;
  }

  const { maxValue, chosen } = solveKnapsack(capacity, items);
  const chosenText =
    chosen.length === 0
      ? "Ничего не выбрано."
      : `Выбраны слитки: ${chosen
          .map((index) => `№${index}`)
          .join(", ")}`;
  knapsackResult.textContent = `Максимальная ценность: ${maxValue}. ${chosenText}`;
});

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const addNodeButton = document.getElementById("addNode");
const clearGraphButton = document.getElementById("clearGraph");
const countPathsButton = document.getElementById("countPaths");
const pathsResult = document.getElementById("pathsResult");
const nodeLabelInput = document.getElementById("nodeLabelInput");

const labels = [
  "A",
  "Б",
  "В",
  "Г",
  "Д",
  "Е",
  "Ж",
  "З",
  "И",
  "К",
  "Л",
  "М",
  "Н",
  "О",
  "П",
  "Р",
  "С",
  "Т",
  "У",
  "Ф",
  "Х",
  "Ц",
  "Ч",
  "Ш",
  "Щ",
  "Ы",
  "Э",
  "Ю",
  "Я",
];

const graphState = {
  nodes: [],
  edges: new Map(),
  pendingAdd: false,
  selectedNode: null,
};

const resizeCanvas = () => {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, rect.width);
  canvas.height = Math.max(1, rect.height);
  drawGraph();
};

window.addEventListener("resize", resizeCanvas);

const drawGraph = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  graphState.edges.forEach((targets, from) => {
    const fromNode = graphState.nodes[from];
    targets.forEach((to) => {
      const toNode = graphState.nodes[to];
      drawArrow(fromNode.x, fromNode.y, toNode.x, toNode.y);
    });
  });

  graphState.nodes.forEach((node, index) => {
    ctx.fillStyle =
      index === graphState.selectedNode ? "rgba(31, 122, 236, 0.15)" : "#fff";
    ctx.strokeStyle = "#1f2a44";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1f2a44";
    ctx.font = "14px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y);
  });
};

const drawArrow = (x1, y1, x2, y2) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 10;
  const offset = 20;
  const startX = x1 + Math.cos(angle) * offset;
  const startY = y1 + Math.sin(angle) * offset;
  const endX = x2 - Math.cos(angle) * offset;
  const endY = y2 - Math.sin(angle) * offset;

  ctx.strokeStyle = "#5b657a";
  ctx.fillStyle = "#5b657a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
};

const getNodeAt = (x, y) =>
  graphState.nodes.findIndex(
    (node) => Math.hypot(node.x - x, node.y - y) <= 18
  );

addNodeButton.addEventListener("click", () => {
  graphState.pendingAdd = true;
  graphState.selectedNode = null;
  pathsResult.textContent = "";
  drawGraph();
});

clearGraphButton.addEventListener("click", () => {
  graphState.nodes = [];
  graphState.edges.clear();
  graphState.pendingAdd = false;
  graphState.selectedNode = null;
  pathsResult.textContent = "";
  drawGraph();
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const addNodeAt = () => {
    const rawLabel = nodeLabelInput.value.trim();
    const label =
      rawLabel.length > 0
        ? rawLabel.toUpperCase()
        : labels[graphState.nodes.length] || `V${graphState.nodes.length + 1}`;
    graphState.nodes.push({ x, y, label });
    graphState.pendingAdd = false;
    nodeLabelInput.value = "";
    drawGraph();
  };

  if (graphState.pendingAdd) {
    addNodeAt();
    return;
  }

  const clickedIndex = getNodeAt(x, y);
  if (clickedIndex === -1) {
    if (graphState.selectedNode === null) {
      addNodeAt();
    } else {
      graphState.selectedNode = null;
      drawGraph();
    }
    return;
  }

  if (graphState.selectedNode === null) {
    graphState.selectedNode = clickedIndex;
    drawGraph();
    return;
  }

  if (graphState.selectedNode !== clickedIndex) {
    const from = graphState.selectedNode;
    if (!graphState.edges.has(from)) {
      graphState.edges.set(from, new Set());
    }
    graphState.edges.get(from).add(clickedIndex);
  }

  graphState.selectedNode = null;
  drawGraph();
});

const countPaths = () => {
  if (graphState.nodes.length === 0) {
    return { kind: "empty" };
  }

  const start = graphState.nodes.findIndex((node) => node.label === "A");
  const target = graphState.nodes.findIndex((node) => node.label === "Я");
  if (start === -1 || target === -1) {
    return { kind: "missing", startMissing: start === -1, targetMissing: target === -1 };
  }

  const n = graphState.nodes.length;
  const adjacency = Array.from({ length: n }, (_, i) =>
    graphState.edges.has(i) ? Array.from(graphState.edges.get(i)) : []
  );

  const reverseAdj = Array.from({ length: n }, () => []);
  adjacency.forEach((targets, from) => {
    targets.forEach((to) => reverseAdj[to].push(from));
  });

  const canReachTarget = Array(n).fill(false);
  const stack = [target];
  canReachTarget[target] = true;
  while (stack.length) {
    const node = stack.pop();
    reverseAdj[node].forEach((prev) => {
      if (!canReachTarget[prev]) {
        canReachTarget[prev] = true;
        stack.push(prev);
      }
    });
  }

  const state = Array(n).fill(0);
  const memo = Array(n).fill(0);
  let infinite = false;

  const dfs = (node) => {
    if (!canReachTarget[node]) return 0;
    if (state[node] === 1) {
      infinite = true;
      return 0;
    }
    if (state[node] === 2) return memo[node];

    state[node] = 1;
    let total = node === target ? 1 : 0;
    adjacency[node].forEach((next) => {
      total += dfs(next);
    });
    state[node] = 2;
    memo[node] = total;
    return total;
  };

  const result = dfs(start);
  if (infinite) {
    return { kind: "infinite" };
  }
  return { kind: "count", value: result };
};

countPathsButton.addEventListener("click", () => {
  const result = countPaths();
  if (result.kind === "empty") {
    pathsResult.textContent = "Добавьте вершины и связи.";
    return;
  }
  if (result.kind === "missing") {
    const parts = [];
    if (result.startMissing) parts.push("A");
    if (result.targetMissing) parts.push("Я");
    pathsResult.textContent = `Не хватает вершины: ${parts.join(" и ")}.`;
    return;
  }
  if (result.kind === "infinite") {
    pathsResult.textContent = "Пути бесконечны (есть цикл).";
    return;
  }
  pathsResult.textContent = `Количество путей: ${result.value}.`;
});

resizeCanvas();

