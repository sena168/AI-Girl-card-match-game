'use client'

import Head from 'next/head'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Game logic here
    const cardGrid = document.getElementById('card-grid');
    const timerDisplay = document.getElementById('timer-display');
    const clicksDisplay = document.getElementById('clicks-display');

    const CURRENT_IMAGE_URLS = [
      '/resized/AI-girl-card1.jpg',
      '/resized/AI-girl-card2.jpg',
      '/resized/AI-girl-card3.jpg',
      '/resized/AI-girl-card4.jpg',
      '/resized/AI-girl-card5.jpg',
      '/resized/AI-girl-card6.jpg',
      '/resized/AI-girl-card7.jpg',
      '/resized/AI-girl-card8.jpg',
    ];

    let board = [];
    let flippedCards = [];
    let matchesFound = 0;
    let totalClicks = 0;
    let lockBoard = false;

    let startTime;
    let timerInterval;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('Audio context created. State:', audioContext.state);

    function playTone(freq, type, duration, volume = 0.5) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    }

    const sfx = {
      click: () => playTone(440, 'sine', 0.05, 0.1),
      match: () => playTone(660, 'triangle', 0.15, 0.4),
      mismatch: () => playTone(150, 'square', 0.2, 0.3),
    };

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function createBoard(imageSet) {
      const pairs = imageSet.length;
      const totalCards = pairs * 2;
      const gridSize = Math.sqrt(totalCards);

      cardGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

      board = [...imageSet, ...imageSet];
      shuffleArray(board);

      cardGrid.innerHTML = '';

      board.forEach((imageURL, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-image', imageURL);
        cardElement.setAttribute('data-index', index);

        cardElement.innerHTML = `
          <div class="card-inner">
            <div class="card-front">
              <img src="${imageURL}" alt="Match Item ${index}"
                onload="console.log('Image loaded:', this.src, 'Dimensions:', this.naturalWidth + 'x' + this.naturalHeight);"
                onerror="console.log('Image failed to load:', this.src); this.src='/resized/AI-girl-card1.jpg'; this.style.opacity=0;">
            </div>
            <div class="card-back">
            </div>
          </div>
        `;
        cardElement.addEventListener('click', handleCardClick);
        cardGrid.appendChild(cardElement);
      });
    }

    function updateTimer() {
      const elapsedTime = Date.now() - startTime;
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);

      const timeString = `${String(minutes).padStart(2, '0')}:${String(
        seconds
      ).padStart(2, '0')}`;
      timerDisplay.textContent = timeString;
      return timeString;
    }

    function stopTimer() {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    document
      .getElementById('start-button')
      .addEventListener('click', startGame);

    function startGame() {
      console.log('Starting game. Audio context state:', audioContext.state);
      matchesFound = 0;
      totalClicks = 0;
      flippedCards = [];
      lockBoard = false;
      clicksDisplay.textContent = 0;
      timerDisplay.textContent = '00:00';

      createBoard(CURRENT_IMAGE_URLS);

      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);

      document.getElementById('title-screen').classList.add('hidden');
      document.getElementById('game-container').classList.remove('hidden');
      document.getElementById('results-screen').classList.add('hidden');
    }

    function endGame() {
      const finalTime = updateTimer();
      stopTimer();

      document.getElementById('game-container').classList.add('hidden');
      document.getElementById('final-time').textContent = finalTime;
      document.getElementById('final-clicks').textContent = totalClicks;
      document.getElementById('results-screen').classList.remove('hidden');
    }

    function handleCardClick(event) {
      if (lockBoard) return;

      const card = event.currentTarget;
      if (
        card.classList.contains('flipped') ||
        card.classList.contains('match-found')
      )
        return;

      sfx.click();

      totalClicks++;
      clicksDisplay.textContent = totalClicks;

      card.classList.add('flipped');
      flippedCards.push(card);

      if (flippedCards.length === 2) {
        lockBoard = true;
        checkForMatch();
      }
    }

    function checkForMatch() {
      const [card1, card2] = flippedCards;
      const isMatch =
        card1.getAttribute('data-image') === card2.getAttribute('data-image');

      if (isMatch) {
        sfx.match();
        disableCards(card1, card2);
      } else {
        sfx.mismatch();
        unflipCards(card1, card2);
      }
    }

    function disableCards(card1, card2) {
      card1.classList.add('match-found');
      card2.classList.add('match-found');

      matchesFound++;

      if (matchesFound === CURRENT_IMAGE_URLS.length) {
        setTimeout(endGame, 800);
      }

      resetBoard();
    }

    function unflipCards(card1, card2) {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        resetBoard();
      }, 200);
    }

    function resetBoard() {
      [flippedCards, lockBoard] = [[], false];
    }
  }, [])

  return (
    <>
      <Head>
        <title>AI Girl Picture Matchup</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --primary-color: #f87171;
            --secondary-color: #3b82f6;
            --card-back-color: #1f2937;
            --card-front-color: #fef3c7;
          }
          body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a;
          }
          .card {
            aspect-ratio: 1 / 1;
            perspective: 1000px;
            cursor: pointer;
            transition: transform 0.1s;
          }
          .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.1s;
            transform-style: preserve-3d;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 0.5rem;
          }
          .card.flipped .card-inner {
            transform: rotateY(180deg);
          }
          .card-front,
          .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .card-back {
            background-color: var(--card-back-color);
            border: 4px solid var(--secondary-color);
            background-image: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.1) 25%,
              transparent 25%,
              transparent 50%,
              rgba(255, 255, 255, 0.1) 50%,
              rgba(255, 255, 255, 0.1) 75%,
              transparent 75%,
              transparent
            );
            background-size: 8px 8px;
          }
          .card-front {
            background-color: var(--card-front-color);
            transform: rotateY(180deg);
            z-index: 10;
          }
          .card-front img {
            width: 105%;
            height: 105%;
            object-fit: cover;
            border-radius: 0.25rem;
          }
          #game-container.hidden {
            display: none;
          }
          #results-screen.hidden {
            display: none;
          }
          .match-found {
            box-shadow: 0 0 20px 5px var(--primary-color);
            opacity: 0.8;
            pointer-events: none;
          }
          @media (max-width: 640px) {
            #app {
              padding: 1rem;
            }
          }
        `}</style>
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          id="app"
          className="w-full max-w-lg mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl"
        >
          <div
            id="title-screen"
            className="text-center transition-opacity duration-500"
          >
            <h1 className="text-6xl font-extrabold text-white mb-4 tracking-tighter">
              AI Girl Matchup
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              Test your memory. Match the pairs to win the game!
            </p>
            <button
              id="start-button"
              className="w-full py-4 text-2xl font-bold rounded-lg shadow-lg bg-pink-600 hover:bg-pink-700 text-white transition transform hover:scale-[1.01] active:scale-95"
            >
              START GAME
            </button>
            <p className="text-sm text-gray-500 mt-6">Current Grid: 4x4</p>
          </div>

          <div id="game-container" className="hidden transition-opacity duration-500">
            <div
              className="flex justify-between items-center mb-6 p-3 bg-gray-700 rounded-lg shadow-md"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-gray-400">Time</p>
                <p id="timer-display" className="text-2xl font-bold text-white">
                  00:00
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-400">Clicks</p>
                <p id="clicks-display" className="text-2xl font-bold text-white">0</p>
              </div>
            </div>

            <div
              id="card-grid"
              className="grid gap-3"
              style={{gridTemplateColumns: 'repeat(4, 1fr)'}}
            >
            </div>
          </div>

          <div
            id="results-screen"
            className="hidden text-center p-6 bg-gray-700 rounded-xl"
          >
            <h2 className="text-4xl font-extrabold text-green-400 mb-4">VICTORY!</h2>
            <p className="text-lg text-gray-300 mb-2">
              Time Taken: <span id="final-time" className="font-bold text-white"></span>
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Total Clicks:
              <span id="final-clicks" className="font-bold text-white"></span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 text-lg font-bold rounded-lg shadow-lg bg-blue-500 hover:bg-blue-600 text-white transition transform hover:scale-[1.01] active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </>
  )
}