import readlineSync from 'readline-sync';
import { checkPokerHand } from './achievements.js';
import chalk from 'chalk';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const HAND_SIZE = 5;
const EXCHANGE_COMPLETE = 111;

// 카드를 저장할 배열 생성하고 suit, value로 모양과 숫자 생성
const createDeck = () => {
  const deck = [];
  for (let suit of SUITS) {
    for (let value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

// 카드를 섞는데
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
};

const cardToString = (card) => createCardVisual(card.value, card.suit);

export const createCardVisual = (value, suit) => {
  const topBottom = `┌───────┐\n└───────┘`;
  const empty = `│       │`;

  // 슈트에 따른 색상 적용
  let coloredSuit;
  switch (suit) {
    case '♥':
      coloredSuit = chalk.redBright(suit);
      break;
    case '♦':
      coloredSuit = chalk.magentaBright(suit);
      break;
    case '♣':
      coloredSuit = chalk.greenBright(suit);
      break;
    case '♠':
      coloredSuit = chalk.blueBright(suit);
      break;
  }

  // 숫자나 문자를 왼쪽 상단과 오른쪽 하단에 배치
  const displayValue = value.length === 2 ? value : ` ${value}`;
  const lines = [
    `│${displayValue}     │`,
    empty,
    `│   ${coloredSuit}   │`,
    empty,
    `│     ${displayValue.split('').join('')}│`,
  ];

  // 숫자에 따라 심볼 배치
  if ('JQK'.includes(value)) {
    lines[2] = `│  ${value}${coloredSuit}   │`;
  } else if (value === 'A') {
    lines[2] = `│   ${coloredSuit}   │`;
  } else {
    const num = parseInt(value);
    switch (num) {
      case 2:
        lines[1] = `│   ${coloredSuit}   │`;
        lines[3] = `│   ${coloredSuit}   │`;
        break;
      case 3:
        lines[1] = `│   ${coloredSuit}   │`;
        lines[2] = `│   ${coloredSuit}   │`;
        lines[3] = `│   ${coloredSuit}   │`;
        break;
      case 4:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 5:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[2] = `│   ${coloredSuit}   │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 6:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 7:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 8:
        lines[1] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        break;
      case 9:
        lines[1] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        break;
      case 10:
        lines[1] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit}${coloredSuit} ${coloredSuit}${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        break;
    }
  }

  return topBottom.split('\n')[0] + '\n' + lines.join('\n') + '\n' + topBottom.split('\n')[1];
};

const displayHand = (hand) => {
  const cardVisuals = hand.map((card) => createCardVisual(card.value, card.suit).split('\n'));
  let display = '';
  for (let i = 0; i < cardVisuals[0].length; i++) {
    display += cardVisuals.map((card) => card[i]).join(' ') + '\n';
  }
  return display;
};

const drawCard = (deck) => deck.pop();

const evaluateHand = (hand) => {
  const values = hand.map((card) => card.value);
  const suits = hand.map((card) => card.suit);

  // 값별 카운트
  const valueCounts = {};
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  const counts = Object.values(valueCounts);
  const isFlush = new Set(suits).size === 1;
  const isStraight = isStraightHand(values);

  // 로얄 스트레이트 플러시 확인
  const isRoyalStraightFlush =
    isFlush &&
    isStraight &&
    new Set(values).size === 5 &&
    values.includes('A') &&
    values.includes('K');

  if (isRoyalStraightFlush) return '로얄 스트레이트 플러시'; // *16.0
  if (isFlush && isStraight) return '스트레이트 플러시'; // * 8.0
  if (counts.includes(4)) return '포카드'; // * 4.0
  if (counts.includes(3) && counts.includes(2)) return '풀하우스'; // *3.0
  if (isFlush) return '플러시'; // * 2.5
  if (isStraight) return '스트레이트'; // *2.0
  if (counts.includes(3)) return '트리플'; // *1.5
  if (counts.filter((count) => count === 2).length === 2) return '투페어'; // *1.2
  if (counts.includes(2)) return '원페어'; // *1.1
  return '하이카드'; // *1.0
};

const isStraightHand = (values) => {
  const order = 'A23456789TJQKA';
  const sortedValues = values
    .map((v) => (v === '10' ? 'T' : v))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const indices = sortedValues.map((v) => order.indexOf(v));
  return (
    indices.every((v, i) => i === 0 || v === indices[i - 1] + 1) ||
    (indices[0] === 0 && indices[1] === 9 && indices[4] === 12)
  ); // A-10-J-Q-K 스트레이트 처리
};

const askForExchange = (playerHand, exchanged, exchangeCount = 0, player) => {
  // player 매개변수 추가
  console.log('\n현재 핸드: \n' + displayHand(playerHand));
  console.log(' ▼ ▼ ▼ 교환 가능 여부 ▼ ▼ ▼');
  console.log(
    exchanged
      .map((e, i) => (e ? chalk.redBright(' |교환끝| ') : chalk.blueBright(`| ${i + 1} | `)))
      .join(' '),
  );

  // player가 존재하고 extraPokerExchange가 true일 때만 표시
  if (player?.extraPokerExchange) {
    console.log(chalk.green(`현재 교환 횟수: ${exchangeCount + 1}/2`));
  }

  const answer = readlineSync.question(
    `교환할 카드의 위치를 입력하세요 (1-${HAND_SIZE}), 또는 ${EXCHANGE_COMPLETE}을 입력하여 완료 \n 입력 : `,
  );
  return parseInt(answer);
};

const calculateCardScore = (card) => {
  if (typeof card !== 'object' || !card.value) {
    throw new Error('Invalid card object');
  }
  if (card.value === 'A') return 14;
  if (card.value === 'K') return 13;
  if (card.value === 'Q') return 12;
  if (card.value === 'J') return 11;
  return parseInt(card.value);
};

const getHandRankMultiplier = (handRank) => {
  const multipliers = {
    '로얄 스트레이트 플러시': 512,
    '스트레이트 플러시': 256,
    포카드: 128,
    풀하우스: 64,
    플러시: 40,
    스트레이트: 32,
    트리플: 16,
    투페어: 8,
    원페어: 4,
  };
  return multipliers[handRank] || 2; // 하이카드
};

// 카드 랭크 별 가장 높은 수의 카드 판별
const getRankingCards = (hand, handRank) => {
  const values = hand.map((card) => card.value);
  const valueCounts = {};
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  switch (handRank) {
    case '로얄 스트레이트 플러시':
    case '스트레이트 플러시':
    case '스트레이트':
    case '플러시':
      return hand; // 모든 카드가 랭킹에 포함됨
    case '포카드':
      return hand.filter((card) => valueCounts[card.value] === 4);
    case '풀하우스':
      return hand.filter((card) => valueCounts[card.value] >= 2);
    case '트리플':
      return hand.filter((card) => valueCounts[card.value] === 3);
    case '투페어':
      const pairValues = Object.keys(valueCounts).filter((value) => valueCounts[value] === 2);
      return hand.filter((card) => pairValues.includes(card.value));
    case '원페어':
      return hand.filter((card) => valueCounts[card.value] === 2);
    default: // 하이카드
      return [
        hand.reduce(
          (highest, card) =>
            calculateCardScore(card) > calculateCardScore(highest) ? card : highest,
          hand[0],
        ),
      ];
  }
};

// 포커 점수 계산
const calculatePokerScore = (hand, handRank) => {
  if (!Array.isArray(hand) || typeof handRank !== 'string') {
    throw new Error('Invalid input for calculatePokerScore');
  }
  const rankingCards = getRankingCards(hand, handRank);
  const highestCard = Math.max(...rankingCards.map(calculateCardScore));
  return Math.floor(highestCard + getHandRankMultiplier(handRank));
};

// 포커 게임의 시작
export const playPoker = (player) => {
  let deck = createDeck();
  shuffleDeck(deck);
  let playerHand = Array(HAND_SIZE)
    .fill()
    .map(() => drawCard(deck));

  console.log('초기 핸드: \n' + displayHand(playerHand));
  let exchanged = new Array(HAND_SIZE).fill(false);

  // 포커의축복 능력이 있는 경우 교환 횟수 증가
  const maxExchanges = player?.extraPokerExchange ? 2 : 1;
  let exchangeCount = 0;

  while (exchangeCount < maxExchanges) {
    const position = askForExchange(playerHand, exchanged, exchangeCount, player);

    if (position === EXCHANGE_COMPLETE) {
      console.log(chalk.yellow('카드 교환을 완료합니다.'));
      break;
    }

    if (position >= 1 && position <= HAND_SIZE) {
      if (!exchanged[position - 1]) {
        console.log(`${position}번째 카드를 교환합니다.`);
        playerHand[position - 1] = drawCard(deck);
        exchanged[position - 1] = true;
      } else {
        console.log(`${position}번째 카드는 이미 교환했습니다. 다른 카드를 선택하세요.`);
      }
    } else {
      console.log(`잘못된 입력입니다. 1-${HAND_SIZE} 사이의 숫자를 입력하세요.`);
    }

    // 모든 카드를 교환했거나 EXCHANGE_COMPLETE를 입력했을 때
    if (exchanged.every((e) => e) || position === EXCHANGE_COMPLETE) {
      exchangeCount++;
      if (exchangeCount < maxExchanges) {
        console.log(chalk.green('\n추가 교환 기회가 있습니다!'));
        exchanged = new Array(HAND_SIZE).fill(false);
      }
    }
  }

  console.log('\n최종 핸드: \n' + displayHand(playerHand));
  const handRank = evaluateHand(playerHand);
  checkPokerHand(handRank);
  console.log(`당신의 핸드는 ${chalk.cyanBright(handRank)} 입니다.`);

  const rankingCards = getRankingCards(playerHand, handRank);
  console.log(
    '랭킹에 포함된 카드:',
    rankingCards.map((card) => `${card.value}${card.suit}`).join(', '),
  );

  const highestCard = Math.max(...rankingCards.map(calculateCardScore));
  console.log('가장 높은 카드 점수:', highestCard);

  const multiplier = getHandRankMultiplier(handRank);
  console.log('핸드 랭크 보너스 점수:', multiplier);

  const pokerScore = Math.ceil(calculatePokerScore(playerHand, handRank));
  console.log(`이번 라운드의 포커 점수: ${pokerScore}`);

  return { hand: playerHand, score: pokerScore };
};
