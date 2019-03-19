import { merge } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { Counter, ICountDownState } from './counter';

// EXERCISE DESCRIPTION ==============================

/**
 * Use `CounterStateKeys` for property names.
 * Explort the counterUI API by typing `counterUI.` somewhere. ;)
 *
 * Implement all features of the counter:
 * 1. Start, pause the counter. Then restart the counter with 0 (+)
 * 2. Start it again from paused number (++)
 * 3. If Set to button is clicked set counter value to input value while counting (+++)
 * 4. Reset to initial state if reset button is clicked (+)
 * 5. If count up button is clicked count up, if count down button is clicked count down  (+)
 * 6. Change interval if input tickSpeed input changes (++)
 * 7. Change count up if input countDiff changes (++)
 * 8. Take care of rendering execution and other performance optimisations as well as refactoring (+)
 */

// ==================================================================

// == CONSTANTS ===========================================================
// Setup counter state
const initialCounterState: ICountDownState = {
  count: 0,
  countDiff: 1,
  countUp: true,
  isTicking: false,
  tickSpeed: 200
};

const counterUI = new Counter(document.body, {
  initialCountDiff: initialCounterState.countDiff,
  initialSetTo: initialCounterState.count + 10,
  initialTickSpeed: initialCounterState.tickSpeed
});

merge(
  counterUI.btnStart$.pipe(mapTo(1)),
  counterUI.btnPause$.pipe(mapTo(0))
).subscribe(n => counterUI.renderCounterValue(n));
