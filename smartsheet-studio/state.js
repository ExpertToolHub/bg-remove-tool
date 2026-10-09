/* ============================================
   SmartSheet Studio — State Module
   ============================================ */

(function (global) {
  "use strict";

  const SmartState = {
    rowCount: 20,
    colCount: 10,
    cells: {},
    selectedCell: "A1",
    editingCell: null,

    getCell(ref) {
      return this.cells[ref] !== undefined ? this.cells[ref] : "";
    },

    setCell(ref, value) {
      const trimmed = String(value === null || value === undefined ? "" : value);
      if (trimmed === "") {
        delete this.cells[ref];
      } else {
        this.cells[ref] = trimmed;
      }
    },

    clear() {
      this.cells = {};
    }
  };

  global.SmartState = SmartState;

})(window);