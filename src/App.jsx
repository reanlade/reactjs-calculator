import { useState } from 'react';
import { buttons } from './utils/buttons';
import { MODES } from './utils/modes';
import Button from './Button';
import ChangeStyle from './ChangeStyle';
import {
  endsWithNegativeSign,
  endsWithOperator,
  isOperator,
} from './utils/validator';
import './styles/App.css';

function App() {
  const [formula, setFormula] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [prevValue, setPrevValue] = useState('0');
  const [evaluate, setEvaluate] = useState(false);

  const [mode, setMode] = useState(MODES.purple);

  /**
   * Function for the numbers
   */
  function handlerNumber({ target: { innerText } }) {
    setEvaluate(false);
    if (evaluate) {
      setCurrentValue(innerText);
      setFormula(innerText !== '0' ? innerText : '');
    } else {
      setCurrentValue(
        currentValue === '0' || isOperator.test(currentValue)
          ? innerText
          : currentValue + innerText
      );
      setFormula(
        currentValue === '0' && innerText === '0'
          ? formula === ''
            ? innerText
            : formula
          : // f the formula is '0' or if there is a '0' after an operator
          // Ej: 12 - 0, 12 * 0
          /([^.0-9]0|^0)$/.test(formula)
          ? formula.slice(0, -1) + innerText
          : formula + innerText
      );
    }
  }

  /**
   * Function for the decimal point
   */
  function handlerDecimal() {
    if (evaluate) {
      setCurrentValue('0.');
      setFormula('0.');
      setEvaluate(false);
    } else {
      // If the currentValue does not contain a dot/period "."
      if (!currentValue.includes('.')) {
        if (
          // If it ends with an operator (+,-,/,*)
          // or if the currentValue is 0 and the formula is empty
          endsWithOperator.test(formula) ||
          (currentValue === '0' && formula === '')
        ) {
          setCurrentValue('0.');
          setFormula(formula + '0.');
        } else {
          // With the match, the last value of the formula is obtained
          // after the operator
          setCurrentValue(formula.match(/(\d+\d*)$/)[0] + '.');
          setFormula(formula + '.');
        }
      }
    }
  }

  /**
   * Function that evaluates the formula and gives the answer
   */
  function handlerEqual() {
    // If it has already been evaluated or if the formula ends with an operator
    // no action is taken
    if (evaluate || endsWithOperator.test(formula)) return;

    let result = '';

    try {
      // If the result of eval() is undefined, then
      // returns NaN
      result = eval(formula) ?? NaN;
    } catch (error) {
      // If there is an error, no action is taken
      return;
    }

    setCurrentValue(result);
    setPrevValue(result);
    setFormula(
      isFinite(result) || isNaN(result) ? formula + '=' + result : result
    );
    setEvaluate(true);
  }

  /**
   * Function that evaluates the input of an operator
   */
  function handlerOperator({ target: { innerText } }) {
    if (evaluate) {
      setFormula(currentValue + innerText);
      setCurrentValue(innerText);
      setEvaluate(false);
    } else {
      setCurrentValue(innerText);

      // If it does not end with an operator (+,-,*,/)
      if (!endsWithOperator.test(formula)) {
        setPrevValue(formula);
        setFormula(formula + innerText);

        // If it does not end with a negative sign (--,+-,*-,/-)
      } else if (!endsWithNegativeSign.test(formula)) {
        setFormula(
          // If it ends with a negative sign (--,+-,*-,/-)
          (endsWithNegativeSign.test(formula + innerText)
            ? formula
            : prevValue) + innerText
        );

        // If the input is different from '-'
      } else if (innerText !== '-') {
        setFormula(prevValue + innerText);
      }
    }
  }

  /**
   * Function that cleans the values
   */
  function handlerInitialize() {
    setFormula('');
    setCurrentValue('0');
    setPrevValue('0');
    setEvaluate(false);
  }

  /**
   * Function to change the style of the calculator
   */
  function changeMode(mode) {
    setMode(mode);
  }

  return (
    <div className={'container ' + mode}>
      <div className='calculator'>
        <ChangeStyle change={changeMode} />
        <div className='screen'>
          <div className='formula'>{formula}</div>
          <div className='output'>{currentValue}</div>
        </div>
        <div className='buttons'>
          {buttons.map((button) => (
            <Button
              key={button.id}
              number={handlerNumber}
              decimal={handlerDecimal}
              equal={handlerEqual}
              operator={handlerOperator}
              initialize={handlerInitialize}
              type={button.type}
              id={button.id}
            >
              {button.value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
