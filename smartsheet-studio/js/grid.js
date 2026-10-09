/* ============================================
   SmartSheet Studio — Grid Module
   Renders the spreadsheet grid and handles
   cell selection + editing (Phase 1).
   ============================================ */

(function (global) {
  "use strict";

  const Grid = {
    /**
     * Convert column index (0-based) to letter (A, B, ..., Z, AA...).
     */
    colLetter(index) {
      let letter = "";
      let n = index;
      while (n >= 0) {
        letter = String.fromCharCode((n % 26) + 65) + letter;
        n = Math.floor(n / 26) - 1;
      }
      return letter;
    },

    /**
     * Build A1 reference from row/col (0-based).
     */
    toRef(row, col) {
      return this.colLetter(col) + (row + 1);
    },

    /**
     * Render the entire grid into the table element.
     */
    render() {
      const state = global.SmartState;
      const table = document.getElementById("sheetGrid");
      if (!table) return;

      table.innerHTML = "";

      // --- Header row ---
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

      // --- Body rows ---
      const tbody = document.createElement("tbody");

      for (let r = 0; r < state.rowCount; r++) {
        const tr = document.createElement("tr");

        // Row number header
        const rowHead = document.createElement("th");
        rowHead.className = "row-header";
        rowHead.textContent = r + 1;
        tr.appendChild(rowHead);

        // Data cells
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

    /**
     * Highlight the currently selected cell and update UI.
     */
    updateSelection() {
      const state = global.SmartState;

      // Remove old selection
      document.querySelectorAll(".data-cell.selected").forEach(el => {
        el.classList.remove("selected");
      });

      // Add new selection
      const cell = document.querySelector(
        '.data-cell[data-ref="' + state.selectedCell + '"]'
      );
      if (cell) {
        cell.classList.add("selected");

        // Update formula bar (cell reference + value)
        document.getElementById("cellRef").textContent = state.selectedCell;
        document.getElementById("formulaInput").textContent =
          state.getCell(state.selectedCell) || "—";

        // Update status bar
        document.getElementById("statusCell").textContent = state.selectedCell;
      }
    },

    /**
     * Select a cell by reference.
     */
    selectCell(ref) {
      global.SmartState.selectedCell = ref;
      this.updateSelection();
    },

    /**
     * Move selection by delta (row/col).
     */
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

    /**
     * Column letter → index (A→0, B→1, AA→26...).
     */
    colIndex(letter) {
      let idx = 0;
      for (let i = 0; i < letter.length; i++) {
        idx = idx * 26 + (letter.charCodeAt(i) - 64);
      }
      return idx - 1;
    },

    /**
     * Scroll the selected cell into view.
     */
    scrollCellIntoView(row, col) {
      const cell = document.querySelector(
        '.data-cell[data-ref="' + this.toRef(row, col) + '"]'
      );
      if (cell && cell.scrollIntoView) {
        cell.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    },

    /**
     * Begin editing the selected cell.
     */
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

      // Place cursor at end (or replace if initial char given)
      if (initialChar !== undefined) {
        input.setSelectionRange(input.value.length, input.value.length);
      } else {
        input.select();
      }

      // --- Input handlers ---
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

    /**
     * Commit the edited value.
     */
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

      // Restore selection & update bars
      state.selectedCell = ref;
      this.updateSelection();
      this.setStatus("Saved: " + ref);
    },

    /**
     * Cancel current edit.
     */
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

    /**
     * Update status bar message.
     */
    setStatus(msg) {
      const el = document.getElementById("statusMessage");
      if (el) el.textContent = msg;
    }
  };

  // Expose globally
  global.Grid = Grid;

})(window);