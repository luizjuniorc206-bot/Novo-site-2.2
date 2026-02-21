const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/buscar-veterinarios', async (req, res) => {
    try {
        const { cidade, estado } = req.body;
        if (!cidade || !estado) {
            return res.status(400).json({ erro: 'Cidade e estado são obrigatórios' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Liste 5 veterinários especializados em medicina bovina e marcação animal em ${cidade}, ${estado}. Forneça nome, especialidade, telefone (se disponível) e endereço (se disponível). Responda em formato JSON com array de objetos contendo: nome, especialidade, telefone, endereco, cidade, estado. Se não encontrar veterinários específicos, retorne uma lista baseada em boas práticas.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const veterinarios = JSON.parse(text);
            res.json({ sucesso: true, cidade, estado, veterinarios: veterinarios || [] });
        } catch (e) {
            res.json({ sucesso: true, cidade, estado, mensagem: text });
        }
    } catch (erro) {
        console.error('Erro ao buscar veterinários:', erro);
        res.status(500).json({ erro: 'Erro ao processar sua solicitação', mensagem: erro.message });
    }
});

module.exports = router;