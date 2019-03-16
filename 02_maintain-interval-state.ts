import {Counter, CountDownState, CounterStateKeys} from './counter'
import { merge, timer, NEVER} from 'rxjs'; 
import { mapTo, switchMap, scan} from 'rxjs/operators';

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

const initialCounterState: CountDownState = {
  isTicking: false, 
  count: 0, 
  countUp: true, 
  tickSpeed: 200, 
  countDiff:1
};

const counterUI = new Counter(
  document.body,
  {
    initialSetTo: initialCounterState.count + 10,
    initialTickSpeed: initialCounterState.tickSpeed,
    initialCountDiff: initialCounterState.countDiff,
  }
);

merge(
  counterUI.btnStart$.pipe(mapTo(true)),
  counterUI.btnPause$.pipe(mapTo(false)),
)
.pipe(
  switchMap(isTicking => (isTicking) ? timer(0, initialCounterState.tickSpeed): NEVER),
  scan((conut: number, _) =>  ++conut)
)
.subscribe(
  n => counterUI.renderCounterValue(n)
);
