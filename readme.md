# RxJS Typescript Workshop

Reactive programming, Event Sourcing & CQRS in the frontend

[Slides](https://slides.com/spike1292/rxjs-typescript-workshop)

## TODO

- [x] links to operator docs + marble
- [ ] review henk
- [x] explain files structure with assignments
- [ ] expand test assignment + example
- [ ] add marbles diagrams to explain
- [x] make index.ts start situation

## Prerequisites

- vscode / webstorm
  - <https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin>
  - <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>
  - <https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig>
- [node lts (10)](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/en/docs/install)

## Setup

1. `git clone quintorgit@git.quintor.nl:SG-QuintorAcademy/rxjs.git`
1. `cd rxjs`
1. `yarn install`
1. `yarn start`

Open to [http://localhost:1234](http://localhost:1234) to see your hot reloaded project.

## 00 - Assignment

Start the project, see [Setup](#setup), and have a look at the starting situation in the [browser](http://localhost:1234).

In the `src` directory there is an `index.ts` and a `count.ts` file. The `counter.ts` file countains a class you will use to implement the counter view. The `index.ts` file contains the starting situation, you will expand this file to implement the counter.

> Every step in the project has an accompanying file in which the implementation is done up untill that point. If you get stuck or need idea's you can always take a look at those files.

The goal of this project is to implement all of the following functionality:

- Pressing _start_ will make the counter start counting up
- Pressing _pause_ will pause the counter
- _Set to_ will set the counter to the given value
- _Reset_ will reset the counter to it's initial state
- _Count up_ will cause the counter to count up
- _Count down_ will cause the counter to count down
- Changing the tickspeed will change the interval of the timer
- Changing the count diff will change how much the counter changes each tick

The starting scenario changes the counter value to 1 or 0 when you press `start` / `pause`.

## 01 - Implement Interval

In order for the counter to actually count, we will need a signal on a fixed interval to update the count. RxJS offers an Observable creation method called `timer` [(docs)](https://rxjs.dev/api/index/function/timer) [(marbes)](https://rxmarbles.com/#timer). The goal in this step is to start a `timer` observable whenever `start` is pressed, and to stop it whenever `pause` is pressed. If you look at the starting scenario you will see we have an observable that emits when either `start` or `pause` is clicked.
At the moment it only logs this to the console, use the `switchMap` [(docs)](https://rxjs.dev/api/operators/switchMap) [(marbes)](https://rxmarbles.com/#switchMap) operator to switch to a `timer` observable whenever `start` is clicked, when `pause` is clicked you can use the `NEVER` [(docs)](https://rxjs.dev/api/index/const/NEVER) observable to stop emitting values.

When implemented correctly when you press start the counter will start counting up from 0, pause will pause the timer at it's current value, and start will restart it from 0.

## 02 - Maintain Interval State

Currently the timer resets when it's restarted after a pause, this is ofcourse not the desired functionality. After `switchMap`, use the `tap` [(docs)](https://rxjs.dev/api/operators/tap) operator to update a local variable which keeps track of the count state. Keep in mind we are not interested in the values that are emitted by the `timer` observable, but only use it to register ticks so we can update our state.

After this step the counter should start counting up when you press `start`, pause on the current value when your click `pause`, and continue counting up after clicking `start` again.

## 03 - Adding Structure

### 03-1 - Micro architecture

One of the benefits of observables is that they are lazy, and can be combined and re-used to compose new observables. Currently we are immediately subscribing to the observable we have, this prevents us from re-using it. During the following exercises we will be creating several more Observables, it is recommended to group the Observables by function.

This is the structure we will be using.

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

- Remove subscribe from the current observable and assign it to the variable `renderCountChangeFromTick$`
- Create an Observable `renderCountChangeFromSetTo$` that uses `counterUI.btnSetTo$` to update the count state and call `counterUI.renderCounterValue` to update the count value on screen. You can use the `tap` operator to accomplish this.
- Both of these observables should be put under SIDE EFFECTS - UI INPUTS.
- Use the `merge` [(docs)](https://rxjs.dev/api/operators/merge) [(marbles)](https://rxmarbles.com/#merge) operator on both of these observables, and subscribe to it. This way we only have to keep track of a single subscription. This should be placed under SUBSCRIPTION.

The counter should still be working as before and the `Set To` button should update the count to the value in the input field next to it.

### 03-2 - Event Sourcing

In this step we will create an observable which combines all the events in the application and maps them to state update commands. Using the `merge` operator create an Observable `counterCommands$` the combines all the click and change observables from `counterUI` (btnStart$, btnPause$ etc.) and maps them to state update commands. You can use the `map` [(docs)](https://rxjs.dev/api/operators/map) [(marbles)](https://rxmarbles.com/#map) and `mapTo` [(docs)](https://rxjs.dev/api/operators/mapTo) [(marbles)](https://rxmarbles.com/#mapTo) operators to do this.
The valid update commands are defined in the `PartialCounterState` type exported by `counter.ts`.

For now subscribe to this observable and log it to the console.

### 03-3 - CQRS

We now have a stream of state update commands in the `counterCommands$` observable, but we currently aren't doing anything with it. Create a new Observable called `counterState$` from the `counterCommands$` Observable. Our goal is to take the stream of state update commands, and apply them, to our current state, and emit the updated state. We want to start out with our initialState, the `startWith` [(docs)](https://rxjs.dev/api/operators/startWith) [(marbles)](https://rxmarbles.com/#startWith) operator can be used for this. The `scan` operator can be used to merge the state update commands into our current state, `scan` [(docs)](https://rxjs.dev/api/operators/scan) [(marbles)](https://rxmarbles.com/#scan) works in the same way as `array.reduce`.
By default most Observabled are cold, we only want to have one instance of the state being shared to the rest of the application. In order to make the Observable hot we can use the `shareReplay` [(docs)](https://rxjs.dev/api/operators/shareReplay) Operator, besides making the Observable hot it also always gives the last value to new subscribers instead of waiting for the next emission.
Subscribe to this Observable and log the result to the console, all the buttons and inputs should cause an updated state to be logged to the console.

```ts
const counterState$ = counterCommands$.pipe(
  startWith(initialCounterState),
  scan<PartialCountDownState, ICountDownState>((counterState, command) => ({
    ...counterState,
    ...command
  })),
  shareReplay(1)
);
```

### 03-4 - Intermediate observables

We now have a `counterState$` Observable, which always gives us the entire state. We want to be able to act on single state value changes, only when that specific value changes. We can create intermediate Observables from the `counterState$` Obserable, do this for each of the properties on the state. Use the `pluck` [(docs)](https://rxjs.dev/api/operators/pluck) [(marbles)](https://rxmarbles.com/#pluck) operator and the `distinctUntillChanged` [(docs)](https://rxjs.dev/api/operators/distinctUntilChanged) [(marbles)](https://rxmarbles.com/#distinctUntilChanged) operator to do this. Put these under the INTERMEDIATE OBSERVABLES section.

```ts
const count$ = counterState$.pipe(
  pluck(CounterStateKeys.count),
  distinctUntillChanged()
);
```

### 03-5 - Interval process

Up untill now we have based the interval tick on the start and pause commands. In the previous step we created observables on the individual state properties, and the tick itself can be based on the `isCounting$` and `intervalSpeed$` observables. Use the `merge` method to start, stop and/or update the timer when either property changes. Make this an Observable called `intervalTick$` and place it in INTERMEDIATE OBSERVABLES.

When the `intervalTick$` emits, we want to update the `count` state. A good way to do this would be to sends a count update command through the `counterCommands$` observable. An Observable van only be piped or subscribed to, you cannot emit into it directly. In order to be able to this we are going to create a `Subject` [(docs)](https://rxjs.dev/api/index/class/Subject). This is an Observable we can emit values into.

Create a Subject `programmaticCommandSubject` and add this to the `counterCommands$` Observable. Now once you call programmaticCommandSubject.next(value), `counterCommands$` will emit the value which will update the state.

```ts
const programmaticCommandSubject = new Subject<PartialCountDownState>();
```

Create an Observable `intervalProcess$` from `intervalTick$` which calls `programmaticCommandSubject.next({ count: newCount })` with the new count value on every tick. For now increment it by 1 every tick. Add the `intervalProcess$` Observable to the Observable you have subscribed to under the SUBSCRIBE section. The counter should work again now.

## 04 - Reset

The reset button currently resets the state due to the command it emits to the `counterCommands$` stream, but the input values are not currently updated. Under the SIDE EFFECTS - UI INPUTS section implement Observables that set the input values whenever the state values change using the `counterUI.render...InputValue` methods and `tap`. The intermediate observables should help with this.
The setTo input value is not based on the application state, think of a way to make the reset button reset this value as well.

## 05 - Countup

Currently the counter can only count up, the buttons count up and count down already update the state. Use that state information to change the `intervalProcess$` Observable to support counting down, and back up again when those buttons are clicked.

## 06 - Dynamic tickspeed

Currently the tickspeed isn't actually updated when the input is changed. Update the `intervalTick$` Observable to use the (intermediate) state to determine to interval speed.

## 07 - Dynamic countDiff

Currently the ammount the count is incremented and decremented is doesn't change when the countDiff input is changed. Alter the `intervalProcess$` Observable to use the state value to determine this.

## 08 - Performance optimalisation & refactoring

Currently we use a sequence of operators exactly the same way several times, namely this pattern.

```ts
const count$ = counterState$.pipe(
  pluck(CounterStateKeys.count),
  distinctUntillChanged()
);
```

RxJS exposes many different usefull operators, but it also allows us to make our own Operators. An operator is a function that returns a function, which takes as input an Observable, and returns an Observable. A noop Operator would look like this

```ts
const noopOperator = () => (source: Observable<T>) => source;
```

And can be used like this

```ts
counterState$.pipe(noopOperator());
```

This Operator does nothing on the source stream and simply returns it, we can ofcourse do more interesting things such as the following

```ts
const greaterThan = (n: number) => (source: Observable<number>) =>
  source.pipe(filter(x => x > n));

from([1, 2, 3, 6])
  .pipe(greaterThan(5))
  .subscribe(console.log); // logs 6
```

Move the duplicated code into a custom operator, which takes takes the state key name as property so it can be used with any state key.

## 09 - Unit tests (WIP)

The last step will be to write a number of unit tests for the code you have written. A common way to test RxJS observables is a via the `rxjs-marbles` library. This lets you easily re-create complex observable streams in tests while allowing you to control the timing. You can read about how to use [rxjs-marbles](https://github.com/cartant/rxjs-marbles)

Create an `index.spec.ts` file, and write a test that verifies that the `counterState$` observable emits a value when `next` is called on `programmaticCommandSubject`. You can run the test suite by running `yarn test`.
