function myFunction() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();  
  var sheet = spreadSheet.getSheetByName("Atributos");
  var rows = sheet.getDataRange();
  
  Browser.msgBox(rows.getCell(2, 2).getValue(), Browser.Buttons.OK);
}
