class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.statusDisplay = document.getElementById('status');
        this.boardElement = document.getElementById('board');
        this.cells = document.querySelectorAll('.cell');
        this.restartButton = document.getElementById('restartButton');
        
        // Add winning animation class
        this.winningClass = 'winner';
        
        // Add score tracking
        this.scores = {
            X: 0,
            O: 0
        };
        
        // Add DOM elements for scores
        this.playerXScore = document.querySelector('#player-x .score');
        this.playerOScore = document.querySelector('#player-o .score');
        this.resetScoresButton = document.getElementById('resetScoresButton');
        
        // Add hover sound
        this.hoverSound = document.getElementById('hoverSound');
        
        // Add sound elements back
        this.clickSound = document.getElementById('clickSound');
        this.winSound = document.getElementById('winSound');
        this.drawSound = document.getElementById('drawSound');
        this.restartSound = document.getElementById('restartSound');
        this.cellTouchSound = document.getElementById('cellTouchSound');
        
        this.initializeGame();
        this.init3DEffects();
    }

    initializeGame() {
        this.cells.forEach(cell => {
            // Add both click and touch handlers
            cell.addEventListener('click', (e) => this.handleCellClick(cell, e));
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-firing on mobile devices
                this.handleCellTouch(cell, e);
            });
            
            // Add hover sound effect
            cell.addEventListener('mouseenter', () => {
                if (cell.textContent === '' && this.gameActive) {
                    this.playSound(this.hoverSound, 0.2);
                }
            });
        });
        
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.resetScoresButton.addEventListener('click', () => this.resetScores());
        
        this.updateActivePlayer();
    }

    playSound(audioElement, volume = 1.0) {
        audioElement.volume = volume;
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log('Sound play failed:', e));
    }

    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    updateActivePlayer() {
        document.getElementById('player-x').classList.toggle('active', this.currentPlayer === 'X');
        document.getElementById('player-o').classList.toggle('active', this.currentPlayer === 'O');
    }

    createConfetti() {
        const confettiCount = 150;
        const colors = ['#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d', '#ff4dff'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random position and animation delay
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random size
            const size = Math.random() * 10 + 5;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            
            // Random rotation
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            document.getElementById('confetti-container').appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    handleCellClick(cell, event) {
        const index = cell.getAttribute('data-cell-index');
        
        if (this.board[index] !== '' || !this.gameActive) {
            // Add feedback for clicking when game is over
            if (!this.gameActive) {
                this.statusDisplay.textContent = 'Game Over! Click New Game to play again';
                this.vibrate(50);
            }
            return;
        }

        // Enhanced vibration feedback
        this.vibrate([50, 30]); // Short double vibration for click
        this.playSound(this.clickSound, 0.5);

        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.setAttribute('data-symbol', this.currentPlayer);
        
        if (this.checkWin()) {
            const winningCombo = this.getWinningCombination();
            this.highlightWinningCells(winningCombo);
            this.scores[this.currentPlayer]++;
            this.updateScores();
            this.createConfetti();
            this.statusDisplay.textContent = `Player ${this.currentPlayer} wins! Click New Game to play again`;
            this.gameActive = false;
            this.playSound(this.winSound, 0.7);
            this.vibrate([100, 50, 100, 50, 200]); // Victory vibration pattern
            
            // Highlight the New Game button
            this.restartButton.classList.add('highlight-button');
            return;
        }

        if (this.checkDraw()) {
            this.statusDisplay.textContent = "Game ended in a draw! Click New Game to play again";
            this.gameActive = false;
            this.playSound(this.drawSound, 0.6);
            this.vibrate([70, 30, 70, 30, 70]); // Draw vibration pattern
            
            // Highlight the New Game button
            this.restartButton.classList.add('highlight-button');
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.updateActivePlayer();

        // Add 3D pop effect when placing symbol
        cell.style.transform = 'translateZ(-10px)';
        setTimeout(() => {
            cell.style.transform = 'translateZ(0)';
        }, 150);

        // Add ripple effect
        this.createRipple(cell, event);
    }

    handleCellTouch(cell, event) {
        if (this.board[cell.getAttribute('data-cell-index')] === '' && this.gameActive) {
            // Enhanced touch feedback
            this.vibrate([70, 30, 70]); // Stronger vibration pattern for touch
            this.playSound(this.cellTouchSound, 0.6);
            
            // Create touch ripple effect
            this.createRipple(cell, event.touches[0]);
            
            // Handle the cell click
            this.handleCellClick(cell, event);
        }
    }

    getWinningCombination() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                return combination;
            }
        }
        return null;
    }

    highlightWinningCells(combination) {
        combination.forEach(index => {
            this.cells[index].classList.add(this.winningClass);
        });
    }

    checkWin() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    restartGame() {
        this.playSound(this.restartSound, 0.5);
        this.vibrate([40, 20, 40]); // Restart vibration pattern
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove(this.winningClass);
            cell.removeAttribute('data-symbol');  // Remove symbol attribute
        });
        
        // Remove highlight from New Game button
        this.restartButton.classList.remove('highlight-button');
        
        this.updateActivePlayer();
    }

    updateScores() {
        this.playerXScore.textContent = this.scores.X;
        this.playerOScore.textContent = this.scores.O;
    }

    resetScores() {
        this.scores.X = 0;
        this.scores.O = 0;
        this.updateScores();
        this.vibrate([30, 20, 30]); // Reset scores vibration pattern
        this.playSound(this.restartSound, 0.4);
    }

    init3DEffects() {
        const container = document.querySelector('.container');
        
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xAxis = (clientX - innerWidth / 2) / 25;
            const yAxis = (clientY - innerHeight / 2) / 25;
            
            container.style.transform = `rotateY(${xAxis}deg) rotateX(${-yAxis}deg)`;
        });

        // Reset transform on mouse leave
        document.addEventListener('mouseleave', () => {
            container.style.transform = 'rotateY(0) rotateX(0)';
        });
    }

    createRipple(cell, event) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        cell.appendChild(ripple);

        const rect = cell.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;

        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        setTimeout(() => ripple.remove(), 600);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 