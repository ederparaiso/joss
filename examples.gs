// URL for Jira's REST API for issues
//var getIssueURL = "https://[Your Jira host]/rest/api/2/issue/";

// Personally I prefer the script to handle request failures, hence muteHTTPExceptions = true
//var fetchArgs = {
//  contentType: "application/json",
//  headers: {"Authorization":"Basic [Your BASE64 Encoded user:pass]"},
//  muteHttpExceptions : true
// teste
//};

/**
 * Make a request to jira for all listed tickets, and update the spreadsheet 
 */
function myFunction() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();  
  var sheet = spreadSheet.getSheetByName("Atributos");
  var rows = sheet.getDataRange();
  
  Browser.msgBox(rows.getCell(2, 2).getValue(), Browser.Buttons.OK);
}

function refreshTickets(){
  // Pull the bits and pieces you need from the spreadsheet
  var sheet = getTicketSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  // Show the user a friendly message
  Browser.msgBox("Jira Tickets","Updating " + numRows + " tickets",Browser.Buttons.OK);

  for (var i = 1; i < numRows; i++) {
    var row = values[i];
    var ri = i + 1; // Set the cell row index
    var httpResponse = UrlFetchApp.fetch(getIssueURL + row[0], fetchArgs);

    if (httpResponse) {
      switch(httpResponse.getResponseCode()){
        case 200:          
          var data = JSON.parse(httpResponse.getContentText());

          // Check the data is valid and the Jira fields exist
          if(data && data.fields) {
            // Set some basic ticket data in your spreadsheet
            rows.getCell(ri, 2).setValue(data.fields.issuetype.name);
            rows.getCell(ri, 3).setValue(data.fields.reporter.displayName);
            rows.getCell(ri, 4).setValue(data.fields.assignee.displayName);
            rows.getCell(ri, 5).setValue(data.fields.summary);
          }
          else {
            // Something funky is up with the JSON response.
            resetRow(i,"Failed to retrive ticket data!");
          }
          break;
        case 404:
          rows.getCell(ri, 5).setValue("This ticket does not exist");
          break;
        default:
          // Jira returns all errors that occured in an array (if using the application/json mime type)
          var data = JSON.parse(httpResponse.getContentText());
          rows.getCell(ri, 5).setValue("Error: " + data.errorMessages.join(","));
          break;
      }
    }
    else {
      Browser.msgBox("Jira Error","Unable to make requests to Jira!", Browser.Buttons.OK);
      break;
    }
  }
}

var parent;
function importIssues2(){
  //Carregar atributos
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetAttributes = spreadSheet.getSheetByName("Atributos");
  var rowsAttributes = sheetAttributes.getDataRange();
  var numrowsAttributes = rowsAttributes.getNumRows();
  var parentType = rowsAttributes.getCell(1, 2).getValue();
  var subIssueType = rowsAttributes.getCell(2, 2).getValue();
  var projectKey = rowsAttributes.getCell(4, 2).getValue(); 
  
  //Carregar tarefas da aba "Payload"
  var sheetPayload = spreadSheet.getSheetByName("Payload");
  var rowsPayload = sheetPayload.getDataRange();
  var numrowsPayload = rowsPayload.getNumRows();
  var values = rowsPayload.getValues();
 
  var parent;
  var url = "https://****.atlassian.net/rest/api/latest/issue";
  
  for (var i = 1; i < numrowsPayload; i++) {
    var row = values[i];
    var ri = i + 1;
    var parent = false;
    
    var type = rowsPayload.getCell(ri, 4).getValue();
    var component = rowsPayload.getCell(ri, 5).getValue();
    
    if(type == parentType){
      var parent = true;
      var parentID = rowsPayload.getCell(ri, 4).getValue();
      var parentComponent = rowsPayload.getCell(ri, 5).getValue();
    }
    
    //Montar payload com a issue  
    if(parent) {
      var data = 
        {
          "fields": {
            "project":{ 
              "key": projectKey
            },
            "summary": rowsPayload.getCell(ri, 2).getValue(),
            "description": rowsPayload.getCell(ri, 3).getValue(),
            "issuetype":{
              "name": type
           },
            "components": [{"name": parentComponent}]
          }
        };
    }
    else{      
        var data = 
        {
          "fields": {
            "project":{ 
              "key": projectKey
            },
            "summary": rowsPayload.getCell(ri, 2).getValue(),
            "description": rowsPayload.getCell(ri, 3).getValue(),
           "issuetype":{
              "name": subIssueType
            },
            "parent":
            {
              "key": parentID
            },
            "timetracking":
            {
              "originalEstimate": rowsPayload.getCell(ri, 6).getValue(),
              "remainingEstimate": rowsPayload.getCell(ri, 6).getValue(),
            },
            "components": [{"name": parentComponent}]
          },
        };
    }
    
    var payload = JSON.stringify(data);
     
    var headers = 
      { 
        "content-type": "application/json",
        "Accept": "application/json",
        "authorization": "Basic ***********"
      };
    
    var options = 
      { 
        "content-type": "application/json",
        "method": "POST",
        "headers": headers,
        "payload": payload
      };
    
    var response = UrlFetchApp.fetch(url, options);  
    //BrowsPayloader.msgBox(response.getContentText() , BrowsPayloader.Buttons.OK);
    
    var splitted = response.getContentText().replace(/[:]/g, ',').replace(/["]/g, '').split(",");
    rowsPayload.getCell(ri, 1).setValue(splitted[3]);
    if(parent)
      rowsPayload.getCell(ri, 4).setValue(type);
    else
      rowsPayload.getCell(ri, 4).setValue(subIssueType);
    rowsPayload.getCell(ri, 5).setValue(parentComponent);
   
    if(parent){
      var parentID = splitted[3];
    }   
  };
}
