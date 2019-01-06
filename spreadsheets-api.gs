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

function writeDefaultFieldsAttributes(sheetName, headers){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  sheet.clear();
  sheet.getFilter().remove();
  sheet.appendRow(headers);
  for(var attribute in defaultFieldsAttributes){
    sheet.appendRow([attribute, defaultFieldsAttributes[attribute].isArray, defaultFieldsAttributes[attribute].primitive, 
                     defaultFieldsAttributes[attribute].attribute, defaultFieldsAttributes[attribute].customEmptyValue,
                     defaultFieldsAttributes[attribute].updatable]);
  }
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  range.createFilter();
}

function readFieldsSheetAttributes(sheetName){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  data.shift();
  fieldsAttributes = {};
  data.forEach(function(fieldAttribute){
    fieldsAttributes[fieldAttribute[0]] = {
      'isArray': fieldAttribute[1],
      'primitive': fieldAttribute[2],
      'attribute': fieldAttribute[3],
      'customEmptyValue': fieldAttribute[4],
      'updatable': fieldAttribute[5]
    };
  });
  return fieldsAttributes;
}

function writeIssues(sheetName, issues){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  //TODO validates sheet not found
  var sheet = spreadSheet.getSheetByName(sheetName);
  if(!sheet){
    return;
  }
  sheet.clear();
  sheet.getFilter().remove();
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

function readIssuesSheetAttributes(sheetName){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  return data;
  /*fieldsAttributes = {};
  data.forEach(function(fieldAttribute){
    fieldsAttributes[fieldAttribute[0]] = {
      'isArray': fieldAttribute[1],
      'primitive': fieldAttribute[2],
      'attribute': fieldAttribute[3],
      'customEmptyValue': fieldAttribute[4]
    };
  });
  return fieldsAttributes;
  */
}

function writeCell(sheetName, issueKey, row, col){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var cell = sheet.getRange(row, col);
  cell.setValue(issueKey);
}

function readCell(sheetName, row, col){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var cell = sheet.getRange(row, col);
  return cell.getValue();
}
  
  
  
  
  
  