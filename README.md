# PoC Google Spreadsheet Backed JS web app

A minimal offline capable web app that use Google Spreadsheet & Drive API to list and interact with the user selected Google Spreadsheet.

## Setup Google Cloud Project

1. Browse to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or Select a project.
3. Using the hamburger menu, navigate to **APIs & Services** > **Library**, search and enable following library for the project.
   - Google Sheets API
   - Google Drive API
4. Using the hamburger menu, navigate to **APIs & Services** > **Credentials**.
   - Add an API key and write it down
   - Add an OAuth client ID
5. Using the hamburger menu, navigate to **APIs & Services** > **OAuth consent screen**
   - While the app is at test mode, you'll need to navigate to **Audience** and setup Test Users
5. Before releasing to public, make sure the OAuth client ID and API key are origin restricted.

