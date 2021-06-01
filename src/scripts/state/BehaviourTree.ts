import { StateDetails } from "./Agent"

export {
  inParallelUntilAny,
  loop,
  selector,
  sequence,
  tell,
  until,
  waitFor,
  withSideEffect,
}

type BTree = Generator<StateDetails[], ["succeed" | "fail", StateDetails[]]>

function* loop(toLoop: () => BTree): BTree {
  while (true) {
    const result = yield* toLoop();
    yield result[1];
  }
}

function* inParallelUntilAny(...trees: BTree[]): BTree {
  while (true) {
    let reports: StateDetails[] = [];

    for (const tree of trees) {
      const result = tree.next();

      // If an item is done, only report that result.
      if (result.done) {
        return result.value;
      } else {
        reports = reports.concat(result.value);
      }
    }

    yield reports;
  }
}

function* sequence(...trees: BTree[]): BTree {
  while (true) {
    const tree = trees.shift();
    if (tree === undefined) {
      return ["succeed", []];
    }

    const result = yield* tree;
    if (result[0] === "fail") {
      return result;
    }

    if (trees.length === 0) {
      return result;
    }

    yield result[1];
  }
}

function* selector(...trees: BTree[]): BTree {
  while (true) {
    const tree = trees.shift();
    if (tree === undefined) {
      return ["fail", []];
    }

    const result = yield* tree;
    if (result[0] === "succeed") {
      return result;
    }

    if (trees.length === 0) {
      return result;
    }

    yield result[1];
  }
}

// eslint-disable-next-line require-yield
function* tell(tell: StateDetails[]): BTree {
  return ["succeed", tell];
}

function* withSideEffect(sideEffect: () => void, subTree: BTree): BTree {
  sideEffect();
  return yield* subTree;
}

function* waitFor(condition: () => boolean, subTree: BTree): BTree {
  while (!condition()) {
    yield [];
  }

  return yield* subTree;
}

function* until(condition: () => boolean, subTree: () => BTree): BTree {
  while (!condition()) {
    const result = yield* subTree();

    if (result[0] === "fail") {
      return result;
    }

    yield result[1];
  }

  return ["succeed", []];
}