import { createStore, applyMiddleware } from 'redux';

import createBehavioralMiddleware from '../index';

test('createBehavioralMiddleware single click', () => {
  const rootReducer = (state = [], action) => state.concat(action);
  const threads = [
    function* showModalAfterClick() {
      yield { wait: 'CLICK' };
      yield { request: 'SHOW_MODAL' };
    }
  ];
  const store = createStore(
    rootReducer,
    applyMiddleware(createBehavioralMiddleware(threads))
  );

  store.dispatch({ type: 'CLICK' });
  const [initAction, ...rest] = store.getState();
  expect(rest).toMatchObject([
    {
      type: { type: 'CLICK', payload: undefined },
      payload: undefined,
      bpThread: true
    },
    {
      type: { type: 'SHOW_MODAL' },
      payload: undefined,
      bpThread: true
    }
  ]);
});

test('createBehavioralMiddleware double click with block', () => {
  const rootReducer = (state = [], action) => state.concat(action);
  const threads = [
    function* showModalAfterClick() {
      yield { wait: 'CLICK' };
      yield { request: 'SHOW_MODAL' };
    },
    function* waitForSecondClickBeforeShowingModal() {
      yield { wait: 'CLICK' };
      yield {
        block: 'SHOW_MODAL',
        wait: 'CLICK'
      };
    }
  ];
  const store = createStore(
    rootReducer,
    applyMiddleware(createBehavioralMiddleware(threads))
  );

  store.dispatch({ type: 'CLICK' });
  const [initAction, ...rest] = store.getState();
  expect(rest).toMatchObject([
    {
      type: { type: 'CLICK', payload: undefined },
      payload: undefined,
      bpThread: true
    }
  ]);
  // Do second click
  store.dispatch({ type: 'CLICK' });
  const [initAction2, ...rest2] = store.getState();
  expect(rest2).toMatchObject([
    {
      type: { type: 'CLICK', payload: undefined },
      payload: undefined,
      bpThread: true
    },
    {
      type: { type: 'CLICK', payload: undefined },
      payload: undefined,
      bpThread: true
    },
    {
      type: { type: 'SHOW_MODAL' },
      payload: undefined,
      bpThread: true
    }
  ]);
});
