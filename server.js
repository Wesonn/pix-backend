import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// saldo simples em memória (teste)
let saldoUsuarios = {};

app.get("/", (req, res) => {
  res.send("Servidor PIX online");
});

// 🔥 CRIAR PIX
app.post("/criar-pix", async (req, res) => {
  const { valor, userId } = req.body;

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
          description: "Depósito no jogo",
          payment_method_id: "pix",
          payer: { email: "pagador@email.com" },
          metadata: { userId }
        })
      }
    );

    const data = await response.json();

    res.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch {
    res.status(500).json({ error: "Erro ao criar Pix" });
  }
});

// 🔔 WEBHOOK
app.post("/webhook", async (req, res) => {
  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.sendStatus(200);

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
      }
    }
  );

  const data = await response.json();

  if (data.status === "approved") {
    const userId = data.metadata.userId;
    const valor = data.transaction_amount;

    saldoUsuarios[userId] = (saldoUsuarios[userId] || 0) + valor;
    console.log(`Saldo liberado: ${userId} +R$${valor}`);
  }

  res.sendStatus(200);
});

// CONSULTAR SALDO
app.get("/saldo/:userId", (req, res) => {
  const saldo = saldoUsuarios[req.params.userId] || 0;
  res.json({ saldo });
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
