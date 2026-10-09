/* ============================================
   SmartSheet Studio — Workbook Module
   Manages multiple sheets within a workbook
   ============================================ */

(function (global) {
  "use strict";

  const Workbook = {
    sheets: [],           // Array of sheet objects
    activeSheetIndex: 0,  // Currently active sheet

    /**
     * Initialize with one default sheet.
     */
    init() {
      this.sheets = [];
      this.activeSheetIndex = 0;
      this.createSheet("Sheet1");
    },

    /**
     * Generate a unique sheet ID.
     */
    generateId() {
      return "sheet_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    },

    /**
     * Create a new sheet and return it.
     */
    createSheet(name) {
      const sheet = {
        id: this.generateId(),
        name: name || this.getDefaultName(),
        cells: {},
        rowCount: 20,
        colCount: 10,
        selectedCell: "A1",
        editingCell: null
      };
      this.sheets.push(sheet);
      return sheet;
    },

    /**
     * Get a default unique sheet name like "Sheet2".
     */
    getDefaultName() {
      let n = this.sheets.length + 1;
      let name = "Sheet" + n;
      while (this.sheets.some(s => s.name === name)) {
        n++;
        name = "Sheet" + n;
      }
      return name;
    },

    /**
     * Get currently active sheet object.
     */
    getActiveSheet() {
      return this.sheets[this.activeSheetIndex];
    },

    /**
     * Switch to a sheet by index.
     */
    switchTo(index) {
      if (index < 0 || index >= this.sheets.length) return false;
      this.activeSheetIndex = index;
      return true;
    },

    /**
     * Rename a sheet. Returns true if success.
     */
    renameSheet(index, newName) {
      if (index < 0 || index >= this.sheets.length) return false;
      const trimmed = String(newName || "").trim();
      if (!trimmed) return false;

      // Prevent duplicate names
      if (this.sheets.some((s, i) => i !== index && s.name === trimmed)) {
        return false;
      }

      this.sheets[index].name = trimmed;
      return true;
    },

    /**
     * Delete a sheet. Cannot delete the last sheet.
     */
    deleteSheet(index) {
      if (this.sheets.length <= 1) return false;
      if (index < 0 || index >= this.sheets.length) return false;

      this.sheets.splice(index, 1);

      // Adjust active index
      if (this.activeSheetIndex >= this.sheets.length) {
        this.activeSheetIndex = this.sheets.length - 1;
      }
      return true;
    },

    /**
     * Duplicate a sheet.
     */
    duplicateSheet(index) {
      if (index < 0 || index >= this.sheets.length) return false;
      const src = this.sheets[index];
      const copy = {
        id: this.generateId(),
        name: this.getUniqueName(src.name + " copy"),
        cells: JSON.parse(JSON.stringify(src.cells)),
        rowCount: src.rowCount,
        colCount: src.colCount,
        selectedCell: "A1",
        editingCell: null
      };
      this.sheets.splice(index + 1, 0, copy);
      return true;
    },

    /**
     * Get a unique name based on a base name.
     */
    getUniqueName(base) {
      let name = base;
      let n = 2;
      while (this.sheets.some(s => s.name === name)) {
        name = base + " (" + n + ")";
        n++;
      }
      return name;
    }
  };

  global.Workbook = Workbook;

})(window);