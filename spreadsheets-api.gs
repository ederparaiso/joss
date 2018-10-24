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

function setDefaultFieldsAttributes(sheetName, headers){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  spreadSheet.deleteSheet(sheet);
  sheet = spreadSheet.insertSheet(sheetName);
  sheet.appendRow(headers);
  for(var attribute in defaultFieldsAttributes){
    sheet.appendRow([attribute, defaultFieldsAttributes[attribute].isArray, defaultFieldsAttributes[attribute].primitive, 
                     defaultFieldsAttributes[attribute].attribute, defaultFieldsAttributes[attribute].customEmptyValue]);
  }
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  range.createFilter();
}
