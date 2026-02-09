// server.js
const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Configure com seu Access Token do Mercado Pago
mercadopago.configurations.setAccessToken("SEU_ACCESS_TOKEN_AQUI");

// Saldo dos jogadores (para teste)
let saldo = 0;

// Rota para gerar PIX
app.get('/pix', async (req, res) => {
    const valor = Number(req.query.valor) || 50; // Recebe valor via query ou default 50
    try {
        const pagamento = await mercadopago.payment.create({
            transaction_amount: valor,
            description: "Depósito no jogo",
            payment_method_id: "pix",
            payer: { email: "teste@teste.com" } // pode trocar por email real do jogador
        }, {
            headers: { "X-Idempotency-Key": uuidv4() } // evita erro de requisição duplicada
        });

        res.json({
            copia_e_cola: pagamento.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Erro ao gerar PIX", detalhes: e });
    }
});

// Rota para consultar saldo
app.get('/saldo', (req, res) => {
    res.json({ saldo });
});

// Rota de webhook do Mercado Pago para atualizar saldo automaticamente
app.post('/webhook', (req, res) => {
    const { type, data } = req.body;
    if(type === "payment") {
        const paymentId = data.id;
        mercadopago.payment.get(paymentId).then(p => {
            if(p.body.status === "approved") {
                saldo += Number(p.body.transaction_amount);
                console.log(`Pagamento aprovado! Novo saldo: R$${saldo}`);
            }
        }).catch(err => console.error(err));
    }
    res.sendStatus(200);
});

// Inicia servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor PIX rodando na porta ${PORT}`));
