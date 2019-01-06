function processForm(formObject){
  var jiraUser = formObject.jUser;
  var jiraPasswd = formObject.jPasswd;
  var jiraUrl = formObject.jUrl;
  if(!jiraUser || !jiraPasswd || !jiraUrl) {
    Logger.log('Invalid data input.');
    return;
  }
  userAuth = generateUserAuth(jiraUser, jiraPasswd);
  storeUserAuth(userAuth);
  storeJiraUrl(jiraUrl);
  Logger.log(jiraUser + ' authenticated.');
}

function generateUserAuth(user, passwd){
  return Utilities.base64Encode(''.concat(user, ':', passwd));
}

function storeUserAuth(userAuth){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('USER_AUTHORIZATION', userAuth);
}

function getUserAuth(){
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('USER_AUTHORIZATION');
}

function storeJiraUrl(jiraUrl){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('JIRA_URL', jiraUrl);
}

function getJiraUrl(){
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('JIRA_URL');
}
