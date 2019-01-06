var ui = SpreadsheetApp.getUi();

function onOpen(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [];
  entries.push({ name : 'Authenticate', functionName : 'authUser' });
  entries.push(null);
  entries.push({ name : 'Import Project Settings', functionName : 'importProjectSettings' });
  entries.push(null);
  entries.push({ name : 'Import Field Settings', functionName : 'importFieldSettings' });
  entries.push(null);
  entries.push({ name : 'Search Issues', functionName : 'searchIssues' });
  entries.push(null);
  entries.push({ name : 'Sync Issues', functionName : 'syncIssues' });
  entries.push(null);
  entries.push({ name : 'Test Connection', functionName : 'testConnection' });
  entries.push(null);
  entries.push({ name : 'Reset Field Settings', functionName : 'resetFieldSettings' });
  entries.push(null);
  entries.push({ name : 'Reset Settings', functionName : 'resetSettings' });
  entries.push(null);
  entries.push({ name : 'About', functionName : 'about' });
  entries.push(null);
  entries.push({ name : 'Import Settings', functionName : 'importSettings' });
  sheet.addMenu('Jira 2.0', entries);
};

function authUser(){
  var html = HtmlService.createHtmlOutputFromFile('user-auth-ui');
  ui.showModalDialog(html, 'Jira Authentication');
}

function importProjectSettings(){
  var result = ui.prompt('Set or update your project settings', 'Enter your project code (key):', ui.ButtonSet.OK);
  var projectKey = result.getResponseText();
  if(projectKey){
    storeProjectKey(projectKey);
    var userAuth = getUserAuth();
    var assignableUsers = getAssignableProjectUsers(userAuth, projectKey);
    storeProjectUsers(assignableUsers);
    var projectInfo = getProjectInfo(userAuth, projectKey);
    storeIssueTypes(projectInfo.issueTypes);
    var issueStatuses = getProjectIssuesStatuses(userAuth, projectKey);
    Logger.log(JSON.stringify(issueStatuses));
    storeIssueStatuses(issueStatuses);
    // TODO how to merge issue fields to show how fields are available
    // var issueFields = getProjectIssuesFields(userAuth, projectKey);
    writeDefaultFieldsAttributes('Fields', ['field', 'isArray', 'primitive', 'attribute', 'customEmptyValue', 'updatable']);
    ui.alert('Project settings successfully set. Info:\nKey: ' + projectInfo.id + '\nProject: ' + projectInfo.name);
  }
}

function importFieldSettings(){
  var fieldsAttributes = readFieldsSheetAttributes('Fields');
  storeFieldsAttributes(fieldsAttributes);
}

function searchIssues(){
  var result = ui.prompt('Search Issues', 'Enter your search query in jql (JIRA Query Language) format:', ui.ButtonSet.OK);
  var searchQuery = result.getResponseText();
  if(searchQuery){
    var userAuth = getUserAuth();
    var projectKey = getProjectKey();
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
    Logger.log('Found ' + issues.length + ' issues');
    writeIssues('Issues', issues);
  }
}

function syncIssues(){
  var userAuth = getUserAuth();
  var projectKey = getProjectKey();
  var issuesData = readIssuesSheetAttributes('Issues');
  var fieldNames = issuesData.shift();
  var amountOfFields = fieldNames.length;
  var keyFieldPos = fieldNames.indexOf('key');
  if(keyFieldPos === -1){
    ui.alert('key field is required to sync issues.');
    return;
  }
  for(var i = 0; i < issuesData.length; i++){
    var sheetCellRow = i + 2;
    var issueKey = issuesData[i][keyFieldPos];
    if(issueKey){
      var issueData = fieldNames.reduce(function(issueData, fieldName, index){
        issueData[fieldName] = issuesData[i][index];
        return issueData;
      }, {});
      removeFieldsBeforeUpdate(issueData);
      Logger.log(issueData);
      var result = updateIssue(userAuth, issueKey, issueData)
      if(!result){
        ui.alert('There was an error on issue update. row ' + sheetCellRow);
        return;
      }
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
          issueData.parent = readCell('Issues', parseInt(issueData.parent), keyFieldPos + 1)
          writeCell('Issues', issueData.parent, sheetCellRow, fieldNames.indexOf('parent')+1)
        }
      }
      else{
        delete issueData.parent;
      }
      Logger.log(issueData);
      var result = createIssue(userAuth, issueData)
      if(!result){
        ui.alert('There was an error on issue creation. row ' + sheetCellRow);
        return;
      }
      var sheetCellCol = keyFieldPos + 1;
      writeCell('Issues', result, sheetCellRow, sheetCellCol)
    }
  }
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

function testConnection(){
  var userAuth = getUserAuth();
  if(!userAuth){
    asksAuth();
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
  writeDefaultFieldsAttributes('Fields', ['field', 'isArray', 'primitive', 'attribute', 'customEmptyValue', 'updatable']);
}

function resetSettings(){
  var result = ui.alert('Please confirm', 'Are you sure about this? All settings will be lost and \
                         you will need to authenticate and import new settings again.', ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    var appProperties = PropertiesService.getUserProperties();
    Logger.log('Removing properties: ' + appProperties.getKeys());
    appProperties.deleteAllProperties();
    resetSpreadsheet();
  }
}

function about(){
  // TODO
}

function importSettings(){
  var fieldsAttributes = readFieldsSheetAttributes('Fields');
  storeFieldsAttributes(fieldsAttributes);
  var result = ui.prompt('Set or update your project settings', 'Enter your project code (key):', ui.ButtonSet.OK);
  var projectKey = result.getResponseText();
  if(projectKey){
    storeProjectKey(projectKey);
  }
}

function asksAuth(){
  ui.alert('Credentials not found. You must enter your jira login data on Authenticate menu.');
}
