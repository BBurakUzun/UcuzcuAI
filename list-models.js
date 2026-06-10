import fs from 'fs';

async function run() {
  try {
    let envContent = '';
    try {
      envContent = fs.readFileSync('.env', 'utf8');
    } catch(e) {
      envContent = fs.readFileSync('.env.local', 'utf8');
    }
    const match = envContent.match(/VITE_GEMINI_API_KEY="?([^"\n]+)"?/);
    const apiKey = match ? match[1] : null;

    if (!apiKey) {
      console.log('No API key found');
      return;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (error) {
    console.error(error);
  }
}

run();
