/* ============================================
   SmartSheet Studio — App Bootstrap (Phase 2)
   ============================================ */

(function (global) {
  "use strict";

  const App = {
    init() {
      const Grid = global.Grid;
      const Workbook = global.Workbook;
      const SheetsUI = global.SheetsUI;

      // 1. Initialize workbook (creates Sheet1)
      Workbook.init();

      // 2. Render grid
      Grid.render();
      Grid.updateSelection();
      Grid.setStatus("Ready — tap a cell to edit");

      // 3. Render sheet tabs + setup events
      SheetsUI.render();
      SheetsUI.setupEvents();

      // 4. Cell click/tap → select
      document.getElementById("sheetGrid").addEventListener("click", (e) => {
        const cell = e.target.closest(".data-cell");
        if (!cell) return;
        if (global.SmartState.editingCell) return;
        Grid.selectCell(cell.dataset.ref);
      });

      // 5. Double-click → edit
      document.getElementById("sheetGrid").addEventListener("dblclick", (e) => {
        const cell = e.target.closest(".data-cell");
        if (!cell) return;
        Grid.selectCell(cell.dataset.ref);
        Grid.startEdit();
      });

      // 6. Keyboard navigation
      document.addEventListener("keydown", (e) => {
        if (global.SmartState.editingCell) return;

        switch (e.key) {
          case "ArrowUp":    e.preventDefault(); Grid.moveSelection(-1, 0); break;
          case "ArrowDown":  e.preventDefault(); Grid.moveSelection(1, 0);  break;
          case "ArrowLeft":  e.preventDefault(); Grid.moveSelection(0, -1); break;
          case "ArrowRight": e.preventDefault(); Grid.moveSelection(0, 1);  break;
          case "Enter":      e.preventDefault(); Grid.startEdit();          break;
          case "F2":         e.preventDefault(); Grid.startEdit();          break;
          case "Delete":
          case "Backspace":
            e.preventDefault();
            global.SmartState.setCell(global.SmartState.selectedCell, "");
            Grid.render();
            Grid.updateSelection();
            Grid.setStatus("Cell cleared");
            break;
          default:
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              e.preventDefault();
              Grid.startEdit(e.key);
            }
        }
      });

      // 7. Prevent double-tap zoom on grid
      document.addEventListener("dblclick", (e) => {
        if (e.target.closest(".sheet-grid")) e.preventDefault();
      }, { passive: false });

      console.log("[SmartSheet Studio] Phase 2 initialized.");
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
  } else {
    App.init();
  }

})(window);