function readCell(sheetName, row, col){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var cell = sheet.getRange(row, col);
  return cell.getValue();
}

function writeCell(sheetName, value, row, col){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var cell = sheet.getRange(row, col);
  cell.setValue(value);
}

function resetSpreadsheet() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadSheet.insertSheet(0);
  var sheets = spreadSheet.getSheets();
  sheets.shift();
  sheets.forEach(function(sheet){
    Logger.log('deleting sheet: ' + sheet.getName());
    spreadSheet.deleteSheet(sheet);
  });
  spreadSheet.renameActiveSheet('Issues');
  spreadSheet.insertSheet('Fields');
}

function readAttributesFromFieldsSheet(sheetName){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  data.shift();
  return data.map(function(fieldAttribute){
    return fieldAttribute[0];
  });
}

function writeDefaultAttributesOnFieldsSheet(sheetName, headers){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  sheet.clear();
  var filter = sheet.getFilter();
  if(filter){
    filter.remove();
  }
  sheet.appendRow(headers);
  for(var attribute in defaultFieldsAttributes){
    sheet.appendRow([attribute, defaultFieldsAttributes[attribute].isArray, defaultFieldsAttributes[attribute].updatable]);
  }
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  range.createFilter();
}

function readItensFromIssuesSheet(sheetName){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  return data;
}

function writeItensOnIssuesSheet(sheetName, issues){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  if(!sheet){
    return;
  }
  sheet.clear();
  var filter = sheet.getFilter();
  if(filter){
    filter.remove();
  }
  var fieldsAttributes = getFieldsAttributes();
  var headers = [];
  for(var issueField in fieldsAttributes){
    headers.push(issueField);
  }
  sheet.appendRow(headers);
  issues.forEach(function(issue){
    var row = extractIssueFields(issue, headers, fieldsAttributes);
    sheet.appendRow(row);
  });
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  range.createFilter();
}

function extractIssueFields(issue, fields, fieldsAttributes){
  return fields.map(function(field){
    if(fieldsAttributes[field].isArray){
      return issue[field].join(',');
    }
    return issue[field] || '';
  });
}

function setValidationOnCell(sheetName, row, col, values){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var cell = sheet.getRange(row, col);
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values).build();
  cell.setDataValidation(rule);
}

function removeDataValidationOnCell(sheetName, row, col){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var cell = sheet.getRange(row, col);
  cell.clearDataValidations();
}
