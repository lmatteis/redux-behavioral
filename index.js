import BProgram from 'behavioral';

function createBehavioralMiddleware(threads) {
  return ({ dispatch, getState }) => {
    const bp = new BProgram();
    let pr = 1;
    bp.run();

    threads.forEach(thread => bp.addBThread(``, pr++, thread));
    bp.addBThread('dispatch', pr++, function*() {
      while (true) {
        yield {
          wait: [
            event => {
              dispatch(Object.assign({}, event, { bpThread: true }));
              return true;
            }
          ]
        };
      }
    });

    return next => action => {
      // if it's a BP event continue reducers, otherwise return null
      // we only can run to the reducers and other middlewars
      // stuff coming "out" of the b-threads.
      if (!action) {
        return;
      }
      if (action.bpThread) {
        return next(action);
      } else {
        bp.request(action);
        return null;
      }
    };
  };
}

export default createBehavioralMiddleware;
