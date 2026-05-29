require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado — negociaodonto_cxs'))
  .catch(err => { console.error('❌ Erro MongoDB:', err); process.exit(1); });

const leadSchema = new mongoose.Schema({
  nome:             { type: String, required: true },
  telefone:         { type: String, required: true },
  tratamento:       { type: String, default: null },
  metodo_pagamento: { type: String, required: true },
  valor_avista:     { type: String, default: null },
  faixa_mensal:     { type: String, default: null },
  origem:           { type: String, default: 'landing-page' },
  criado_em:        { type: Date,   default: Date.now },
});

const Lead = mongoose.model('Lead', leadSchema, 'leads');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado' });
});

app.post('/leads', async (req, res) => {
  try {
    const { nome, telefone, tratamento, metodo_pagamento, valor_avista, faixa_mensal } = req.body;

    if (!nome || !telefone || !metodo_pagamento) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, telefone, metodo_pagamento.' });
    }

    const lead = await Lead.create({
      nome,
      telefone,
      tratamento:       tratamento       || null,
      metodo_pagamento,
      valor_avista:     valor_avista     || null,
      faixa_mensal:     faixa_mensal     || null,
    });

    console.log(`📥 Novo lead: ${nome} | ${telefone} | ${tratamento} | ${metodo_pagamento}`);
    res.status(201).json({ sucesso: true, id: lead._id });

  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar lead.', detalhe: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
