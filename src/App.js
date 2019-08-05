import React, { useEffect, useState } from 'react';
import * as cardsService from './services/cardsService';
import '@scss/style.scss';

const App = () => {
  const [deckInfo, setDeckInfo] = useState({});
  const [dealerCards, setDealerCards] = useState([]);
  const [handCards, setHandCards] = useState([]);
  const [round, setRound] = useState(0);
  const [stand, setStand] = useState({
    player: false,
    dealer: false
  });
  const [score, setScore] = useState({
    player: 0,
    dealer: 0
  });
  const [isFinished, setFinished] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if( stand.player && !stand.dealer ) startBotActions(); 
      if( stand.player && stand.dealer ) checkWinner();
    }, 800);
  }, [stand, dealerCards]);

  useEffect(() => {
    (createDeck)();
  },[]);

  const createDeck = async () => {
    const deck = await cardsService.createDeck(6);
    setDeckInfo(deck);
  }

  const startGame = async () => {

    const dataDealerCards = await cardsService.getCard(2, deckInfo.deck_id);
    const dataPlayerCards = await cardsService.getCard(2, deckInfo.deck_id);
    setDealerCards(dataDealerCards.cards);
    setHandCards(dataPlayerCards.cards);
    setDeckInfo({
      ...deckInfo,
      remaining: dataPlayerCards.remaining
    });
    finishRound();
  };

  const restartGame = () => {
    setFinished(false);
    setDealerCards([]);
    setHandCards([]);
    setRound(0);
    setStand({
      player: false,
      dealer: false
    });
  }

  const finishGame = () => setFinished(true);

  const finishRound = () => setRound(round + 1);

  const getTotal = cards => {
    const aces = cards.filter(card => card.value === "ACE");
    let total = cards.reduce((acc, curr) => {
      const { value } = curr;
      if( value === "JACK" || value === "KING" || value === "QUEEN" ) {
        return Number(acc) + Number(10);
      } 
      else if( value === "ACE" ) {
        return Number(acc);
      }
      else {
        return Number(acc) + Number(value);
      }
    },0);

    if( aces.length ) {
      if( aces.length === 2 ) {
        return 21;
      }
      if( (21 - total) > 1 && (21 - total) <= 11 ) {
        total += (21 - total);
      }
      else {
        total += 11;
      }
    }

    return total;
  };

  const getCard = async user => {
    const data = await cardsService.getCard(1, deckInfo.deck_id);
    setDeckInfo({
      ...deckInfo,
      remaining: data.remaining
    });
    if( user === "player" ) {
      setHandCards([...handCards, ...data.cards]);
    }
    else{
      setDealerCards([...dealerCards, ...data.cards]);
    }
    finishRound();
  };

  const selectStand = user => {
    setStand({...stand, [user]: true});
    finishRound();
  };

  const addScorePoint = user => setScore({...score, [user]: (score[user] + 1)});

  const startBotActions = () => {
    const trustLevel = Math.floor(Math.random() * (16 - 11 + 1) + 11);
    console.log("bot",trustLevel)
    if( getTotal(handCards) > 21 || getTotal(dealerCards) >= 21 ) {
      checkWinner();
      return;
    }
    if( getTotal(dealerCards) <= trustLevel ) {
      getCard("dealer");
    } else {
      selectStand("dealer");
    }
  };

  const checkWinner = () => {
    if( (getTotal(handCards) > 21 && getTotal(dealerCards) > 21) || (getTotal(handCards) === 21 && getTotal(dealerCards) === 21) || (getTotal(handCards) === getTotal(dealerCards)) ) {
      showMessage("Draw!", 1500);
      finishGame();
      return;
    }
    else if( getTotal(handCards) > 21 ) {
      showMessage("You lose!", 1500);
      addScorePoint("dealer");
    }
    else if( getTotal(dealerCards) > 21 || ( 21 - getTotal(handCards) < 21 - getTotal(dealerCards) ) ) {
      showMessage("You win!", 1500);
      addScorePoint("player");
    }
    else {
      showMessage("You lose!", 1500);
      addScorePoint("dealer");
    }
    finishGame();
  }

  const showMessage = (message, delay=0) => {
    setTimeout(() => {
      alert(message);
    }, delay);
  };

  return (
    <>
      <div className="hand hand--dealer">
        { round > 0 && <div className="score">{ score.dealer }</div> }
        <div className="card-list">
        {
          dealerCards.map((card, index) => (
            <div
              key={index} 
              className={`card-list__card ${ (index > 0 && !isFinished) && 'card-list__card--hidden' }`}
            >
              <img src={ card.image } />
            </div>
          ))
        }
        </div>
      </div>
      <div className="hand hand--player">
        { round > 0 && <div className="score">{ score.player }</div> }
        <div className="card-list">
        {
          handCards.map((card, index) => (
            <div
              key={index} 
              className="card-list__card"
            >
              <img src={ card.image } />
            </div>
          ))
        }
        </div>
      </div>
      {
        round > 0 && (
          <div className="info-panel">
            <div className="info-panel__item">
              <div className="info-panel__item-label">Round:</div>
              <div className="info-panel__item-content">{ round }</div>
            </div>
          </div>
        )
      }
      <div className={`action-panel ${ round > 0 && 'action-panel--active' }`}>
        { round == 0 && <button className="action-panel__button" onClick={() => startGame()}>START</button> }
        {
          round > 0 && (
            <>
              {
                (!stand.player && !isFinished) && (
                  <>
                    <button className="action-panel__button" onClick={() => getCard("player")}>Hits</button>
                    <button className="action-panel__button" onClick={() => selectStand("player")}>Stand</button>
                  </>
                )
              }
              <button className="action-panel__button action-panel__button--red" onClick={() => restartGame()}>Restart</button>
            </>
          )
        }
      </div>  
    </>
  )
};

export default App;