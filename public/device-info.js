function getDeviceInfo() {
    // Coletar informações do dispositivo
    const deviceInfo = {
        userAgent: navigator.userAgent, // User-Agent do navegador
        platform: navigator.platform, // Plataforma do dispositivo (ex: Windows, Mac, Linux)
        language: navigator.language || navigator.userLanguage, // Idioma do navegador
        languages: navigator.languages, // Preferências de idiomas
        screen: {
            width: window.screen.width, // Largura da tela
            height: window.screen.height, // Altura da tela
            colorDepth: window.screen.colorDepth // Profundidade de cor da tela
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Fuso horário
        pixelRatio: window.devicePixelRatio, // Relação de pixels
        plugins: Array.from(navigator.plugins).map(plugin => plugin.name), // Plugins instalados
        cookiesEnabled: navigator.cookieEnabled, // Verificar se cookies estão habilitados
        connection: navigator.connection ? navigator.connection.effectiveType : 'unknown', // Tipo de conexão
        currentURL: window.location.href, // URL da página atual
        referrer: document.referrer, // URL de referência
        localStorageEnabled: typeof Storage !== 'undefined' && localStorage, // Verificar se o armazenamento local está habilitado
        sessionStorageEnabled: typeof Storage !== 'undefined' && sessionStorage, // Verificar se o armazenamento de sessão está habilitado
    };

    // Adicionando informações sobre a bateria, se disponível
    if (navigator.getBattery) {
        navigator.getBattery().then(function(battery) {
            deviceInfo.battery = {
                level: battery.level * 100, // Nível da bateria em porcentagem
                charging: battery.charging // Se a bateria está carregando
            };
        });
    }

    // Coletar informações de desempenho
    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
        const entry = performanceEntries[0];
        deviceInfo.performance = {
            redirectCount: entry.redirectCount, // Número de redirecionamentos
            fetchStart: entry.fetchStart, // Tempo de início da requisição
            connectEnd: entry.connectEnd, // Tempo de conexão finalizada
            responseEnd: entry.responseEnd, // Tempo em que a resposta foi recebida
            domContentLoaded: entry.domContentLoadedEventEnd, // Tempo de carregamento do DOM
            loadEventEnd: entry.loadEventEnd // Tempo de carregamento total
        };
    }

    var xhr = new XMLHttpRequest();
    var apiURL = 'https://dfshield-leandrommelo-dev.apps.sandbox-m2.ll9k.p1.openshiftapps.com/device-info';

    xhr.open('POST', apiURL, true); // Alterado para POST para enviar dados
    xhr.setRequestHeader('Content-Type', 'application/json'); // Configurar cabeçalho para JSON

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log('Dados do dispositivo enviados com sucesso:', response);
            } else {
                console.error('Erro ao acessar a API de Device Info.');
            }
        }
    };

    xhr.onerror = function () {
        console.error('Erro de conexão ao acessar a API.');
    };

    // Enviar informações do dispositivo como JSON
    xhr.send(JSON.stringify(deviceInfo));
}

// Chamar a função para obter as informações
getDeviceInfo();
