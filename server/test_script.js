const http = require('http');

const post = (path, body, token) => new Promise((res, rej) => {
  const opts = {
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  const req = http.request(opts, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => res({ status: r.statusCode, body: JSON.parse(d) }));
  });
  req.on('error', rej);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

const get = (path, token) => new Promise((res, rej) => {
  const opts = {
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'GET',
    headers: {}
  };
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  const req = http.request(opts, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => res({ status: r.statusCode, body: JSON.parse(d) }));
  });
  req.on('error', rej);
  req.end();
});

const del = (path, token) => new Promise((res, rej) => {
  const opts = {
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  };
  const req = http.request(opts, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => res({ status: r.statusCode, body: JSON.parse(d) }));
  });
  req.on('error', rej);
  req.end();
});

(async () => {
  try {
    let r;
    
    console.log('=== TEST 1: Empty login ===');
    r = await post('/api/auth/login', {});
    console.log(r.status, r.body.message);

    console.log('\n=== TEST 2: Wrong password ===');
    r = await post('/api/auth/login', { email: 'alice@company.com', password: 'wrong' });
    console.log(r.status, r.body.message);

    console.log('\n=== TEST 3: Valid employee login ===');
    r = await post('/api/auth/login', { email: 'alice@company.com', password: 'password123' });
    console.log(r.status, r.body.name, r.body.role);
    const empToken = r.body.token;

    console.log('\n=== TEST 4: Valid HR login ===');
    r = await post('/api/auth/login', { email: 'hr@company.com', password: 'admin123' });
    console.log(r.status, r.body.name, r.body.role);
    const hrToken = r.body.token;

    console.log('\n=== TEST 5: No token access to protected route ===');
    r = await get('/api/metrics/mine');
    console.log(r.status, r.body.message);

    console.log('\n=== TEST 6: Employee accessing HR route ===');
    r = await get('/api/metrics/all', empToken);
    console.log(r.status, r.body.message);

    console.log('\n=== TEST 7: Metrics missing fields ===');
    r = await post('/api/metrics', { screenTime: 8, date: '2026-03-16' }, empToken);
    console.log(r.status, r.body.message);

    console.log('\n=== TEST 8: Metrics with negative values (should fail) ===');
    r = await post('/api/metrics', { screenTime: -5, breakTime: 1, meetingTime: 2, workTime: 8, afterHoursTime: 7, date: '2026-01-01' }, empToken);
    console.log(r.status, r.body);

    console.log('\n=== TEST 9: Metrics with values > 24 (should fail) ===');
    r = await post('/api/metrics', { screenTime: 25, breakTime: 1, meetingTime: 2, workTime: 8, afterHoursTime: 7, date: '2026-01-02' }, empToken);
    console.log(r.status, r.body);

    console.log('\n=== ALL TESTS DONE ===');
  } catch (err) {
    console.error('Test failed:', err);
  }
})();
