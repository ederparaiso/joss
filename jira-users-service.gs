function getUserInfo(authorization){
  var response = doRequest('get', 'myself', authorization, null, null);
  Logger.log('getUserInfo response status: ' + response.getResponseCode());
  if(response.getResponseCode() != 200){
    return null;
  }
  var responseData = getResponseAsJson(response);
  return processGetUserInfo(responseData);
}

function processGetUserInfo(responseData){
  return {
    'id': responseData.key,
    'email': responseData.emailAddress,
    'name': responseData.displayName
  };
}
