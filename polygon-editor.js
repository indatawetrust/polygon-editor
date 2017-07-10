const canvas = document.querySelector('canvas'), c = canvas.getContext('2d');
let polygons = [], polygonTouch = false, startX = null, startY = null;

const pointInPolygon = (x, y, points) => {
  let i, j = points.length - 1, touch = false;

  for (i = 0; i < points.length; i++) {
    const pxi = points[i].x,
      pxj = points[j].x,
      pyi = points[i].y,
      pyj = points[j].y;

    if (
      ((pyi < y && pyj >= y) || (pyj < y && pyi >= y)) && (pxi <= x || pxj <= x)
    ) {
      if (pxi + (y - pyi) / (pyj - pyi) * (pxj - pxi) < x) {
        touch = !touch;
      }
    }
    j = i;
  }

  return touch;
};

const polygonPoints = (k, x, y) => {
  const points = [];

  for (let i = 0; i < k + 1; i++) {
    points.push({
      x: 75 * Math.sin(Math.PI * (i * (360 / k) / 180)) + x,
      y: 75 * Math.cos(Math.PI * (i * (360 / k) / 180)) + y,
    });
  }

  return points;
};

const drawPolygon = pointss => {
  c.clearRect(0, 0, 500, 500);

  const rectss = [];

  pointss.forEach(points => {
    const rects = [];
    c.save();
    c.beginPath();
    points.forEach((p, i) => {
      c.lineTo(p.x, p.y);
    });
    c.fillStyle = '#fff';
    c.fill();
    c.stroke();
    c.closePath();
    c.restore();
    points.forEach((p, i) => {
      if (i < points.length - 1) {
        c.save();
        c.translate(p.x, p.y);
        c.fillStyle = '#2c3e50';
        c.fillRect(-5, -5, 10, 10);
        c.restore();

        rects.push({
          x: p.x,
          y: p.y,
          w: 10,
          h: 10,
          index: i,
        });
      }
    });

    rectss.push(rects);
  });

  return rectss;
};

const rectForEach = (rects, x, y, down) => {
  rects.forEach((rect, i) => {
    if (down) {
      if (
        x >= rect.x &&
        x <= rect.x + rect.w &&
        y >= rect.y &&
        y <= rect.y + rect.h
      ) {
        rect.down = true;
      }
    } else {
      if (
        x >= rect.x &&
        x <= rect.x + rect.w &&
        y >= rect.y &&
        y <= rect.y + rect.h &&
        rect.down
      ) {
        rect.touch = true;
      }
    }
  });

  return rects;
};

const init = () => {
  let p1 = polygonPoints(5, 100, 100);

  let p2 = polygonPoints(3, 250, 100);
  
  let p3 = polygonPoints(6, 400, 100);

  let rects = drawPolygon([p1, p2, p3]);

  polygons.push({
    points: p1,
    rects: rects[0],
    polygonTouch: false,
  });

  polygons.push({
    points: p2,
    rects: rects[1],
    polygonTouch: false,
  });

  polygons.push({
    points: p3,
    rects: rects[2],
    polygonTouch: false,
  });

  canvas.addEventListener('mousedown', e => {
    let {clientX, clientY} = e;

    const x = clientX - 4, y = clientY - 4;

    polygons.forEach((polygon, i) => {
    	polygons[polygons.length - 1].rects = rectForEach(
        polygons[polygons.length - 1].rects,
        x,
        y,
        true,
      );
      if (pointInPolygon(x, y, polygons[i].points)) {

				const p = polygons[i];
        polygons.splice(i, 1);

        polygons.push(p);
        polygons[polygons.length - 1].polygonTouch = true;
        startX = x;
        startY = y;
      } else {
        //drawPolygon(polygonPoints(5, x, y))
      }
    });
  });

  canvas.addEventListener('mousemove', e => {
    let {clientX, clientY} = e;

    const x = clientX - 4, y = clientY - 4;

    polygons.forEach((polygon, i) => {
      polygons[i].rects = rectForEach(polygons[i].rects, x, y, false);

      const rect = polygons[i].rects.filter(r => r.touch)[0];
if (rect) {
        if (rect.index === 0) {
          polygons[i].points[0].x = x;
          polygons[i].points[0].y = y;
          polygons[i].points[polygons[i].points.length - 1].x = x;
          polygons[i].points[polygons[i].points.length - 1].y = y;
        } else {
          polygons[i].points[rect.index].x = x;
          polygons[i].points[rect.index].y = y;
        }

        drawPolygon(polygons.map(({points}) => points));
      }
      if (polygons[i].polygonTouch && !rect) {
        polygons[i].points.forEach(point => {
          point.x += x - startX;
          point.y += y - startY;
        });
        drawPolygon(polygons.map(({points}) => points));
        startX = x;
        startY = y;
      }
    });
  });

  canvas.addEventListener('mouseout', e => {
    rects.forEach(rect => {});
  });

  canvas.addEventListener('mouseup', e => {
    let {clientX, clientY} = e;

    const x = clientX - 4, y = clientY - 4;

    polygons.forEach((polygon, i) => {
      const rect = polygons[i].rects.filter(r => r.touch)[0];

      if (polygons[i].polygonTouch && !rect) {
        polygons[i].points.forEach(point => {
          point.x += x - startX;
          point.y += y - startY;
        });
        polygons[i].rects = drawPolygon(polygons.map(({points}) => points))[i];
      }

      polygons[i].polygonTouch = false;

      if (rect) {
        polygons[i].rects[rect.index].touch = false;
        polygons[i].rects[rect.index].down = false;

        if (rect.index === 0) {
          polygons[i].points[0].x = x;
          polygons[i].points[0].y = y;
          polygons[i].points[polygons[i].points.length - 1].x = x;
          polygons[i].points[polygons[i].points.length - 1].y = y;
        } else {
          polygons[i].points[rect.index].x = x;
          polygons[i].points[rect.index].y = y;
        }

        polygons[i].rects = drawPolygon(polygons.map(({points}) => points))[i];
      }
    });
  });
};

init();
