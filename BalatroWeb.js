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


    //Priority Variables
    let deck = [];
    let hand = [];
    let selectedCards = [];

    let handSize = 7;

    //Initialize Game
    startGame();

    //Event Listeners
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

        const suitOrder = ['Clubs', 'Diamonds', 'Spades', 'Hearts'];
        const cardsBySuit={};

        deck.forEach(card => {
            cardsBySuit[card.suit].push(card);
        });

        suitOrder.forEach(suit => {
            const suitCards = cardsBySuit[suit];
            if (suitCards.length === 0)
                return;

            const suitSection = document.getElementById('');
        })


        deckPopup.style.display = 'block';
    }

    function hideDeckPopup() {
        deckPopup.style.display = 'none';
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
    }

});