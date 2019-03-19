import { merge, NEVER, timer } from 'rxjs';
import {
  map,
  mapTo,
  switchMap,
  tap,
  startWith,
  scan,
  shareReplay
} from 'rxjs/operators';
import { Counter, ICountDownState, PartialCountDownState } from './lib/counter';

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

let currentCount = initialCounterState.count;

// = BASE OBSERVABLES ====================================================
// == SOURCE OBSERVABLES ==================================================
// === STATE OBSERVABLES ==================================================

const counterCommands$ = merge<PartialCountDownState>(
  counterUI.btnStart$.pipe(mapTo({ isTicking: true })),
  counterUI.btnPause$.pipe(mapTo({ isTicking: false })),
  counterUI.btnSetTo$.pipe(map(n => ({ count: n }))),
  counterUI.btnUp$.pipe(mapTo({ countUp: true })),
  counterUI.btnDown$.pipe(mapTo({ countUp: false })),
  counterUI.btnReset$.pipe(mapTo({ ...initialCounterState })),
  counterUI.inputTickSpeed$.pipe(map(n => ({ tickSpeed: n }))),
  counterUI.inputCountDiff$.pipe(map(n => ({ countDiff: n })))
);

const counterState$ = counterCommands$.pipe(
  startWith(initialCounterState),
  scan<PartialCountDownState, ICountDownState>((counterState, command) => ({
    ...counterState,
    ...command
  })),
  shareReplay(1)
);

// === INTERACTION OBSERVABLES ============================================
// == INTERMEDIATE OBSERVABLES ============================================
// = SIDE EFFECTS =========================================================
// == UI INPUTS ===========================================================
// == UI OUTPUTS ==========================================================
// == SUBSCRIPTION ========================================================
// === INPUTs =============================================================
// === OUTPUTS ============================================================
// = HELPER ===============================================================
// = CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================
// == OPERATORS ===========================================================

// = SIDE EFFECTS =========================================================
// == UI INPUTS ===========================================================
const renderCountChangeFromTick$ = merge(
  counterUI.btnStart$.pipe(mapTo(1)),
  counterUI.btnPause$.pipe(mapTo(0))
).pipe(
  switchMap(n => (n === 1 ? timer(0, initialCounterState.tickSpeed) : NEVER)),
  tap(_ => (currentCount += 1)),
  tap(_ => counterUI.renderCounterValue(currentCount))
);

const renderCountChangeFromSetTo$ = counterUI.btnSetTo$.pipe(
  tap(n => (currentCount = n)),
  tap(n => counterUI.renderSetToInputValue(n.toString()))
);

merge(renderCountChangeFromTick$, renderCountChangeFromSetTo$).subscribe();
