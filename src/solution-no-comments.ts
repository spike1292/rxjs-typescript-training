import {
  combineLatest,
  merge,
  NEVER,
  Observable,
  pipe,
  Subject,
  timer,
  UnaryFunction
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mapTo,
  pluck,
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

const initialCounterState: ICountDownState = {
  count: 0,
  isTicking: false,
  tickSpeed: 200,
  countUp: true,
  countDiff: 1
};

const counterUI = new Counter(document.body, {
  initialSetTo: initialCounterState.count + 10,
  initialTickSpeed: initialCounterState.tickSpeed,
  initialCountDiff: initialCounterState.countDiff
});

const programmaticCommandSubject = new Subject<PartialCountDownState>();
const counterCommands$ = merge(
  counterUI.btnStart$.pipe(mapTo({ isTicking: true })),
  counterUI.btnPause$.pipe(mapTo({ isTicking: false })),
  counterUI.btnSetTo$.pipe(map(n => ({ count: n }))),
  counterUI.btnUp$.pipe(mapTo({ countUp: true })),
  counterUI.btnDown$.pipe(mapTo({ countUp: false })),
  counterUI.btnReset$.pipe(mapTo({ ...initialCounterState })),
  counterUI.inputTickSpeed$.pipe(map(n => ({ tickSpeed: n }))),
  counterUI.inputCountDiff$.pipe(map(n => ({ countDiff: n }))),
  programmaticCommandSubject.asObservable()
);

const counterState$: Observable<ICountDownState> = counterCommands$.pipe(
  startWith(initialCounterState),
  scan(
    (counterState: ICountDownState, command): ICountDownState => ({
      ...counterState,
      ...command
    })
  ),
  shareReplay(1)
);

const count$ = counterState$.pipe(
  pluck<ICountDownState, number>(CounterStateKeys.count)
);
const isTicking$ = counterState$.pipe(
  queryChange<ICountDownState, boolean>(CounterStateKeys.isTicking)
);
const tickSpeed$ = counterState$.pipe(
  queryChange<ICountDownState, number>(CounterStateKeys.tickSpeed)
);
const countDiff$ = counterState$.pipe(
  queryChange<ICountDownState, number>(CounterStateKeys.countDiff)
);

const counterUpdateTrigger$ = combineLatest([isTicking$, tickSpeed$]).pipe(
  switchMap(([isTicking, tickSpeed]) =>
    isTicking ? timer(0, tickSpeed) : NEVER
  )
);

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
const commandFromTick$ = counterUpdateTrigger$.pipe(
  withLatestFrom(counterState$, (_, counterState) => ({
    [CounterStateKeys.count]: counterState.count,
    [CounterStateKeys.countUp]: counterState.countUp,
    [CounterStateKeys.countDiff]: counterState.countDiff
  })),
  tap(({ count, countUp, countDiff }) =>
    programmaticCommandSubject.next({
      count: count + countDiff * (countUp ? 1 : -1)
    })
  )
);

merge(
  renderCountChange$,
  renderTickSpeedChange$,
  renderCountDiffChange$,
  renderSetToChange$,
  commandFromTick$
).subscribe();

function queryChange<T, I>(
  key: string
): UnaryFunction<Observable<T>, Observable<I>> {
  return pipe(
    pluck<T, I>(key),
    distinctUntilChanged<I>()
  );
}
