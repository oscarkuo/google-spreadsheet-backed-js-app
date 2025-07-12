const CLIENT_ID = '33921811367-ssbbmr2i5c6qe1fahef26g8mu6onktvt.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBhUU-fevlx23cG3KeY1iEIOT68ngfHbHM'; // domain restricted
const SPREADSHEET_ID = '1XfFf3xtcTV4tUEHHsZhMtUWHpCHahmSd0YQZ7m8KzU0';
const RANGE = 'Sheet1!A:A'; // Adjust as needed

const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

const labels = {
  signedOut: 'Signed out',
  signedIn: 'Signed in',
}

const elements = {
  signInButton: document.getElementById('signInButton'),
  signOutButton: document.getElementById('signOutButton'),
  inputDiv: document.getElementById('inputDiv'),
  outputDiv: document.getElementById('outputDiv'),
  authDiv: document.getElementById('authDiv'),
  spreadsheetsList: document.getElementById('spreadsheetsList')
};

const state = {
  tokenClient: null,
  setAccessToken: (accessToken) => {
    if (accessToken === null) {
      sessionStorage.removeItem('google_access_token');
    } else {
      sessionStorage.setItem('google_access_token', accessToken);
    }
  },
  getAccessToken: () => {
    return sessionStorage.getItem('google_access_token');
  }
}

function log(msg) {
  var time = new Date().toLocaleTimeString();
  elements.outputDiv.textContent = `[${time}] ${msg}\n` + elements.outputDiv.textContent;
}

function onAccessTokenRetrieved() {
  elements.signInButton.disabled = true;
  elements.signOutButton.disabled = false;
  gapi.client.setToken({ access_token: state.getAccessToken() });
  gapi.client.drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)'
  }).then(
    function(response) {
      const files = response.result.files;
      if (!files || files.length === 0) {
        log('No spreadsheets found.');
      } else {
        log('Spreadsheets:');
        files.forEach(function (file) {
          var li = document.createElement('li');
          li.textContent = `${file.name} (${file.id})`;
          elements.spreadsheetsList.appendChild(li);
        });
      }
    },
    function (error) {
      log('Error initializing GAPI: ' + JSON.stringify(error));
    });
}

function onGoogleTokenResponse(response) {
  if (response.error) {
    log('Auth error: ' + response.error);
    return;
  }
  log('Signed in with token.');
  state.setAccessToken(response.access_token);
  onAccessTokenRetrieved();
}

function onSignInClick() {
  if (!state.tokenClient) {
    log('Token client not initialized.');
    return;
  }
  if (state.getAccessToken()) {
    onAccessTokenRetrieved();
  } else {
    state.tokenClient.callback = onGoogleTokenResponse;
    state.tokenClient.requestAccessToken({ prompt: 'consconst CLIENT_ID = '33921811367-ssbbmr2i5c6qe1fahef26g8mu6onktvt.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBhUU-fevlx23cG3KeY1iEIOT68ngfHbHM'; // domain restricted
const SPREADSHEET_ID = '1XfFf3xtcTV4tUEHHsZhMtUWHpCHahmSd0YQZ7m8KzU0';
const RANGE = 'Sheet1!A:A'; // Adjust as needed

const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

const labels = {
  signedOut: 'Signed out',
  signedIn: 'Signed in',
}

const elements = {
  signInButton: document.getElementById('signInButton'),
  signOutButton: document.getElementById('signOutButton'),
  inputDiv: document.getElementById('inputDiv'),
  outputDiv: document.getElementById('outputDiv'),
  authDiv: document.getElementById('authDiv'),
  spreadsheetsList: document.getElementById('spreadsheetsList')
};

const state = {
  tokenClient: null,
  setAccessToken: (accessToken) => {
    if (accessToken === null) {
      sessionStorage.removeItem('google_access_token');
    } else {
      sessionStorage.setItem('google_access_token', accessToken);
    }
  },
  getAccessToken: () => {
    return sessionStorage.getItem('google_access_token');
  }
}

function log(msg) {
  var time = new Date().toLocaleTimeString();
  elements.outputDiv.textContent = `[${time}] ${msg}\n` + elements.outputDiv.textContent;
}

function onAccessTokenRetrieved() {
  elements.signInButton.disabled = true;
  elements.signOutButton.disabled = false;
  gapi.client.setToken({ access_token: state.getAccessToken() });
  gapi.client.drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)'
  }).then(
    function(response) {
      const files = response.result.files;
      if (!files || files.length === 0) {
        log('No spreadsheets found.');
      } else {
        log('Spreadsheets:');
        files.forEach(function (file) {
          var li = document.createElement('li');
          li.textContent = `${file.name} (${file.id})`;
          elements.spreadsheetsList.appendChild(li);
        });
      }
    },
    function (error) {
      log('Error initializing GAPI: ' + JSON.stringify(error));
    });
}

function onGoogleTokenResponse(response) {
  if (response.error) {
    log('Auth error: ' + response.error);
    return;
  }
  log('Signed in with token.');
  state.setAccessToken(response.access_token);
  onAccessTokenRetrieved();
}

function onSignInClick() {
  if (!state.tokenClient) {
    log('Token client not initialized.');
    return;
  }
  if (state.getAccessToken()) {
    onAccessTokenRetrieved();
  } else {
    state.tokenClient.callback = onGoogleTokenResponse;
    state.tokenClient.requestAccessToken({ prompt: 'consent', scope: SCOPES });
  }
}

function onSignOutClick() {
  if (state.getAccessToken()) {
    google.accounts.oauth2.revoke(
      state.getAccessToken(),
      function () {
        log('Signed out.');
      });
    state.setAccessToken(null);
    elements.signInButton.disabled = false;
    elements.signOutButton.disabled = true;
  } else {
    log('Not signed in.');
  }
}


function onGapiLoaded() {
  log('Initialising google token client');
  if (state.tokenClient == null) {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS
      }).then(
        function () {
          state.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: onGoogleTokenResponse
          });
          log('Google token client initialized.');
          elements.authDiv.classList.remove('hidden');
        },
        function (error) {
          log('Error initializing GAPI: ' + JSON.stringify(error));
        });
    });
  } else {
    log('Google token client already initialised');
  }
}
/*
function initialiseApiClient() {
    if (tokenClient == null) {
        gapi.load('client', initializeGapiClient);
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Set later
        });
    }

    return tokenClient;
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
}

function handleAuthClick() {
  getTokenClient().callback = async (resp) => {
    if (resp.error) throw resp;
    document.getElementById('output').textContent = 'Signed in!';
  };
  getTokenClient().requestAccessToken({ prompt: 'consent' });
}

function handleSignOutClick() {
  google.accounts.oauth2.revoke(getTokenClient().access_token, () => {
    document.getElementById('output').textContent = 'Signed out.';
  });
}

async function appendData() {
  const value = document.getElementById('dataInput').value;
  if (!value) return;

  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
  };

  const valueRangeBody = {
    values: [[value]],
  };

  try {
    await gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
    document.getElementById('output').textContent = 'Data appended.';
  } catch (err) {
    document.getElementById('output').textContent = 'Error: ' + err.message;
  }
}

function readData() {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const output = response.result.values?.map(row => row[0]).join('\n') || 'No data.';
    document.getElementById('output').textContent = output;
  } catch (err) {
    document.getElementById('output').textContent = 'Error: ' + err.message;
  }
}
*/
ent', scope: SCOPES });
  }
}

function onSignOutClick() {
  if (state.getAccessToken()) {
    google.accounts.oauth2.revoke(
      state.getAccessToken(),
      function () {
        log('Signed out.');
      });
    state.setAccessToken(null);
    elements.signInButton.disabled = false;
    elements.signOutButton.disabled = true;
  } else {
    log('Not signed in.');
  }
}


function onGapiLoaded() {
  log('Initialising google token client');
  if (state.tokenClient == null) {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS
      }).then(
        function () {
          state.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: onGoogleTokenResponse
          });
          log('Google token client initialized.');
          elements.authDiv.classList.remove('hidden');
        },
        function (error) {
          log('Error initializing GAPI: ' + JSON.stringify(error));
        });
    });
  } else {
    log('Google token client already initialised');
  }
}
/*
function initialiseApiClient() {
    if (tokenClient == null) {
        gapi.load('client', initializeGapiClient);
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Set later
        });
    }

    return tokenClient;
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
}

function handleAuthClick() {
  getTokenClient().callback = async (resp) => {
    if (resp.error) throw resp;
    document.getElementById('output').textContent = 'Signed in!';
  };
  getTokenClient().requestAccessToken({ prompt: 'consent' });
}

function handleSignOutClick() {
  google.accounts.oauth2.revoke(getTokenClient().access_token, () => {
    document.getElementById('output').textContent = 'Signed out.';
  });
}

async function appendData() {
  const value = document.getElementById('dataInput').value;
  if (!value) return;

  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
  };

  const valueRangeBody = {
    values: [[value]],
  };

  try {
    await gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
    document.getElementById('output').textContent = 'Data appended.';
  } catch (err) {
    document.getElementById('output').textContent = 'Error: ' + err.message;
  }
}

function readData() {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const output = response.result.values?.map(row => row[0]).join('\n') || 'No data.';
    document.getElementById('output').textContent = output;
  } catch (err) {
    document.getElementById('output').textContent = 'Error: ' + err.message;
  }
}
*/
