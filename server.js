import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// rota teste
app.get("/", (req, res) => {
  res.send("Servidor PIX online");
});

// 🔥 ROTA QUE CRIA O PIX REAL
app.post("/criar-pix", async (req, res) => {
  const { valor } = req.body;

  if (!valor || valor <= 0) {
    return res.status(400).json({ error: "Valor inválido" });
  }

  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_amount: Number(valor),
          description: "Depósito no jogo Caixas Premiadas",
          payment_method_id: "pix",
          payer: {
            email: "pagador@email.com"
          }
        })
      }
    );

    const data = await response.json();

    res.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao criar Pix" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
