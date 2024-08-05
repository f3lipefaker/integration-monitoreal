import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { config as dotenvConfig } from 'dotenv';
import { pool } from './src/utils/index.js';

dotenvConfig();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

const PORT = process.env.PORT;
const MODE = process.env.MODE;
const HOST = process.env.ADDRESS;
const server = http.createServer(app);

import auth from './src/routes/auth/index.js';

app.use('/api/v1', auth);


server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export { app, pool };