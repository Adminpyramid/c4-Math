const display = document.getElementById("display");
const historyList = document.getElementById("historyList");

const equalsBtn = document.getElementById("equals");
const clearBtn = document.getElementById("clear");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const opButtons = document.querySelectorAll(".op");

let states = [""];
let stateIndex = 0;
let history = [];
let justEvaluated = false;

// Format numbers with spaces for readability
function formatExpressionForDisplay(expr) {
  return expr.replace(/\d+/g, (num) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  });
}

// Update display
function updateDisplay() {
  display.value = formatExpressionForDisplay(states[stateIndex] || "");
  updateUndoRedoButtons();
}

// Undo/redo buttons state
function updateUndoRedoButtons() {
  undoBtn.disabled = stateIndex <= 0;
  redoBtn.disabled = stateIndex >= states.length - 1;
}

// Push new state
function pushState(expr) {
  states = states.slice(0, stateIndex + 1);
  states.push(expr);
  stateIndex = states.length - 1;
  updateDisplay();
  justEvaluated = false;
}

// Replace current state
function replaceCurrentState(expr) {
  states[stateIndex] = expr;
  justEvaluated = false;
}

// Update history
function updateHistoryUI() {
  historyList.innerHTML = "";
  history.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      const parts = item.split("=");
      const left = parts[0].trim();
      pushState(left.replace(/\s/g, ''));
    });
    historyList.appendChild(li);
  });
}

// Evaluate expression
function evaluateExpression() {
  const expr = states[stateIndex] || "";
  if (expr.trim() === "") return;
  try {
    const cleaned = expr.replace(/\s/g, ''); // remove spaces
    const result = eval(cleaned);
    const formatted = Number(result).toLocaleString();
    history.push(`${expr} = ${formatted}`);
    updateHistoryUI();
    pushState(formatted);
    justEvaluated = true;
  } catch (err) {
    pushState("Error");
    justEvaluated = true;
  }
}

// Buttons
equalsBtn.addEventListener("click", evaluateExpression);
clearBtn.addEventListener("click", () => pushState(""));
undoBtn.addEventListener("click", () => {
  if (stateIndex > 0) stateIndex--;
  updateDisplay();
});
redoBtn.addEventListener("click", () => {
  if (stateIndex < states.length - 1) stateIndex++;
  updateDisplay();
});

// Operator buttons insert at cursor
opButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const symbol = btn.dataset.op; // use * directly
    insertAtCursor(display, symbol);
  });
});

// Insert text at cursor with auto-format
function insertAtCursor(input, text) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const current = input.value.replace(/\s/g, ''); // remove spaces
  const newValue = current.slice(0, start) + text + current.slice(end);

  input.value = formatExpressionForDisplay(newValue);
  let cursorPos = start + text.length;
  const spacesBefore = (input.value.slice(0, cursorPos).match(/\s/g) || []).length;
  input.selectionStart = input.selectionEnd = cursorPos + spacesBefore;
  input.focus();

  if (justEvaluated) {
    replaceCurrentState(newValue);
    justEvaluated = false;
  } else {
    pushState(newValue);
  }
}

// Prevent letters but allow digits, operators, parentheses, space
display.addEventListener("keydown", (e) => {
  const allowedKeys = [
    "Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown",
    "Enter","Tab","Escape"," "
  ];
  const allowedChars = /[\d\+\-\*\/\.\(\)\s]/;

  if (allowedKeys.includes(e.key)) return;
  if (allowedChars.test(e.key)) return;
  e.preventDefault();
});

// Input event (typing or pasting)
display.addEventListener("input", () => {
  let typed = display.value.replace(/[A-Za-z]/g, '');
  const internal = typed.replace(/\s/g, '');
  if (justEvaluated) {
    replaceCurrentState(internal);
    justEvaluated = false;
  } else {
    pushState(internal);
  }
  display.value = formatExpressionForDisplay(internal);
});

// Enter key evaluates
display.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    evaluateExpression();
  }
});

// Initialize
updateDisplay();
updateHistoryUI();
