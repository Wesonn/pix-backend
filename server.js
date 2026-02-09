import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.MP_TOKEN;

app.post("/pix", async (req, res) => {
  const { valor } = req.body;

  const r = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transaction_amount: valor,
      description: "Deposito jogo",
      payment_method_id: "pix",
      payer: { email: "test_user@test.com" }
    })
  });

  const j = await r.json();

  res.json({
    id: j.id,
    copia: j.point_of_interaction.transaction_data.qr_code
  });
});

app.listen(process.env.PORT || 3000);
