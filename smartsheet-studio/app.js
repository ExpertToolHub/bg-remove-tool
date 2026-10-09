/* ============================================
   SmartSheet Studio — App Bootstrap
   ============================================ */

(function (global) {
  "use strict";

  const App = {
    init() {
      const Grid = global.Grid;

      Grid.render();
      Grid.updateSelection();
      Grid.setStatus("Ready — tap a cell to edit");

      document.getElementById("sheetGrid").addEventListener("click", (e) => {
        const cell = e.target.closest(".data-cell");
        if (!cell) return;
        if (global.SmartState.editingCell) return;
        Grid.selectCell(cell.dataset.ref);
      });

      document.getElementById("sheetGrid").addEventListener("dblclick", (e) => {
        const cell = e.target.closest(".data-cell");
        if (!cell) return;
        Grid.selectCell(cell.dataset.ref);
        Grid.startEdit();
      });

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

      document.addEventListener("dblclick", (e) => {
        if (e.target.closest(".sheet-grid")) e.preventDefault();
      }, { passive: false });

      console.log("[SmartSheet Studio] Phase 1 initialized.");
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
  } else {
    App.init();
  }

})(window);