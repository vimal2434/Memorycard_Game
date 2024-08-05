const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
};

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

// Function to shuffle an array
const shuffle = array => {
    const clonedArray = [...array];
    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [clonedArray[i], clonedArray[randomIndex]] = [clonedArray[randomIndex], clonedArray[i]];
    }
    return clonedArray;
};

// Function to pick a random set of items from an array
const pickRandom = (array, times) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < times; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

// Function to generate the game board
const generateGame = () => {
    const dimensions = parseInt(selectors.board.getAttribute('data-dimension'));

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.");
    }

    const emojis = ['☕', '🌽', '🥕', '🧁', '🧀', '🥪', '🥞', '🥜', '🥂', '🍀', '🍄'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item =>
                `<div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>`
            ).join('')}
        </div>
    `;

    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.board.replaceWith(parser.querySelector('.board'));
};

// Function to start the game
const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerHTML = `${state.totalFlips} moves`;
        selectors.timer.innerHTML = `Time: ${state.totalTime} sec`;
    }, 1000);
};

// Function to flip back unmatched cards
const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

// Function to handle card flipping logic
const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }
    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }
    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].querySelector('.card-back').innerHTML === flippedCards[1].querySelector('.card-back').innerHTML) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }
        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You Won!<br/>
                    with <span class="highlight">${state.totalFlips}</span> moves<br/>
                    under <span class="highlight">${state.totalTime}</span> seconds<br/>
                </span>
            `;
            clearInterval(state.loop);
        }, 1000);
    }
};

// Function to attach event listeners for card flipping and game start
const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.closest('.card');

        if (eventParent && !eventParent.classList.contains('flipped')) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.classList.contains('disabled')) {
            startGame();
        }
    });
};

// Initialize the game
generateGame();
attachEventListeners();
