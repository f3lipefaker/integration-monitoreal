import { Router } from 'express';
import axios from 'axios';
import { pool } from '../../../server.js';
import sql from '../../functions/sql.js';
import tables from '../../utils/tables.js';

const router = Router();
const MONITOREAL_API = 'http://monitoreal.viptech.com.br/api';

// ========================================================
// FUNÇÃO: Obter Token de Acesso do Monitoreal
// ========================================================
async function getMonitorealToken() {
    try {
        const response = await axios.post(`${MONITOREAL_API}/token/`, {
            username: "fbdomingos",
            password: "@Viptech3348"
        });
        
        // Retorna o token de acesso (access)
        return response.data.access; 
    } catch (error) {
        console.error('Erro ao obter token do Monitoreal:', error.response?.data || error.message);
        throw new Error('Falha na autenticação com Monitoreal');
    }
}

// ========================================================
// FUNÇÕES / ROTAS: Ativar e Desativar Câmeras dinamicamente
// ========================================================

// ROTA: Ativar uma câmera específica -> PUT /camera/:id/ative
router.get('/camera/:id/ative', async (req, res) => {
    try {
        const { id } = req.params; // ID da câmera (ex: 45 ou 46)
        
        // 1. Busca o token válido atualizado
        const accessToken = await getMonitorealToken();

        // 2. Faz a requisição PUT para a API do Monitoreal
        const response = await axios.put(`${MONITOREAL_API}/camera/${id}/`, 
            { active: true }, 
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        return res.status(200).json({ success: true, message: `Câmera ${id} ativada com sucesso!`, data: response.data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ROTA: Desativar uma câmera específica -> PUT /camera/:id/desative
router.get('/camera/:id/desative', async (req, res) => {
    try {
        const { id } = req.params; // ID da câmera (ex: 45 ou 46)
        
        // 1. Busca o token válido atualizado
        const accessToken = await getMonitorealToken();

        // 2. Faz a requisição PUT para a API do Monitoreal
        const response = await axios.put(`${MONITOREAL_API}/camera/${id}/`, 
            { active: false }, 
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        return res.status(200).json({ success: true, message: `Câmera ${id} desativada com sucesso!`, data: response.data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;