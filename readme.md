# RxJS Typescript Workshop

Operating Heavily Dynamic UI's

_Event Sourcing & CQRS in the frontend_

[Slides](https://slides.com/spike1292/rxjs-workshop)

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

## PROJECT STRUCTURE

In the `src` directory there is an `index.ts` and a `count.ts` file. The `counter.ts` file countains a class you will use to implement the counter. The `index.ts` file contains the starting situation, you will expand this file to implement the counter.

Start the project and have a look at the starting situation in the browser. The goal of this project is to implement all of the following functionality.

- Pressing start will make the counter start counting up
- Pressing pause will pause the counter
- Set to will set the counter to the given value
- Reset will reset the counter to it's initial state
- Count up will cause the counter to count up
- Count down will cause the counter to count down
- Changing the tickspeed will change the interval of the timer
- Changing the count diff will change how much the counter changes each tick

## STATE MANAGEMENT

To start off we will create the state management section of the application. We will be making use of the counterUI interface, take some time to see what this exposes. In this section we will:

- Gather all inputs into an event stream
- Map these events to state updates
- Expose the application state as an observable
- Merge the state updates into the existing state

1. Use the `merge` rxjs operator to create a `command$` observable. This should emit a state update when any of the inputs on the `counterUI` change (counterUI.btnStart$, counterUI.btnPause$ etc.) A state update is a partial state, for example:

```ts
counterUI.btnStart$.pipe(mapTo({ isTicking: true }));
```

2. Create a `state$` observable.
   Start with `initialCounterState`, use the `scan` operator to merge updates from `command$` in. Scan is similar to the `array.reduce` function.
   Use the `shareReplay(1)` operator to retrieve the last value emitted whenever you subscribe.

3. Subscribe to `state$` and use `console.log` to test it, the updated state should be logged when you click any of the buttons or change a value.

## RENDERING

In this section we will

- Render the current count value from the state to the screen.

1. Create a `renderCountValue$` observable from the `state$` observable, use the `map` operator to select the `count` property.
   Use the `tap` operator to execute `counterUI.renderDisplayText()`.
2. Subscribe to this observable and verify that the initial count variable is rendered to the screen.

## TIMER

In this section we will create an observable that will emit on a fixed interval, this will be used as the tick for the timer. The observable should only emit when `isTicking` is true. RxJS

1. Create a `timerProcessChange$` observable in the section "OBSERVABLES".
2. Use the `state$` to get the isTicking value. Use the "switchMap NEVER" pattern from before to start a timer.
3. Create a `programmaticCommands` subject in section "STATE" - "Command"
4. Create a `handleTimerProcessChange$` observable in section "SIDE EFFECTS" - "Outputs".
   Use the `tap` operator to call `next()` on `programmaticCommands`

# BONUS

Explore the counterUI API by typing `counterUI.` somewhere in the index.ts file. ;)

Implement all the features of the counter:

- Start, pause the counter. Then restart the counter (+)
- Start it again from the paused number (++)
- If Set to button is clicked set counter value to input value while counting (+++)
- Reset to initial state if the reset button is clicked (+)
- Is count up button is clicked count up (+)
- Is count down button is clicked count down (+)
- Change interval if input tickSpeed input changes (++)
- Change count up if input countDiff changes (++)
- Take care of rendering execution and other performance optimizations (+)

Some structure recommendations

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
