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
  var response = doRequest('post', 'search', authorization, null, payload);
  Logger.log('searchIssues response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processSearchIssues(responseData);
}

function processSearchIssues(responseData){
  var issues = responseData.issues.map(function(issue){
    var issueData = buildIssueData(issue.fields);
    issueData['key'] = issue.key;
    return issueData;
  });
  return {
    'total': responseData.total,
    'issues': issues
  };
}

function buildIssueData(issueFields){
  var fields = {};
  for(var fieldName in issueFields){
    fields[fieldName] = getIssueFieldValue(fieldName, issueFields[fieldName]);
  }
  return fields;
}

function getIssueFieldValue(fieldName, fieldData){
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
    issueFields[fieldName] = setIssueFieldValue(fieldName, issueData[fieldName]);
  }
  payload['fields'] = issueFields;
  return payload;
}

function setIssueFieldValue(fieldName, fieldValue){
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
  Logger.log('updateIssue payload: ' + JSON.stringify(issueData));
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
      issueFields[fieldName] = setIssueFieldValue(fieldName, issueData[fieldName]);
    }
    else{
      if(fieldName != 'parent'){ // 'parent' field should not be sent if null, its not allowed by jira api
        issueFields[fieldName] = setIssueFieldValueEmpty(fieldName, issueData[fieldName]);
      }
    }
  }
  payload['fields'] = issueFields;
  return payload;
}

function setIssueFieldValueEmpty(fieldName, fieldValue){
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
