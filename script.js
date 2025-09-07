let qr = new QRCode(document.getElementById("qrcode"), {
    width: 160,
    height: 160,
  });
  ش
  let countdownInterval;
  
  function generateTicket() {
    // تغيير صورة المنطقة تلقائيًا
const zoneImg = document.querySelector(".zone-img img");
if (zone === "AB") {
  zoneImg.src = "https://upload.wikimedia.org/wikipedia/commons/e/e8/HSL_alue_AB.png";
} else {
  zoneImg.src = "https://upload.wikimedia.org/wikipedia/commons/5/5d/HSL_matkustusalue_ABC.png";
}

    const type = document.getElementById("type").value;
    const zone = document.getElementById("zone").value;
    const id = Math.floor(Math.random() * 900000 + 100000);
    const extra = Math.floor(Math.random() * 90000000 + 10000000);
    const ticketId = `${id} ${extra}`;
    document.getElementById("ticketId").innerText = ticketId;
  
    const now = new Date();
    const expiry = new Date(now.getTime() + 60 * 60000); // +60 min
    const hh = expiry.getHours().toString().padStart(2, '0');
    const mm = expiry.getMinutes().toString().padStart(2, '0');
    document.getElementById("validTime").innerText = `${hh}:${mm} asti`;
    document.getElementById("asiakasryhma").innerText = type;
  
    qr.clear();
    qr.makeCode(`Lippu ${ticketId} - ${type} - ${zone} - ${hh}:${mm}`);
  
    saveToLocalStorage(ticketId, type, zone, expiry);
    startCountdown(expiry);
  }
  
  function startCountdown(expiry) {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      const now = new Date();
      const diff = expiry - now;
      if (diff <= 0) {
        document.getElementById("countdown").innerText = "Lippu vanhentunut";
        clearInterval(countdownInterval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      document.getElementById("countdown").innerText = `Voimassa vielä: ${mins} min ${secs} sek`;
    }, 1000);
  }
  
  function saveToLocalStorage(ticketId, type, zone, expiry) {
    const data = { ticketId, type, zone, expiry: expiry.toISOString() };
    localStorage.setItem("lastTicket", JSON.stringify(data));
  }
  
  function loadLastTicket() {
    const data = JSON.parse(localStorage.getItem("lastTicket"));
    if (!data) return;
  
    document.getElementById("ticketId").innerText = data.ticketId;
    document.getElementById("asiakasryhma").innerText = data.type;
    document.getElementById("type").value = data.type;
    document.getElementById("zone").value = data.zone;
  
    const expiry = new Date(data.expiry);
    const hh = expiry.getHours().toString().padStart(2, '0');
    const mm = expiry.getMinutes().toString().padStart(2, '0');
    document.getElementById("validTime").innerText = `${hh}:${mm} asti`;
  
    qr.clear();
    qr.makeCode(`Lippu ${data.ticketId} - ${data.type} - ${data.zone} - ${hh}:${mm}`);
  
    startCountdown(expiry);
  }
  
  function downloadAsImage() {
    html2canvas(document.getElementById("ticketCard")).then(canvas => {
      const link = document.createElement("a");
      link.download = "lippu.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }
  
  function printTicket() {
    const content = document.getElementById("ticketCard").innerHTML;
    const win = window.open("", "", "width=400,height=600");
    win.document.write(`
      <html><head><title>Tulosta</title></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  }
  
  loadLastTicket();
  