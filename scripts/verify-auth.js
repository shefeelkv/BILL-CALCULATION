const http = require('http');

const registerData = JSON.stringify({
    username: 'autotest_user_' + Date.now(),
    password: 'password123'
});

function request(path, method, data, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? data.length : 0
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: body });
                }
            });
        });

        req.on('error', error => reject(error));
        if (data) req.write(data);
        req.end();
    });
}

async function runTest() {
    console.log('1. Testing Registration...');
    console.log('Payload:', registerData);
    const regRes = await request('/register', 'POST', registerData);
    console.log('Response:', regRes);

    if (regRes.statusCode !== 201) {
        console.error('❌ Registration Failed');
        return;
    }
    console.log('✅ Registration Success\n');

    console.log('2. Testing Login...');
    const loginData = registerData; // Same credentials
    const loginRes = await request('/login', 'POST', loginData);
    console.log('Response:', loginRes);

    if (loginRes.statusCode !== 200 || !loginRes.body.token) {
        console.error('❌ Login Failed');
        return;
    }
    console.log('✅ Login Success');
    console.log('Token received:', loginRes.body.token.substring(0, 20) + '...');
}

runTest();
