const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ROTA TESTE
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// ROTA PARA CRIAR PIX
app.post("/pix", async (req, res) => {
  try {
    const { valor } = req.body;

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: Number(valor),
        description: "Pagamento PIX",
        payment_method_id: "pix",
        payer: {
          email: "test_user_123456@test.com"
        }
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
      qr_code_base64:
        response.data.point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao gerar PIX",
      detalhe: error.response?.data || error.message
    });
  }
});

// PORTA OBRIGATÓRIA DO RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
