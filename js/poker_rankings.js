import chalk from 'chalk';
import { createCardVisual } from './poker.js';

export function displayPokerRankings() {
  console.clear();
  console.log(chalk.yellow('===== 포커 족보 =====\n'));

  const rankings = [
    {
      name: '로얄 스트레이트 플러시',
      description: '같은 무늬의 A, K, Q, J, 10',
      example: [
        { suit: '♠', value: '10' },
        { suit: '♠', value: 'J' },
        { suit: '♠', value: 'Q' },
        { suit: '♠', value: 'K' },
        { suit: '♠', value: 'A' },
      ],
      multiplier: 16.0,
    },
    {
      name: '스트레이트 플러시',
      description: '같은 무늬의 연속된 5장의 카드',
      example: [
        { suit: '♥', value: '5' },
        { suit: '♥', value: '6' },
        { suit: '♥', value: '7' },
        { suit: '♥', value: '8' },
        { suit: '♥', value: '9' },
      ],
      multiplier: 8.0,
    },
    {
      name: '포카드',
      description: '같은 숫자 4장',
      example: [
        { suit: '♠', value: 'K' },
        { suit: '♥', value: 'K' },
        { suit: '♦', value: 'K' },
        { suit: '♣', value: 'K' },
        { suit: '♠', value: '2' },
      ],
      multiplier: 4.0,
    },
    {
      name: '풀하우스',
      description: '트리플과 원페어',
      example: [
        { suit: '♠', value: 'J' },
        { suit: '♥', value: 'J' },
        { suit: '♦', value: 'J' },
        { suit: '♣', value: '4' },
        { suit: '♠', value: '4' },
      ],
      multiplier: 3.0,
    },
    {
      name: '플러시',
      description: '같은 무늬 5장',
      example: [
        { suit: '♣', value: '2' },
        { suit: '♣', value: '5' },
        { suit: '♣', value: '7' },
        { suit: '♣', value: '9' },
        { suit: '♣', value: 'K' },
      ],
      multiplier: 2.5,
    },
    {
      name: '스트레이트',
      description: '연속된 숫자 5장',
      example: [
        { suit: '♠', value: '3' },
        { suit: '♥', value: '4' },
        { suit: '♦', value: '5' },
        { suit: '♣', value: '6' },
        { suit: '♠', value: '7' },
      ],
      multiplier: 2.0,
    },
    {
      name: '트리플',
      description: '같은 숫자 3장',
      example: [
        { suit: '♠', value: '8' },
        { suit: '♥', value: '8' },
        { suit: '♦', value: '8' },
        { suit: '♣', value: '3' },
        { suit: '♠', value: 'K' },
      ],
      multiplier: 1.5,
    },
    {
      name: '투페어',
      description: '같은 숫자 2장이 2쌍',
      example: [
        { suit: '♠', value: '9' },
        { suit: '♥', value: '9' },
        { suit: '♦', value: 'Q' },
        { suit: '♣', value: 'Q' },
        { suit: '♠', value: '2' },
      ],
      multiplier: 1.2,
    },
    {
      name: '원페어',
      description: '같은 숫자 2장',
      example: [
        { suit: '♠', value: 'A' },
        { suit: '♥', value: 'A' },
        { suit: '♦', value: '5' },
        { suit: '♣', value: '8' },
        { suit: '♠', value: 'J' },
      ],
      multiplier: 1.1,
    },
    {
      name: '하이카드',
      description: '위의 모든 족보에 해당하지 않는 경우',
      example: [
        { suit: '♠', value: '2' },
        { suit: '♥', value: '7' },
        { suit: '♦', value: '9' },
        { suit: '♣', value: 'J' },
        { suit: '♠', value: 'K' },
      ],
      multiplier: 1.0,
    },
  ];

  rankings.forEach((ranking) => {
    console.log(chalk.cyan(`${ranking.name} (x${ranking.multiplier})`));
    console.log(chalk.white(ranking.description));
    console.log(displayHand(ranking.example));
    console.log();
  });

  console.log(chalk.green('엔터를 누르면 게임으로 돌아갑니다...'));
}

function displayHand(hand) {
  const cardVisuals = hand.map((card) => createCardVisual(card.value, card.suit).split('\n'));
  let display = '';
  for (let i = 0; i < cardVisuals[0].length; i++) {
    display += cardVisuals.map((card) => card[i]).join(' ') + '\n';
  }
  return display;
}
