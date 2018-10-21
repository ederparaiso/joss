function resetSpreadsheet() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadSheet.insertSheet(0);
  var sheets = spreadSheet.getSheets();
  sheets.shift();
  sheets.forEach(function(sheet){
    Logger.log('deleting ' + sheet.getName());
    spreadSheet.deleteSheet(sheet);
  });
  spreadSheet.renameActiveSheet('Issues');
  spreadSheet.insertSheet('Fields');
}
