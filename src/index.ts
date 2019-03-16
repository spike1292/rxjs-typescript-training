import { combineLatest, merge, NEVER, Observable, Subject, timer } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mapTo,
  scan,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { CountDownState, Counter, CounterStateKeys } from './counter';

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

const queryChange = <T, K extends keyof T>(key: K) => (
  source: Observable<T>
): Observable<T[K]> =>
  source.pipe(
    map(value => value[key]),
    distinctUntilChanged()
  );

const initialCounterState: CountDownState = {
  isTicking: false,
  count: 0,
  countUp: true,
  tickSpeed: 200,
  countDiff: 1
};

const counterUI = new Counter(document.body, {
  initialSetTo: initialCounterState.count + 10,
  initialTickSpeed: initialCounterState.tickSpeed,
  initialCountDiff: initialCounterState.countDiff
});

const programmaticCommands = new Subject<Partial<CountDownState>>();

const command$ = merge<Partial<CountDownState>>(
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

const state$ = command$.pipe(
  scan<Partial<CountDownState>, CountDownState>(
    (state, command) => ({ ...state, ...command }),
    initialCounterState
  ),
  shareReplay(1)
);

const isTicking$ = state$.pipe(queryChange(CounterStateKeys.isTicking));

const tickSpeed$ = state$.pipe(queryChange(CounterStateKeys.tickSpeed));

const count$ = state$.pipe(queryChange(CounterStateKeys.count));

const countDiff$ = state$.pipe(queryChange(CounterStateKeys.countDiff));

const countUp$ = state$.pipe(queryChange(CounterStateKeys.countUp));

const countData$ = combineLatest(count$, countDiff$, countUp$);

const tick$ = combineLatest(isTicking$, tickSpeed$).pipe(
  switchMap(([isTicking, tickSpeed]) =>
    isTicking ? timer(0, tickSpeed) : NEVER
  )
);

tick$
  .pipe(
    withLatestFrom(countData$),
    tap(([_, [count, countDiff, countUp]]) =>
      programmaticCommands.next({
        count: count + (countUp ? countDiff : -countDiff)
      })
    )
  )
  .subscribe();

state$
  .pipe(
    queryChange(CounterStateKeys.count),
    tap(n => counterUI.renderCounterValue(n))
  )
  .subscribe();
