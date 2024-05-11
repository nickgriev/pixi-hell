import {
  Application,
  Assets,
  Container,
  DisplacementFilter,
  Graphics,
  Sprite,
  Ticker,
} from 'pixi.js';
import displacementImage from './displace.jpg';
import './style.css';

const appElement = document.querySelector<HTMLDivElement>('#app')!;

const app = new Application();

await app.init({
  antialias: false,
  width: 160,
  height: 90,
  backgroundColor: 'black',
});

function resize() {
  if (document.body.clientWidth / 16 > document.body.clientHeight / 9) {
    app.canvas.style.width = 'auto';
    app.canvas.style.height = '100%';
  } else {
    app.canvas.style.width = '100%';
    app.canvas.style.height = 'auto';
  }
}

resize();
document.body.onresize = () => {
  resize();
};

appElement.appendChild(app.canvas);

const backgroundContainer = new Container({
  isRenderGroup: true,
});
app.stage.addChild(backgroundContainer);
await Assets.load(displacementImage);
const displacementSprite = Sprite.from(displacementImage);
const blur = new DisplacementFilter({
  sprite: displacementSprite,
  scale: 3,
});

let circle = new Graphics().circle(0, 0, 2).fill('white');

circle.filters = [blur];

backgroundContainer.filters = [blur];

app.stage.addChild(circle);

let mousePosition = { x: 0, y: 0 };
app.canvas.addEventListener('mousemove', (event) => {
  // canvas is upscaled, so we need to scale the mouse position
  const scaleX = app.canvas.width / app.canvas.offsetWidth;
  const scaleY = app.canvas.height / app.canvas.offsetHeight;
  mousePosition = {
    x: event.offsetX * scaleX,
    y: event.offsetY * scaleY,
  };
});

let isMouseDown = false;
app.canvas.addEventListener('mousedown', () => {
  isMouseDown = true;
});
app.canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

let elapsedTime = 0;
app.ticker.add((ticker) => {
  elapsedTime += ticker.deltaTime;
  circle.position.set(mousePosition.x, mousePosition.y);

  if (isMouseDown) {
    // dark hellish red
    const redColor = 0x7f0000;
    const newCircle = new Graphics().circle(0, 0, 2).fill(redColor);
    newCircle.position.set(mousePosition.x, mousePosition.y);
    backgroundContainer.addChild(newCircle);

    // some circles should drip down like blood
    const dripChance = 0.15;
    if (Math.random() < dripChance) {
      const dripCallback = (ticker: Ticker) => {
        newCircle.position.y += 0.1 * ticker.deltaTime;
        newCircle.position.x += (Math.random() - 0.5) * 1 * ticker.deltaTime;
        if (newCircle.position.y > app.canvas.height) {
          backgroundContainer.removeChild(newCircle);
        }

        if (Math.random() < 0.1) {
          const drip = new Graphics().circle(0, 0, 2).fill(redColor);
          drip.position.set(newCircle.position.x, newCircle.position.y);
          backgroundContainer.addChild(drip);
        }

        if (Math.random() < 0.005) {
          app.ticker.remove(dripCallback);
        }
      };

      app.ticker.add(dripCallback);
    }
  }
});
