async function test() {
  const loginRes = await fetch("https://med-rev-flow.abdulahadbutt420.workers.dev/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@demo.medrevflow.com", password: "Demo@1234" })
  });
  
  const { token } = await loginRes.json();
  
  const arRes = await fetch("https://med-rev-flow.abdulahadbutt420.workers.dev/api/ar", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  console.log("AR status:", arRes.status);
  console.log("AR text:", await arRes.text());
}
test().catch(console.error);
