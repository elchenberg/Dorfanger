window.onload = function() {
  'use strict';
  var canvas, context, drawMap, drawPlayer, drawPlayers, gameloop, getContext, getTile, initializePlayers, input, keyHandler, map, newMap, newTiles, player, pointHandler, prepareCanvas, updatePlayers;
  pointHandler = function(event) {
    var scale, x, y;
    event.preventDefault();
    x = void 0;
    y = void 0;
    scale = canvas.foreground.offsetWidth / canvas.foreground.width;
    if (event.type === 'touchstart') {
      input.type = 'touch';
      x = event.targetTouches[0].pageX - canvas.foreground.offsetLeft;
      y = event.targetTouches[0].pageY - canvas.foreground.offsetTop;
    } else {
      input.type = 'click';
      x = event.layerX;
      y = event.layerY;
    }
    input.update = true;
    input.target = {
      column: Math.floor(x / map.tilesize / scale),
      row: Math.floor(y / map.tilesize / scale)
    };
    input.change = {
      column: NaN,
      row: NaN
    };
    if (!input.focus) {
      input.focus = false;
    }
    if (!input.player && input.player !== 0) {
      input.player = NaN;
    }
  };
  keyHandler = function(event) {
    var key, result;
    key = event.key.toLowerCase();
    result = {
      arrowleft: [0, -1, 0],
      arrowup: [0, 0, -1],
      arrowright: [0, 1, 0],
      arrowdown: [0, 0, 1],
      w: [1, 0, -1],
      a: [1, -1, 0],
      s: [1, 0, 1],
      d: [1, 1, 0],
      t: [2, 0, -1],
      f: [2, -1, 0],
      g: [2, 0, 1],
      h: [2, 1, 0],
      i: [3, 0, -1],
      j: [3, -1, 0],
      k: [3, 0, 1],
      l: [3, 1, 0]
    };
    if (result[key]) {
      event.preventDefault();
      input.update = true;
      input.type = 'key';
      input.focus = true;
      input.player = result[key][0];
      input.change = {
        column: result[key][1],
        row: result[key][2]
      };
      input.target = {
        column: NaN,
        row: NaN
      };
    }
  };
  canvas = void 0;
  context = void 0;
  input = {
    update: false
  };
  map = void 0;
  player = void 0;
  newTiles = function(columns, rows) {
    var index, tiles;
    tiles = [];
    index = columns * rows;
    while (index--) {
      tiles.push(Math.floor(10 * Math.random()));
    }
    /*
    Array.prototype.fill() not available in Firefox until version 31
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/Firefox_JavaScript_changelog#Firefox_31
    */
    index = columns;
    while (index--) {
      tiles[index] = 0;
    }
    index = columns * rows;
    while (index-- && index > columns * (rows - 1)) {
      tiles[index] = 0;
    }
    index = rows;
    while (index--) {
      tiles[index * columns] = 0;
      tiles[index * columns + columns - 1] = 0;
    }
    return tiles;
  };
  getTile = function(column, row) {
    var tile;
    tile = {};
    if (row || row === 0) {
      tile.index = map.columns * row + column;
      tile.column = column;
      tile.row = row;
    } else {
      tile.index = column;
      tile.column = tile.index % map.columns;
      tile.row = Math.floor(tile.index / map.rows);
    }
    tile.value = map.tiles[tile.index];
    tile.x = tile.column * map.tilesize;
    tile.y = tile.row * map.tilesize;
    tile.width = map.tilesize;
    tile.height = map.tilesize;
    return tile;
  };
  newMap = function(columns, rows) {
    return {
      columns: columns,
      rows: rows,
      tilesize: 64,
      width: 64 * columns,
      height: 64 * rows,
      layers: ['background', 'playground', 'foreground'],
      tiles: newTiles(columns, rows),
      spritesheet: document.getElementById('spritesheet'),
      sprite: {
        x: {
          'deciduous_tree': 0,
          'evergreen_tree': 64,
          'player': [128, 192, 256, 320]
        },
        y: 0,
        width: 64,
        height: 64
      },
      getTile: getTile
    };
  };
  map = newMap(8, 8);
  prepareCanvas = function() {
    var index, layer;
    layer = void 0;
    canvas = {};
    index = map.layers.length;
    while (index--) {
      layer = map.layers[index];
      canvas[layer] = document.getElementById(layer);
      canvas[layer].setAttribute('width', map.width);
      canvas[layer].setAttribute('height', map.height);
    }
    return canvas;
  };
  canvas = prepareCanvas();
  getContext = function() {
    var index, layer;
    layer = void 0;
    context = {};
    index = map.layers.length;
    while (index--) {
      layer = map.layers[index];
      context[layer] = canvas[layer].getContext('2d');
    }
    return context;
  };
  context = getContext();
  canvas.foreground.addEventListener('touchstart', pointHandler);
  canvas.foreground.addEventListener('click', pointHandler);
  document.addEventListener('keyup', keyHandler);
  drawMap = function() {
    var colorvalue, index, tile, treetype;
    tile = void 0;
    index = map.tiles.length;
    colorvalue = ['#6495ed', '#9acd32', '#9acd32', '#9acd32', '#9acd32', '#9acd32', '#7fa046', '#7fa046', '#7fa046', '#7fa046'];
    treetype = {
      5: 'deciduous_tree',
      9: 'evergreen_tree'
    };
    context.background.lineJoin = 'round';
    context.background.lineWidth = Math.floor(0.4 * map.tilesize);
    while (index--) {
      tile = map.getTile(index);
      context.background.fillStyle = colorvalue[tile.value];
      context.background.strokeStyle = colorvalue[tile.value];
      context.background.beginPath();
      context.background.rect(tile.x + Math.floor(0.25 * tile.width), tile.y + Math.floor(0.25 * tile.height), tile.width - Math.floor(0.5 * tile.width), tile.height - Math.floor(0.5 * tile.height));
      context.background.stroke();
      context.background.fill();
      if (treetype[tile.value]) {
        context.foreground.drawImage(map.spritesheet, map.sprite.x[treetype[tile.value]], map.sprite.y, map.sprite.width, map.sprite.height, tile.x + Math.floor(0.2 * tile.width), tile.y, tile.width, tile.height);
      }
    }
  };
  drawMap();
  initializePlayers = function(index) {
    /*
    Array.prototype.indexOf() not available in Firefox until version 25
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/Firefox_JavaScript_changelog#Firefox_25
    */
    var position, tile, value, player;
    value = 0;
    tile = void 0;
    player = [];
    position = [];
    while (value < 9 && position.length < index) {
      value++;
      tile = 0;
      while (tile <= map.tiles.length) {
        tile++;
        if (map.tiles[tile] === value) {
          position.push(tile);
          break;
        }
      }
    }
    while (index--) {
      tile = map.getTile(position[index]);
      player[index] = {
        column: tile.column,
        row: tile.row
      };
    }
    return player;
  };
  player = initializePlayers(4);
  drawPlayer = function(index) {
    var tile;
    tile = map.getTile(player[index].column, player[index].row);
    context.playground.drawImage(map.spritesheet, map.sprite.x.player[index], map.sprite.y, map.sprite.width, map.sprite.height, tile.x, tile.y, tile.width, tile.height);
  };
  drawPlayers = function() {
    var index;
    index = player.length;
    while (index--) {
      drawPlayer(index);
    }
  };
  drawPlayers();
  updatePlayers = function() {
    var end, index, start;
    index = void 0;
    start = void 0;
    end = void 0;
    if (input.update) {
      if (input.type !== 'key') {
        index = player.length;
        while (index--) {
          if (input.target.column === player[index].column && input.target.row === player[index].row) {
            input.focus = true;
            input.player = index;
            break;
          }
        }
        if (input.focus && Math.abs(input.target.column - player[input.player].column) <= 1 && Math.abs(input.target.row - player[input.player].row) <= 1) {
          input.change = {
            column: input.target.column - player[input.player].column,
            row: input.target.row - player[input.player].row
          };
        }
      }
      if (input.focus && (input.change.column || input.change.row)) {
        start = map.getTile(player[input.player].column, player[input.player].row);
        end = map.getTile(player[input.player].column + input.change.column, player[input.player].row + input.change.row);
        if (end.value) {
          context.playground.clearRect(start.x, start.y, start.width, start.height);
          player[input.player] = {
            column: end.column,
            row: end.row
          };
          drawPlayers();
          drawPlayer(input.player);
        }
      }
      input.update = false;
      input.change = {
        column: NaN,
        row: NaN
      };
      input.target = {
        column: NaN,
        row: NaN
      };
    }
  };
  gameloop = function() {
    if (input.update) {
      updatePlayers();
    }
    window.requestAnimationFrame(gameloop);
  };
  window.requestAnimationFrame(gameloop);
};
