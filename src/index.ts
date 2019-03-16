import { combineLatest, merge, NEVER, Observable, Subject, timer } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mapTo,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {
  Counter,
  CounterStateKeys,
  ICountDownState,
  PartialCountDownState
} from './counter';

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

// = BASE OBSERVABLES  ====================================================
// == SOURCE OBSERVABLES ==================================================
// All our source observables are extracted into Counter class to hide away all the low leven bindings.
// === STATE OBSERVABLES ==================================================
const programmaticCommands = new Subject<PartialCountDownState>();

const command$ = merge(
  counterUI.btnStart$.pipe(mapTo({ isTicking: true })),
  counterUI.btnPause$.pipe(mapTo({ isTicking: false })),
  counterUI.btnDown$.pipe(mapTo({ countUp: false })),
  counterUI.btnUp$.pipe(mapTo({ countUp: true })),
  counterUI.btnReset$.pipe(mapTo({ ...initialCounterState })),
  counterUI.btnSetTo$.pipe(map(n => ({ count: n }))),
  counterUI.inputTickSpeed$.pipe(map(n => ({ tickSpeed: n }))),
  counterUI.inputSetTo$.pipe(map(n => ({ count: n }))),
  counterUI.inputCountDiff$.pipe(map(n => ({ countDiff: n }))),
  programmaticCommands.asObservable()
);

const counterState$ = command$.pipe(
  startWith(initialCounterState),
  scan<PartialCountDownState, ICountDownState>((state, command) => ({
    ...state,
    ...command
  })),
  shareReplay(1)
);

// == INTERMEDIATE OBSERVABLES ============================================
const isTicking$ = counterState$.pipe(queryChange(CounterStateKeys.isTicking));
const tickSpeed$ = counterState$.pipe(queryChange(CounterStateKeys.tickSpeed));
const count$ = counterState$.pipe(queryChange(CounterStateKeys.count));
const countDiff$ = counterState$.pipe(queryChange(CounterStateKeys.countDiff));
const countUp$ = counterState$.pipe(queryChange(CounterStateKeys.countUp));
const countInfo$ = combineLatest(count$, countDiff$, countUp$);

const counterUpdateTrigger$ = combineLatest(isTicking$, tickSpeed$).pipe(
  switchMap(([isTicking, tickSpeed]) =>
    isTicking ? timer(0, tickSpeed) : NEVER
  )
);

// = SIDE EFFECTS =========================================================

// == UI INPUTS ===========================================================
const renderCountChange$ = count$.pipe(
  tap(n => counterUI.renderCounterValue(n))
);
const renderTickSpeedChange$ = tickSpeed$.pipe(
  tap(n => counterUI.renderTickSpeedInputValue(n))
);
const renderCountDiffChange$ = countDiff$.pipe(
  tap(n => counterUI.renderCountDiffInputValue(n))
);
const renderSetToChange$ = counterUI.btnReset$.pipe(
  tap(_ => {
    counterUI.renderSetToInputValue('10');
  })
);

// == UI OUTPUTS ==========================================================
const commandFromTick$ = counterUpdateTrigger$.pipe(
  withLatestFrom(countInfo$, (_, info) => info),
  tap(([count, countDiff, countUp]) =>
    programmaticCommands.next({
      count: count + (countUp ? countDiff : -countDiff)
    })
  )
);

// == SUBSCRIPTION ========================================================
merge(
  // Input side effect,
  renderCountChange$,
  renderTickSpeedChange$,
  renderCountDiffChange$,
  renderSetToChange$,
  // Output side effects
  commandFromTick$
).subscribe();

// = HELPER ===============================================================
// = CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================
// == OPERATORS ===========================================================
function queryChange<T, K extends keyof T>(key: K) {
  return (source: Observable<T>): Observable<T[K]> =>
    source.pipe(
      map(value => value[key]),
      distinctUntilChanged()
    );
}
