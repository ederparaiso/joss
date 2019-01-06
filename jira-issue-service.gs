var defaultMaxResults = 100;

function findIssues(authorization, projectKey, jql, fields, startIndex){
  var query = 'project = ' + projectKey + ' AND ' + jql;
  var payload = {
    "jql": query,
    "startAt": startIndex,
    "maxResults": defaultMaxResults,
    "fields": fields,
    "fieldsByKeys": false
  };
  Logger.log('findIssues payload: ' + JSON.stringify(payload));
  var response = doRequest('post', 'search', authorization, null, payload);
  Logger.log('findIssues response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processFindIssues(responseData);
}

function processFindIssues(responseData){
  var issues = responseData.issues.map(function(issue){
    var issueData = processIssueData(issue.fields);
    issueData['key'] = issue.key;
    return issueData;
  });
  return {
    'total': responseData.total,
    'issues': issues
  };
}

function processIssueData(issueFields){
  var fields = {};
  for(var fieldName in issueFields){
    fields[fieldName] = processIssueFieldValue(fieldName, issueFields[fieldName]);
  }
  return fields;
}

function processIssueFieldValue(fieldName, fieldData){
  if(!fieldData){
    return '';
  }
  var fieldAttributesConfig = getFieldsAttributes();
  var config = fieldAttributesConfig[fieldName];
  if(!config){
    return 'unable to find property ' + fieldName + ' to extract value';
  }
  // string, number or array of primitive types
  if(config.primitive){
    return fieldData;
  }
  // array of complex types
  if(config.isArray){
    return fieldData.map(function(attrValue){
      return attrValue[config.attribute];
    });
  }
  // single complex type
  return fieldData[config.attribute];
}

function createIssue(authorization, issueData){
  var payload = buildCreateIssuePayload(issueData);
  Logger.log('createIssue payload: ' + JSON.stringify(payload));
  var response = doRequest('post', 'issue', authorization, null, payload);
  Logger.log('createIssue response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 201){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processCreateIssue(responseData);
}

function buildCreateIssuePayload(issueData){
  var payload = {};
  var issueFields = {};
  for(var fieldName in issueData){
    issueFields[fieldName] = buildIssueFieldValue(fieldName, issueData[fieldName]);
  }
  payload['fields'] = issueFields;
  return payload;
}

function buildIssueFieldValue(fieldName, fieldValue){
  var fieldAttributesConfig = getFieldsAttributes();
  var config = fieldAttributesConfig[fieldName];
  var result = {};
  if(!config){
    return 'unable to find property ' + fieldName + ' to set value';
  }
  // string, number or array of primitive types
  if(config.primitive){
    var propertyValue = fieldValue;
    if(config.isArray){
      propertyValue = fieldValue.split(',');
    }
    return propertyValue;
  }
  // array of complex types
  if(config.isArray){
    var fieldValues = fieldValue.split(',');
    var propertyValues = fieldValues.map(function(singleValue){
      var propertyValue = {};
      propertyValue[config.attribute] = singleValue;
      return propertyValue;
    });
    return propertyValues;
  }
  // single complex type
  var propertyValue = {};
  propertyValue[config.attribute] = fieldValue;
  return propertyValue;
}

function processCreateIssue(responseData){
  return responseData.key;
}

function updateIssue(authorization, issueKey, issueData){
  var url = 'issue/' + issueKey;
  var payload = buildUpdateIssuePayload(issueData);
  Logger.log('updateIssue payload: ' + JSON.stringify(payload));
  var response = doRequest('put', url, authorization, null, payload);
  Logger.log('updateIssue response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 204){
    return null;
  }
  return true;
}

function buildUpdateIssuePayload(issueData){
  var payload = {};
  var issueFields = {};
  for(var fieldName in issueData){
    if(issueData[fieldName]){
      issueFields[fieldName] = buildIssueFieldValue(fieldName, issueData[fieldName]);
    }
    else{
      if(fieldName != 'parent'){ // 'parent' field should not be sent if null, its not allowed by jira api
        issueFields[fieldName] = buildIssueFieldValueEmpty(fieldName, issueData[fieldName]);
      }
    }
  }
  payload['fields'] = issueFields;
  return payload;
}

function buildIssueFieldValueEmpty(fieldName, fieldValue){
  var fieldAttributesConfig = getFieldsAttributes();
  var config = fieldAttributesConfig[fieldName];
  if(!config){
    return 'unable to find property ' + fieldName + ' to set value';
  }
  // some fields does not accept null, empty string or empty array (e.g. timetracking)
  if(config.customEmptyValue){
    return {};
  }
  // array
  if(config.isArray){
    return [];
  }
  // primitive types
  return null;
}

function deleteIssue(authorization, issueKey){
  var url = 'issue/' + issueKey;
  var response = doRequest('delete', url, authorization, null, null);
  Logger.log('deleteIssue response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 204){
    return null;
  }
  return true;
}
