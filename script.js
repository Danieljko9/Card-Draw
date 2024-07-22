document.addEventListener("DOMContentLoaded", () => {
    const drawCardBtn = document.getElementById("drawCardBtn");
    const cardDisplay = document.getElementById("cardDisplay");
    const collectionList = document.getElementById("collectionList");
    const unlockedList = document.getElementById("unlockedList");
    const upgradeLuckBtn = document.getElementById("upgradeLuckBtn");
    const upgradeCost = document.getElementById("upgradeCost");
    const chancesList = document.getElementById("chancesList");
    const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
    const applyFilterBtn = document.getElementById("applyFilterBtn");
    const finalMessage = document.getElementById("finalMessage");
    const rollCounter = document.getElementById("rollCounter"); // Roll counter element
    const achievementPopupContainer = document.getElementById("achievementPopupContainer"); // Container for popups

    let cards = [];
    let unlockedCards = new Set();
    let luck = 1;
    let activeFilter = [];
    let gameEnded = false;
    let rollCount = 0; // Counter for rolls
    let achievementMilestones = [1, 10, 100, 1000, 10000, 100000, 1000000];
    let achievements = new Set(); // To track achieved milestones

    // Define card rarities
    const cardRarities = [
        { name: "Common", baseProbability: 0.5, order: 1 },
        { name: "Uncommon", baseProbability: 0.3, order: 2 },
        { name: "Rare", baseProbability: 0.1, order: 3 },
        { name: "Epic", baseProbability: 0.07, order: 4 },
        { name: "Legendary", baseProbability: 0.03, order: 5 },
        { name: "Mythical", baseProbability: 0.01, order: 6 },
        { name: "Divine", baseProbability: 0.005, order: 7 },
        { name: "Celestial", baseProbability: 0.002, order: 8 },
        { name: "Ethereal", baseProbability: 0.001, order: 9 },
        { name: "Astral", baseProbability: 0.0005, order: 10 },
        { name: "Cosmic", baseProbability: 0.0002, order: 11 },
        { name: "Quantum", baseProbability: 0.0001, order: 12 },
        { name: "Singularity", baseProbability: 0.00005, order: 13 },
        { name: "Infinite", baseProbability: 0.00001, order: 14 }
    ];

    // Define the explicit upgrade costs in the 1, 5, 1, 5, pattern
    const upgradeCosts = [
        { rarity: "Common", count: 1 },
        { rarity: "Common", count: 5 },
        { rarity: "Uncommon", count: 1 },
        { rarity: "Uncommon", count: 5 },
        { rarity: "Rare", count: 1 },
        { rarity: "Rare", count: 5 },
        { rarity: "Epic", count: 1 },
        { rarity: "Epic", count: 5 },
        { rarity: "Legendary", count: 1 },
        { rarity: "Legendary", count: 5 },
        { rarity: "Mythical", count: 1 },
        { rarity: "Mythical", count: 5 },
        { rarity: "Divine", count: 1 },
        { rarity: "Divine", count: 5 },
        { rarity: "Celestial", count: 1 },
        { rarity: "Celestial", count: 5 },
        { rarity: "Ethereal", count: 1 },
        { rarity: "Ethereal", count: 5 },
        { rarity: "Astral", count: 1 },
        { rarity: "Astral", count: 5 },
        { rarity: "Cosmic", count: 1 },
        { rarity: "Cosmic", count: 5 },
        { rarity: "Quantum", count: 1 },
        { rarity: "Quantum", count: 5 },
        { rarity: "Singularity", count: 1 },
        { rarity: "Singularity", count: 5 },
        { rarity: "Infinite", count: 1 }
    ];

    // Play the background music when the page loads
    backgroundMusic.play();

    // Toggle background music on/off
    toggleMusicBtn.addEventListener("click", () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            toggleMusicBtn.textContent = "Turn Music Off";
        } else {
            backgroundMusic.pause();
            toggleMusicBtn.textContent = "Turn Music On";
        }
    });
 

    function drawCard() {
        if (gameEnded) return;

        let totalProbability = cardRarities.reduce((sum, card) => sum + card.baseProbability, 0);
        let probability = Math.random() * totalProbability;

        let drawnCard;
        for (let card of cardRarities) {
            probability -= card.baseProbability;
            if (probability <= 0) {
                drawnCard = card;
                break;
            }
        }

        if (drawnCard) {
            if (activeFilter.length === 0 || !activeFilter.includes(drawnCard.name)) {
                cards.push(drawnCard.name);
                updateCollection();
                updateUnlockedCards();
                updateChances();
                cardDisplay.textContent = `You drew a ${drawnCard.name} card!`;

                if (drawnCard.name === "Infinite") {
                    showFinalMessage();
                    gameEnded = true;
                }

                // Increment and update roll counter
                rollCount++;
                rollCounter.textContent = `Rolls: ${rollCount}`;

                // Check for achievements
                checkAchievements();

            } else {
                cardDisplay.textContent = `Filtered out: ${drawnCard.name}`;
            }
        }
    }

    function updateCollection() {
        collectionList.innerHTML = '';
        const cardCounts = cards.reduce((counts, card) => {
            counts[card] = (counts[card] || 0) + 1;
            return counts;
        }, {});

        cardRarities.sort((a, b) => a.order - b.order).forEach(rarity => {
            if (cardCounts[rarity.name]) {
                const item = document.createElement('li');
                item.className = rarity.name;
                item.textContent = `${rarity.name}: ${cardCounts[rarity.name]}`;
                collectionList.appendChild(item);
            }
        });
    }

    function updateUnlockedCards() {
        unlockedList.innerHTML = '';
        const uniqueCards = Array.from(new Set(cards));
        uniqueCards.forEach(cardName => {
            const card = cardRarities.find(r => r.name === cardName);
            if (card) {
                const item = document.createElement('li');
                item.className = card.name;
                item.textContent = card.name;
                unlockedList.appendChild(item);
            }
        });

        Array.from(unlockedList.children)
            .sort((a, b) => cardRarities.find(c => c.name === a.textContent).order - cardRarities.find(c => c.name === b.textContent).order)
            .forEach(item => unlockedList.appendChild(item));
    }

    function updateChances() {
        chancesList.innerHTML = '';
        cardRarities.forEach(rarity => {
            const item = document.createElement('li');
            item.className = rarity.name;
            item.textContent = `${rarity.name}: ${(Math.min(rarity.baseProbability * luck * 100, 100)).toFixed(2)}%`; // Cap at 100%
            chancesList.appendChild(item);
        });
    }

    function applyFilter() {
        activeFilter = Array.from(document.querySelectorAll(".filter-checkbox:checked")).map(cb => cb.value);
        if (activeFilter.length > 0) {
            cardDisplay.textContent = `Filtering cards: ${activeFilter.join(", ")}`;
        } else {
            cardDisplay.textContent = '';
        }
    }

    function upgradeLuck() {
        if (gameEnded) return;

        // Find the current upgrade cost based on the luck level
        let costIndex = luck - 1; // Adjust for 0-based index
        let cost = upgradeCosts[costIndex];
        
        if (cost) {
            const requiredCount = cards.filter(card => card === cost.rarity).length;
            if (requiredCount >= cost.count) {
                luck++;
                updateChances();
                updateUpgradeCost();
                // Check for the 'Max Upgrades' achievement
                if (luck === upgradeCosts.length + 1) {
                    awardAchievement('maxUpgrades');
                }
            } else {
                alert(`Not enough ${cost.rarity} cards to upgrade.`);
            }
        } else {
            alert("Upgrade limit reached or pattern not found.");
        }
    }

    function updateUpgradeCost() {
        // Find the current upgrade cost based on the luck level
        let costIndex = luck - 1; // Adjust for 0-based index
        let cost = upgradeCosts[costIndex];
        if (cost) {
            upgradeCost.textContent = `Upgrade Cost: ${cost.rarity} x ${cost.count}`;
        } else {
            upgradeCost.textContent = `Upgrade Cost: Maxed out`;
        }
    }

    function showFinalMessage() {
        finalMessage.innerHTML = `
            <div class="cutscene">
                <h1>Congratulations!</h1>
                <p>You have unlocked the Infinite card!</p>
                <p>Thanks for playing!</p>
            </div>
        `;
        finalMessage.style.display = 'flex';
    }

    function checkAchievements() {
        achievementMilestones.forEach(milestone => {
            if (rollCount >= milestone && !achievements.has(milestone)) {
                achievements.add(milestone);
                showAchievementPopup(`You have rolled ${milestone} times!`);
            }
        });
    }

    function showAchievementPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.textContent = message;
        achievementPopupContainer.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = 1;
        }, 10);

        setTimeout(() => {
            popup.style.opacity = 0;
            setTimeout(() => {
                achievementPopupContainer.removeChild(popup);
            }, 500);
        }, 5000);
    }

    drawCardBtn.addEventListener('click', drawCard);
    upgradeLuckBtn.addEventListener('click', upgradeLuck);
    applyFilterBtn.addEventListener('click', applyFilter);

    // Initialize upgrade cost
    updateUpgradeCost();
});
