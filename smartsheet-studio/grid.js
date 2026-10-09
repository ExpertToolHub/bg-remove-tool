/* ============================================
   SmartSheet Studio — Grid Module (Phase 2)
   ============================================ */

(function (global) {
  "use strict";

  const Grid = {
    colLetter(index) {
      let letter = "";
      let n = index;
      while (n >= 0) {
        letter = String.fromCharCode((n % 26) + 65) + letter;
        n = Math.floor(n / 26) - 1;
      }
      return letter;
    },

    toRef(row, col) {
      return this.colLetter(col) + (row + 1);
    },

    colIndex(letter) {
      let idx = 0;
      for (let i = 0; i < letter.length; i++) {
        idx = idx * 26 + (letter.charCodeAt(i) - 64);
      }
      return idx - 1;
    },

    render() {
      const state = global.SmartState;
      const table = document.getElementById("sheetGrid");
      if (!table) return;

      table.innerHTML = "";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      const corner = document.createElement("th");
      corner.className = "corner-cell";
      headerRow.appendChild(corner);

      for (let c = 0; c < state.colCount; c++) {
        const th = document.createElement("th");
        th.className = "col-header";
        th.textContent = this.colLetter(c);
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      for (let r = 0; r < state.rowCount; r++) {
        const tr = document.createElement("tr");

        const rowHead = document.createElement("th");
        rowHead.className = "row-header";
        rowHead.textContent = r + 1;
        tr.appendChild(rowHead);

        for (let c = 0; c < state.colCount; c++) {
          const ref = this.toRef(r, c);
          const td = document.createElement("td");
          td.className = "data-cell";
          td.dataset.ref = ref;
          td.textContent = state.getCell(ref);

          if (ref === state.selectedCell) {
            td.classList.add("selected");
          }

          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }

      table.appendChild(tbody);
    },

    updateSelection() {
      const state = global.SmartState;

      document.querySelectorAll(".data-cell.selected").forEach(el => {
        el.classList.remove("selected");
      });

      const cell = document.querySelector(
        '.data-cell[data-ref="' + state.selectedCell + '"]'
      );
      if (cell) {
        cell.classList.add("selected");

        document.getElementById("cellRef").textContent = state.selectedCell;
        document.getElementById("formulaInput").textContent =
          state.getCell(state.selectedCell) || "—";

        document.getElementById("statusCell").textContent = state.selectedCell;
      }
    },

    selectCell(ref) {
      global.SmartState.selectedCell = ref;
      this.updateSelection();
    },

    moveSelection(dRow, dCol) {
      const state = global.SmartState;
      const current = state.selectedCell;
      const match = current.match(/^([A-Z]+)(\d+)$/);
      if (!match) return;

      const col = this.colIndex(match[1]);
      const row = parseInt(match[2], 10) - 1;

      const newRow = Math.max(0, Math.min(state.rowCount - 1, row + dRow));
      const newCol = Math.max(0, Math.min(state.colCount - 1, col + dCol));

      this.selectCell(this.toRef(newRow, newCol));
      this.scrollCellIntoView(newRow, newCol);
    },

    scrollCellIntoView(row, col) {
      const cell = document.querySelector(
        '.data-cell[data-ref="' + this.toRef(row, col) + '"]'
      );
      if (cell && cell.scrollIntoView) {
        cell.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    },

    startEdit(initialChar) {
      const state = global.SmartState;
      if (state.editingCell) return;

      const ref = state.selectedCell;
      const cell = document.querySelector('.data-cell[data-ref="' + ref + '"]');
      if (!cell) return;

      state.editingCell = ref;
      cell.classList.add("editing");
      cell.classList.remove("selected");

      const input = document.createElement("input");
      input.type = "text";
      input.className = "cell-input";
      input.value = initialChar !== undefined ? initialChar : state.getCell(ref);

      cell.textContent = "";
      cell.appendChild(input);
      input.focus();

      if (initialChar !== undefined) {
        input.setSelectionRange(input.value.length, input.value.length);
      } else {
        input.select();
      }

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.commitEdit(input.value);
          this.moveSelection(1, 0);
        } else if (e.key === "Escape") {
          e.preventDefault();
          this.cancelEdit();
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.commitEdit(input.value);
          this.moveSelection(0, e.shiftKey ? -1 : 1);
        }
      });

      input.addEventListener("blur", () => {
        if (state.editingCell === ref) {
          this.commitEdit(input.value);
        }
      });
    },

    commitEdit(value) {
      const state = global.SmartState;
      const ref = state.editingCell;
      if (!ref) return;

      state.setCell(ref, value);
      state.editingCell = null;

      const cell = document.querySelector('.data-cell[data-ref="' + ref + '"]');
      if (cell) {
        cell.classList.remove("editing");
        cell.textContent = state.getCell(ref);
      }

      state.selectedCell = ref;
      this.updateSelection();
      this.setStatus("Saved: " + ref);
    },

    cancelEdit() {
      const state = global.SmartState;
      const ref = state.editingCell;
      if (!ref) return;

      state.editingCell = null;
      const cell = document.querySelector('.data-cell[data-ref="' + ref + '"]');
      if (cell) {
        cell.classList.remove("editing");
        cell.textContent = state.getCell(ref);
      }

      state.selectedCell = ref;
      this.updateSelection();
      this.setStatus("Edit cancelled");
    },

    setStatus(msg) {
      const el = document.getElementById("statusMessage");
      if (el) el.textContent = msg;
    }
  };

  global.Grid = Grid;

})(window);