document.addEventListener('DOMContentLoaded', () => {
    const matrix = document.getElementById('matrix');
    
    // 40 linhas x 100 colunas = 4.000 bolinhas
    const totalBalls = 40 * 100;
    
    // Usar um DocumentFragment para melhorar a performance de inserção no DOM
    const fragment = document.createDocumentFragment();
    
    let isDrawing = false;
    let lastX = null;
    let lastY = null;
    let currentSessionId = null;

    const startBtn = document.getElementById('start-btn');
    const finishBtn = document.getElementById('finish-btn');
    const clearBtn = document.getElementById('clear-btn');
    const usernameInput = document.getElementById('username');
    const messageArea = document.getElementById('message-area');
    let messageTimeout;

    function generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let drawnBallsThisSession = new Set();

    function sendIngestion(data) {
        fetch('http://localhost:1414/api/ingestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(err => console.error('Erro ao enviar evento de ingestão:', err));
    }

    function markBallDrawn(ball) {
        if (!ball || !ball.classList.contains('ball')) return;
        
        if (!ball.classList.contains('drawn')) {
            ball.classList.add('drawn');
        }

        const ballId = `${ball.dataset.x}-${ball.dataset.y}`;
        if (currentSessionId && !drawnBallsThisSession.has(ballId)) {
            drawnBallsThisSession.add(ballId);
            sendIngestion({
                type: 'capture',
                nome: usernameInput.value.trim() || 'Desconhecido',
                timestamp: Date.now(),
                posicao: {
                    x: parseInt(ball.dataset.x, 10),
                    y: parseInt(ball.dataset.y, 10)
                },
                sessao: currentSessionId
            });
        }
    }

    function showMessage(msg, isError = false) {
        messageArea.textContent = msg;
        messageArea.className = 'message-area show ' + (isError ? 'message-error' : 'message-success');
        
        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(() => {
            messageArea.classList.remove('show');
        }, 4000);
    }

    // Botão Iniciar
    startBtn.addEventListener('click', () => {
        currentSessionId = generateGUID();
        showMessage(`Sessão iniciada! Você já pode começar a desenhar.`);
    });

    // Botão Finalizar
    finishBtn.addEventListener('click', () => {
        if (!currentSessionId) {
            showMessage('Você precisa clicar em "Iniciar" primeiro!', true);
            return;
        }

        const username = usernameInput.value.trim();
        
        if (username) {
            // Dispara requisição de finalização para o backend
            sendIngestion({
                type: 'finalize',
                nome: username,
                timestamp: Date.now(),
                sessao: currentSessionId
            });

            showMessage(`Obrigado, ${username}! Sua assinatura (ID: ${currentSessionId}) foi finalizada.`);
            usernameInput.value = ''; // Limpa o campo de nome
            currentSessionId = null; // Reseta a sessão
            drawnBallsThisSession.clear(); // Limpa tracking
        } else {
            showMessage('Por favor, insira o seu nome antes de finalizar.', true);
            return; // Impede a limpeza se o nome não for preenchido
        }

        // Limpa a tela
        const drawnBalls = matrix.querySelectorAll('.drawn');
        drawnBalls.forEach(ball => ball.classList.remove('drawn'));
    });

    // Botão Limpar Desenho
    clearBtn.addEventListener('click', () => {
        // Encontra apenas as bolinhas que foram desenhadas para melhor performance
        const drawnBalls = matrix.querySelectorAll('.drawn');
        drawnBalls.forEach(ball => ball.classList.remove('drawn'));
    });

    // Previne o menu de contexto na matriz
    matrix.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Inicia o desenho
    matrix.addEventListener('mousedown', (e) => {
        if (!currentSessionId) {
            showMessage('Por favor, clique em "Iniciar" primeiro para gerar seu ID de sessão.', true);
            return;
        }

        if (e.button === 0) { // 0 = Botão esquerdo
            e.preventDefault(); // Impede o navegador de tentar "arrastar" a imagem/div nativamente
            isDrawing = true;
            lastX = e.clientX;
            lastY = e.clientY;
            markBallDrawn(e.target);
        }
    });

    // Finaliza o desenho
    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isDrawing = false;
            lastX = null;
            lastY = null;
        }
    });

    // Usa 'mousemove' para capturar o rastro.
    matrix.addEventListener('mousemove', (e) => {
        // Fallback de segurança: se o mouse se mover, mas o botão esquerdo não estiver pressionado (1), 
        // cancelamos o desenho. Isso corrige bugs onde o mouse é solto fora da janela.
        if (e.buttons !== 1) {
            isDrawing = false;
            lastX = null;
            lastY = null;
            return;
        }

        if (!isDrawing) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        if (lastX !== null && lastY !== null) {
            const dx = currentX - lastX;
            const dy = currentY - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Verifica um ponto a cada 3 pixels (metade do tamanho da bolinha) para garantir que não pula nenhuma
            const steps = Math.max(Math.floor(distance / 3), 1);

            for (let i = 0; i <= steps; i++) {
                const x = lastX + (dx * i) / steps;
                const y = lastY + (dy * i) / steps;
                
                // Pega o elemento exato naquelas coordenadas interpoladas
                const element = document.elementFromPoint(x, y);
                markBallDrawn(element);
            }
        }

        lastX = currentX;
        lastY = currentY;
    });

    for (let i = 0; i < totalBalls; i++) {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        
        // Adiciona atributos de coordenadas. (0,0) é no canto inferior esquerdo.
        // A matriz tem 100 colunas e 40 linhas. 
        // O DOM renderiza de cima para baixo, então a linha 0 (visual no topo) será Y = 39.
        const col = i % 100;
        const row = Math.floor(i / 100);
        ball.dataset.x = col;
        ball.dataset.y = 39 - row;

        // Não adicionamos nenhum listener aqui!
        fragment.appendChild(ball);
    }
    
    // Adiciona todas as 4.000 bolinhas de uma vez só ao DOM
    matrix.appendChild(fragment);
});
