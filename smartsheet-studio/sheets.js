/* ============================================
   SmartSheet Studio — Sheets UI Module
   Renders sheet tabs and handles interactions
   ============================================ */

(function (global) {
  "use strict";

  const SheetsUI = {
    /**
     * Render the sheet tabs bar.
     */
    render() {
      const Workbook = global.Workbook;
      const bar = document.getElementById("sheetTabs");
      if (!bar) return;

      bar.innerHTML = "";

      Workbook.sheets.forEach((sheet, index) => {
        const tab = document.createElement("div");
        tab.className = "sheet-tab";
        if (index === Workbook.activeSheetIndex) {
          tab.classList.add("active");
        }
        tab.dataset.index = index;

        const nameSpan = document.createElement("span");
        nameSpan.className = "sheet-tab-name";
        nameSpan.textContent = sheet.name;

        tab.appendChild(nameSpan);
        bar.appendChild(tab);
      });

      // Add "+" button
      const addBtn = document.createElement("button");
      addBtn.className = "sheet-add-btn";
      addBtn.textContent = "+";
      addBtn.title = "Add new sheet";
      bar.appendChild(addBtn);
    },

    /**
     * Switch to a sheet by index.
     */
    switchTo(index) {
      const Workbook = global.Workbook;
      if (index === Workbook.activeSheetIndex) return;

      const Grid = global.Grid;
      Workbook.switchTo(index);

      // Re-render grid for new sheet
      Grid.render();
      Grid.updateSelection();

      this.render();
      Grid.setStatus("Switched to " + Workbook.getActiveSheet().name);
    },

    /**
     * Add a new sheet.
     */
    addSheet() {
      const Workbook = global.Workbook;
      const Grid = global.Grid;

      const newSheet = Workbook.createSheet();
      Workbook.activeSheetIndex = Workbook.sheets.length - 1;

      Grid.render();
      Grid.updateSelection();
      this.render();
      Grid.setStatus("Created " + newSheet.name);
    },

    /**
     * Show rename prompt for a sheet.
     */
    renameSheet(index) {
      const Workbook = global.Workbook;
      const sheet = Workbook.sheets[index];
      if (!sheet) return;

      const newName = prompt("Rename sheet:", sheet.name);
      if (newName === null) return; // Cancelled

      const ok = Workbook.renameSheet(index, newName);
      if (ok) {
        this.render();
        global.Grid.setStatus("Renamed to " + sheet.name);
      } else {
        alert("Invalid name or name already exists.");
      }
    },

    /**
     * Delete a sheet (with confirmation).
     */
    deleteSheet(index) {
      const Workbook = global.Workbook;
      if (Workbook.sheets.length <= 1) {
        alert("Cannot delete the last sheet.");
        return;
      }

      const sheet = Workbook.sheets[index];
      const ok = confirm('Delete sheet "' + sheet.name + '"?\nThis cannot be undone.');
      if (!ok) return;

      const wasActive = index === Workbook.activeSheetIndex;
      Workbook.deleteSheet(index);

      if (wasActive) {
        global.Grid.render();
        global.Grid.updateSelection();
      }

      this.render();
      global.Grid.setStatus("Deleted sheet");
    },

    /**
     * Duplicate a sheet.
     */
    duplicateSheet(index) {
      const Workbook = global.Workbook;
      const ok = Workbook.duplicateSheet(index);
      if (ok) {
        this.render();
        global.Grid.setStatus("Sheet duplicated");
      }
    },

    /**
     * Setup event listeners on the tab bar.
     */
    setupEvents() {
      const bar = document.getElementById("sheetTabs");
      if (!bar) return;

      // --- Click on tab or add button ---
      bar.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".sheet-add-btn");
        if (addBtn) {
          this.addSheet();
          return;
        }

        const tab = e.target.closest(".sheet-tab");
        if (!tab) return;
        const index = parseInt(tab.dataset.index, 10);
        this.switchTo(index);
      });

      // --- Long-press / context menu on tab ---
      let pressTimer = null;

      bar.addEventListener("touchstart", (e) => {
        const tab = e.target.closest(".sheet-tab");
        if (!tab) return;
        pressTimer = setTimeout(() => {
          pressTimer = null;
          this.showContextMenu(tab, e);
        }, 600);
      }, { passive: true });

      bar.addEventListener("touchend", () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      });

      bar.addEventListener("touchmove", () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      });

      // --- Right-click (desktop) ---
      bar.addEventListener("contextmenu", (e) => {
        const tab = e.target.closest(".sheet-tab");
        if (!tab) return;
        e.preventDefault();
        this.showContextMenu(tab, e);
      });
    },

    /**
     * Show a context menu for a sheet tab.
     */
    showContextMenu(tabEl, event) {
      const index = parseInt(tabEl.dataset.index, 10);
      const Workbook = global.Workbook;
      const sheet = Workbook.sheets[index];
      if (!sheet) return;

      // Remove old menu
      const old = document.getElementById("sheetContextMenu");
      if (old) old.remove();

      const menu = document.createElement("div");
      menu.id = "sheetContextMenu";
      menu.className = "sheet-context-menu";

      const actions = [
        { label: "Rename",   fn: () => this.renameSheet(index) },
        { label: "Duplicate", fn: () => this.duplicateSheet(index) },
        { label: "Delete",   fn: () => this.deleteSheet(index), danger: true }
      ];

      actions.forEach(a => {
        const item = document.createElement("div");
        item.className = "context-item";
        if (a.danger) item.classList.add("danger");
        item.textContent = a.label;
        item.addEventListener("click", () => {
          menu.remove();
          a.fn();
        });
        menu.appendChild(item);
      });

      // Position menu above the tab
      const rect = tabEl.getBoundingClientRect();
      menu.style.left = Math.max(8, rect.left) + "px";
      menu.style.bottom = (window.innerHeight - rect.top + 4) + "px";

      document.body.appendChild(menu);

      // Close on outside click
      setTimeout(() => {
        document.addEventListener("click", function closeMenu(ev) {
          if (!menu.contains(ev.target)) {
            menu.remove();
            document.removeEventListener("click", closeMenu);
          }
        });
      }, 10);
    }
  };

  global.SheetsUI = SheetsUI;

})(window);