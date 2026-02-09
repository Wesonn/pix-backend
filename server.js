const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Rota raiz só pra testar
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// Rota PIX segura
app.get("/pix", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: 10, // valor do pagamento para teste
        description: "Depósito no jogo",
        payment_method_id: "pix",
        payer: { email: "teste@teste.com" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      qr_code: response.data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao gerar PIX", detalhes: error.response?.data || error.message });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
