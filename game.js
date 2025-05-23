document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const deckImage = document.getElementById('deck-image');
    const deckCount = document.getElementById('deck-count');
    const handContainer = document.getElementById('hand');
    const drawBtn = document.getElementById('draw-btn');
    const discardBtn = document.getElementById('discard-btn');
    const playBtn = document.getElementById('play-btn');
    const messageEl = document.getElementById('message');
    const deckPopup = document.getElementById('deck-popup');
    const deckCardsContainer = document.getElementById('deck-cards-container');
    const closePopup = document.querySelector('.close');

    // Game state
    let deck = [];
    let hand = [];
    let selectedCards = [];

    // Initialize the game
    initGame();

    // Event listeners
    drawBtn.addEventListener('click', drawHand);
    discardBtn.addEventListener('click', discardSelected);
    playBtn.addEventListener('click', playSelected);
    deckImage.addEventListener('click', showDeckPopup);
    closePopup.addEventListener('click', hideDeckPopup);
    window.addEventListener('click', (event) => {
        if (event.target === deckPopup) {
            hideDeckPopup();
        }
    });

    // Initialize a fresh deck
    function initGame() {
        deck = createDeck();
        shuffleDeck(deck);
        hand = [];
        selectedCards = [];
        updateUI();
    }

    // Create a standard 52-card deck
    function createDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const deck = [];

        suits.forEach(suit => {
            for (let value = 2; value <= 14; value++) {
                let cardName;

                if (value === 14) {
                    cardName = `${suit}_${value}_Ace`;
                } else if (value === 11) {
                    cardName = `${suit}_${value}_Jack`;
                } else if (value === 12) {
                    cardName = `${suit}_${value}_Queen`;
                } else if (value === 13) {
                    cardName = `${suit}_${value}_King`;
                } else {
                    cardName = `${suit}_${value}`;
                }

                deck.push({
                    suit: suit,
                    value: value,
                    name: cardName,
                    image: `cards/${cardName}.png`  // Added cards/ folder here
                });
            }
        });

        return deck;
    }

    // Fisher-Yates shuffle algorithm
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    // Draw 7 cards from the deck
    function drawHand() {
        if (hand.length > 0) {
            showMessage("You already have cards. Play or discard some first.");
            return;
        }

        if (deck.length === 0) {
            showMessage("The deck is empty! Reshuffling...");
            initGame();
            return;
        }

        const cardsToDraw = Math.min(7, deck.length);
        hand = deck.splice(0, cardsToDraw);

        showMessage(`Drew initial hand of ${cardsToDraw} card(s)`);

        if (cardsToDraw < 7) {
            showMessage("Couldn't draw full hand - deck is running low!");
        }

        updateUI();
    }

    // Discard selected cards
    function discardSelected() {
        if (selectedCards.length === 0) return;
        const discardCount = selectedCards.length;
        // Remove selected cards from hand
        hand = hand.filter(card => !selectedCards.includes(card));
        selectedCards = [];

        // Draw new cards to replace discarded ones
        const cardsToDraw = Math.min(discardCount, deck.length);
        if (cardsToDraw > 0) {
            const newCards = deck.splice(0, cardsToDraw);
            hand.push(...newCards);
        }

        showMessage(`Discarded ${discardCount} card(s) and drew ${cardsToDraw} new one(s).`);

        // If deck is empty after discarding
        if (deck.length === 0) {
            showMessage("The deck is empty!");
        }

        updateUI();
    }

    // Play selected cards (in a real game, this would have game logic)
    function playSelected() {
        if (selectedCards.length === 0) return;

        // Here you would add your game logic for playing cards
        const cardNames = selectedCards.map(card => {
            if (card.value === 14) return 'Ace';
            if (card.value === 11) return 'Jack';
            if (card.value === 12) return 'Queen';
            if (card.value === 13) return 'King';
            return card.value;
        }).join(', ');

        showMessage(`Played ${selectedCards.length} card(s): ${cardNames}`);

        // Remove played cards from hand
        hand = hand.filter(card => !selectedCards.includes(card));
        selectedCards = [];

        // Auto-draw to replenish hand to 7 cards
        const cardsNeeded = 7 - hand.length;
        if (cardsNeeded > 0 && deck.length > 0) {
            const cardsToDraw = Math.min(cardsNeeded, deck.length);
            const newCards = deck.splice(0, cardsToDraw);
            hand.push(...newCards);
            showMessage(`Automatically drew ${cardsToDraw} card(s) to replenish hand`);

            if (cardsToDraw < cardsNeeded) {
                showMessage("Couldn't draw enough cards - deck is running low!");
            }
        }

        updateUI();

        // Check if deck is empty after drawing
        if (deck.length === 0) {
            showMessage("The deck is empty!");
            if (reshuffleBtn) reshuffleBtn.style.display = 'inline-block';
        }
    }

    // Update the UI to reflect game state
    function updateUI() {
        // Update deck count
        deckCount.textContent = `${deck.length} card${deck.length !== 1 ? 's' : ''}`;

        // Update hand display - organized by value
        handContainer.innerHTML = '';

        // Sort hand by card value (Ace to King)
        const sortedHand = [...hand].sort((a, b) => a.value - b.value);

        sortedHand.forEach(card => {
            const cardEl = document.createElement('img');
            cardEl.src = `cards/${card.name}.png`;
            cardEl.alt = card.name;
            cardEl.className = 'card';
            cardEl.dataset.cardId = card.name;

            if (selectedCards.includes(card)) {
                cardEl.classList.add('selected');
            }

            cardEl.addEventListener('click', () => toggleCardSelection(card));
            handContainer.appendChild(cardEl);
        });

        // Update button states
        drawBtn.disabled = hand.length >= 7;
        discardBtn.disabled = selectedCards.length === 0;
        playBtn.disabled = selectedCards.length === 0;
    }

    // Toggle card selection
    function toggleCardSelection(card) {
        const index = selectedCards.indexOf(card);
        if (index === -1) {
            selectedCards.push(card);
        } else {
            selectedCards.splice(index, 1);
        }
        updateUI();
    }

    // Show a message to the player
    function showMessage(msg) {
        messageEl.textContent = msg;
        setTimeout(() => {
            if (messageEl.textContent === msg) {
                messageEl.textContent = '';
            }
        }, 3000);
    }

    function showDeckPopup() {
        if (deck.length === 0) {
            showMessage("The deck is empty!");
            return;
        }

        deckCardsContainer.innerHTML = '';

        // Define suit order (you can change this order if needed)
        const suitOrder = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];

        // Group cards by suit first
        const cardsBySuit = {};
        suitOrder.forEach(suit => {
            cardsBySuit[suit] = [];
        });

        // Organize cards by suit
        deck.forEach(card => {
            cardsBySuit[card.suit].push(card);
        });

        // Display cards organized by suit then value
        suitOrder.forEach(suit => {
            const suitCards = cardsBySuit[suit];
            if (suitCards.length === 0) return;

            // Create a section for each suit
            const suitSection = document.createElement('div');
            suitSection.className = 'suit-section';

            const suitHeader = document.createElement('h3');
            suitHeader.textContent = suit;
            suitHeader.style.color = getSuitColor(suit);
            suitSection.appendChild(suitHeader);

            // Sort cards by value within the suit
            suitCards.sort((a, b) => a.value - b.value);

            // Create a container for cards of this suit
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'cards-row';

            // Add all cards of this suit
            suitCards.forEach(card => {
                const cardEl = document.createElement('img');
                cardEl.src = `cards/${card.name}.png`;
                cardEl.alt = card.name;
                cardEl.className = 'deck-card';
                cardEl.title = `${getValueName(card.value)} of ${card.suit}`;
                cardsContainer.appendChild(cardEl);
            });

            suitSection.appendChild(cardsContainer);
            deckCardsContainer.appendChild(suitSection);
        });

        deckPopup.style.display = 'block';
    }

    function getSuitColor(suit) {
        const suitColors = {
            'Hearts': '#ff5252',
            'Diamonds': '#ff5252',
            'Clubs': '#000000',
            'Spades': '#000000'
        };
        return suitColors[suit] || '#ffffff';
    }

    function getValueName(value) {
        const valueNames = {
            14: 'Ace',
            11: 'Jack',
            12: 'Queen',
            13: 'King'
        };
        return valueNames[value] || value;
    }

    function hideDeckPopup() {
        deckPopup.style.display = 'none';
    }

    function getCardDisplayName(card) {
        const valueNames = {
            14: 'Ace',
            11: 'Jack',
            12: 'Queen',
            13: 'King'
        };

        const valueName = valueNames[card.value] || card.value;
        return `${valueName} of ${card.suit}`;
    }

});