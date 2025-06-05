document.addEventListener('DOMContentLoaded', function() {

    //Game elements
    const deckImage = document.getElementById('deck-image');
    const deckCount = document.getElementById('deck-count');
    const handContainer = document.getElementById('hand');
    const discardBtn = document.getElementById('discard-btn');
    const playBtn = document.getElementById('play-btn');
    const deckPopup = document.getElementById('deck-popup');
    const deckCardsContainer = document.getElementById('deck-cards-container');
    const closePopup = document.querySelector('.close');
    const scoreDisplay = document.getElementById('score-display');


    //Priority Variables
    let deck = [];
    let hand = [];
    let selectedCards = [];

    let score = 0;

    let handSize = 7;

    let playsRemaining = 4;  // Starting number of plays
    let discardsRemaining = 3;  // Starting number of discards
    let currentRound = 1;

    //Initialize Game
    startGame();

    //Event Listeners
    playBtn.addEventListener('click', playSelected);
    discardBtn.addEventListener('click', discardSelected);
    deckImage.addEventListener('click', showDeckPopup);
    closePopup.addEventListener('click', hideDeckPopup);
    window.addEventListener('click', (event) => {
        if (event.target === deckPopup) {
            hideDeckPopup();
        }
    });


    //Start game
    function startGame(){
        deck = createDeck();
        shuffleDeck(deck);
        hand = [];
        firstHand(handSize);
        updateUI();
    }

    function createDeck(){
        const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const deck = [];

        suits.forEach(suit => {
            for (let value = 2; value <= 14; value++) {
                let cardName;
                if (value === 14){
                    cardName = `${suit}_${value}_Ace`;
                }
                else if (value === 13){
                    cardName = `${suit}_${value}_King`;
                }
                else if (value === 12){
                    cardName = `${suit}_${value}_Queen`;
                }
                else if (value === 11){
                    cardName = `${suit}_${value}_Jack`;
                }
                else {
                    cardName = `${suit}_${value}`;
                }

                deck.push({
                    suit: suit,
                    value: value,
                    name: cardName,
                    image: `./Cards/${cardName}.png` //This will add cards from the directory cards/
                });
            }
        });
        return deck;
    }

    // Fisher-Yates Shuffle (Algorithm)
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    // Draw cards equal to hand Size
    function firstHand(handSize) {
        hand = [];

        const cardsToDraw = Math.min(handSize, deck.length);
        const newCards = deck.splice(0, cardsToDraw);
        hand.push(...newCards);

        updateUI();
        return hand;
    }

    function toggleCardSelection(card) {
        const index = selectedCards.indexOf(card);
        if (index === -1) {
            selectedCards.push(card);
        } else  {
            selectedCards.splice(index, 1);
        }

        updateUI();
    }

    // Pop-Up related methods

    function showDeckPopup(){

        if (deck.length === 0) {
            return;
        }

        deckCardsContainer.innerHTML = '';

        const suitOrder = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
        const cardsBySuit={};

        //Group by suit
        suitOrder.forEach(suit => {
            cardsBySuit[suit] = [];
        });

        //Organize by suit
        deck.forEach(card => {
            cardsBySuit[card.suit].push(card);
        });

        // Display
        suitOrder.forEach(suit => {
            const suitCards = cardsBySuit[suit];
            if (suitCards.length === 0)
                return;

            const suitSection = document.createElement('section');
            suitSection.className = 'suit-section';

            const suitHeader = document.createElement('h3');
            suitHeader.innerText = suit;
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
                cardEl.src = `./Cards/${card.name}.png`;
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

    function hideDeckPopup() {
        deckPopup.style.display = 'none';
    }

    function getSuitColor(suit) {
        const suitColors = {
            'Hearts': '#ff0000',
            'Diamonds': '#ff0000',
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

    // Game Mechanics

    function playSelected(){

        if(playsRemaining <= 0)
            return;

        if(selectedCards.length > 5)
            return;
        else if(selectedCards.length <= 0)
            return;

        //Evaluation calls
        const evaluation = evaluateHand(selectedCards);
        const multiplier = getHandMultiplier(evaluation.hand);
        const handScore = Math.round(evaluation.value * multiplier);
        score += handScore;

        // Remove played cards from hand
        hand = hand.filter(card => !selectedCards.includes(card));
        selectedCards = [];

        playsRemaining--;

        autoDraw();
        updateUI();

        if (playsRemaining === 0)
        {
            endRound();
        }
    }

    function discardSelected(){

        if(discardsRemaining <= 0)
            return;

        if(selectedCards.length > 5)
            return;
        else if(selectedCards.length <= 0)
            return;

        hand = hand.filter(card => !selectedCards.includes(card));
        selectedCards = [];

        discardsRemaining--;
        autoDraw();
        updateUI();
    }

    //Auto draw to replenish hand to handsize
    function autoDraw(){

        const cardsNeeded = handSize - hand.length;
        if (cardsNeeded > 0 && deck.length > 0) {
            const cardsToDraw = Math.min(cardsNeeded, deck.length);
            const newCards = deck.splice(0, cardsToDraw);
            hand.push(...newCards);
        }
    }

    //Evaluates Hands
    function evaluateHand(cards){

        const sorted = [...cards].sort((a, b) => b.value - a.value);
        const values = sorted.map(card => card.value);
        const suits = sorted.map(card => card.suit);

        //Check if is Flush
        const isFlush = suits.every(suit => suit === suits[0]);

        //Check if is Straight
        const isStraight = values.every((val, i) => i === 0 || val === values[i-1] - 1 ||
            (i === 4 && values[0] === 13 && val === 1)
        );

        const valueCounts = {};
        values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
        const counts = Object.values(valueCounts).sort((a,b) => b - a);

        // Royal Flush
        if (isFlush && isStraight && values[0] === 13 && values[4] === 1)
            return { hand: 'Royal Flush', value: 200 };

        // Straight Flush
        if (isFlush && isStraight)
            return { hand: 'Straight Flush', value: 100 + values[0] };

        // Four of a Kind
        if (counts[0] === 4)
            return { hand: 'Four of a Kind', value: 60 + values.find(v => valueCounts[v] === 4) };

        // Full House
        if (counts[0] === 3 && counts[1] === 2)
            return { hand: 'Full House', value: 40 + values.find(v => valueCounts[v] === 3) };

        // Flush
        if (isFlush)
            return { hand: 'Flush', value: 35 + values[0] };

        // Straight
        if (isStraight)
            return { hand: 'Straight', value: 30 + values[0] };

        // Three of a Kind
        if (counts[0] === 3)
            return { hand: 'Three of a Kind', value: 30 + values.find(v => valueCounts[v] === 3) };

        // Two Pair
        if (counts[0] === 2 && counts[1] === 2) {
            const pairs = values.filter(v => valueCounts[v] === 2);
            return { hand: 'Two Pair', value: 20 + Math.max(...pairs) };
        }

        // One Pair
        if (counts[0] === 2)
            return { hand: 'One Pair', value: 10 + values.find(v => valueCounts[v] === 2) };

        // High Card
        return { hand: 'High Card', value: 5 + values[0] };
    }

    function getHandMultiplier(handType) {
        const multipliers = {
            'Royal Flush': 8,
            'Straight Flush': 8,
            'Four of a Kind': 7,
            'Full House': 4,
            'Flush': 4,
            'Straight': 4,
            'Three of a Kind': 3,
            'Two Pair': 2,
            'One Pair': 2,
            'High Card': 1
        };
        return multipliers[handType] || 1;
    }

    //Round End
    function endRound() {
        alert(`Round ${currentRound} complete! Starting next round...`);
        currentRound++;
        playsRemaining = 5;  // Reset plays
        discardsRemaining = 3;  // Reset discards
        score = 0; //Resets Score
        startGame();
    }

    function  updateUI(){

        // Update hand display - organized by value
        handContainer.innerHTML = '';

        // Sort hand by card value (Ace to King)
        const sortedHand = [...hand].sort((a, b) => a.value - b.value);

        sortedHand.forEach(card => {
            const cardEl = document.createElement('img');
            cardEl.src = `./Cards/${card.name}.png`;
            cardEl.alt = card.name;
            cardEl.className = 'card';
            cardEl.dataset.cardId = card.name;

            if (selectedCards.includes(card)) {
                cardEl.classList.add('selected');
            }

            cardEl.addEventListener('click', () => toggleCardSelection(card));
            handContainer.appendChild(cardEl);
        });

        //Update deck count
        deckCount.textContent = `${deck.length} card${deck.length !== 1 ? 's' : ''}`;

        //Update Score
        scoreDisplay.textContent = `Score:${score}`;

        //Update Plays/Discards Remaining
        document.getElementById('plays-remaining').textContent = playsRemaining;
        document.getElementById('discards-remaining').textContent = discardsRemaining;

        // Disable buttons when actions are exhausted
        playBtn.disabled = playsRemaining <= 0;
        discardBtn.disabled = discardsRemaining <= 0;

    }
});