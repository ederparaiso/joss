# Jira on Spreadsheets (joss)
## (Work in progress)
Just a simple scripts to manage your jira issues on google spreadsheets!

Create and update Jira issues is an awful work as the number of issues grows.

Inspired by visual studio tfs plugin where users could manage tfs tasks in a simple excel spreadsheet, I built this [Google Apps Script](https://developers.google.com/apps-script/) project extending google sheets capabilities using [Jira rest api](https://developer.atlassian.com/cloud/jira/platform/rest/v3) to manage some issues operations.

For a while, project creating still manual. Create an google spreadsheet and go to `Tools > Script editor`. Then create and copy & paste script files in this project.

Future versions intent to use [clasp](https://github.com/google/clasp) to deploy project files to google apps script.

## Limitations
At this moment, some issue fields are partially supported and some fields are unsupported.

**Partially supported**
- timeTracking: just orignalEstimate sub field. It is planned to support remainingEstimate.

**Not supported**
- attachment
- issuelinks (linked issues)
- worklog

## How to use
1- If its your first use after import google scripts, setup spreadsheet by using `Reset all settings` menu.* 

2- Login on your jira account using `Authenticate` menu. 

3- Test your login connection using `Test connection` menu.** 

4- On `Fields` sheet, select which issues fields to use. Remove unecessary fields/rows.*** 

5- Configure your jira project key and task fields using `Import settings` menu. 

6- If you need to configure issue fields again, use `Reset field settings` menu to get original fields and import again using `Import settings` menu. 

7- Search issues input query in jql format using `Search issues` menu. Results will be displayed in `Issues` sheet. 

8- Update issues in `Issues` sheet using `Sync issues` menu.**** 

9- Create new issues in `Issues` sheet leaving `key` column blank and use `Sync issues` menu.***** 

*sheet names can not be changed. 

**jira cloud users that login with integrated google account must be able to login with email/password on jira page. If you are not able, go to jira login page and ask recovery link to your account and set proper password. It will create a jira "OnDemand password" which can be used to authenticate and consume jira services. 

***`key` and `parent` issue fields must be present. Only main default jira fields are available in this version. `timetracking` field is the `originalEstimate` subfield. `remainingEstimate` currently not supported.

****multivalued fields should be set comma separated in sheet cells, e.g. value1,value2. Look at `Fields` sheet to see which fields are multivalued on `isArray` column. 

*****If issue is a `sub task` type, parent must be provided. If parent exists, set its key. Otherwise set row number of parent. After parents creation, its key will be set as parent of child task. As expected, in this case, parent issue row must be set before child issue. Only `key` and `parent` fields are updated on sheet after issues creation. To see all fields updated after creation make a issues seach again.
