const run = async () => {
  await fetch('http://localhost:8787/api/seed');
  
  const loginRes = await fetch('http://localhost:8787/api/auth/login', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ email: 'abdulahadbutt420@gmail.com', password: 'Qaz123$$' }) 
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    console.log('Login failed', loginData);
    return;
  }
  
  const practiceRes = await fetch('http://localhost:8787/api/admin/practices', { 
    method: 'POST', 
    headers: { Authorization: 'Bearer ' + loginData.token, 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ practiceName: 'Real Practice 5', ownerEmail: 'real5@practice.com', ownerFirstName: 'Real', ownerLastName: 'User' }) 
  });
  const practiceData = await practiceRes.json();
  if (!practiceData.credentials) {
    console.log('Create practice failed', practiceData);
    return;
  }
  
  const uLoginRes = await fetch('http://localhost:8787/api/auth/login', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ email: 'real5@practice.com', password: practiceData.credentials.temporaryPassword }) 
  });
  const uLoginData = await uLoginRes.json();
  
  const dashRes = await fetch('http://localhost:8787/api/dashboard', { 
    headers: { Authorization: 'Bearer ' + uLoginData.token } 
  });
  console.log('Status:', dashRes.status);
  console.log('Body:', await dashRes.text());
};
run().catch(console.error);
