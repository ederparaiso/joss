function getAssignableProjectUsers(authorization, projectKey){
  var queryString = 'project=' + projectKey;
  var response = doRequest('get', 'user/assignable/search', authorization, queryString, null);
  Logger.log('getAssignableProjectUsers response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processGetAssignableProjectUsers(responseData);
}

function processGetAssignableProjectUsers(responseData){
  return responseData.map(function(user){
    return user.key;
  });
}

function getProjectInfo(authorization, projectKey){
  var url = 'project/' + projectKey;
  var response = doRequest('get', url, authorization, null, null);
  Logger.log('getProjectInfo response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processGetProjectInfo(responseData);
}

function processGetProjectInfo(responseData){
  var issueTypes = responseData.issueTypes.map(function(issueType){
    return {
      'id': issueType.name,
      'subtask': issueType.subtask
    };
  });
  return {
    'id': responseData.key,
    'name': responseData.name,
    'issueTypes': issueTypes
  };
}

function getProjectIssuesStatuses(authorization, projectKey){
  var url = 'project/' + projectKey + '/statuses';
  var response = doRequest('get', url, authorization, null, null);
  Logger.log('getProjectIssuesStatuses response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processGetProjectIssuesStatuses(responseData);
}

function processGetProjectIssuesStatuses(responseData){
  return responseData.reduce(function(issues, issueType){
    issues[issueType.name] = getIssueStatuses(issueType);
    return issues;
  }, {});
}

function getIssueStatuses(issueType){
  return issueType.statuses.map(function(status){
    return status.name;
  });
}

function getProjectIssuesFields(authorization, projectKey){
  var queryString = 'projectKeys=' + projectKey + '&expand=projects.issuetypes.fields';
  var response = doRequest('get', 'issue/createmeta', authorization, queryString, null);
  Logger.log('getProjectIssuesFields response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processGetProjectIssuesFields(responseData);
}

function processGetProjectIssuesFields(responseData){
  return responseData.projects[0].issuetypes.reduce(function(issues, issueType){
    issues[issueType.name] = getIssueFields(issueType.fields);
    return issues;
  }, {});
}

function getIssueFields(issueFields){
  var fields = {};
  for(var fieldName in issueFields){
    fields[fieldName] = getFieldAttributes(issueFields[fieldName])
  }
  return fields;
}

function getFieldAttributes(fieldAttributes){
  // 'name': fieldAttributes.name,
  // 'isArray': fieldAttributes.schema.type === 'array',
  // 'type': fieldAttributes.schema.items || fieldAttributes.schema.type,
  // 'operations': fieldAttributes.operations
  return {
    'allowedValues': getFieldAllowedValues(fieldAttributes.allowedValues),
  };  
}

function getFieldAllowedValues(allowedFieldValues){
  if(!allowedFieldValues){
    return null;
  }
  return allowedFieldValues.map(function(allowedValue){
    return allowedValue.name || allowedValue.value;
  });
}
