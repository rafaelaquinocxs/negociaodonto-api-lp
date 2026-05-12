require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Conexão MongoDB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado — negociaodonto_cxs'))
  .catch(err => { console.error('❌ Erro MongoDB:', err); process.exit(1); });

// ── Schema / Model ──
const leadSchema = new mongoose.Schema({
  nome:             { type: String, required: true },
  email:            { type: String, required: true },
  telefone:         { type: String, required: true },
  tratamento:       { type: String, required: true },
  metodo_pagamento: { type: String, required: true },
  // À vista
  valor_avista:     { type: String, default: null },
  // Cartão
  parcelas:         { type: String, default: null },
  // Financiamento
  financiadora:     { type: String, default: null },
  // Metadata
  origem:           { type: String, default: 'landing-page' },
  criado_em:        { type: Date,   default: Date.now },
});

const Lead = mongoose.model('Lead', leadSchema, 'leads');

// ── Rota de saúde ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado' });
});

// ── POST /leads ──
app.post('/leads', async (req, res) => {
  try {
    const { nome, email, telefone, tratamento, metodo_pagamento,
            valor_avista, parcelas, financiadora } = req.body;

    // Validação básica
    if (!nome || !email || !telefone || !tratamento || !metodo_pagamento) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
    }

    const lead = await Lead.create({
      nome, email, telefone, tratamento, metodo_pagamento,
      valor_avista:  valor_avista  || null,
      parcelas:      parcelas      || null,
      financiadora:  financiadora  || null,
    });

    console.log(`📥 Novo lead: ${nome} | ${tratamento} | ${metodo_pagamento}`);
    res.status(201).json({ sucesso: true, id: lead._id });

  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar lead.' });
  }
});

// ── Iniciar servidor ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
