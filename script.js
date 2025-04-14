// Modificaciones en script.js

document.addEventListener('DOMContentLoaded', function() {
    // Variables del juego
    const player = document.getElementById('player');
    const gameArea = document.getElementById('game-area');
    const messageBox = document.getElementById('message-box');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-button');
    const playMusicButton = document.getElementById('play-music-button');
    const backgroundMusic = document.getElementById('background-music');
    
    let score = 0;
    let gameActive = true;
    let playerPosition = 100;
    let potholes = [];
    let potholesFixedMilestone = 0;
    let gameSpeed = 1;
    let maxPotholes = 5;
    let difficultyInterval;
    let messageTimeout;
    let musicPlaying = false;
    
    // Configuración de controles
    const keys = {
        left: false,
        right: false,
        space: false
    };
    
    // Función para reproducir música
    function playMusic() {
        if (!musicPlaying) {
            backgroundMusic.volume = 0.5; // Volumen al 50%
            backgroundMusic.play()
                .then(() => {
                    musicPlaying = true;
                    playMusicButton.classList.add('music-playing'); // Ocultar botón
                    showMessage("¡MÚSICA ENCENDIDA!");
                })
                .catch(error => {
                    console.error("Error al reproducir música:", error);
                });
        }
    }
    
    // Botón para iniciar música
    playMusicButton.addEventListener('click', function() {
        playMusic();
    });
    
    // Iniciar el juego
    function startGame() {
        score = 0;
        gameActive = true;
        playerPosition = 100;
        potholes = [];
        potholesFixedMilestone = 0;
        gameSpeed = 1;
        maxPotholes = 5;
        
        scoreDisplay.textContent = '0';
        player.style.left = playerPosition + 'px';
        gameOverScreen.classList.add('hidden');
        
        // Si ya se inició la música, reiniciarla
        if (musicPlaying) {
            backgroundMusic.currentTime = 0;
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.log("Error al reanudar música:", e));
            }
        }
        
        // Limpiar baches existentes
        const existingPotholes = document.querySelectorAll('.pothole');
        existingPotholes.forEach(pothole => pothole.remove());
        
        // Generar baches iniciales
        generatePothole();
        
        // Aumentar dificultad con el tiempo
        difficultyInterval = setInterval(increaseDifficulty, 15000);
        
        // Iniciar bucle del juego
        requestAnimationFrame(gameLoop);
    }
    
    // También intentar reproducir música con cualquier interacción del usuario
    document.addEventListener('click', function firstUserInteraction() {
        if (!musicPlaying) {
            playMusic();
        }
        // Remover este listener después de la primera interacción
        document.removeEventListener('click', firstUserInteraction);
    });
    
    // Aumentar dificultad
    function increaseDifficulty() {
        if (gameSpeed < 3) {
            gameSpeed += 0.2;
        }
        if (maxPotholes < 12) {
            maxPotholes += 1;
        }
    }
    
    // Generar un nuevo bache
    function generatePothole() {
        if (!gameActive || potholes.length >= maxPotholes) return;
        
        const pothole = document.createElement('div');
        pothole.className = 'pothole';
        
        // Posición aleatoria en el ancho del juego
        const position = Math.floor(Math.random() * (gameArea.offsetWidth - 50));
        pothole.style.left = position + 'px';
        
        // Tiempo de vida del bache
        pothole.dataset.timeLeft = 10; // segundos antes de que cause game over
        
        gameArea.appendChild(pothole);
        potholes.push(pothole);
        
        // Programar la generación del próximo bache
        const nextDelay = Math.max(1000, 3000 / gameSpeed);
        setTimeout(generatePothole, nextDelay);
    }
    
    // Reparar bache
    function fixPothole() {
        if (!keys.space) return;
        
        // Verificar si hay un bache cerca del jugador
        const playerCenter = playerPosition + player.offsetWidth / 2;
        
        for (let i = 0; i < potholes.length; i++) {
            const pothole = potholes[i];
            const potholeLeft = parseInt(pothole.style.left);
            const potholeCenter = potholeLeft + pothole.offsetWidth / 2;
            
            // Si el jugador está cerca del bache
            if (Math.abs(playerCenter - potholeCenter) < 40) {
                // Remover el bache y actualizar puntuación
                pothole.parentNode.removeChild(pothole);
                potholes.splice(i, 1);
                
                score++;
                scoreDisplay.textContent = score;
                
                // Verificar hito
                if (score % 10 === 0 && score > potholesFixedMilestone) {
                    potholesFixedMilestone = score;
                    showMessage("¡TAPANDO LOS 1000 POZOS DE YUTO!");
                }
                
                break;
            }
        }
        
        // Resetear la tecla de espacio
        keys.space = false;
    }
    
    // Mostrar mensaje en forma de nube de conversación más pequeña
    function showMessage(text) {
        messageBox.textContent = text;
        messageBox.style.opacity = 1;
        
        // No establecemos la posición fija aquí, se actualizará en el gameLoop
        
        // Limpiar el mensaje después de un tiempo
        if (messageTimeout) {
            clearTimeout(messageTimeout);
        }
        
        messageTimeout = setTimeout(() => {
            messageBox.style.opacity = 0;
        }, 2000);
    }
    
    // Game Over
    function gameOver() {
        gameActive = false;
        clearInterval(difficultyInterval);
        
        // Pausar la música
        if (musicPlaying) {
            backgroundMusic.pause();
        }
        
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }
   
    // Bucle principal del juego
    function gameLoop() {
        if (!gameActive) return;
        
        // Mover al jugador
        if (keys.left && playerPosition > 0) {
            playerPosition -= 5;
        }
        if (keys.right && playerPosition < gameArea.offsetWidth - player.offsetWidth) {
            playerPosition += 5;
        }
        
        player.style.left = playerPosition + 'px';
        
        // Actualizar la posición del mensaje para que siga al jugador (al lado de la boca)
        if (parseFloat(messageBox.style.opacity) > 0 || messageBox.style.opacity === '') {
            // Posicionar al lado de la boca del jugador (ajustado)
            messageBox.style.left = (playerPosition - 130) + 'px'; // A la izquierda del jugador
            messageBox.style.top = '30px'; // A la altura de la boca (aprox)
        }
        
        // Actualizar tiempo de vida de los baches
        potholes.forEach((pothole, index) => {
            pothole.dataset.timeLeft -= 0.016; // aproximadamente 16ms por frame
            
            // Cambiar color según el tiempo restante (mantenemos negro pero con diferente opacidad)
            const timeLeft = parseFloat(pothole.dataset.timeLeft);
            if (timeLeft < 3) {
                pothole.style.backgroundColor = '#000000'; // Negro completo
            } else if (timeLeft < 6) {
                pothole.style.backgroundColor = '#111111'; // Negro un poco más claro
            }
            
            // Si el tiempo se acaba, game over
            if (timeLeft <= 0) {
                gameOver();
                return;
            }
        });
        
        // Intentar reparar bache si se presiona espacio
        fixPothole();
        
        // Continuar el bucle
        requestAnimationFrame(gameLoop);
    }
    
    // Event Listeners para los controles
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
        if (e.key === ' ') keys.space = true;
    });
    
    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
    });
    
    // Botón de reinicio también intenta reproducir música
    restartButton.addEventListener('click', function() {
        startGame();
        if (!musicPlaying) {
            playMusic();
        }
    });
    
    // Iniciar el juego
    startGame();
});