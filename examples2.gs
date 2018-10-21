// URL for Jira's REST API for issues
//var getIssueURL = "https://[Your Jira host]/rest/api/2/issue/";

// Personally I prefer the script to handle request failures, hence muteHTTPExceptions = true
//var fetchArgs = {
//  contentType: "application/json",
//  headers: {"Authorization":"Basic [Your BASE64 Encoded user:pass]"},
//  muteHttpExceptions : true
//};

/**
 * Make a request to jira for all listed tickets, and update the spreadsheet 
 */
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