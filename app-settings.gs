var defaultFieldsAttributes = {
  'key': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false, 'updatable': false},
  'parent': {'isArray': false, 'primitive': false, 'attribute': 'key', 'customEmptyValue': false, 'updatable': false},
  'project': {'isArray': false, 'primitive': false, 'attribute': 'key', 'customEmptyValue': false, 'updatable': false},
  'issuetype': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': true},
  'summary': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false, 'updatable': true},
  'description': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false, 'updatable': true},
  'priority': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': true},
  'labels': {'isArray': true, 'primitive': true, 'attribute': '', 'customEmptyValue': false, 'updatable': true},
  'components': {'isArray': true, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': true},
  'fixVersions': {'isArray': true, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': true},
  'reporter': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': true},
  'assignee': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': true},
  'duedate': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false, 'updatable': true},
  'resolution': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': false},
  'status': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false, 'updatable': false},
  'timetracking': {'isArray': false, 'primitive': false, 'attribute': 'originalEstimate', 'customEmptyValue': true, 'updatable': true}
};

function resetProperties(){
  var appProperties = PropertiesService.getUserProperties();
  Logger.log('removing properties: ' + appProperties.getKeys());
  appProperties.deleteAllProperties();
}

function storeDefaultFieldsAttributes(){
  var fieldsProperties = PropertiesService.getUserProperties();
  fieldsProperties.setProperty('ISSUES_FIELDS_ATTRIBUTES', JSON.stringify(defaultFieldsAttributes));
}

function storeFieldsAttributes(attributes){
  var fieldsProperties = PropertiesService.getUserProperties();
  var fieldsAttributes = {};
  attributes.forEach(function(attribute){
    fieldsAttributes[attribute] = defaultFieldsAttributes[attribute];
  });
  fieldsProperties.setProperty('ISSUES_FIELDS_ATTRIBUTES', JSON.stringify(fieldsAttributes));
}

function getFieldsAttributes(){
  var fieldsProperties = PropertiesService.getUserProperties();
  var fieldsAttributes = fieldsProperties.getProperty('ISSUES_FIELDS_ATTRIBUTES');
  if(!fieldsAttributes){
    return defaultFieldsAttributes;
  }
  return JSON.parse(fieldsAttributes);
}

function storeProjectKey(projectKey){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('PROJECT_KEY', projectKey);
}

function getProjectKey(){
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('PROJECT_KEY');
}

function storeProjectUsers(projectUsers){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('PROJECT_USERS', JSON.stringify(projectUsers));
}

function getProjectUsers(){
  var userProperties = PropertiesService.getUserProperties();
  return JSON.parse(userProperties.getProperty('PROJECT_USERS'));
}

function storeIssueTypes(issueTypes){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('ISSUE_TYPES', JSON.stringify(issueTypes));
}

function getIssueTypes(){
  var userProperties = PropertiesService.getUserProperties();
  return JSON.parse(userProperties.getProperty('ISSUE_TYPES'));
}

function storeIssueStatuses(issueStatuses){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('ISSUE_STATUSES', JSON.stringify(issueStatuses));
}

function getIssueStatuses(){
  var userProperties = PropertiesService.getUserProperties();
  return JSON.parse(userProperties.getProperty('ISSUE_STATUSES'));
}
