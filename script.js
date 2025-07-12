const CLIENT_ID = '33921811367-ssbbmr2i5c6qe1fahef26g8mu6onktvt.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBhUU-fevlx23cG3KeY1iEIOT68ngfHbHM';
const SPREADSHEET_ID = '1XfFf3xtcTV4tUEHHsZhMtUWHpCHahmSd0YQZ7m8KzU0';
const RANGE = 'Sheet1!A:A';

const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

const elements = {
  signInButton: document.getElementById('signInButton'),
  signOutButton: document.getElementById('signOutButton'),
  inputDiv: document.getElementById('inputDiv'),
  outputDiv: document.getElementById('outputDiv'),
  authDiv: document.getElementById('authDiv'),
  spreadsheetsDiv: document.getElementById('spreadsheetsDiv')
};

const state = {
  tokenClient: null,
  setAccessToken: (accessToken) => {
    accessToken
      ? sessionStorage.setItem('google_access_token', accessToken)
      : sessionStorage.removeItem('google_access_token');
  },
  getAccessToken: () => sessionStorage.getItem('google_access_token')
};

function log(msg) {
  const time = new Date().toLocaleTimeString();
  elements.outputDiv.textContent = `[${time}] ${msg}\n` + elements.outputDiv.textContent;
}

async function fetchSpreadsheets() {
  let files = null;

  try {
    const response = await gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)'
    });

    files = response.result.files;
  } catch (error) {
    log('Error fetching spreadsheets: ' + JSON.stringify(error));
  }

  if (!files || files.length === 0) {
    const label = document.createElement('label');
    label.textContent = 'No spreadsheets found.';
    elements.spreadsheetsDiv.appendChild(div);
  } else {
    log(`Found ${files.length} spreadsheets`)
    for (const file of files) {
      const item = document.createElement('input');
      item.type = 'radio';
      item.name = "googleSpreadsheet";
      item.value = file.id;
      item.id = `radio-${file.id}`;

      const label = document.createElement('label');
      label.htmlFor = item.id;
      label.textContent = file.name;

      const div = document.createElement('div');

      //li.textContent = `${file.name} (${file.id})`;
      div.appendChild(item);
      div.appendChild(label);
      elements.spreadsheetsDiv.appendChild(div);
    }
  }
}

async function onAccessTokenRetrieved() {
  elements.signInButton.disabled = true;
  elements.signOutButton.disabled = false;
  gapi.client.setToken({ access_token: state.getAccessToken() });
  await fetchSpreadsheets();
}

async function onGoogleTokenResponse(response) {
  if (response.error) {
    log('Auth error: ' + response.error);
    return;
  }
  log('Signed in with token.');
  state.setAccessToken(response.access_token);
  await onAccessTokenRetrieved();
}

async function onSignInClick() {
  if (!state.tokenClient) {
    log('Token client not initialized.');
    return;
  }

  if (state.getAccessToken()) {
    await onAccessTokenRetrieved();
  } else {
    state.tokenClient.callback = async (response) => await onGoogleTokenResponse(response);
    state.tokenClient.requestAccessToken({ prompt: 'consent', scope: SCOPES });
  }
}

function onSignOutClick() {
  const token = state.getAccessToken();
  if (token) {
    google.accounts.oauth2.revoke(token, () => {
      log('Signed out.');
    });
    state.setAccessToken(null);
    elements.signInButton.disabled = false;
    elements.signOutButton.disabled = true;
  } else {
    log('Not signed in.');
  }
}

async function onGapiLoaded() {
  log('Initializing Google token client...');
  if (state.tokenClient) {
    log('Google token client already initialized.');
    return;
  }

  try {
    await new Promise((resolve) => gapi.load('client', resolve));
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS
    });

    state.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => await onGoogleTokenResponse(response)
    });

    log('Google token client initialized.');
    elements.authDiv.classList.remove('hidden');
  } catch (error) {
    log('Error initializing GAPI: ' + JSON.stringify(error));
  }
}
