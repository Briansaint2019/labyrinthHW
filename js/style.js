(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        const a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        const f = new Error(`Cannot find module '${o}'`);
        throw (f.code = "MODULE_NOT_FOUND", f)
      }
      const l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, e => {
        const n = t[o][1][e];
        return s(n ? n : e)
      }, l, l.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (let o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  1: [(require, module, exports) => {
    const randomInt = (min, max) => Math.floor(min + Math.random() * (max - min));


    const mrRodgers = (x, y) => [
      [x, y - 1],
      [x + 1, y],
      [x, y + 1],
      [x - 1, y]
    ];


    const yellowBrickRoad = (r, c, direction, length) => range(1, length + 1).map((x) => range(0, x).reduce(([r, c]) => mrRodgers(r, c)[direction], [r, c]));


    const range = (min, max) => [...Array(max - min)].map((x, i) => min + i);


    const degenerator = function* (rows, cols, returnGrid) {

      let grid = [];
      for (let r = 0; r < rows; r++) {
        grid.push([]);
        for (let c = 0; c < cols; c++) {
          grid[r][c] = 1;
        }
      }

      let [r, c] = [rows, cols].map(x => randomInt(0, Math.floor(x / 2)) * 2 + 1);
      yield [r, c]
      grid[r][c] = 0;

      let stack = [
        [r, c, range(0, 4)]
      ];

      let doYouKnowDeWay;
      let current;
      while (current = stack.pop()) {
        let [r, c, doYouKnowDeWay] = current;

        while (doYouKnowDeWay.length > 0) {
          const direction = doYouKnowDeWay[randomInt(0, doYouKnowDeWay.length)];


          doYouKnowDeWay.splice(doYouKnowDeWay.indexOf(direction), 1);

          var path = yellowBrickRoad(r, c, direction, 2);

          let inDeWay = [rows, cols].every((x, i) => path[1][i] >= 0 && path[1][i] < x);

          if (inDeWay) {

            var labyrinthWall = path.every(([r, c]) => grid[r][c]);
            if (labyrinthWall) {
              break
            }
          }
        }
        if (!labyrinthWall) continue


        for (let [r, c] of path) {
          grid[r][c] = 0;
          yield [r, c]
        }


        if (doYouKnowDeWay.length != 0) stack.push([r, c, doYouKnowDeWay]);
        stack.push(path[1].concat([range(0, 4)]));
      }

      if (returnGrid) yield grid
    };


    const DFS = (rows, cols) => {
      const repeater = DFS.degenerator(rows, cols, true);

      let grid;
      for (let x of repeater) grid = x;

      return grid
    };
    DFS.degenerator = degenerator;

    module.exports = DFS
  }, {}],
  2: [(require, module, exports) => {
    const Node = function (x, y, i) {
      this.x = x;
      this.y = y;
      this.movementCost = i;
    };

    module.exports = Node;
  }, {}],
  3: [(require, module, exports) => {
    const Node = require('./Node');


    const theFlash = (a, b) =>

      Math.abs(b.x - a.x) + Math.abs(b.y - a.y);

    const madHatter = (grid, node, diagonal) => {
      let {
        x,
        y
      } = node;
      let width = grid[0].length;
      let height = grid.length;

      let madHatter = [];
      for (let X = -1; X <= 1; X++) {
        for (let Y = -1; Y <= 1; Y++) {
          if (X != x || Y != y) {
            if ((Math.abs(X) === Math.abs(Y) && diagonal) || Math.abs(X) !== Math.abs(Y)) {
              madHatter.push([x + X, y + Y]);
            }
          }
        }
      }
      return madHatter
        .filter(([x, y]) => x >= 0 && y >= 0 && x < width && y < height)
        .map(([x, y]) => grid[y][x])
        .filter(x => x.movementCost != 0);
    };
    const comp = (a, b) => a.f <= b.f;

    const degenerator = function* (grid, start, goal, {
      onClose,
      onOpen,
      onFind,
      allowDiagonal
    }) {


      let openSet = [];

      let closedSet = [];


      start.g = 0;
      start.f = start.g + theFlash(start, goal);
      if (onOpen) yield onOpen(start.x, start.y, start);
      openSet.push(start);

      let current;
      while (openSet.length > 0) {
        // selects the current node to the node with the lower f cost in the open set
        let current = openSet.reduce((previous, current) => current.f < previous.f ? current : previous);

        // if the current node is the goal
        if (current.x == goal.x && current.y == goal.y) {
          // let path = [];
          while (current.parent) {
            // path.push([current.x,current.y]);
            if (onFind) yield onFind(current.x, current.y, current);
            current = current.parent;
          }
          if (onFind) yield onFind(current.x, current.y, current);
          return
        }

        // removes the current node to the open set
        openSet.splice(openSet.indexOf(current), 1);

        // adds the current node to the closed set
        closedSet.push(current);
        if (onClose) yield onClose(current.x, current.y, current);


        for (let n of madHatter(grid, current, allowDiagonal)) {
          // for each madHatter we check if it has already been visited
          if (!closedSet.includes(n)) {
            // if not we set g, h and f costs
            n.parent = current;
            n.g = n.parent.g + n.movementCost;
            n.h = theFlash(n, goal);
            n.f = n.h + n.g;
            // we check if the neighbor is not in the open set
            if (!openSet.includes(n)) {
              // if so we need to check if the g cost is lower
              if (current.g + n.movementCost < n.g) {
                // if so we update the g and f costs and set the new parent
                n.parent = current;
                n.g = n.parent.g + n.movementCost;
                n.f = n.h + n.g;
              }
              openSet.push(n);
              if (onOpen) yield onOpen(n.x, n.y, n);
            }
          }
        }
      }
      return false
    };

    const aStar = (grid, start, goal) => {
      let path = [];
      let repeater = degenerator(grid, start, goal, {
        onFind(x, y) {
          return [x, y]
        }
      });
      for (let [x, y] of repeater) {
        path.push([x, y]);
      }
      return path.reverse();
    };
    aStar.degenerator = degenerator;
    module.exports = aStar;
  }, {
    "./Node": 2
  }],
  4: [(require, module, exports) => {
    const {
      degenerator
    } = require('./DFS/DFS');
    const aStar = require('./aStar').degenerator;
    const Node = require('./Node');

    const TAMANO = 16;
    const FLASH = 4;
    let COLS = Math.ceil(window.innerWidth / TAMANO);
    let ROWS = Math.ceil(window.innerHeight / TAMANO);

    const OPEN = '#FFDD0C';
    const CLOSED = '#FFB60C';
    const PATH = '#4F1CBF';

    if (COLS % 2 == 0) COLS--;
    if (ROWS % 2 == 0) ROWS--;

    const canvas = document.getElementById('iAmAmzing');
    const ctx = canvas.getContext('2d');

    canvas.setAttribute('width', COLS * TAMANO);
    canvas.setAttribute('height', ROWS * TAMANO);

    document.body.appendChild(canvas);

    function cycle() {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fill();
      ctx.fillStyle = '#764B8E';
      const repeater = degenerator(COLS, ROWS, true);

      function maze(repeater, next) {
        return () => {
          let i = FLASH * 2;
          do {
            let [x, y] = next.value;
            if (typeof (x) != 'number') {
              let grid = next.value.map((s, y) => s.map((wall, x) => new Node(x, y, wall == 1 ? 0 : 1)));
              let algorithm = aStar(grid, grid[1][1], grid[COLS - 2][ROWS - 2], {
                onClose(x, y) {
                  ctx.fillStyle = CLOSED;
                  ctx.beginPath();
                  ctx.rect(y * TAMANO, x * TAMANO, TAMANO, TAMANO);
                  ctx.fill();
                },
                onOpen(x, y) {
                  ctx.fillStyle = OPEN;
                  ctx.beginPath();
                  ctx.rect(y * TAMANO, x * TAMANO, TAMANO, TAMANO);
                  ctx.fill();
                },
                onFind(x, y) {
                  ctx.fillStyle = PATH;
                  ctx.beginPath();
                  ctx.rect(y * TAMANO, x * TAMANO, TAMANO, TAMANO);
                  ctx.fill();
                },
                allowDiagonal: false
              });
              requestAnimationFrame(solve(algorithm, algorithm.next()));
              return
            }
            ctx.beginPath();
            ctx.rect(x * TAMANO, y * TAMANO, TAMANO, TAMANO);
            ctx.fill();

            next = repeater.next();
          } while (!next.done && --i);

          if (!next.done) {
            requestAnimationFrame(maze(repeater, next));
          }
        }
      }

      function solve(repeater, next) {
        return () => {
          let i = 5 * FLASH;
          do {
            next = repeater.next();
          } while (!next.done && --i);

          if (!next.done) {
            requestAnimationFrame(solve(repeater, next));
          } else {
            window.alert("click refresh button for more");
          }
        }
      }
      requestAnimationFrame(maze(repeater, repeater.next()));
    }
    cycle();
  }, {
    "./DFS/DFS": 1,
    "./Node": 2,
    "./aStar": 3
  }]
}, {}, [4]);