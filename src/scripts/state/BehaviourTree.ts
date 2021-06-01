import { StateDetails } from "./Agent"

export {
  failIf,
  inParallelUntilAny,
  loop,
  selector,
  sequence,
  tell,
  until,
  waitFor,
  withSideEffect,
  guard
}

type BTree = Generator<StateDetails[], "fail" | ["succeed", StateDetails[]]>

function* loop(toLoop: () => BTree): BTree {
  while (true) {
    const result = yield* toLoop();

    if (result !== "fail") {
      yield result[1];
    }
  }
}

function* inParallelUntilAny(...trees: BTree[]): BTree {
  while (true) {
    let reports: StateDetails[] = [];

    for (const tree of trees) {
      const result = tree.next();

      if (result.done && result.value !== "fail") {
        return ["succeed", reports.concat(result.value[1])];
      } else if (!result.done) {
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
    if (result === "fail") {
      return result;
    }

    if (trees.length === 0) {
      return result;
    }

    if (result[1].length > 0) {
      yield result[1];
    }
  }
}

function* selector(...trees: BTree[]): BTree {
  while (true) {
    const tree = trees.shift();
    if (tree === undefined) {
      return "fail";
    }

    const result = yield* tree;
    if (trees.length === 0) {
      return result;
    }

    if (result !== "fail") {
      return result;
    }
  }
}

// eslint-disable-next-line require-yield
function* tell(tell: StateDetails[] | (() => StateDetails[])): BTree {
  return ["succeed", Array.isArray(tell) ? tell : tell()];
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

    if (result === "fail") {
      return result;
    }

    yield result[1];
  }

  return ["succeed", []];
}

function* failIf(condition: () => boolean): BTree {
  while (!condition()) {
    yield [];
  }

  return "fail";
}

function* guard(condition: () => boolean, subtree: BTree): BTree {
  if (condition()) {
    return yield* subtree;
  }

  return "fail";
}