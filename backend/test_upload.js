const fs = require('fs');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runUploadTest() {
  console.log('=== Starting CommonJS Cloudinary Upload Test ===\n');

  try {
    // 1. Write dummy image file
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync('dummy.png', Buffer.from(base64Png, 'base64'));
    console.log('✔ Created dummy.png file.');

    // 2. Register & Login Admin
    const credentials = {
      name: 'CommonJS Admin',
      email: 'cjs@example.com',
      password: 'CjsUploadPassword123!',
    };

    // Register (ignore 403 if already exists)
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    console.log(`Register status: ${regRes.status}`);

    // Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    assert.equal(loginRes.status, 200);
    const setCookieHeader = loginRes.headers.get('set-cookie');
    const cookie = setCookieHeader.split(';')[0];
    console.log(`Logged in. Cookie: ${cookie}`);

    // 3. POST /projects with FormData
    const formData = new FormData();
    formData.append('title', 'CJS Cloudinary Project');
    formData.append('description', 'Test project uploaded using CommonJS.');
    formData.append('category', 'webdev');
    formData.append('technologies', 'CommonJS, Multer, Express');
    
    // Read the file and append it as a Blob
    const fileBuffer = fs.readFileSync('dummy.png');
    const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('image', fileBlob, 'dummy.png');

    console.log('Sending upload request...');
    const uploadRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Cookie': cookie,
      },
      body: formData,
    });

    const text = await uploadRes.text();
    console.log(`Upload Status: ${uploadRes.status}`);
    console.log('Upload Raw Response:', text);
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Ignored
    }

    assert.equal(uploadRes.status, 201);
    assert.ok(data.imageURL, 'Response should contain imageURL');
    assert.ok(data.imageURL.includes('cloudinary.com'), 'imageURL should point to cloudinary.com');
    assert.ok(data.imagePublicId, 'Response should contain imagePublicId');
    console.log('\n🎉 COMMONJS CLOUDINARY UPLOAD TEST PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Upload test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup dummy file
    if (fs.existsSync('dummy.png')) {
      fs.unlinkSync('dummy.png');
    }
  }
}

runUploadTest();
