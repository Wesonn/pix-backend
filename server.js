// server.js
const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Coloque seu Access Token do Mercado Pago aqui
mercadopago.configurations.setAccessToken("SEU_ACCESS_TOKEN_AQUI");

let saldo = 0; // saldo do jogador

// Rota para gerar PIX
app.get('/pix', async (req, res) => {
    const valor = Number(req.query.valor) || 50;
    try {
        const pagamento = await mercadopago.payment.create({
            transaction_amount: valor,
            description: "Depósito no jogo",
            payment_method_id: "pix",
            payer: { email: "teste@teste.com" } // email fictício
        }, {
            headers: { "X-Idempotency-Key": uuidv4() } // evita erro 400
        });

        res.json({
            copia_e_cola: pagamento.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch(e) {
        console.log(e);
        res.status(400).json({ error: "Erro ao gerar PIX", detalhes: e });
    }
});

// Rota para consultar saldo
app.get('/saldo', (req, res) => res.json({ saldo }));

// Webhook do Mercado Pago (atualiza saldo quando pagamento aprovado)
app.post('/webhook', (req, res) => {
    const { type, data } = req.body;
    if(type === "payment") {
        mercadopago.payment.get(data.id).then(p => {
            if(p.body.status === "approved") {
                saldo += Number(p.body.transaction_amount);
                console.log(`Pagamento aprovado! Novo saldo: R$${saldo}`);
            }
        }).catch(console.error);
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor PIX rodando na porta ${PORT}`));
