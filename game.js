document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const deckImage = document.getElementById('deck-image');
    const deckCount = document.getElementById('deck-count');
    const handContainer = document.getElementById('hand');
    const drawBtn = document.getElementById('draw-btn');
    const discardBtn = document.getElementById('discard-btn');
    const playBtn = document.getElementById('play-btn');
    const messageEl = document.getElementById('message');

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
            for (let value = 1; value <= 13; value++) {
                let cardName;

                if (value === 1) {
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
        if (deck.length === 0) {
            showMessage("The deck is empty!");
            return;
        }

        // Calculate how many cards to draw (up to 7)
        const cardsToDraw = 7 - hand.length;
        if (cardsToDraw <= 0) {
            showMessage("Your hand is already full!");
            return;
        }

        const actualDraw = Math.min(cardsToDraw, deck.length);
        const newCards = deck.splice(0, actualDraw);
        hand.push(...newCards);

        showMessage(`Drew ${actualDraw} card(s).`);

        if (actualDraw < cardsToDraw) {
            showMessage("Couldn't draw enough cards - deck is running low!");
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
            if (card.value === 1) return 'Ace';
            if (card.value === 11) return 'Jack';
            if (card.value === 12) return 'Queen';
            if (card.value === 13) return 'King';
            return card.value;
        }).join(', ');

        showMessage(`Played ${selectedCards.length} card(s): ${cardNames}`);

        // Remove played cards from hand
        hand = hand.filter(card => !selectedCards.includes(card));
        selectedCards = [];

        updateUI();
    }

    // Update the UI to reflect game state
    function updateUI() {
        // Update deck count
        deckCount.textContent = `${deck.length} card${deck.length !== 1 ? 's' : ''}`;

        // Update hand display
        handContainer.innerHTML = '';
        hand.forEach(card => {
            const cardEl = document.createElement('img');
            cardEl.src = card.image;
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
        drawBtn.disabled = hand.length > 0;
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
});