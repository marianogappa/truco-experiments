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
            <h2>Nerd Metrics</h2>
            <div id="categoryStatsList"></div>
        `;
        document.body.appendChild(statsPanel);
        console.log('Stats panel appended to body');
    }

    loadStats() {
        const stats = localStorage.getItem(STORAGE_KEY);
        const defaultStats = {
            categories: {},
            totalGames: 0,
            lastUpdated: null
        };

        if (!stats) {
            return defaultStats;
        }

        try {
            const parsedStats = JSON.parse(stats);
            
            // Ensure each category has all required fields
            Object.keys(parsedStats.categories).forEach(categoryName => {
                const category = parsedStats.categories[categoryName];
                // Initialize missing fields with default values
                category.gamesPlayed = category.gamesPlayed || 0;
                category.totalCorrect = category.totalCorrect || 0;
                category.bestTime = category.bestTime || Infinity;
                category.averageTime = category.averageTime || 0;
                category.totalTime = category.totalTime || 0;
                category.roundTimes = category.roundTimes || [];
                category.gameResults = category.gameResults || [];
                category.currentStreak = category.currentStreak || 0;
                category.bestStreak = category.bestStreak || 0;
                category.recentGames = category.recentGames || [];
                category.consistency = category.consistency || 0;
                category.recentTrend = category.recentTrend || 0;
            });

            return parsedStats;
        } catch (error) {
            console.error('Error parsing stats:', error);
            return defaultStats;
        }
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
                totalTime: 0,
                // Enhanced metrics
                roundTimes: [],
                gameResults: [],
                currentStreak: 0,
                bestStreak: 0,
                recentGames: [], // Last 5 games for trend analysis
                consistency: 0,
                recentTrend: 0
            };
        }

        const categoryStats = stats.categories[categoryName];
        const gameTime = (Date.now() - gameState.startTime) / 1000; // Convert to seconds
        const roundTimesInSeconds = gameState.roundTimes.map(time => time / 1000);
        
        // Create game record
        const gameRecord = {
            date: new Date().toISOString(),
            totalTime: gameTime,
            correctAnswers: gameState.correctAnswers,
            accuracy: (gameState.correctAnswers / gameState.totalRounds) * 100,
            roundTimes: roundTimesInSeconds,
            averageRoundTime: roundTimesInSeconds.reduce((a, b) => a + b, 0) / roundTimesInSeconds.length
        };

        // Update basic stats
        categoryStats.gamesPlayed++;
        categoryStats.totalCorrect += gameState.correctAnswers;
        categoryStats.bestTime = Math.min(categoryStats.bestTime, gameTime);
        categoryStats.totalTime += gameTime;
        categoryStats.averageTime = categoryStats.totalTime / categoryStats.gamesPlayed;

        // Update enhanced metrics
        categoryStats.roundTimes.push(...roundTimesInSeconds);
        categoryStats.gameResults.push(gameRecord);

        // Keep only last 100 games for performance
        if (categoryStats.gameResults.length > 100) {
            categoryStats.gameResults = categoryStats.gameResults.slice(-100);
        }
        if (categoryStats.roundTimes.length > 1000) {
            categoryStats.roundTimes = categoryStats.roundTimes.slice(-1000);
        }

        // Update streaks
        const isPerfectGame = gameState.correctAnswers === gameState.totalRounds;
        if (isPerfectGame) {
            categoryStats.currentStreak++;
            categoryStats.bestStreak = Math.max(categoryStats.bestStreak, categoryStats.currentStreak);
        } else {
            categoryStats.currentStreak = 0;
        }

        // Update recent games (last 10)
        categoryStats.recentGames.push(gameRecord);
        if (categoryStats.recentGames.length > 10) {
            categoryStats.recentGames = categoryStats.recentGames.slice(-10);
        }

        // Calculate consistency (coefficient of variation of round times)
        if (categoryStats.roundTimes.length >= 10) {
            const mean = categoryStats.roundTimes.reduce((a, b) => a + b, 0) / categoryStats.roundTimes.length;
            const variance = categoryStats.roundTimes.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) / categoryStats.roundTimes.length;
            const stdDev = Math.sqrt(variance);
            categoryStats.consistency = mean > 0 ? (stdDev / mean) : 0; // Lower is better (more consistent)
        }

        // Calculate recent trend when we have enough games
        if (categoryStats.recentGames.length >= window.settings.trendThreshold) {
            const recentAccuracy = categoryStats.recentGames.reduce((acc, game) => acc + game.accuracy, 0) / categoryStats.recentGames.length;
            const overallAccuracy = (categoryStats.totalCorrect / (categoryStats.gamesPlayed * 10)) * 100;
            categoryStats.recentTrend = recentAccuracy - overallAccuracy; // Positive means improving
        }

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

    sortStats(table, sortBy) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const th = table.querySelector(`th[data-sort="${sortBy}"]`);
        
        // Toggle sort direction
        const isAsc = th.classList.toggle('asc');
        th.classList.toggle('desc', !isAsc);
        
        // Reset other headers
        table.querySelectorAll('th').forEach(header => {
            if (header !== th) {
                header.classList.remove('asc', 'desc');
            }
        });

        // Sort rows
        rows.sort((a, b) => {
            // Find the cells in the correct column using the sortBy value
            const aCell = a.querySelector(`td:nth-child(${Array.from(th.parentNode.children).indexOf(th) + 1})`);
            const bCell = b.querySelector(`td:nth-child(${Array.from(th.parentNode.children).indexOf(th) + 1})`);
            
            // Get raw values for sorting
            const aVal = aCell.dataset.raw;
            const bVal = bCell.dataset.raw;

            // Handle numeric values
            if (!isNaN(aVal) && !isNaN(bVal)) {
                const aNum = parseFloat(aVal);
                const bNum = parseFloat(bVal);
                return isAsc ? aNum - bNum : bNum - aNum;
            }
            
            // Handle text values
            return isAsc ? 
                String(aVal).localeCompare(String(bVal)) : 
                String(bVal).localeCompare(String(aVal));
        });

        // Reorder rows
        rows.forEach(row => tbody.appendChild(row));
    }

    displayStats() {
        const stats = this.loadStats();
        const container = document.getElementById('categoryStatsList');
        container.innerHTML = '';

        if (Object.keys(stats.categories).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No statistics available yet. Complete a game to see stats!</p>';
            return;
        }

        // Create grid table
        const table = document.createElement('table');
        table.className = 'stats-grid';
        
        // Create header with sort functionality
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th data-sort="category" class="sortable">Category</th>
                <th data-sort="games" class="sortable">Games</th>
                <th data-sort="accuracy" class="sortable">Accuracy</th>
                <th data-sort="time" class="sortable">Avg Time</th>
                <th data-sort="consistency" class="sortable">Consistency</th>
                <th data-sort="trend" class="sortable">Trend</th>
            </tr>
        `;
        table.appendChild(thead);

        // Add click handlers for sorting
        thead.querySelectorAll('th').forEach(th => {
            th.addEventListener('click', () => {
                const sortBy = th.dataset.sort;
                this.sortStats(table, sortBy);
            });
        });

        // Create body with category rows
        const tbody = document.createElement('tbody');
        Object.entries(stats.categories).forEach(([category, categoryStats]) => {
            const accuracy = (categoryStats.totalCorrect / (categoryStats.gamesPlayed * 10) * 100).toFixed(1);
            
            // Calculate average round time instead of total game time
            const avgRoundTime = categoryStats.roundTimes.length > 0 
                ? (categoryStats.roundTimes.reduce((a, b) => a + b, 0) / categoryStats.roundTimes.length).toFixed(1)
                : categoryStats.averageTime.toFixed(1);
            
            // Format consistency score (lower is better)
            const consistencyScore = categoryStats.consistency 
                ? (categoryStats.consistency * 100).toFixed(0)
                : '-';
            
            // Format trend (positive is improving)
            let trendDisplay = 'N/A';
            let trendClass = 'trend-na';
            let trendValue = -999; // Use a very low number to sort N/A values last
            if (categoryStats.recentTrend !== undefined && categoryStats.recentGames && categoryStats.recentGames.length >= window.settings.trendThreshold) {
                const trend = categoryStats.recentTrend;
                trendValue = trend;
                if (Math.abs(trend) < 1) {
                    trendDisplay = '→';
                    trendClass = 'trend-stable';
                } else if (trend > 0) {
                    trendDisplay = '↗';
                    trendClass = 'trend-up';
                } else {
                    trendDisplay = '↘';
                    trendClass = 'trend-down';
                }
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="category-name" data-raw="${category}">${category}</td>
                <td class="stat-value" data-raw="${categoryStats.gamesPlayed}">${categoryStats.gamesPlayed}</td>
                <td class="stat-value" data-raw="${accuracy}">${accuracy}%</td>
                <td class="stat-value" data-raw="${avgRoundTime}">${avgRoundTime}s</td>
                <td class="stat-value" data-raw="${consistencyScore === '-' ? -1 : consistencyScore}">${consistencyScore}%</td>
                <td class="stat-value ${trendClass}" data-raw="${trendValue}">${trendDisplay}</td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);
    }
}

// Export the StatsManager class
window.StatsManager = StatsManager; 