/* ============================================
   SmartSheet Studio — State Module
   Now delegates to active sheet in Workbook.
   ============================================ */

(function (global) {
  "use strict";

  const SmartState = {
    // Legacy properties (kept for compatibility)
    get rowCount() {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      return sheet ? sheet.rowCount : 20;
    },
    set rowCount(v) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (sheet) sheet.rowCount = v;
    },

    get colCount() {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      return sheet ? sheet.colCount : 10;
    },
    set colCount(v) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (sheet) sheet.colCount = v;
    },

    get cells() {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      return sheet ? sheet.cells : {};
    },
    set cells(v) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (sheet) sheet.cells = v;
    },

    get selectedCell() {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      return sheet ? sheet.selectedCell : "A1";
    },
    set selectedCell(ref) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (sheet) sheet.selectedCell = ref;
    },

    get editingCell() {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      return sheet ? sheet.editingCell : null;
    },
    set editingCell(ref) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (sheet) sheet.editingCell = ref;
    },

    /**
     * Get cell value from active sheet.
     */
    getCell(ref) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (!sheet) return "";
      return sheet.cells[ref] !== undefined ? sheet.cells[ref] : "";
    },

    /**
     * Set cell value in active sheet.
     */
    setCell(ref, value) {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (!sheet) return;
      const trimmed = String(value === null || value === undefined ? "" : value);
      if (trimmed === "") {
        delete sheet.cells[ref];
      } else {
        sheet.cells[ref] = trimmed;
      }
    },

    /**
     * Clear all cells in active sheet.
     */
    clear() {
      const sheet = global.Workbook && global.Workbook.getActiveSheet();
      if (sheet) sheet.cells = {};
    }
  };

  global.SmartState = SmartState;

})(window);