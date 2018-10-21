var jiraApiPath = '/rest/api/latest/';

function buildJiraRequestHeaders(authorization){
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + authorization
  };
}

function doRequest(method, url, authorization, queryString, payload){
  var requestUrl = getJiraUrl() + jiraApiPath + url;
  if(queryString){
    requestUrl += '?' + queryString;
  }
  var options = {
    'method': method,
    'headers': buildJiraRequestHeaders(authorization)
  };
  if(payload){
    options['contentType'] = 'application/json';
    options['payload'] = JSON.stringify(payload);
  }
  Logger.log('request to [' + method + '] ' + requestUrl);
  return UrlFetchApp.fetch(requestUrl, options);
}

function getResponseAsJson(response){
  var jsonStr = response.getContentText();
  return JSON.parse(jsonStr);
}
