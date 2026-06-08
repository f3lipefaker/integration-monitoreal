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
        
        return response.data.access; 
    } catch (error) {
        console.error('Erro ao obter token do Monitoreal:', error.response?.data || error.message);
        throw new Error('Falha na autenticação com Monitoreal');
    }
}

// ========================================================
// FUNÇÃO AUXILIAR: Executa a ação para múltiplos IDs
// ========================================================
async function alterarStatusCameras(idsString, active) {
    // Transforma "45,46" em ["45", "46"]. Se for só "45", vira ["45"]
    const ids = idsString.split(',').map(id => id.trim());
    
    // Busca o token uma única vez para todas as requisições
    const accessToken = await getMonitorealToken();

    // Mapeia cada ID para uma promessa do Axios
    const promises = ids.map(async (id) => {
        try {
            const response = await axios.put(`${MONITOREAL_API}/camera/${id}/`, 
                { active }, 
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            return { id, success: true, data: response.data };
        } catch (error) {
            return { id, success: false, error: error.response?.data || error.message };
        }
    });

    // Executa todas em paralelo
    return await Promise.all(promises);
}

// ========================================================
// ROTAS: Ativar e Desativar Câmeras (Suporta um ou múltiplos IDs)
// ========================================================

// ROTA: Ativar -> GET ou POST /camera/:id/ative (Ex: /camera/45/ative ou /camera/45,46,47/ative)
router.get('/camera/:id/ative', async (req, res) => {
    try {
        const { id } = req.params; 
        const resultados = await alterarStatusCameras(id, true);

        // Verifica se houve alguma falha global ou parcial
        const falhas = resultados.filter(r => !r.success);
        
        return res.status(200).json({
            success: falhas.length === 0,
            message: `Processamento de ativação concluído.`,
            resultados
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ROTA: Desativar -> GET ou POST /camera/:id/desative (Ex: /camera/45/desative ou /camera/45,46,47/desative)
router.get('/camera/:id/desative', async (req, res) => {
    try {
        const { id } = req.params; 
        const resultados = await alterarStatusCameras(id, false);

        const falhas = resultados.filter(r => !r.success);
        
        return res.status(200).json({
            success: falhas.length === 0,
            message: `Processamento de desativação concluído.`,
            resultados
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;