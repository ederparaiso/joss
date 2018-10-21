function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Importar Jiras",
    functionName : "importIssues"
  }];
  sheet.addMenu("Jira 1.0", entries);
};

var parent;

function importIssues(){
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
        "authorization": "Basic ******************"
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