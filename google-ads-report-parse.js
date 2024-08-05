/*===============================================================================================================================================
  Copies data to the marketing spreadsheet from a daily scheduled Google Ads report downloaded to a google sheet. The original downloaded report
  is then deleted.

  Setup: 1) In Google Ads, schedule a daily download of a campaign report as a google sheet. If you want to change the name of the scheduled 
            download from the default 'Campaign report', be sure to change var sourceFileName = '[your report name]'
         2) Change var targetSpreadsheetID = '[marketing spreadsheet ID]'. Find the spreadsheet id by opening the spreadsheet and checking the url.
            It will look something like this https://docs.google.com/spreadsheets/d/15nZl5I3-8The1pQ7QTmxVJnHCtn2cd7FuuZe9sasof0/.
            https://docs.google.com/spreadsheets/d/<SPREADSHEET ID>/
         3) Create a new helper sheet named 'Google Ads'. If you wish to use a different name, be sure to change var targetSheetName = '[newName]';
         4) Run the function setUpTrigger() to set up the daily trigger to transfer and delete the downloaded report data.

 ===============================================================================================================================================*/

 function transferDataAndDelete() {
    var targetSpreadsheetID = '[marketing spreadsheet ID]';  // Replace with your actual spreadsheet ID
    var targetSheetName = 'Google Ads';
  
    var sourceFileName = 'Campaign report';  // This is the name of the scheduled report spreadsheet file downloaded
  
    // Get all spreadsheets with the name sourceFileName
    var files = DriveApp.getFilesByName(sourceFileName);
    while (files.hasNext()) {
      var file = files.next();
      var ss = SpreadsheetApp.open(file);
      
      // Log file name to check if it's the correct file being processed
      console.log("Processing file: " + ss.getName() + ", ID: " + ss.getId());
  
      var sheet = ss.getSheets()[0];  // Assuming the data is in the first sheet; otherwise specify the exact sheet name
  
      // Log sheet name to verify correct sheet is accessed
      console.log("Processing sheet: " + sheet.getName());
  
      // Read the date from the second row, first cell
      var dateRange = sheet.getRange('A2').getValue();
      var date = new Date(dateRange.split('-')[0].trim());  // Assumes date format "May 7, 2024 - May 7, 2024"
  
      var dataRange = sheet.getRange('A4:AJ' + sheet.getLastRow());
      var data = dataRange.getValues();
  
      data = data.map(function(row) {
        row.unshift(Utilities.formatDate(date, Session.getScriptTimeZone(), "MM/dd/yyyy"));
        return row;
      });
  
      var targetSS = SpreadsheetApp.openById(targetSpreadsheetID);
      var targetSheet = targetSS.getSheetByName(targetSheetName);
  
      // Log intended target sheet for appending data
      console.log("Appending data to: " + targetSheet.getName());
  
      var lastRow = targetSheet.getLastRow();
      targetSheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
  
      // Delete file if correct file processed
      DriveApp.getFileById(file.getId()).setTrashed(true);
    }
  }
  
  
  function setUpTrigger() {
    ScriptApp.newTrigger('transferDataAndDelete')
      .timeBased()
      .everyDays(1)
      .atHour(4)
      .create();
  }
  
