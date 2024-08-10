import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import useWindowSize from 'react-use/lib/useWindowSize'

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [roll, setRoll] = React.useState(0)
    const [ms, setMs] = React.useState(0);
    const { width, height } = useWindowSize()

    // const min = Math.floor((ms/1000/60) << 0)
    // const sec = Math.floor((ms/1000) % 60)
    
    const bestTime = JSON.parse(localStorage.getItem('bestTime')) || 0

    React.useEffect(() => {
        if (tenzies){
            if (bestTime === 0 || bestTime > ms) {
                localStorage.setItem('bestTime', JSON.stringify(ms))
            }
        }
    }, [tenzies])

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
        }
    }, [dice])

    React.useEffect(() => {
        if (tenzies){
            return
        }

        const intervalId = setInterval(() => {
          setMs(prevTime => prevTime + 1000); // increment by 1 second
        }, 1000); // every 1 second
        return () => clearInterval(intervalId); // cleanup
      }, [tenzies]);

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            setRoll(prev => prev + 1)
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            setMs(0)
            setRoll(0)
            setTenzies(false)
            setDice(allNewDice())
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))

    function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

    function min(n) {
        return Math.floor((n/1000/60) << 0)
    }

    function sec(n) {
        return Math.floor((n/1000) % 60)
    }
    
    return (
        <main>
            {tenzies && <Confetti width={width} height={height}/>}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="data">
                <h2>Best Time: {pad(min(bestTime)) + '.'}{pad(sec(bestTime))}</h2>
                <div className="roll--time">
                    <h2>Rolls: {roll}</h2>
                    <h2>Time: {min(ms) !== 0 && pad(min(ms)) + '.'}{pad(sec(ms))}</h2>
                </div>
            </div>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
        </main>
    )
}