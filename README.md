# JavaScript로 로그라이크 게임 만들기

# 기본적인 요소

1.  확률 로직 적용
- 연속 공격, 방어, 도망치기
- 스테이지 클리어 시 플레이어 능력치 증가, 증가량
- 몬스터의 공격력, 체력 증가량

2. 복잡한 행동 패턴 구현 (=Skill)
- 카드 슬래쉬
- 방어
- 도망가기 (몬스터의 남은 체력에 비례해서 도망확률 증가)

# 어떤 식으로 플레이할 것인가
1. 플레이어가 강해지는 방식
- 포커를 사용
  1) 5장의 카드로 진행
  2) 각 카드마다 교환할 수 있는 chance 1 - 교환 방식은 random
  3) 족보 별로 증가량 설정
     하이카드:+2, 원페어:+4, 투페어:+8, 트리플:+16, 스트레이트:+32, 플러쉬:+40, 풀하우스:+64,
     포카드:+128, 스트레이트_플러쉬:+256, 로얄_스트레이트_플러쉬:+512
  5) pokerScore의 형태로 매판마다 나온 결과의 점수를 누적
  6) 카드 슬래쉬 : pokerScore + playerDmg 공격, 명중률 80%

2. 어떤 식으로 진행이 될 것인가
- 스테이지 진행마다 5장의 카드로 포커 진행
- 게임을 시작했을 때, 포커 시작
- 포커를 진행하는 화면에는  
  *******************************************************************
![스크린샷 2024-11-12 204340](https://github.com/user-attachments/assets/6f98ce5a-1606-4f90-baf8-417118073eb2)
  *******************************************************************
  1 : 교환 2 : 교환 3 : 교환 4: 교환 5: 교환
  1 : 교환 2 : -- 3 : 교환 4: 교환 5: -- // 교환 했으면 선택 불가
  *******************************************************************
- 포커를 완료했으면 띄우는 화면
   플레이어 능력치(Ability)에 증가량 표시
   => pokerScore라는 형태의 누적 점수 --> 카드 슬래쉬 형태의 공격에 추가

- 총 Stage는 10개,
  1) 스테이지를 클리어하면 일정 스테이지마다 레벨업
  2) 레벨 업을 하면 능력(Ability)를 선택할 수 있다
  3) Ability 선택 UI에서는 3가지의 랜덤 능력을 선택할 수 있으며,
     정해진 확률에 따라 커먼, 언커먼, 레어, 에픽, 레전더리 각각 확률에 따라 나온다

- 게임을 시작 시 선택지
  1. 일반 공격
  2. 특수 공격 = 카드 슬래쉬 (기본공격 + 포커점수)
  3. 방어
  4. 도망가기
  100. 족보확인
  998. 게임로그
  999. 포기하기(게임종료)

3. 필요한 장면
 - 플레이어 Status (체력=hp, 공격력=atk, 방어력=def, 도망확률=run)
 - monster, enemy 처치 시 텍스트 출력
 - 스테이지 클리어 시 능력을 선택하는 페이지 출력
 - 선택한 능력이 어떤 것들이 있는지 확인하는 Player Status 출력

 4. 세부사항
  - 포커 카드별 점수 지정
    A-14 K-13 Q-12 J-11
    2~10 =  각각 카드의 수치
  - 스테이지를 클리어 했을 때에만 포커를 해서 능력치가 증가할 수 있다
   --> '도망가기'를 선택할 시 포커 화면으로 넘어가지 않음 = '도망가기'에는 턴을 소비하고 확률이 존재
   --> 적 체력을 절반 깎는다.
  - 레벨 시스템
    1) 처음 시작 시 레벨 = Lv.1
    2) 1stage 클리어 시 레벨 업 --> 능력 선택
    3) 2stage 클리어 시 레벨 업 --> 능력 선택
    4) 3, 4 stage 클리어 시 레벨 업 --> 능력 선택
    5) 5stage는 중간보스 스테이지로 체력이 좀 더 많고 강하다.
       --> 처치 시 레벨업 --> 능력 선택
    6) 6, 7stage 클리어 시 레벨 업 --> 능력 선택
    7) 8, 9stage 클리어 시 레벨 업 --> 마지막 능력 선택
    8) 10stage는 보스임으로 체력이 높고 공격력이 높다 방어력 또한 높다 --> 처치할 시 게임 클리어

  - 업적 시스템
    1) 게임을 클리어 했다 : 조건 = stage를 1부터 10까지 전부 클리어
    2) 로오오오야야야르를 스토레이트으 풀라아쉬!!!???? : 조건 = 포커 게임에서 처음으로 로얄 스트레이트 플러시가 나온다
    3) 스트...레이트... 근데 색깔이 다 똑같아! : 조건 = 포커 게임에서 처음으로 스트레이트 플러시가 나온다
    4) 나야... 포 카드 : 조건 = 포커 게임에서 처음으로 포카드가 나온다
    5) 이게 가능했었어...? : 조건 = Player maxAttackDmg 500 달성
    6) 그럴 수 있어 : 조건 = 처음 게임오버 한다
    7) Even하네요 : 조건 = 처음 투 페어 연속 5번
    8) 오늘은 날이 아니올씨다 : 조건 = 하이카드 연속 5번


  <!-- - 도망가기 시스템 (구상만 해보는 단계)
    1) 1 stage에서 도망가기를 성공했을 시 심연 stage에 진입
    2) 심연 stage는 stage가 증가할 때마다 더욱 더 강한 Monster 등장
    3) stage 10까지 존재 -->



