var defaultFieldsAttributes = {
  'key': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false},
  'parent': {'isArray': false, 'primitive': false, 'attribute': 'key', 'customEmptyValue': false},
  'project': {'isArray': false, 'primitive': false, 'attribute': 'key', 'customEmptyValue': false},
  'issuetype': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'summary': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false},
  'description': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false},
  'priority': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'labels': {'isArray': true, 'primitive': true, 'attribute': '', 'customEmptyValue': false},
  'components': {'isArray': true, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'fixVersions': {'isArray': true, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'reporter': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'assignee': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'duedate': {'isArray': false, 'primitive': true, 'attribute': '', 'customEmptyValue': false},
  'resolution': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'status': {'isArray': false, 'primitive': false, 'attribute': 'name', 'customEmptyValue': false},
  'timetracking': {'isArray': false, 'primitive': false, 'attribute': 'remainingEstimate', 'customEmptyValue': true}, // TODO
  'timetracking': {'isArray': false, 'primitive': false, 'attribute': 'originalEstimate', 'customEmptyValue': true}
};

function storeFieldsAttributes(fieldsAttributes){
  var fieldsProperties = PropertiesService.getUserProperties();
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

//TODO rename all getxyz to readxyz
function readIssueStatuses(){
  var userProperties = PropertiesService.getUserProperties();
  return JSON.parse(userProperties.getProperty('ISSUE_STATUSES'));
}
