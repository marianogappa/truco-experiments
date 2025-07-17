// Stats Management
const STORAGE_KEY = 'truco_coding_practice_stats_v1';

class StatsManager {
    constructor() {
        console.log('StatsManager constructor called');
        this.initializeUI();
    }

    initializeUI() {
        console.log('Initializing stats UI...');
        
        // Create and append stats button
        const statsButton = document.createElement('button');
        statsButton.className = 'stats-button';
        statsButton.innerHTML = '📊';
        statsButton.title = 'View Statistics';
        statsButton.onclick = () => this.toggleStats();
        
        console.log('Stats button created:', statsButton);
        document.body.appendChild(statsButton);
        console.log('Stats button appended to body');

        // Create and append stats panel
        const statsPanel = document.createElement('div');
        statsPanel.className = 'stats-panel';
        statsPanel.id = 'statsPanel';
        statsPanel.innerHTML = `
            <h2>Category Statistics</h2>
            <div id="categoryStatsList"></div>
        `;
        document.body.appendChild(statsPanel);
        console.log('Stats panel appended to body');
    }

    loadStats() {
        const stats = localStorage.getItem(STORAGE_KEY);
        return stats ? JSON.parse(stats) : {
            categories: {},
            totalGames: 0,
            lastUpdated: null
        };
    }

    saveStats(stats) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }

    updateStats(gameState, CATEGORY_NAMES) {
        if (gameState.currentRound !== gameState.totalRounds) return; // Only save completed games

        const stats = this.loadStats();
        const categoryName = gameState.selectedCategoryIndex === -1 ? 'Random' : CATEGORY_NAMES[gameState.selectedCategoryIndex];
        
        if (!stats.categories[categoryName]) {
            stats.categories[categoryName] = {
                gamesPlayed: 0,
                totalCorrect: 0,
                bestTime: Infinity,
                averageTime: 0,
                totalTime: 0
            };
        }

        const categoryStats = stats.categories[categoryName];
        const gameTime = (Date.now() - gameState.startTime) / 1000; // Convert to seconds

        // Update category stats
        categoryStats.gamesPlayed++;
        categoryStats.totalCorrect += gameState.correctAnswers;
        categoryStats.bestTime = Math.min(categoryStats.bestTime, gameTime);
        categoryStats.totalTime += gameTime;
        categoryStats.averageTime = categoryStats.totalTime / categoryStats.gamesPlayed;

        // Update global stats
        stats.totalGames++;
        stats.lastUpdated = new Date().toISOString();

        this.saveStats(stats);
        this.displayStats(); // Refresh stats display if panel is open
    }

    toggleStats() {
        const panel = document.getElementById('statsPanel');
        panel.classList.toggle('visible');
        if (panel.classList.contains('visible')) {
            this.displayStats();
        }
    }

    displayStats() {
        const stats = this.loadStats();
        const container = document.getElementById('categoryStatsList');
        container.innerHTML = '';

        // Add total games played
        const totalGamesDiv = document.createElement('div');
        totalGamesDiv.className = 'category-stats';
        totalGamesDiv.innerHTML = `
            <h3>Overall</h3>
            <div class="stat-row">
                <span>Total Games Played:</span>
                <span class="stat-value">${stats.totalGames}</span>
            </div>
        `;
        container.appendChild(totalGamesDiv);

        // Add stats for each category
        Object.entries(stats.categories).forEach(([category, categoryStats]) => {
            const accuracy = (categoryStats.totalCorrect / (categoryStats.gamesPlayed * 10) * 100).toFixed(1);
            const div = document.createElement('div');
            div.className = 'category-stats';
            div.innerHTML = `
                <h3>${category}</h3>
                <div class="stat-row">
                    <span>Games Played:</span>
                    <span class="stat-value">${categoryStats.gamesPlayed}</span>
                </div>
                <div class="stat-row">
                    <span>Accuracy:</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="stat-row">
                    <span>Best Time:</span>
                    <span class="stat-value">${categoryStats.bestTime === Infinity ? '-' : categoryStats.bestTime.toFixed(1)}s</span>
                </div>
                <div class="stat-row">
                    <span>Average Time:</span>
                    <span class="stat-value">${categoryStats.averageTime.toFixed(1)}s</span>
                </div>
            `;
            container.appendChild(div);
        });

        if (stats.lastUpdated) {
            const lastUpdated = document.createElement('div');
            lastUpdated.style.textAlign = 'right';
            lastUpdated.style.marginTop = '20px';
            lastUpdated.style.fontSize = '0.8em';
            lastUpdated.style.color = '#666';
            lastUpdated.textContent = `Last updated: ${new Date(stats.lastUpdated).toLocaleString()}`;
            container.appendChild(lastUpdated);
        }
    }
}

// Export the StatsManager class
window.StatsManager = StatsManager; 