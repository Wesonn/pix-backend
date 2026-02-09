async function abrirPix(){
  const pixContainer = document.getElementById("pixContainer");
  pixContainer.innerHTML = "Gerando PIX...";
  try{
    const resp = await fetch("https://pix-backend-production-b072.up.railway.app/pix");
    const data = await resp.json();

    pixContainer.innerHTML = `
      <p>Copia e Cola PIX: ${data.copia_e_cola}</p>
      <img src="data:image/png;base64,${data.qr_code_base64}" alt="QR Code PIX"/>
      <p>Pague pelo app do banco para receber o saldo</p>
    `;

    // Atualiza saldo depois de alguns segundos
    setTimeout(atualizarSaldoReal, 5000);
  }catch(e){
    pixContainer.innerHTML = "Erro ao gerar PIX";
  }
}
