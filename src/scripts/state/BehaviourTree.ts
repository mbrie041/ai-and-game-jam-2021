import { StateReport } from "./Agent"

export {
  inParallelUntilAny,
  loop,
  selector,
  sequence,
  tell
}

type BTree = Generator<StateReport[], ["succeed" | "fail", StateReport[]]>

function* loop(toLoop: () => BTree): BTree {
  while (true) {
    const result = yield* toLoop();
    yield result[1];
  }
}

function* inParallelUntilAny(...trees: BTree[]): BTree {
  while (true) {
    const reports: StateReport[] = [];

    for (const tree of trees) {
      const result = tree.next();
      if (result.done) {
        reports.concat(result.value[1]);
        return [result.value[0], reports];
      } else {
        reports.concat(result.value);
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
function* tell(tell: [StateReport]): BTree {
  return ["succeed", tell];
}