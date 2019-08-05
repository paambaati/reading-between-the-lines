# Notes
Candidate Name: Ganesh "GP" Prasannah

Tasks: `#2`, `#3` (Backend API)

Time: `~2.5 hours`

Notes:

1. `~2 hours` for code (including tests & fixtures).
2. `~30 minutes` for notes.


#### Key motivations

1. Write production-ready code

    a) Clean & reusable code.

    b) Very few and lean runtime dependencies.

    c) Thoroughly tested (with code coverage).

    d) CI builds via Travis!

    e) Well-documented functions & types.

    f) Super-fast logs (JSON by default but can be formatted to any format at zero cost thanks to [`pino`'s transports](https://github.com/pinojs/pino/blob/master/docs/transports.md)).

    g) Migration-ready DB code.

    h) Git hooks to enforce code formatting.

#### Developer notes

1. Assumptions in monthly usage calculation

    a) Simple linear interpolation is used to calculate end-of-month energy usage; The implementation is based on this formula from https://wikihow.com/Interpolate —

    ![](linear-interpolation.svg)

    b) Interpolated cumulative reading is simply rounded off with `Math.round()`.

    c) Usage is set to `0` for the first month.

2. `Readings` class design

    a) All meter readings-related core logic (interpolation, usage calculation, persistence, etc.) encapsulated in `Readings` class. This helps keeping all related future logic in the same class, making scaling and testing easier.

    b) All class methods are `static` as there's no "state" or data-sharing as such. As the code grows and there's a need for any kind of state (say, a particular user's readings) or caching, they can be turned to regular methods.

3. Dependency choices

    a) `tape` for tests instead of `mocha` + `chai` because —

        i) Mocha requires a 'test runner', while tape tests can be run as standalone files. This forces us to write lean, independent tests that are clean to read and easy to run.

        ii) Mocha pollutes the globals with too many 'magic' functions, which are harder to reason about.

        iii) The very bare-bones nature of tape forces developers to write pure functions as much as possible, without side-effects.

        iv) tape comes bundled with a few simple assertions that (IMHO) are enough in most cases (including this exercise). 

    b) `date-fns` for Date manipulation instead of `momentjs` because —

        i) MomentJS mutates the original object, and I personally prefer libraries that don't. This helps write pure functions.

        ii) Moment is also much heavier (especially on the browser) and I prefer leaner libraries.

    c) `koa-tree-router` instead of `koa-router` because `koa-router` was [suspiciously transferred to an unknown user](https://news.ycombinator.com/item?id=19156707). Also, `koa-tree-router` is leaner and [faster](https://github.com/delvedor/router-benchmark).

    d) `better-sqlite3-helper` for DB instead of `sqlite3` because —

        i) It is a thin wrapper over better-sqlite3, which is vastly faster than sqlite3 in most cases.

        ii) Support for migrations, which is super-helpful as the DB evolves.

4. Code coverage is included. Run —

    ```
    yarn coverage
    ```

5. A [Postman](https://www.getpostman.com/) collection is included for the APIs as I tested them. Open Postman and use File → Import to import [`api.postman_collection.json`](https://raw.githubusercontent.com/paambaati/reading-between-the-lines/master/api.postman_collection.json)
