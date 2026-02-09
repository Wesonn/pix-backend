const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Coloque aqui seu Access Token do Mercado Pago
const ACCESS_TOKEN = "COLE_AQUI_SEU_ACCESS_TOKEN";

// Se for usar no front-end, também coloque a Public Key
const PUBLIC_KEY = "COLE_AQUI_SUA_PUBLIC_KEY";

app.get("/pix", async (req, res) => {
    try {
        // Exemplo de requisição para gerar pagamento PIX
        const response = await axios.post(
            "https://api.mercadopago.com/v1/payments",
            {
                transaction_amount: 10, // valor do pagamento
                description: "Teste PIX",
                payment_method_id: "pix"
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao gerar PIX", detalhes: error.response?.data });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor PIX rodando na porta ${PORT}`));
