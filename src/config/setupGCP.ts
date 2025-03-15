import fs from 'fs';
import path from 'path';

export const setupGoogleCredentials = () => {
    // Define the path where the credentials file will be stored
    const credentialsPath = path.resolve('./src/gcp-credentials.json');

    // Get the JSON string from GitHub Secrets (process.env)
    const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!credentialsJSON) {
        console.error("❌ Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable");
        process.exit(1);
    }

    // Write the JSON secret to the file
    fs.writeFileSync(credentialsPath, credentialsJSON);

    console.log(`✅ Google Cloud credentials saved to: ${credentialsPath}`);

    // Set the environment variable for authentication
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
};
