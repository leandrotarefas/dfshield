const express = require('express');
const path = require('path');
const app = express();

const axios = require('axios');

const cors = require('cors');

const bodyParser = require('body-parser');

const useragent = require('express-useragent');
const geoip = require('geoip-lite');

app.use(bodyParser.json());

const fs = require('fs');


app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


// Middleware para capturar User-Agent
app.use(useragent.express());


// Rota para capturar dados do dispositivo
app.post('/device-info', (req, res) => {

    // Captura o IP do cliente
    const ip = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0] // Pega o primeiro IP da lista se houver múltiplos
        : req.socket.remoteAddress === '::1' // Verifica se é IPv6 loopback
            ? '127.0.0.1' // Converte para IPv4 loopback
            : req.socket.remoteAddress; // Retorna o endereço remoto

    // Captura geolocalização aproximada com base no IP
    const geo = geoip.lookup(ip);

    console.log('-----------------------------------------------------------------');
    // Impressão organizada no console
    console.log('==================== Dados de Geolocalização ====================');
    console.log(`IP do Cliente: ${ip}`);
    console.log('Dados de Geolocalização:', JSON.stringify(geo, null, 2)); // Indentação de 2 espaços

    // Captura os dados enviados do frontend
    const deviceInfo = req.body;
    console.log('==================== Dados do Dispositivo ====================');
    console.log('Dados do Dispositivo Recebidos:', JSON.stringify(deviceInfo, null, 2)); // Indentação de 2 espaços

    console.log('-----------------------------------------------------------------');

    // Responder com uma confirmação
    res.send();
});


function deviceFingerShield(req, res){

    const { env = "HML", session_id } = req.query;

    const filename = "device-info.js";   
  
    // Usando res.sendFile para enviar o arquivo específico
    const filePath = path.join(__dirname, 'public', filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro no processamento');
        }

        // Substitui as variáveis no conteúdo do arquivo
        let modifiedData = data.replace(/{{v_ENV}}/g, env)
                               .replace(/{{v_SESSION}}/g, session_id);

        // Envia o conteúdo modificado como resposta
        res.setHeader('Content-Type', 'application/javascript');
        res.send(modifiedData);
    });   
    
}


async function deviceFingerPrintVisa(req, res){
    try {
        const { env = "HML", session_id } = req.query;

        let org_id = "1snn5n9w";
        if(env == "PRD"){
            org_id = "k8vif92e";
        }
  
        // URL da qual você deseja obter o conteúdo
        const response = await axios.get(`https://h.online-metrix.net/fp/tags.js?org_id=${org_id}&session_id=${session_id}`);
    
        // Definindo o cabeçalho de resposta para permitir que o conteúdo seja utilizado como um script
        res.setHeader('Content-Type', 'application/javascript');
        
        // Retornando o conteúdo da URL externa
        res.send(response.data);
      } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        res.status(500).send('Erro ao buscar conteúdo externo.');
      }
}


const key = 0;

app.get('/dfshield', async (req, res) => {
    const { key = "visa"} = req.query;
    
    if(key == "visa"){
        return deviceFingerPrintVisa(req,res);
    }else{
        return deviceFingerShield(req, res);
    }
});


app.listen(8080, () => {
    console.log('Servidor rodando e device-info.js disponível!');
});
