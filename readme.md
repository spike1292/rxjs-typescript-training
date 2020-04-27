# RxJS Typescript training

Reactive programming, Event Sourcing & CQRS in the frontend

[Slides](https://slides.com/spike1292/rxjs-typescript-training/fullscreen)

## Table of Contents <!-- omit in toc -->

- [RxJS Typescript training](#rxjs-typescript-training)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [00 - Assignment](#00---assignment)
    - [Structure](#structure)
  - [01 - Implement Interval](#01---implement-interval)
  - [02 - Maintain Interval State](#02---maintain-interval-state)
    - [02-1 Interlude](#02-1-interlude)
  - [03 - Adding Structure](#03---adding-structure)
    - [03-1 - Micro architecture](#03-1---micro-architecture)
    - [03-2 - Event Sourcing](#03-2---event-sourcing)
    - [03-3 - CQRS](#03-3---cqrs)
      - [Interlude - Hot & Cold](#interlude---hot--cold)
    - [03-4 - Intermediate observables](#03-4---intermediate-observables)
    - [03-5 Remove wrong state implementation](#03-5-remove-wrong-state-implementation)
    - [03-6 - Interval process - Move timer](#03-6---interval-process---move-timer)
    - [03-7 - Interval process - Command Subject](#03-7---interval-process---command-subject)
    - [03-8 - Interval process - Command stream](#03-8---interval-process---command-stream)
    - [Interlude - Start & Stop](#interlude---start--stop)
  - [04 - Input & Reset](#04---input--reset)
  - [05 - Count up](#05---count-up)
  - [06 - Dynamic tick speed](#06---dynamic-tick-speed)
  - [07 - Dynamic countDiff](#07---dynamic-countdiff)
    - [Interlude - counter.ts](#interlude---counterts)
  - [08 - Performance optimization & refactoring](#08---performance-optimization--refactoring)
  - [09 - Unit tests](#09---unit-tests)

## Prerequisites

- vscode / webstorm
  - <https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin>
  - <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>
  - <https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig>
- [node lts (12)](https://nodejs.org/en/download/)

## Setup

1. `git clone git@github.com:spike1292/rxjs-typescript-training.git`
1. `cd rxjs-typescript-training`
1. `npm install`
1. `npm start`

Open to [http://localhost:1234](http://localhost:1234) to see your hot reloaded project.

## 00 - Assignment

Start the project, see [Setup](#setup), and have a look at the starting situation in the [browser](http://localhost:1234).

The goal of this project is to implement all of the following functionality:

- Pressing _start_ will make the counter start counting up
- Pressing _pause_ will pause the counter
- _Set to_ will set the counter to the given value
- _Reset_ will reset the counter to it's initial state
- _Count up_ will cause the counter to count up
- _Count down_ will cause the counter to count down
- Changing the tick speed will change the interval of the timer
- Changing the count diff will change how much the counter changes each tick

The starting scenario changes the counter value to 1 or 0 when you press `start` / `pause`.

### Structure

In the `./src` directory there is an `index.ts` and an `index.html` file. The `index.ts` file contains the starting situation, you will expand this file to implement the counter. The `index.html` is already setup for you.

The `./src/lib` directory contains a file `counter.ts` with a class you will use to implement the counter view. **You don't have to adjust this file**.

> In [Interlude - counter.ts](#interlude---counterts) the content of of `counter.ts` will be explained

In the `./src/results` directory there are files for every step. In those files there is a possible result of that step. If you get stuck or need idea's you can always take a look at those files.

Every step has it's own branch with the results.

## 01 - Implement Interval

In order for the counter to actually count, we will need a signal on a fixed interval to update the count. RxJS offers an Observable creation method called `timer` [(docs)](https://rxjs.dev/api/index/function/timer) [(marbles)](https://rxmarbles.com/#timer). The goal in this step is to start a `timer` observable whenever `start` is pressed, and to stop it whenever `pause` is pressed. If you look at the [starting scenario](./src/index.ts) you will see we have an observable that emits when either `start` or `pause` is clicked.
At the moment it only switches the count between `0` and `1`, use the `switchMap` [(docs)](https://rxjs.dev/api/operators/switchMap) [(marbles)](https://rxmarbles.com/#switchMap) operator to switch to a `timer` observable whenever `start` is clicked, when `pause` is clicked you can use the `NEVER` [(docs)](https://rxjs.dev/api/index/const/NEVER) observable to stop emitting values.

When implemented correctly when the start button is clicked the counter should start counting up from `0`, _pause_ will pause the timer at its current value, and _start_ will restart it from `0`.

## 02 - Maintain Interval State

Currently the timer resets when it's restarted after a pause, this is of course not the desired functionality. After `switchMap`, use the `tap` [(docs)](https://rxjs.dev/api/operators/tap) operator to update a local variable which keeps track of the count state. Keep in mind we are not interested in the values that are emitted by the `timer` observable, but only use it to register ticks so we can update our state.

After this step the counter should start counting up when you press `start`, pause on the current value when your click `pause`, and continue counting up after clicking `start` again.

### 02-1 Interlude

Answer the following question: **"What is wrong with the current implementation?"**

> Discus your answer with the group

## 03 - Adding Structure

### 03-1 - Micro architecture

One of the benefits of _observables_ is that they are lazy, and can be combined and re-used to compose new observables. Currently we are immediately subscribing to the observable we have, this prevents us from re-using it. During the following exercises we will be creating several more Observables, it is recommended to group the Observables by function.

This is the structure we will be using:

```ts
// == CONSTANTS ===========================================================
// = BASE OBSERVABLES ====================================================
// == SOURCE OBSERVABLES ==================================================
// === STATE OBSERVABLES ==================================================
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
```

We will start the restructuring according to the following steps:

- Remove subscribe from the current observable and assign the observable to a variable `renderCountChangeFromTick$`
- Create an Observable `renderCountChangeFromSetTo$` that uses `counterUI.btnSetTo$` to update the count state and call `counterUI.renderCounterValue` to update the count value on screen. You can use the `tap` operator to accomplish this.
- Both of these observables should be put under `SIDE EFFECTS - UI INPUTS`.
- Use the `merge` [(docs)](https://rxjs.dev/api/operators/merge) [(marbles)](https://rxmarbles.com/#merge) operator on both of these observables, and subscribe to it. This way we only have to keep track of a single subscription. This should be placed under `SUBSCRIPTION`.

The counter should still be working as before and the `Set To` button should update the count to the value in the input field next to it.

### 03-2 - Event Sourcing

In this step we will create an observable which combines all the events in the application and maps them to state update commands. Use the `merge` operator to create an Observable `counterCommands$`. Add `counterCommands$` to the `STATE OBSERVABLES` section. The `counterCommands$` should combine all the click and change observables from `counterUI` (_btnStart$, btnPause$_ etc.) and maps the counterUI observables to state update commands. You can use the `map` [(docs)](https://rxjs.dev/api/operators/map) [(marbles)](https://rxmarbles.com/#map) and `mapTo` [(docs)](https://rxjs.dev/api/operators/mapTo) [(marbles)](https://rxmarbles.com/#mapTo) operators to do this.

> The valid update commands are defined in the `PartialCounterState` type exported by `counter.ts`.

For now subscribe to this observable and log it to the console.

### 03-3 - CQRS

We now have a stream of state update commands in the `counterCommands$` observable, but we currently aren't doing anything with it. Create a new Observable called `counterState$` from the `counterCommands$` Observable. Add the observable to the `STATE OBSERVABLES` section.

You can use the following `merge` type signature on `counterCommands$`:

```ts
merge<PartialCountDownState>
```

The goal is to take the stream of state update commands, and apply them, to our current state, and emit the updated state.

We want to start out with our initialState, the `startWith` [(docs)](https://rxjs.dev/api/operators/startWith) [(marbles)](https://rxmarbles.com/#startWith) operator can be used to emit a inital state. The `scan` operator can be used to merge the state update commands into our current state, `scan` [(docs)](https://rxjs.dev/api/operators/scan) [(marbles)](https://rxmarbles.com/#scan) behaves in the same way as `array.reduce`.

You can use the following `scan` type signature:

```ts
scan<PartialCountDownState, ICountDownState>
```

#### Interlude - Hot & Cold

> Observables are known as either hot or cold, depending on the nature of the data producer. Here we’ll go over the differences, why it matters, and how to properly manage both types of observables.

- <https://alligator.io/rxjs/hot-cold-observables/>
- <https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339>

By default most Observables are _cold_ ❄️, we only want to have one instance of the state being shared to the rest of the application. In order to make the Observable _hot_ 🔥 we can use the `shareReplay` [(docs)](https://rxjs.dev/api/operators/shareReplay) operator, besides making the Observable _hot_ it also always gives the most recent value to new subscribers instead of waiting for the next emission.

Subscribe to this Observable and log the result to the console, all the buttons and inputs should cause an updated state to be logged to the console.

### 03-4 - Intermediate observables

We now have a `counterState$` Observable, which always gives us the entire state. We want to be able to act on partial state value changes. We can create intermediate Observables from the `counterState$` Observable, do this for each of the properties eg. `isTicking`, `count`, on the state. Use the `pluck` [(docs)](https://rxjs.dev/api/operators/pluck) [(marbles)](https://rxmarbles.com/#pluck) operator and the `distinctUntilChanged` [(docs)](https://rxjs.dev/api/operators/distinctUntilChanged) [(marbles)](https://rxmarbles.com/#distinctUntilChanged) operator to do this.

For example:

```ts
const count$ = counterState$.pipe(
  pluck(CounterStateKeys.count),
  distinctUntilChanged()
);
```

Put these new Observables under the `INTERMEDIATE OBSERVABLES` section.

### 03-5 Remove wrong state implementation

You should remove `renderCountChangeFromTick$`, `renderCountChangeFromSetTo$` and it's local variable. Within functional programming it's discouraged to mutate and use state from outside of the observable stream inside of it. The scan solution we just implemented keeps the state internal to the stream.

cleanup the **wrong** state implementation:

- Remove the `counterState$` subscription
- Remove the variable `actualCount`
  - which holds state outside the stream
- replace the Observables in `UI INPUTS` with:
  ```ts
  const renderCountChange$ = count$.pipe(
    tap((n) => counterUI.renderCounterValue(n))
  );
  ```
  - don't forget to update `SUBSCRIPTION` 😉

### 03-6 - Interval process - Move timer

Up until now we have based the interval tick on the start and pause commands. In the previous step we created observables on the individual state properties, and the tick itself can be based on the `isTicking$` intermediate observable. Use the `switchMap` function, from [01 - Implement Interval](#01---implement-interval), to start and stop the timer when this property changes. Create an Observable called `intervalTick$` and place it in `INTERMEDIATE OBSERVABLES`.

### 03-7 - Interval process - Command Subject

When the `intervalTick$` emits, we want to update the `count` state. A good way to do this would be to sends a count update command through the `counterCommands$` observable. An Observable can only be piped from or subscribed to, you cannot emit into it directly. In order to be able to this we are going to create a `Subject` [(docs)](https://rxjs.dev/api/index/class/Subject). This is an Special Observable which acts as a producer.

Create a Subject `programmaticCommandSubject` and add this to the `counterCommands$` Observable in the `STATE OBSERVABLES` section. Once you call `programmaticCommandSubject.next(value)`, `counterCommands$` will emit the value which will update the state.

```ts
const programmaticCommandSubject = new Subject<PartialCountDownState>();
```

### 03-8 - Interval process - Command stream

Create an Observable `commandFromTick$` from `intervalTick$` which calls `programmaticCommandSubject.next({ count: newCount })` with the new count value on every tick. You can get the current count state using `withLatestFrom` [(docs)](https://rxjs.dev/api/operators/withLatestFrom) [(marbles)](https://rxmarbles.com/#withLatestFrom). For now increment it by 1 every tick. Place this in `UI OUTPUTS`

Add the `commandFromTick$` Observable to the Observable you have subscribed to under the `SUBSCRIPTION` section. The counter should work again now.

### Interlude - Start & Stop

Time to catch up and explain current situation

## 04 - Input & Reset

> If you did not create intermediate observables for all the `CounterStateKeys` you should do it now, because you will be needing them

The reset button currently resets the state due to the command it emits to the `counterCommands$` stream, but the input values are not currently updated. Under the `SIDE EFFECTS - UI INPUTS` section implement Observables that set the input values whenever the state values change using the `counterUI.render...InputValue` methods and `tap`. The intermediate observables should help with this.

The setTo input value is not based on the application state, think of a way to make the reset button reset this value as well.

> Hints: search for the following methods/properties: `renderTickSpeedInputValue`, `renderCountDiffInputValue`, `btnReset$`, `renderSetToInputValue`.
> You may reset the value to `10`

## 05 - Count up

Currently the counter can only count up, the buttons count up and count down already update the state. Use that state information to change the `commandFromTick$` Observable to support counting down, and back up again when those buttons are clicked. You can use the `withLatestFrom` [(docs)](https://rxjs.dev/api/operators/withLatestFrom) [(marbles)](https://rxmarbles.com/#withLatestFrom) operator to get the latest value from another observable in a pipe.

> Hints: create `countUp` intermediate observable, use `combineLatest` to combine `count` and `countUp`, use combined observable in `commandFromTick$` in `withLatestFrom`

## 06 - Dynamic tick speed

Currently the tick speed isn't actually updated when the input is changed. Update the `intervalTick$` Observable to use the (intermediate) state to determine to interval speed. You can use the `combineLatest` [(docs)](https://rxjs.dev/api/index/function/combineLatest) [(marbles)](https://rxmarbles.com/#combineLatest) observable creation method to get the most recent value of those observables when either one emits a value.

## 07 - Dynamic countDiff

Currently the amount the count is incremented and decremented is doesn't change when the countDiff input is changed. Alter the `commandFromTick$` Observable to use the state value to determine this. Hint: create a new intermediate observable that contains all count data you need in `commandFromTick$`.

> Hints: add `countDiff` to `countInfo`

### Interlude - counter.ts

Time to catch up and explain current situation and `counter.ts`

## 08 - Performance optimization & refactoring

Currently we use a sequence of operators exactly the same way several times, namely this pattern.

```ts
const count$ = counterState$.pipe(
  pluck(CounterStateKeys.count),
  distinctUntilChanged()
);
```

RxJS exposes many different useful operators, but it also allows us to make our own Operators. An operator is a function that returns a function, which takes as input an Observable, and returns an Observable. A noop Operator would look like this

```ts
const noopOperator = () => (source: Observable<T>) => source;
```

And can be used like this

```ts
counterState$.pipe(noopOperator());
```

This Operator does nothing on the source stream and simply returns it, we can of course do more interesting things such as the following

```ts
const greaterThan = (n: number) => (source: Observable<number>) =>
  source.pipe(filter((x) => x > n));

from([1, 2, 3, 6]).pipe(greaterThan(5)).subscribe(console.log); // logs 6
```

Move the duplicated code into a custom operator, which takes the state key name as property so it can be used with any state key. Place this operator in `OPERATORS`

## 09 - Unit tests

The last step will be to write a number of unit tests for the code you have written. A common way to test RxJS observables is a via the `rxjs-marbles` library. This lets you easily re-create complex observable streams in tests while allowing you to control the timing. You can read about how to use [rxjs-marbles](https://github.com/cartant/rxjs-marbles)

Create an `index.spec.ts` file, and write a test that verifies that the `counterState$` observable emits a value when `next` is called on `programmaticCommandSubject`. You can run the test suite by running `npm test`.
