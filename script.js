const CLIENT_ID = '33921811367-ssbbmr2i5c6qe1fahef26g8mu6onktvt.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBhUU-fevlx23cG3KeY1iEIOT68ngfHbHM';

const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

const elements = {
  reloadButton: document.getElementById('reloadButton'),
  signInButton: document.getElementById('signInButton'),
  signOutButton: document.getElementById('signOutButton'),
  selectSpreadsheetButton: document.getElementById('selectSpreadsheetButton'),
  unselectSpreadsheetButton: document.getElementById('unselectSpreadsheetButton'),
  inputDiv: document.getElementById('inputDiv'),
  a1Input: document.getElementById('a1Input'),
  a2Input: document.getElementById('a2Input'),
  a3Input: document.getElementById('a3Input'),
  a4Output: document.getElementById('a4Output'),
  outputDiv: document.getElementById('outputDiv'),
  outputDetailsDiv: document.getElementById('outputDetailsDiv'),
  authDiv: document.getElementById('authDiv'),
  spreadsheetsDiv: document.getElementById('spreadsheetsDiv'),
  selectSpreadsheetDiv: document.getElementById('selectSpreadsheetDiv'),
  reloadButton: document.getElementById('reloadButton')
};

const state = {
  spreadsheetId: null,
  tokenClient: null,
  accessToken: null
};

function setAccessToken (accessToken) {
  if (accessToken) {
    sessionStorage.setItem('google_access_token', accessToken);
  } else {
    sessionStorage.removeItem('google_access_token');
  }
}
function getAccessToken() { return sessionStorage.getItem('google_access_token'); }

function showInputDiv() { elements.inputDiv.classList.remove('hidden'); }
function hideInputDiv() { elements.inputDiv.classList.add('hidden'); }
function showSelectSpreadsheetsDiv() { elements.selectSpreadsheetDiv.classList.remove('hidden'); }
function hideSelectSpreadsheetsDiv() { elements.selectSpreadsheetDiv.classList.add('hidden'); }
function showAuthDiv() { elements.authDiv.classList.remove('hidden'); }
function hideAuthDiv() { elements.authDiv.classList.add('hidden'); }

function enableSpreadsheetRadioElements(enabled) {
  const spreadsheetRadioElements = document.
    getElementsByName("googleSpreadsheet");
  for (const spreadsheetRadioElement of spreadsheetRadioElements) {
    spreadsheetRadioElement.disabled = !!!enabled;
    if (state.spreadsheetId != null && !spreadsheetRadioElement.checked) {
      spreadsheetRadioElement.parentElement.classList.add('hidden');
    } else {
      spreadsheetRadioElement.parentElement.classList.remove('hidden');
    }
  }
}

function clearSpreadsheetsDiv() {
  while (elements.spreadsheetsDiv.firstChild) {
    elements.spreadsheetsDiv.removeChild(elements.spreadsheetsDiv.firstChild);
  }
}
function updateViewState() {
  if (state.tokenClient == null) {
    hideAuthDiv();
  } else {
    showAuthDiv();
  }

  if (state.accessToken == null) {
    elements.signInButton.disabled = false;
    elements.signOutButton.disabled = true;
    hideSelectSpreadsheetsDiv();
    clearSpreadsheetsDiv();
  } else {
    elements.signInButton.disabled = true;
    elements.signOutButton.disabled = false;
    showSelectSpreadsheetsDiv();
  }

  if (state.spreadsheetId == null) {
    hideInputDiv();
    enableSpreadsheetRadioElements(true);
    elements.selectSpreadsheetButton.disabled = false;
    elements.unselectSpreadsheetButton.disabled = true;
  } else {
    showInputDiv();
    enableSpreadsheetRadioElements(false);
    elements.selectSpreadsheetButton.disabled = true;
    elements.unselectSpreadsheetButton.disabled = false;
  }
}

function log(message, details) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${message} ${details}`)
  elements.outputDiv.textContent = message;
  elements.outputDetailsDiv.textContent = details == null ? '' : details;
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
    elements.spreadsheetsDiv.appendChild(label);
  } else {
    log(`Found ${files.length} spreadsheets`)
    clearSpreadsheetsDiv();
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

    updateViewState();
  }
}

async function updateCellValue(spreadsheetId, range, value) {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED', // or 'RAW'
      resource: {
        values: [[value]]
      }
    });

    log(`Updated ${range} to "${value}"`);
    return response;
  } catch (error) {
    log(`Error updating ${range}: ${JSON.stringify(error)}`);
    throw error;
  }
}

async function getCellValue(spreadsheetId, range) {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range // e.g., "Sheet1!A1"
    });

    const value = response.result.values?.[0]?.[0];
    if (value !== undefined) {
      log(`Value at ${range}: ${value}`);
      return value;
    } else {
      log(`No data found at ${range}.`);
      return null;
    }
  } catch (error) {
    log(`Error reading cell ${range}: ` + JSON.stringify(error));
    return null;
  }
}

async function onSelectSpreadsheetClick() {
  var selectedSpreadsheet = document.
    querySelector("input[type='radio'][name=googleSpreadsheet]:checked");
  if (selectedSpreadsheet == null) {
    log('Please select a spreadsheet.');
  } else {
    state.spreadsheetId = selectedSpreadsheet.value;
    log('Selected ' + state.spreadsheetId);

    enableSpreadsheetRadioElements(false);

    const [a1, a2, a3, a4] = await Promise.all([
      getCellValue(state.spreadsheetId, 'Sheet1!A1'),
      getCellValue(state.spreadsheetId, 'Sheet1!A2'),
      getCellValue(state.spreadsheetId, 'Sheet1!A3'),
      getCellValue(state.spreadsheetId, 'Sheet1!A4'),
    ]);

    elements.a1Input.value = a1;
    elements.a2Input.value = a2;
    elements.a3Input.value = a3;
    elements.a4Output.value = a4;
  }

  updateViewState();
}

function onUnselectSpreadsheetClick() {
  state.spreadsheetId = null;
  updateViewState();
}

async function onSubmitInputClick() {
  await Promise.all([
    updateCellValue(state.spreadsheetId, 'Sheet1!A1', elements.a1Input.value),
    updateCellValue(state.spreadsheetId, 'Sheet1!A2', elements.a2Input.value),
    updateCellValue(state.spreadsheetId, 'Sheet1!A3', elements.a3Input.value)
  ]);

  elements.a4Output.value = await getCellValue(state.spreadsheetId, 'Sheet1!A4');
}

async function onAccessTokenRetrieved() {
  gapi.client.setToken({ access_token: state.accessToken });
  await fetchSpreadsheets();
}

async function onGoogleTokenResponse(response) {
  if (response.error) {
    log('Auth error: ' + response.error);
    return;
  }
  log('Signed in with token.');
  setAccessToken(response.access_token);
  state.accessToken = response.access_token;
  await onAccessTokenRetrieved();
}

async function onSignInClick() {
  if (!state.tokenClient) {
    log('Token client not initialized.');
    return;
  }

  if (getAccessToken()) {
    state.accessToken = getAccessToken();
    state.tokenClient.callback = async (response) => await onGoogleTokenResponse(response);
    state.tokenClient.requestAccessToken();
    await onAccessTokenRetrieved();
  } else {
    state.tokenClient.callback = async (response) => await onGoogleTokenResponse(response);
    state.tokenClient.requestAccessToken({ scope: SCOPES });
  }
  updateViewState();
}

function onSignOutClick() {
  const token = state.accessToken;
  if (token) {
    google.accounts.oauth2.revoke(token, () => {
      log('Signed out.');
    });
    state.accessToken = null;
    state.spreadsheetId = null;
    setAccessToken(null);
    updateViewState();
  } else {
    log('Not signed in.');
  }
}

function onReload() {
  location.reload();
}

async function onGapiLoaded() {
  log('Initializing Google token client...');

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
  } catch (error) {
    log('Failed to initialise Google API, please reload', JSON.stringify(error));
    reloadButton.classList.remove('hidden');
  }

  updateViewState();
}
