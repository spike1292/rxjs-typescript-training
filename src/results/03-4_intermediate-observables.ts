import { merge } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mapTo,
  pluck,
  scan,
  shareReplay,
  startWith,
  tap,
} from 'rxjs/operators';
import {
  Counter,
  CounterStateKeys,
  ICountDownState,
  PartialCountDownState,
} from '../lib/counter';

// EXERCISE DESCRIPTION ==============================

/**
 * Use `CounterStateKeys` for property names.
 * Export the counterUI API by typing `counterUI.` somewhere. ;)
 *
 * Implement all features of the counter:
 * 1. Start, pause the counter. Then restart the counter with 0 (+)
 * 2. Start it again from paused number (++)
 * 3. If Set to button is clicked set counter value to input value while counting (+++)
 * 4. Reset to initial state if reset button is clicked (+)
 * 5. If count up button is clicked count up, if count down button is clicked count down  (+)
 * 6. Change interval if input tickSpeed input changes (++)
 * 7. Change count up if input countDiff changes (++)
 * 8. Take care of rendering execution and other performance optimizations as well as refactoring (+)
 */
// ==================================================================

// == CONSTANTS ===========================================================
// Setup counter state
const initialCounterState: ICountDownState = {
  isTicking: false,
  count: 0,
  countUp: true,
  tickSpeed: 200,
  countDiff: 1,
};

// Init CountDown counterUI
const counterUI = new Counter(document.body, {
  initialSetTo: initialCounterState.count + 10,
  initialTickSpeed: initialCounterState.tickSpeed,
  initialCountDiff: initialCounterState.countDiff,
});

// = BASE OBSERVABLES  ====================================================
// == SOURCE OBSERVABLES ==================================================

// All our source observables are extracted into Counter class

// === STATE OBSERVABLES ==================================================
const counterCommands$ = merge<PartialCountDownState>(
  counterUI.btnStart$.pipe(mapTo({ isTicking: true })),
  counterUI.btnPause$.pipe(mapTo({ isTicking: false })),
  counterUI.btnSetTo$.pipe(map((n) => ({ count: n }))),
  counterUI.btnUp$.pipe(mapTo({ countUp: true })),
  counterUI.btnDown$.pipe(mapTo({ countUp: false })),
  counterUI.btnReset$.pipe(mapTo({ ...initialCounterState })),
  counterUI.inputTickSpeed$.pipe(map((n) => ({ tickSpeed: n }))),
  counterUI.inputCountDiff$.pipe(map((n) => ({ countDiff: n })))
);

const counterState$ = counterCommands$.pipe(
  startWith(initialCounterState),
  scan<PartialCountDownState, ICountDownState>((counterState, command) => ({
    ...counterState,
    ...command,
  })),
  shareReplay(1)
);

// === INTERACTION OBSERVABLES ============================================

// == INTERMEDIATE OBSERVABLES ============================================
const count$ = counterState$.pipe(
  pluck<ICountDownState, number>(CounterStateKeys.count)
);
const isTicking$ = counterState$.pipe(
  pluck(CounterStateKeys.isTicking),
  distinctUntilChanged<boolean>()
);

// = SIDE EFFECTS =========================================================
// == UI INPUTS ===========================================================
const renderCountChange$ = count$.pipe(
  tap((n) => counterUI.renderCounterValue(n))
);

// WRONG SOLUTION REMOVED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// == UI OUTPUTS ==========================================================

// == SUBSCRIPTION ========================================================

merge(
  // Input side effect
  renderCountChange$
  // Outputs side effect
).subscribe();

// = HELPER ===============================================================
// = CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================
// == OPERATORS ===========================================================
