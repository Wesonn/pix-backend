import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Rota raiz (teste)
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// Rota PIX
app.get("/pix", async (req, res) => {
  try {
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: 50,
        description: "Crédito no jogo",
        payment_method_id: "pix",
        payer: {
          email: "teste@teste.com"
        }
      })
    });

    const data = await response.json();

    return res.json({
      copia_e_cola: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar PIX", detalhes: err });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
