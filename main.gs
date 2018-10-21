var ui = SpreadsheetApp.getUi();

function onOpen(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [];
  entries.push({ name : 'Authenticate', functionName : 'authUser' });
  entries.push(null);
  entries.push({ name : 'Project Settings', functionName : 'importProjectSettings' });
  entries.push(null);
  entries.push({ name : 'Field Settings', functionName : 'importFieldSettings' });
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
  // TODO
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
  }
  var userInfo = getUserInfo(userAuth);
  if(!userInfo){
    ui.alert('Connection Failed. Try to authenticate.');
  }
  Logger.log(JSON.stringify(userInfo));
  ui.alert('User authenticated. Connection successful. Info:\nId: ' + userInfo.id + '\nName: ' + userInfo.name + '\nEmail: ' + userInfo.email);
}

function resetSettings(){
  var appProperties = PropertiesService.getUserProperties();
  appProperties.deleteAllProperties();
}

function about(){
  // TODO
}

function asksAuth(){
  ui.alert('Credentials not found. You must enter your jira login data on Authenticate menu.');
}
