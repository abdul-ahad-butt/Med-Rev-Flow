async function test() {
  const loginRes = await fetch('https://med-rev-flow.abdulahadbutt420.workers.dev/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'frontdesk@demo.medrevflow.com', password: 'Demo@1234' })
  });
  
  const loginData = await loginRes.json();

  const statsRes = await fetch('https://med-rev-flow.abdulahadbutt420.workers.dev/api/denials', {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${loginData.token}`,
      'Origin': 'https://med-rev-flow.pages.dev'
    }
  });

  console.log('List status:', statsRes.status);
  console.log('List headers:', statsRes.headers.get('content-type'));
  const text = await statsRes.text();
  console.log('List body:', text.slice(0, 100));
}

test();
