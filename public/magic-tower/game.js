/* 魔塔闯关小游戏逻辑（纯原生 JS，无第三方依赖） */
(function (global) {
  "use strict";

  var DATA = global.MagicTowerData;
  var DIRS = {
    ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
    W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
  };

  function cloneGrid(floor) {
    return floor.grid.map(function (row) { return row.split(""); });
  }

  function createGame() {
    var game = {
      floorIndex: 0,
      grids: DATA.FLOORS.map(cloneGrid),
      rows: DATA.FLOORS[0].grid.length,
      cols: DATA.FLOORS[0].grid[0].length,
      player: { hp: DATA.PLAYER_START.hp, atk: DATA.PLAYER_START.atk, def: DATA.PLAYER_START.def, r: 0, c: 0 },
      keys: { yellow: 0, blue: 0, red: 0 },
      won: false,
      message: "欢迎来到魔塔！方向键移动。",
    };
    for (var r = 0; r < game.rows; r++) {
      for (var c = 0; c < game.cols; c++) {
        if (game.grids[0][r][c] === "@") {
          game.player.r = r;
          game.player.c = c;
          game.grids[0][r][c] = ".";
        }
      }
    }
    return game;
  }

  /* 数值战斗：返回 null 表示无法击败，否则返回本次战斗损失的生命 */
  function battleCost(playerAtk, playerDef, playerHp, monster) {
    var playerHit = playerAtk - monster.def;
    var monsterHit = monster.atk - playerDef;
    if (playerHit <= 0 && monsterHit > 0) return null;
    if (monsterHit <= 0) return 0;
    var rounds = Math.ceil(monster.hp / playerHit);
    var cost = (rounds - 1) * monsterHit;
    if (cost >= playerHp) return null;
    return cost;
  }

  function tileAt(game, r, c) {
    if (r < 0 || c < 0 || r >= game.rows || c >= game.cols) return "#";
    return game.grids[game.floorIndex][r][c];
  }

  function tryMove(game, dr, dc) {
    if (game.won) { game.message = "你已经通关了！按 Enter 重新开始。"; return; }
    var r = game.player.r + dr;
    var c = game.player.c + dc;
    var tile = tileAt(game, r, c);
    var setTile = function (ch) { game.grids[game.floorIndex][r][c] = ch; };
    switch (tile) {
      case "#":
        game.message = "撞到墙了，不能通过。";
        return;
      case ".":
      case "@":
        break;
      case "y": case "b": case "r":
        game.keys[DATA.KEYS[tile]] += 1;
        setTile(".");
        game.message = "拾取了钥匙。";
        break;
      case "Y": case "B": case "R":
        var color = DATA.DOORS[tile];
        if (game.keys[color] > 0) {
          game.keys[color] -= 1;
          setTile(".");
          game.message = "用钥匙打开了门。";
        } else {
          game.message = "门锁着，需要对应的钥匙。";
          return;
        }
        break;
      case "p": case "P": case "a": case "d":
        var item = DATA.ITEMS[tile];
        if (item.hp) game.player.hp += item.hp;
        if (item.atk) game.player.atk += item.atk;
        if (item.def) game.player.def += item.def;
        setTile(".");
        game.message = "拾取了" + item.name + "（" +
          (item.hp ? "生命+" + item.hp : item.atk ? "攻击+" + item.atk : "防御+" + item.def) + "）。";
        break;
      case "1": case "2": case "3":
        var monster = DATA.MONSTERS[tile];
        var cost = battleCost(game.player.atk, game.player.def, game.player.hp, monster);
        if (cost === null) {
          game.message = "打不过" + monster.name + "，无法挑战！";
          return;
        }
        game.player.hp -= cost;
        setTile(".");
        game.message = "击败了" + monster.name + "，损失 " + cost + " 点生命。";
        if (tile === "3" && game.floorIndex === DATA.FLOORS.length - 1) {
          game.won = true;
          game.message = "击败了顶层守卫，恭喜通关！";
          return;
        }
        break;
      case "U":
        if (game.floorIndex < DATA.FLOORS.length - 1) {
          game.floorIndex += 1;
          var stairs = findTile(game, "D");
          game.player.r = stairs.r;
          game.player.c = stairs.c;
          game.grids[game.floorIndex][stairs.r][stairs.c] = ".";
          game.message = "上到了第 " + (game.floorIndex + 1) + " 层。";
        } else {
          game.message = "已经是最顶层了。";
          return;
        }
        break;
      case "D":
        game.message = "这是下楼的楼梯，这里用不上。";
        return;
      default:
        game.message = "无法通行。";
        return;
    }
    game.player.r = r;
    game.player.c = c;
  }

  function findTile(game, ch) {
    var grid = game.grids[game.floorIndex];
    for (var r = 0; r < game.rows; r++) {
      for (var c = 0; c < game.cols; c++) {
        if (grid[r][c] === ch) return { r: r, c: c };
      }
    }
    return { r: 1, c: 1 };
  }

  // 导出供测试与页面共用
  var MagicTower = {
    DATA: DATA,
    createGame: createGame,
    battleCost: battleCost,
    tryMove: tryMove,
    DIRS: DIRS,
  };
  global.MagicTower = MagicTower;

  /* ---------- 页面渲染与输入（仅浏览器执行） ---------- */
  function inBrowser() {
    return typeof document !== "undefined" && document.getElementById("game");
  }

  if (inBrowser()) {
    var game = null;
    var board = document.getElementById("game");
    var el = function (id) { return document.getElementById(id); };

    function render() {
      var grid = game.grids[game.floorIndex];
      var rows = grid.length, cols = grid[0].length;
      board.style.gridTemplateColumns = "repeat(" + cols + ", 34px)";
      board.innerHTML = "";
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var isPlayer = !game.won && r === game.player.r && c === game.player.c;
          var ch = grid[r][c];
          var cls = "mt-cell mt-floor";
          if (isPlayer) cls = "mt-cell mt-player";
          else if (ch === "#") cls = "mt-cell mt-wall";
          else if (DATA.DOORS[ch]) cls = "mt-cell mt-door-" + DATA.DOORS[ch];
          else if (DATA.KEYS[ch]) cls = "mt-cell mt-key-" + DATA.KEYS[ch] + " mt-key-cell";
          else if (ch === "p" || ch === "P") cls = "mt-cell mt-potion";
          else if (ch === "a") cls = "mt-cell mt-gem-atk";
          else if (ch === "d") cls = "mt-cell mt-gem-def";
          else if (ch === "U" || ch === "D") cls = "mt-cell mt-stairs";
          else if (DATA.MONSTERS[ch]) cls = "mt-cell mt-monster";
          var cell = document.createElement("div");
          cell.className = cls;
          cell.textContent = isPlayer ? "勇" : cellText(ch);
          board.appendChild(cell);
        }
      }
      el("stat-hp").textContent = game.player.hp;
      el("stat-atk").textContent = game.player.atk;
      el("stat-def").textContent = game.player.def;
      el("stat-floor").textContent = game.floorIndex + 1 + " / " + DATA.FLOORS.length;
      el("key-yellow").textContent = game.keys.yellow;
      el("key-blue").textContent = game.keys.blue;
      el("key-red").textContent = game.keys.red;
      el("message").textContent = game.message;
    }

    function cellText(ch) {
      var icons = {
        Y: "门", B: "门", R: "门",
        y: "钥", b: "钥", r: "钥",
        p: "瓶", P: "瓶", a: "攻", d: "防",
        U: "梯", D: "梯",
        1: "史", 2: "蝠", 3: "卫",
      };
      return icons[ch] || "";
    }

    function restart() {
      game = createGame();
      render();
    }

    function handleKey(e) {
      var dir = DIRS[e.key];
      if (e.key === "Enter") { restart(); e.preventDefault(); return; }
      if (!dir) return;
      e.preventDefault();
      tryMove(game, dir[0], dir[1]);
      render();
    }

    document.addEventListener("keydown", handleKey);
    el("restart").addEventListener("click", restart);
    restart();
    board.focus();
  }
})(typeof window !== "undefined" ? window : globalThis);
