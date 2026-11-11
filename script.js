/**
 * ============================================================================
 * JAVASCRIPT: Calculator Logic & State Management
 * ============================================================================
 *
 * HOW THIS CODE IS ORGANIZED:
 * 1. Calculator Class: Holds all the math logic and current state.
 * 2. DOM Elements Selection: Grabs HTML elements so JavaScript can update them.
 * 3. Event Listeners: Listens for user interactions (mouse clicks & keyboard).
 */

class Calculator {
  /**
   * Constructor: Initializes the calculator with references to the HTML display elements.
   * Runs once when a new Calculator instance is created with `new Calculator(...)`.
   */
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear(); // Set default values when starting
  }

  /**
   * Resets all calculator state variables back to their initial values.
   * Triggered when the user presses 'AC' (All Clear).
   */
  clear() {
    this.currentOperand = '0';   // The number currently being entered or displayed
    this.previousOperand = '';  // The previous number before an operator was chosen
    this.operation = undefined; // The selected operator (+, -, ×, ÷)
    this.shouldResetScreen = false; // Flag to clear the display on next number click
  }

  /**
   * Appends a digit or decimal point to the current number string.
   * @param {string} number - The clicked digit ('0'-'9') or '.'
   */
  appendNumber(number) {
    // If a calculation was just completed or an operator was clicked,
    // we start typing a fresh number instead of appending to the old one.
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // Edge case: Don't allow multiple decimal points in one number (e.g., prevent "12.3.4")
    if (number === '.' && this.currentOperand.includes('.')) return;

    // Edge case: If current display is '0' and user types a digit (not '.'), replace the '0'
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  /**
   * Sets the math operation (+, -, ×, ÷).
   * If an operation is already pending and the user presses another operator,
   * it computes the current pair first (chaining operations: 5 + 5 + 5 = 15).
   * @param {string} operation - The operator symbol
   */
  chooseOperation(operation) {
    // Prevent choosing an operator if screen is showing an error
    if (this.currentOperand === 'Error') return;

    // If there is already a previous operand waiting, compute it first
    if (this.previousOperand !== '') {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand; // Move current number to previous
    this.shouldResetScreen = true;              // Next digit entered will start fresh
  }

  /**
   * Performs the mathematical calculation based on previousOperand,
   * currentOperand, and the chosen operation.
   */
  compute() {
    let computation;
    // Convert strings to floating point numbers for math calculations
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    // If either value is missing/invalid, stop and do nothing
    if (isNaN(prev) || isNaN(current)) return;

    // Perform the math operation
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        // Edge case: Division by zero is mathematically undefined
        if (current === 0) {
          this.currentOperand = 'Error';
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Fix floating point precision issues (e.g., 0.1 + 0.2 = 0.30000000000000004)
    // We round to 10 decimal places and strip trailing zeros using parseFloat()
    computation = parseFloat(computation.toFixed(10));

    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  /**
   * Toggles the sign of the current number between positive and negative.
   * e.g., 5 becomes -5, or -5 becomes 5.
   */
  toggleSign() {
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
    this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
  }

  /**
   * Converts the current number into a percentage (divides by 100).
   * e.g., 50 becomes 0.5.
   */
  applyPercent() {
    if (this.currentOperand === 'Error') return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    const result = parseFloat((current / 100).toFixed(10));
    this.currentOperand = result.toString();
  }

  /**
   * Removes the last typed character (Backspace functionality).
   */
  deleteNumber() {
    if (this.shouldResetScreen || this.currentOperand === 'Error') {
      this.clear();
      return;
    }
    // Remove last character
    this.currentOperand = this.currentOperand.slice(0, -1);
    // If everything was deleted, reset display back to '0'
    if (this.currentOperand === '' || this.currentOperand === '-') {
      this.currentOperand = '0';
    }
  }

  /**
   * Helper function: Formats raw numbers with commas for thousands (e.g., 1000000 -> 1,000,000).
   * Keeps decimal numbers easy to read while typing.
   */
  getDisplayNumber(number) {
    if (number === 'Error') return 'Error';

    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      // Formats the integer portion with commas based on user locale
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    // If there are decimal digits (or the user just typed the dot), re-attach them
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  /**
   * Synchronizes the internal state of the Calculator with the HTML DOM elements.
   * Called every time an action or computation occurs.
   */
  updateDisplay() {
    // 1. Update the main bottom number display
    this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);

    // 2. Update the smaller top line (shows "12 +" while waiting for second number)
    if (this.operation != null) {
      this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }
}

/* ==========================================================================
 * INITIALIZATION & EVENT LISTENERS
 * ========================================================================== */

// Step 1: Select HTML elements from the DOM
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const keypad = document.querySelector('.keypad');

// Step 2: Create our Calculator instance
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Step 3: Event Delegation on the Keypad
// Instead of adding 19 separate listeners for each button, we add ONE listener
// to the parent keypad container. This is a frontend best practice!
keypad.addEventListener('click', (event) => {
  // Find the button element that was clicked (even if child element was clicked)
  const button = event.target.closest('button');
  if (!button) return; // Ignore clicks in the gaps between buttons

  // Handle number button clicks (0 - 9)
  if (button.dataset.number !== undefined) {
    calculator.appendNumber(button.dataset.number);
    calculator.updateDisplay();
    return;
  }

  // Handle action buttons based on their data-action attribute
  const action = button.dataset.action;

  switch (action) {
    case 'decimal':
      calculator.appendNumber('.');
      calculator.updateDisplay();
      break;

    case 'operator':
      calculator.chooseOperation(button.dataset.operator);
      calculator.updateDisplay();
      break;

    case 'calculate':
      calculator.compute();
      calculator.updateDisplay();
      break;

    case 'clear':
      calculator.clear();
      calculator.updateDisplay();
      break;

    case 'toggle-sign':
      calculator.toggleSign();
      calculator.updateDisplay();
      break;

    case 'percent':
      calculator.applyPercent();
      calculator.updateDisplay();
      break;
  }
});

/* ==========================================================================
 * KEYBOARD SUPPORT
 * Allows users to type using their computer keyboard for a real desktop app feel.
 * ========================================================================== */
window.addEventListener('keydown', (event) => {
  const key = event.key;

  // Numbers (0 - 9)
  if (!isNaN(key) && key !== ' ') {
    calculator.appendNumber(key);
    calculator.updateDisplay();
    return;
  }

  // Decimal point
  if (key === '.') {
    calculator.appendNumber('.');
    calculator.updateDisplay();
    return;
  }

  // Operators (+, -, *, /)
  if (key === '+') {
    calculator.chooseOperation('+');
    calculator.updateDisplay();
  } else if (key === '-') {
    calculator.chooseOperation('-');
    calculator.updateDisplay();
  } else if (key === '*') {
    calculator.chooseOperation('×');
    calculator.updateDisplay();
  } else if (key === '/') {
    event.preventDefault(); // Prevents browser search shortcut in some browsers
    calculator.chooseOperation('÷');
    calculator.updateDisplay();
  }

  // Equals / Enter
  if (key === 'Enter' || key === '=') {
    event.preventDefault(); // Prevents accidental button re-triggering
    calculator.compute();
    calculator.updateDisplay();
  }

  // Backspace (Delete last digit)
  if (key === 'Backspace') {
    calculator.deleteNumber();
    calculator.updateDisplay();
  }

  // Escape (All Clear / AC)
  if (key === 'Escape') {
    calculator.clear();
    calculator.updateDisplay();
  }
});

