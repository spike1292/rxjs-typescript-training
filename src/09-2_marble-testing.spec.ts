import { marbles } from 'rxjs-marbles/jest';
import {
  counterState$,
  initialCounterState,
  programmaticCommandSubject
} from './09-1_export-observables';

describe('rxjs-marbles', () => {
  it(
    'Should emit the next state after programmaticCommandSubject emits',
    marbles(m => {
      const stateUpdate = { count: 50 };
      const expectedState = { ...initialCounterState, ...stateUpdate };

      const expected = m.cold('a', { a: expectedState });

      programmaticCommandSubject.next(stateUpdate);
      m.expect(counterState$).toBeObservable(expected);
    })
  );
});
