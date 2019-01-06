var ui = SpreadsheetApp.getUi();

function onOpen(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [];
  entries.push({ name : 'Authenticate', functionName : 'authUser' });
  entries.push(null);
  entries.push({ name : 'Import settings', functionName : 'importSettings' });
  entries.push(null);
  entries.push({ name : 'Search issues', functionName : 'searchIssues' });
  entries.push(null);
  entries.push({ name : 'Sync issues', functionName : 'syncIssues' });
  entries.push(null);
  entries.push({ name : 'Test connection', functionName : 'testConnection' });
  entries.push(null);
  entries.push({ name : 'Reset field settings', functionName : 'resetFieldSettings' });
  entries.push(null);
  entries.push({ name : 'Reset all settings', functionName : 'resetSettings' });
  entries.push(null);
  entries.push({ name : 'About', functionName : 'about' });
  sheet.addMenu('Jira 3.0', entries);
};

function authUser(){
  var html = HtmlService.createHtmlOutputFromFile('user-auth-ui');
  ui.showModalDialog(html, 'Jira Authentication');
}

function importSettings(){
  ui.alert('All fields available in \'Fields\' sheet will be show on issues seach/sync. \
            You can customize which fields to use editing \'Fields\' sheet.\n\nImporting...');
  var fieldsAttributes = readAttributesFromFieldsSheet('Fields');
  storeFieldsAttributes(fieldsAttributes);
  var result = ui.prompt('Set or update your project settings', 'Enter your jira project code (key):', ui.ButtonSet.OK);
  var projectKey = result.getResponseText();
  if(projectKey){
    storeProjectKey(projectKey);
  }
  ui.alert('Project settings successfully set.');
}

function searchIssues(){
  var userAuth = getUserAuth();
  if(!userAuth){
    requireAuth();
    return;
  }
  var projectKey = getProjectKey();
  if(!projectKey){
    requireProjectConfig();
    return;
  }
  var result = ui.prompt('Search Issues', 'Enter your search query in jql (JIRA Query Language) format:', ui.ButtonSet.OK);
  var searchQuery = result.getResponseText();
  if(searchQuery){
    var fieldsAttributes = getFieldsAttributes();
    var fields = [];
    for(var field in fieldsAttributes){
      fields.push(field);
    }
    var issues = [];
    var issuesResult = findIssues(userAuth, projectKey, searchQuery, fields, 0);
    if(!issuesResult || issuesResult.total == 0){
      ui.alert('No issues matches found.');
      return;
    }
    Array.prototype.push.apply(issues, issuesResult.issues);
    var pages = Math.ceil(issuesResult.total/defaultMaxResults);
    for(var pageNumber = 2; pageNumber <= pages; pageNumber++){
      var startIndex = (pageNumber-1) * defaultMaxResults;
      var pageResult = findIssues(userAuth, projectKey, searchQuery, fields, startIndex);
      Array.prototype.push.apply(issues, pageResult.issues);
    }
    Logger.log('Issues found: ' + issues.length);
    writeItensOnIssuesSheet('Issues', issues);
    ui.alert('Issues found: ' + issues.length);
  }
}

function syncIssues(){
  var userAuth = getUserAuth();
  if(!userAuth){
    requireAuth();
    return;
  }
  var projectKey = getProjectKey();
  if(!projectKey){
    requireProjectConfig();
    return;
  }
  var result = ui.alert('Please confirm', 'Sync issues? this action can not be undone.', ui.ButtonSet.YES_NO);
  if (result != ui.Button.YES) {
    return;
  }
  var issuesData = readItensFromIssuesSheet('Issues');
  var fieldNames = issuesData.shift();
  var amountOfFields = fieldNames.length;
  var keyFieldPos = fieldNames.indexOf('key');
  var parentFieldPos = fieldNames.indexOf('parent');
  if(keyFieldPos === -1 || parentFieldPos === -1){
    ui.alert('\'key\' and \'parent\' fields are required to sync issues.');
    return;
  }
  var sheetCellParentFieldCol = parentFieldPos + 1;
  var sheetCellKeyFieldCol = keyFieldPos + 1;
  var updatedIssues = 0;
  var createdIssues = 0;
  for(var i = 0; i < issuesData.length; i++){
    var sheetCellRow = i + 2;
    var issueKey = issuesData[i][keyFieldPos];
    if(issueKey){
      var issueData = fieldNames.reduce(function(issueData, fieldName, index){
        issueData[fieldName] = issuesData[i][index];
        return issueData;
      }, {});
      removeFieldsBeforeUpdate(issueData);
      var result = updateIssue(userAuth, issueKey, issueData);
      if(!result){
        ui.alert('There was an error on issue update row ' + sheetCellRow);
        return;
      }
      updatedIssues++;
    }
    else{
      var issueData = fieldNames.reduce(function(issueData, fieldName, index){
        if(issuesData[i][index]){
          issueData[fieldName] = issuesData[i][index];
        }
        return issueData;
      }, {});
      removeReadOnlyFieldsBeforeCreate(issueData);
      if(!issueData.project){
        issueData.project = projectKey;
      }
      if(issueData.parent){
        if(parseInt(issueData.parent)){
          issueData.parent = readCell('Issues', parseInt(issueData.parent), sheetCellKeyFieldCol);
          writeCell('Issues', issueData.parent, sheetCellRow, sheetCellParentFieldCol);
        }
      }
      else{
        delete issueData.parent;
      }
      var createdIssueKey = createIssue(userAuth, issueData);
      if(!createdIssueKey){
        ui.alert('There was an error on issue creation row ' + sheetCellRow);
        return;
      }
      writeCell('Issues', createdIssueKey, sheetCellRow, sheetCellKeyFieldCol);
      createdIssues++;
    }
  }
  ui.alert('Sync successfull.\n\nIssues updated: ' + updatedIssues + '\nIssues created: ' + createdIssues);
}

function testConnection(){
  var userAuth = getUserAuth();
  if(!userAuth){
    requireAuth();
    return;
  }
  var userInfo = getUserInfo(userAuth);
  if(!userInfo){
    ui.alert('Connection Failed. Try to authenticate.');
    return;
  }
  Logger.log(JSON.stringify(userInfo));
  ui.alert('User authenticated. Connection successful. Info:\nId: ' + userInfo.id + '\nName: ' + userInfo.name + '\nEmail: ' + userInfo.email);
}

function resetFieldSettings(){
  var result = ui.alert('Please confirm', 
                        'Are you sure about this? \'Fields\' sheet will be reset and all default fields will be show in issues search/sync.\n \
                         You can customize which fields to use editing \'Fields\' sheet and use \'Import Settings\' menu.', ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    writeDefaultAttributesOnFieldsSheet('Fields', ['field', 'isArray', 'updatable']);
    storeDefaultFieldsAttributes();
    ui.alert('Success.');
  }
}

function resetSettings(){
  var result = ui.alert('Please confirm', 'Are you sure about this? All settings will be lost and \
                         you will need to authenticate and import new field settings again.', ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    resetProperties();
    resetSpreadsheet();
    writeDefaultAttributesOnFieldsSheet('Fields', ['field', 'isArray', 'updatable']);
    ui.alert('Success.');
  }
}

function about(){
  ui.alert('-- Jira on Spreadsheets --\n\n \
           How to use:\n \
           1- If its your first use after import google scripts, setup spreadsheet by using \'Reset all settings\' menu.*\n \
           2- Login on your jira account using \'Authenticate\' menu.\n \
           3- Test your login connection using \'Test connection\' menu.**\n \
           4- On \'Fields\' sheet, select which issues fields to use. Remove unecessary fields/rows.***\n \
           5- Configure your jira project key and task fields using \'Import settings\' menu.\n \
           6- If you need to configure issue fields again, use \'Reset field settings\' menu to get original fields and import again using \'Import settings\' menu.\n \
           7- Search issues input query in jql format using \'Search issues\' menu. Results will be displayed in \'Issues\' sheet.\n \
           8- Update issues in \'Issues\' sheet using \'Sync issues\' menu.****\n \
           9- Create new issues in \'Issues\' sheet leaving \'key\' column blank and use \'Sync issues\' menu.*****\n\n \
           *sheet names can not be changed.\n \
           **jira cloud users that login with integrated google account must be able to login with email/password on jira page. \
           If you are not able, go to jira login page and ask recovery link to your account and set proper password. It will \
           create a jira "OnDemand password" which can be used to authenticate and consume jira services.\n \
           ***\'key\' and \'parent\' issue fields must be present. Only main default jira fields are available in this version. \
           \'timetracking\' field is \'originalEstimate\' subfield. \'remainingEstimate\' currently not supported.\n \
           ****multivalued fields should be set comma separated in sheet cells, e.g. value1,value2. \
           Look at \'Fields\' sheet to see which fields are multivalued on \'isArray\' column.\n \
           *****If issue is a \'sub task\' type, parent must be provided. If parent exists, set its key. Otherwise set row number of parent. \
           After parents creation, its key will be set as parent of child task. As expected, in this case, parent issue row must be set before child issue.\n \
           Only \'key\' and \'parent\' fields are updated on sheet after issues creation. \
           To see all fields updated after creation make a issues seach again.\
           ');
}

function removeFieldsBeforeUpdate(issueData){
  var fieldsAttributes = getFieldsAttributes();
  // remove readonly fields
  for(var fieldName in fieldsAttributes){
    if(fieldsAttributes[fieldName].updatable === false){
      delete issueData[fieldName];
    }
  }
  // remove not null fields
  if(!issueData.priority){
    delete issueData.priority;
  }
  if(!issueData.reporter){
    delete issueData.reporter;
  }
}

function removeReadOnlyFieldsBeforeCreate(issueData){
  delete issueData.key;
  delete issueData.resolution;
  delete issueData.status;
}

function requireAuth(){
  ui.alert('Credentials not found. You must enter your jira login data on Authenticate menu.');
}

function requireProjectConfig(){
  ui.alert('Project key not found. You must setup on Import Settings menu.');
}
