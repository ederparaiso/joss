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
  entries.push({ name : 'Reset Settings', functionName : 'resetSettings' });
  entries.push(null);
  entries.push({ name : 'About', functionName : 'about' });
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
    storeIssueStatuses(issueStatuses);
    setDefaultFieldsAttributes('Fields', ['field', 'isArray', 'primitive', 'attribute', 'customEmptyValue']);
    ui.alert('Project settings successfully set. Info:\nKey: ' + projectInfo.id + '\nProject: ' + projectInfo.name);
  }
}

function importFieldSettings(){
  // TODO
}

function searchIssues(){
  // TODO
}

function syncIssues(){
  // TODO
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

function asksAuth(){
  ui.alert('Credentials not found. You must enter your jira login data on Authenticate menu.');
}
