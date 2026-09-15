fetch("https://med-rev-flow.abdulahadbutt420.workers.dev/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "hassansaqib27@gmail.com", password: "b$4aC2qH67gV" })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);
