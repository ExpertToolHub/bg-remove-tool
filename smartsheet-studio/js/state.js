/* ============================================
   SmartSheet Studio — State Module
   Central data model for the workbook
   ============================================ */

(function (global) {
  "use strict";

  /**
   * SmartState
   * Holds the current workbook data.
   * Phase 1: single sheet, plain string values.
   */
  const SmartState = {
    // Number of rows and columns in the active sheet
    rowCount: 20,
    colCount: 10,

    // Sheet data: { "A1": "value", "B2": "hello", ... }
    cells: {},

    // Currently selected cell (A1 notation)
    selectedCell: "A1",

    // Currently editing cell (or null)
    editingCell: null,

    /**
     * Get value of a cell by A1 reference.
     */
    getCell(ref) {
      return this.cells[ref] !== undefined ? this.cells[ref] : "";
    },

    /**
     * Set value of a cell.
     */
    setCell(ref, value) {
      const trimmed = String(value === null || value === undefined ? "" : value);
      if (trimmed === "") {
        delete this.cells[ref];
      } else {
        this.cells[ref] = trimmed;
      }
    },

    /**
     * Clear all data.
     */
    clear() {
      this.cells = {};
    }
  };

  // Expose globally
  global.SmartState = SmartState;

})(window);