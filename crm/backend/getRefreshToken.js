require("dotenv").config();
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
 `${process.env.API_URL}/oauth2callback`
  //"http://localhost:5000/oauth2callback" // must match your Google Console redirect URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

async function main() {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",   // ensures refresh_token is returned
    prompt: "consent",        // forces consent screen every time
    scope: SCOPES,
  });

  console.log("👉 Visit this URL:", url);
}

main();
