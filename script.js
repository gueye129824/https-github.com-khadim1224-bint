class QuizBuzzerGame {
    constructor() {
        this.players = {
            1: { score: 0, name: 'Joueur 1' },
            2: { score: 0, name: 'Joueur 2' },
            3: { score: 0, name: 'Joueur 3' },
            4: { score: 0, name: 'Joueur 4' }
        };
        
        this.currentWinner = null;
        this.gameActive = true;
        this.timer = 30;
        this.timerInterval = null;
        
        this.questions = [
            "Quelle est la capitale de la France ?",
            "Combien font 7 x 8 ?",
            "Quel est le plus grand océan du monde ?",
            "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?",
            "Quel est l'élément chimique représenté par le symbole 'O' ?",
            "Qui a peint la Joconde ?",
            "Combien de continents y a-t-il sur Terre ?",
            "Quelle est la planète la plus proche du Soleil ?",
            "Dans quel pays se trouve Machu Picchu ?",
            "Quel est le plus long fleuve du monde ?"
        ];
        
        this.currentQuestionIndex = 0;
        
        this.initializeGame();
        this.setupEventListeners();
        this.startTimer();
    }
    
    initializeGame() {
        this.updateQuestion();
        this.updateScores();
        this.resetBuzzers();
    }
    
    setupEventListeners() {
        // Buzzers
        document.querySelectorAll('.buzzer').forEach(buzzer => {
            buzzer.addEventListener('click', (e) => {
                const playerId = e.target.dataset.player;
                this.handleBuzzer(playerId);
            });
        });
        
        // Contrôles
        document.getElementById('correctBtn').addEventListener('click', () => {
            this.handleAnswer(true);
        });
        
        document.getElementById('wrongBtn').addEventListener('click', () => {
            this.handleAnswer(false);
        });
        
        document.getElementById('nextQuestionBtn').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetRound();
        });
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case '1':
                    this.handleBuzzer('1');
                    break;
                case '2':
                    this.handleBuzzer('2');
                    break;
                case '3':
                    this.handleBuzzer('3');
                    break;
                case '4':
                    this.handleBuzzer('4');
                    break;
                case 'ArrowRight':
                    if (this.currentWinner) {
                        this.handleAnswer(true);
                    }
                    break;
                case 'ArrowLeft':
                    if (this.currentWinner) {
                        this.handleAnswer(false);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
            }
        });
    }
    
    handleBuzzer(playerId) {
        if (!this.gameActive || this.currentWinner) return;
        
        this.currentWinner = playerId;
        this.gameActive = false;
        
        // Jouer le son du buzzer
        this.playBuzzerSound(playerId);
        
        // Effets visuels
        this.showWinner(playerId);
        this.disableAllBuzzers();
        
        // Activer les boutons de contrôle
        document.getElementById('correctBtn').disabled = false;
        document.getElementById('wrongBtn').disabled = false;
        
        // Arrêter le timer
        this.stopTimer();
    }
    
    playBuzzerSound(playerId) {
        // Créer différents sons pour chaque joueur
        const frequencies = {
            '1': 440, // La
            '2': 523, // Do
            '3': 659, // Mi
            '4': 784  // Sol
        };
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[playerId], audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Ajouter un effet de "ding" pour le premier joueur
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.setValueAtTime(frequencies[playerId] * 2, audioContext.currentTime);
            oscillator2.type = 'triangle';
            
            gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.3);
        }, 100);
    }
    
    showWinner(playerId) {
        const buzzer = document.querySelector(`[data-player="${playerId}"] .buzzer`);
        const status = document.getElementById(`status${playerId}`);
        
        buzzer.classList.add('first');
        status.textContent = '🏆 Premier !';
        status.style.color = '#f39c12';
        
        // Animation de confettis
        this.createConfetti();
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a55eea'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.borderRadius = '50%';
                
                document.body.appendChild(confetti);
                
                const animation = confetti.animate([
                    { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 }
                ], {
                    duration: 3000 + Math.random() * 2000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                animation.onfinish = () => {
                    confetti.remove();
                };
            }, i * 50);
        }
    }
    
    disableAllBuzzers() {
        document.querySelectorAll('.buzzer').forEach(buzzer => {
            buzzer.disabled = true;
        });
    }
    
    enableAllBuzzers() {
        document.querySelectorAll('.buzzer').forEach(buzzer => {
            buzzer.disabled = false;
            buzzer.classList.remove('first');
        });
    }
    
    handleAnswer(isCorrect) {
        if (!this.currentWinner) return;
        
        const playerId = this.currentWinner;
        const playerName = this.players[playerId].name;
        
        if (isCorrect) {
            this.players[playerId].score += 10;
            this.showMessage(`✅ ${playerName} a donné la bonne réponse ! (+10 points)`, 'success');
            this.playSuccessSound();
        } else {
            this.players[playerId].score = Math.max(0, this.players[playerId].score - 5);
            this.showMessage(`❌ ${playerName} s'est trompé ! (-5 points)`, 'error');
            this.playErrorSound();
        }
        
        this.updateScores();
        this.resetRound();
    }
    
    playSuccessSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = [523, 659, 784]; // Do, Mi, Sol
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 150);
        });
    }
    
    playErrorSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '15px 25px';
        messageDiv.style.borderRadius = '25px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.fontSize = '1.1rem';
        messageDiv.style.zIndex = '10000';
        messageDiv.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        
        if (type === 'success') {
            messageDiv.style.background = '#2ecc71';
            messageDiv.style.color = 'white';
        } else {
            messageDiv.style.background = '#e74c3c';
            messageDiv.style.color = 'white';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    updateScores() {
        Object.keys(this.players).forEach(playerId => {
            document.getElementById(`score${playerId}`).textContent = this.players[playerId].score;
        });
    }
    
    updateQuestion() {
        const questionElement = document.getElementById('question');
        questionElement.textContent = this.questions[this.currentQuestionIndex];
    }
    
    nextQuestion() {
        this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questions.length;
        this.updateQuestion();
        this.resetRound();
    }
    
    resetRound() {
        this.currentWinner = null;
        this.gameActive = true;
        
        // Réinitialiser les buzzers
        this.enableAllBuzzers();
        
        // Réinitialiser les statuts
        document.querySelectorAll('.player-status').forEach(status => {
            status.textContent = '';
        });
        
        // Désactiver les boutons de contrôle
        document.getElementById('correctBtn').disabled = true;
        document.getElementById('wrongBtn').disabled = true;
        
        // Redémarrer le timer
        this.timer = 30;
        this.startTimer();
    }
    
    startTimer() {
        this.stopTimer();
        const timerElement = document.getElementById('timer');
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            timerElement.textContent = this.timer;
            
            if (this.timer <= 10) {
                timerElement.parentElement.classList.add('warning');
            } else {
                timerElement.parentElement.classList.remove('warning');
            }
            
            if (this.timer <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    handleTimeout() {
        this.stopTimer();
        this.gameActive = false;
        this.disableAllBuzzers();
        this.showMessage('⏰ Temps écoulé ! Passons à la question suivante.', 'error');
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
}

// Initialiser le jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new QuizBuzzerGame();
});