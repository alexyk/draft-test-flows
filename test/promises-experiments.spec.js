let log = console.log;
let l = console.log;
let elog = console.error;
const NO_LOGGING = true;

if (NO_LOGGING) {
  log = () => {}
  elog = () => {}
}

describe('chained promises handling experiments', () => {
  const cases = [1,2,3,4,5];
  const resolves = {
    all:      [0,1,2,3, 10,11,12,13,14,15, 20,21,22,23,24,25],
    throws:   [0, 3, 10, 20, 25],
    resolves: [1, 21, 23],
    rejects:  [2, 22, 24],
  }

  /** 
   * If testing limited amount of cases
   *    format 1 -> [ cases, resolveCases ]
   *    format 2 -> [  [caseNo-1, resolveCase-1], ... ]
   */
  const limit1 = [[4],[]];
  const limit2 = [[4,2]];
  const limit = [] //limit1;


  // run the test cases
  if (limit.length > 0 && limit[0].length == 2) {
    for (let l of limit) {
      const c = l[0],
            r = l[1];
      test( `case ${c}/${r}`, () => runCase(c, r), 300 );
    }
  } else {
    for (let c of cases) {
      for (let r of resolves) {
        if (limit.length > 0) {
          const [cases, resolveCases] = limit;
          if (cases.length > 0 && !cases.includes(c)) continue;
          if (resolveCases.length > 0 && !resolveCases.includes(r)) continue;
        }
        test( `case ${c}/${r}`, () => runCase(c, r), 300 );
      }
    }
  }

  function runCase(caseNo, resolveCase) {
    let assertionsCount = 0;

    if (resolveCase != 0) {
      assertionsCount = 1;

      if (!checkResolves([1,2,3,10], resolveCase)) {
        assertionsCount = 2;

        if (resolveCase != 20) {
          assertionsCount = 3;
        }
      }
    }

    if (caseNo == 1 && resolveCase == 10) assertionsCount = 1;

    log(`Running Case ${caseNo}/${resolveCase}`)

    let resolve1, reject1;

    const p1 = () => new Promise(h1);

    const h1 = (resolve, reject) => {
      resolve1 = resolve;
      reject1 = reject;
      log(`    [case ${caseNo}/${resolveCase}] handle 1`);

      if (resolveCase == 0) throw new Error(`[case ${caseNo}/${resolveCase}] throw at level 0`)

      expect.assertions( assertionsCount );

      expect (1)                                .toBe(1);

      switch (resolveCase) {
        case 1:
          return resolve1(`[case ${caseNo}/${resolveCase}] resolve 1 at level 1`)
        case 2:
          return reject1(`[case ${caseNo}/${resolveCase}] reject 1 at level 1`)
        case 3:
          throw new Error(`[case ${caseNo}/${resolveCase}] throw at level 1`)
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
          return new Promise(h2);
      }
    }

    const h2 = (resolve2, reject2) => {
      log(`    [case ${caseNo}/${resolveCase}] handle 2`);
      if (resolveCase == 10) throw new Error(`[case ${caseNo}/${resolveCase}] throw at level 2.1`)

      expect (1)                                .toBe(1);

      return setTimeout(() => {
        log(`    [case ${caseNo}/${resolveCase}] handle 2 - setTimeout`);

        if (resolveCase == 20) throw new Error(`[case ${caseNo}/${resolveCase}] throw at level 2.2`)

        expect (1)                                .toBe(1);

        switch (resolveCase) {
          case 10:
          case 21:
            return resolve1(`[case ${caseNo}/${resolveCase}] resolve 1 at level 2`)
          case 11:
          case 22:
            return reject1(`[case ${caseNo}/${resolveCase}] reject 1 at level 2`)
          case 13:
          case 23:
            return resolve2(`[case ${caseNo}/${resolveCase}] resolve 2 at level 2`)
          case 14:
          case 24:
            return reject2(`[case ${caseNo}/${resolveCase}] reject 2 at level 2`)
          case 12:
          case 15:
          case 25:
            throw new Error(`[case ${caseNo}/${resolveCase}] throw at level 2`)
        }

      }, 100)
    }

    switch (caseNo) {
      case 1:
        return p1()
                .then()
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 1: ${error.message}`))
      case 2:
        return p1()
                .then()
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 1: ${error.message}`))
                .then()
      case 3:
        return p1()
                .then()
                .then()
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 2: ${error.message}`))
      case 4:
        return p1()
                .then()
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 1: ${error.message}`))
                .then()
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 2: ${error.message}`))
      case 5:
        return p1()
                .then()
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 1: ${error.message}`))
                .catch(error => elog(`    [case ${caseNo}/${resolveCase}] catch at level 2: ${error.message}`))
    }
  }

  function checkCases(cases, compareCase) {
    return (
      cases.length == 0 
      || cases.includes(compareCase)
    )
  }

  function checkResolves(resolves, compareResolve) {
    return (
        resolves.length == 0
        || resolves.includes(compareResolve)
    )
  }
});