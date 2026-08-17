### Example: Start a Phaser State

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Demonstrates the practical application of starting a game state. This snippet shows how to activate the 'firstState' in the 'pacman' game, making it the currently active state.

```javascript
pacman.state.start('firstState');
```

--------------------------------

### Define and Start Multiple Phaser Game States

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

This JavaScript example demonstrates how to initialize a Phaser game instance, define multiple game states (Boot, Preloader, MainMenu, Game), and then sequentially start them. This pattern is useful for setting up the initial flow of a Phaser game, handling different stages like loading assets and presenting menus.

```javascript
var pacman = new Phaser.Game(1024, 768, Phaser.AUTO, 'gameContainer');
pacman.state.add('Boot', BasicGame.Boot);
pacman.state.add('Preloader', BasicGame.Preloader);
pacman.state.add('MainMenu', BasicGame.MainMenu);
pacman.state.add('Game', BasicGame.Game);
pacman.state.start('Boot').start('MainMenu').start('Game');
```

--------------------------------

### Create Audio Instances in Phaser (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Audio

This example shows how to create audio instances from preloaded assets in Phaser. `game.add.audio` is used to get an audio object, optionally setting initial volume and loop properties directly during creation. The first example creates a single-play instance, while the second creates a looping instance.

```javascript
var my_music = game.add.audio("my_music")
var my_music_loop = game.add.audio("my_music", 1, true)
```

--------------------------------

### Example: Add a Phaser State

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Provides a concrete example of adding a previously defined state, 'State1', to a 'pacman' game instance. The state is registered under the key 'firstState' for subsequent activation.

```javascript
pacman.state.add('firstState' , State1);
```

--------------------------------

### Configure and Control Phaser Tweens with advanced options and callbacks

Source: https://github.com/phaserjs/phaser/wiki/Tween

This code demonstrates various methods to configure and control a Phaser tween. It shows how to set target properties (x, y, alpha, angle), duration, easing, auto-start, delay, and yoyo. It also illustrates how to start, stop, repeat, pause, resume, and attach event callbacks (onComplete, onStart, onUpdate) to the tween.

```javascript
tween_ball.to({x:100, y:0, alpha: 0, angle: 0}, 2000, Phaser.Easing.Bounce.In, true, 100, false)
//x,y,alpha, angle, duration, easing, autostart?, delay, yoyo?
tween_ball.start(1000) // delay?
tween_ball.stop()
tween_ball.repeat(2) //repear tween 2 times
tween_ball.onComplete.add(callback) // callback will be called each time the onComplete signal is dispatched
tween_ball.onStart.add(callback)
tween_ball.onUpdate.add(callback)
tween_ball.onComplete.addOnce(callback) // callback will be called only the first time the onComplete signal is dispatched
tween_ball.onStart.addOnce(callback)
tween_ball.onUpdate.addOnce(callback)
tween_ball.pause() // pauses the tween
tween_ball.resume() // resumes the tween
```

--------------------------------

### Install Phaser using npm

Source: https://github.com/phaserjs/phaser/blob/master/README.md

This command installs the Phaser game framework into your project using Node Package Manager (npm). It adds Phaser as a dependency, allowing you to import and use it in your JavaScript or TypeScript application.

```bash
npm install phaser
```

--------------------------------

### Create a basic Phaser Tween for an object

Source: https://github.com/phaserjs/phaser/wiki/Tween

This snippet initializes a sprite object and then creates a tween instance associated with it. The 'ball' image must be preloaded before use. The `game.add.sprite` method adds the object to the game world, and `game.add.tween` prepares it for animation.

```javascript
var ball = game.add.sprite(300, 0, "ball"); // you have to preload ball image first
var tween_ball = game.add.tween(ball); // init tween for ball object
```

--------------------------------

### Create a Phaser Game with Inline Initial State

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Illustrates how to instantiate a Phaser game and define its initial state directly within the constructor. The example uses an object literal to provide 'create' and 'update' functions, which serve as the primary lifecycle hooks for the game's starting logic.

```javascript
var pacman = new Game(640, 480, Phaser.AUTO, "mygame", {create: gameDefinitions, update: gameLoop});
function gameDefinitions() { /* object initializations here */ }
function gameLoop() { /* movements, collisions, rendering here */ }
```

--------------------------------

### Create and Play a Phaser Timeline with an Initial Event

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Timeline.md

This example shows how to instantiate a Phaser Timeline with a configuration object that defines an initial event. The event is scheduled to run at 1000ms, adding a sprite to the scene. After creation, the `play()` method is called to start the timeline.

```js
const timeline = this.add.timeline({
    at: 1000,
    run: () => {
        this.add.sprite(400, 300, 'logo');
    }
});

timeline.play();
```

--------------------------------

### Implement a basic Phaser Tween with an onComplete callback

Source: https://github.com/phaserjs/phaser/wiki/Tween

This example demonstrates creating a simple vertical tween for a ball sprite and attaching a callback function that executes once the tween animation finishes. The `tweenFinished` function will display an alert when the ball reaches its target position.

```javascript
var ball = game.add.sprite(300, 0, "ball"); // you have to preload ball image first
var tween_ball = game.add.tween(ball); // init tween for ball object
tween_ball.to({y: 300}, 1000, Phaser.Easing.Bounce.In); // define tween
tween_ball.onComplete.add(tweenFinished, this); // define function which will be called when tween ends
tween_ball.start() // start tween

function tweenFinished {
   alert("tween finished")
}
```

--------------------------------

### Implement Basic Phaser Camera3D Plugin Scene

Source: https://github.com/phaserjs/phaser/blob/master/plugins/camera3d/readme.md

This comprehensive JavaScript example illustrates the fundamental usage of the Camera 3D plugin within a Phaser game. It includes a Phaser game configuration, preloading assets, initializing the 3D camera, creating 3D objects, and applying transformations in the update loop.

```javascript
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var camera;
var transform;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.scenePlugin('Camera3DPlugin', 'plugins/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');

    this.load.image('particle', 'assets/sprites/mushroom2.png');
}

function create ()
{
    camera = this.cameras3d.add(85).setZ(300).setPixelScale(128);

    var sprites = camera.createRect({ x: 4, y: 4, z: 16 }, { x: 48, y: 48, z: 32 }, 'particle');

    //  Our rotation matrix
    transform = new Phaser.Math.Matrix4().rotateX(-0.01).rotateY(-0.02).rotateZ(0.01);
}

function update ()
{
    camera.transformChildren(transform);
}
```

--------------------------------

### Phaser Basic Game Structure (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Game

Illustrates the fundamental functions for organizing a Phaser game: `gameDefinitions` for initial setups and `gameLoop` for continuous game logic like movements, collisions, and rendering. These functions provide a basic template for game development in Phaser.

```javascript
function gameDefinitions() { /* object initializations here */ }
function gameLoop() { /* movements, collisions, rendering here */ }
```

--------------------------------

### Start a Phaser Game State

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Details how to activate a registered game state using its unique key. This action initiates the state's lifecycle, causing its 'preload', 'create', and 'update' methods to be called in sequence.

```javascript
game.state.start(key);
```

--------------------------------

### Add and Play Sprite Sheet Animation in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Adds an animation sequence to a sprite sheet and then plays it. The `add` method defines the animation, and `play` starts it with specified frame rate and loop options.

```javascript
my_spritesheet.animations.add("walk")
my_spritesheet.animations.play("walk", 20, true);
```

--------------------------------

### Create a looping Phaser Tween animation

Source: https://github.com/phaserjs/phaser/wiki/Tween

This snippet illustrates how to make a tween animation loop continuously. After defining the tween's target and duration, the `tween_ball.loop()` method is called to ensure the animation repeats indefinitely once started. The ball will smoothly move to the Y position 300 and then immediately restart.

```javascript
var ball = game.add.sprite(300, 0, "ball"); // you have to preload ball image first
var tween_ball = game.add.tween(ball); // init tween for ball object
tween_ball.to({y: 300}, 1000, Phaser.Easing.Bounce.In);
tween_ball.loop();
tween_ball.start();
```

--------------------------------

### Listen for Phaser Particle Emitter Lifecycle Events (JavaScript)

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

Demonstrates how to listen for the five new events fired by a Phaser Particle Emitter: 'start', 'explode', 'deathzone', 'stop', and 'complete'. These events provide callbacks at different stages of the particle emission and lifecycle, allowing for fine-grained control and interaction.

```js
const emitter = this.add.particles(0, 0, 'flares');

emitter.on('start', (emitter) => {
    //  emission started
});

emitter.on('explode', (emitter, particle) => {
    //  emitter 'explode' called
});

emitter.on('deathzone', (emitter, particle, deathzone) => {
    //  emitter 'death zone' called
});

emitter.on('stop', (emitter) => {
    //  emission has stopped
});

emitter.on('complete', (emitter) => {
    //  all particles fully dead
});
```

--------------------------------

### Conditionally Start Phaser Game States

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

This JavaScript snippet illustrates how to conditionally transition between different Phaser game states based on an internal condition. It allows for dynamic navigation within the game's state machine, such as switching to 'state_A' or 'state_B' depending on game logic.

```javascript
if (internal_state_condition) 
  { game.state.start('state_A') ; }
else 
  { game.state.start('state_B') ;}
```

--------------------------------

### Create a Basic Phaser Timeline Instance

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/Timeline.md

This snippet demonstrates how to create a new instance of the Timeline class in Phaser 3.60 using the `add.timeline()` factory method. The Timeline always starts in a paused state and requires an explicit call to `play()` to begin its sequence.

```js
const timeline = this.add.timeline();
```

--------------------------------

### Create Phaser Matter Game Object with Wrap Bounds (JavaScript)

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.85/MatterWrapBounds.md

This JavaScript example shows how to create a Matter game object, such as an image, and directly apply the previously defined `wrapBounds` during its instantiation. By passing the `wrapBounds` object in the configuration, the game object will automatically exhibit wrapping behavior within the specified boundaries.

```javascript
    const gameObject = this.matter.add.image(x, y, 'key', null, {
        wrapBounds: wrapBoundary 
    });
```

--------------------------------

### Load and Add Shader in Phaser 3

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.17/CHANGELOG-v3.17.md

This example demonstrates how to load a GLSL shader file during the preload phase using `this.load.glsl` and then instantiate it as a new Shader Game Object in the Phaser 3 scene during the create phase with `this.add.shader`, specifying its position and dimensions.

```javascript
function preload ()
{
    this.load.glsl('fire', 'shaders/fire.glsl.js');
}
 
function create ()
{
    this.add.shader('fire', 400, 300, 512, 512);
}
```

--------------------------------

### Create Phaser Game with Inline State and Lifecycle Functions (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Game

This snippet shows how to initialize a Phaser Game object while defining an inline state, specifically overriding the 'create' and 'update' lifecycle functions. The 'create' function ('gameDefinitions') is intended for initial setup and object instantiation, while the 'update' function ('gameLoop') handles continuous game logic during each frame.

```javascript
var pacman = new Game(640, 480, Phaser.AUTO, "mygame", {create: gameDefinitions, update: gameLoop});
```

--------------------------------

### Draw Line in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Draws a single line segment between two points. The `moveTo` method sets the starting point, and `lineTo` draws to the end point.

```javascript
shape.moveTo(30, 30);
shape.lineTo(600, 300);
```

--------------------------------

### Configure Phaser Particle Emitter to Cycle Animations with Quantity

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

Beyond simple cycling, you can specify a `quantity` for each animation in the cycle. This example will emit 10 'prism' particles, then 10 'ruby' particles, and then repeat the sequence. Animations must be pre-created in the Global Animation Manager and share the emitter's texture.

```javascript
const emitter = this.add.particles(400, 300, 'gems', {
    anim: { anims: [ 'prism', 'ruby' ], cycle: true, quantity: 10 }
    ...
});
```

--------------------------------

### Phaser Easing Functions for tween animations

Source: https://github.com/phaserjs/phaser/wiki/Tween

This snippet lists various easing functions available in Phaser for creating different animation effects. Easing functions control the rate of change of an animation over time, allowing for smooth, bouncy, or linear transitions. These examples cover linear, bounce, cubic, and quadratic easing types.

```javascript
Phaser.Easing.Linear.None
Phaser.Easing.Bounce.In
Phaser.Easing.Bounce.Out
Phaser.Easing.Cubic.Out
Phaser.Easing.Quadratic.InOut
```

--------------------------------

### Draw Custom Polygon Shape in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Draws a custom multi-segment shape. Uses `moveTo` for the starting point and multiple `lineTo` calls to define segments, finally using `endFill()` to close and fill the shape.

```javascript
shape.moveTo(30, 30);
shape.lineTo(250, 50);
shape.lineTo(100, 100);
shape.lineTo(250, 220);
shape.endFill();
```

--------------------------------

### Add a Single Sprite to a Phaser Group (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Groups

This example demonstrates how to declare and create a Phaser Group, then add a single sprite to it. The `create` method of the group adds a new sprite, positioning it at a random X-coordinate and fixed Y-coordinate using the 'robot1' asset.

```Javascript
var maingroup;
maingroup = game.add.group();
var robot01 = maingroup.create(game.world.randomX, 100, 'robot1');
```

--------------------------------

### Add a Phaser State to the Game

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Explains how to register a custom Phaser State object with the game's state manager. This method requires a unique string 'key' to identify the state, allowing it to be referenced and started later within the game.

```javascript
game.state.add(key , State_object);
```

--------------------------------

### Configure Phaser.js Sprite Properties (Health, Scale)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Sprites

Sets various properties for an instantiated Phaser sprite, such as its health and visual scale. This example assigns a health value of 50 to the `player` and uniformly scales its width and height by 1.5. These properties are usually set during the game's `create` phase.

```javascript
player.health = 50;   // simple as that really.
 player.scale.x = 1.5; // set the size/scale of the width
 player.scale.y = 1.5; // same for the height of the player
```

--------------------------------

### Access Facebook Instant Games Plugin in Phaser Scene

Source: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md

Demonstrates how to access the Facebook Instant Games plugin from within any Phaser Scene using 'this.facebook'. This example shows how to display the player's name on a text object, leveraging the plugin's properties.

```javascript
this.add.text(0, 0).setText(this.facebook.playerName);
```

--------------------------------

### Add Multiple Emit Zones to a Phaser Particle Emitter (JavaScript)

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

Illustrates how to add multiple emission zones to a Phaser Particle Emitter using the `addEmitZone` method. Particles will cycle through these zones sequentially. This example creates a circular emission zone.

```js
const circle = new Phaser.Geom.Circle(0, 0, 160);

const emitter = this.add.particles(400, 300, 'metal');

emitter.addEmitZone({ type: 'edge', source: circle, quantity: 64 });
```

--------------------------------

### Phaser DataManager: Accessing and Modifying Single Values

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md

These examples demonstrate how to set a single value in the Phaser DataManager using `data.set()` and then access or modify it directly via the new `data.values` property, enabling conditional evaluations and direct updates.

```javascript
data.set('gold', 50)
```

```javascript
data.values.gold
```

```javascript
if (data.values.level === 2)
```

```javascript
data.values.gold += 50
```

--------------------------------

### Tween a Wipe Effect on a Phaser Container

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/FX.md

This example shows how to apply a Wipe effect to a Phaser Container and then animate its progress using a tween. The wipe effect's 'progress' property is tweened from 0 to 1, causing the effect to play out.

```javascript
const fx = container.postFX.addWipe();

this.tweens.add({
    targets: fx,
    progress: 1
});
```

--------------------------------

### Enable Phaser.js Sprite Collision with World Bounds

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Sprites

Enables collision detection for a sprite's physics body with the defined boundaries of the game world. Setting `collideWorldBounds` to `true` ensures the sprite remains within the visible game area and does not fall off the screen. This is an important setup step, usually placed in the `create` function.

```javascript
player.body.collideWorldBounds = true;
```

--------------------------------

### Create Phaser Particle Emitter (3.60+)

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

In Phaser 3.60 and later, a ParticleEmitter is created directly by calling `this.add.particles`. This method returns a `ParticleEmitter` instance, which is a `GameObject` and can be manipulated directly. This example creates an emitter at (100, 300) using 'flares' texture and 'red' frame, with specific angle and speed for emitted particles.

```javascript
const emitter = this.add.particles(100, 300, 'flares', {
    frame: 'red',
    angle: { min: -30, max: 30 },
    speed: 150
});
```

--------------------------------

### Embed Phaser Game in Specific HTML Element (HTML, JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Game

This example illustrates how to embed a Phaser game within a specific HTML div element using the 'parent' parameter. The HTML code provides a div with the ID "mygame", and the JavaScript snippet then initializes the Phaser Game object, passing "mygame" as the 'parent' parameter to render the game canvas inside that div.

```html
<html><head><script src="phaser.js"></script></head>
<body>
  <div id="mygame"></div>
</body>
</html>
```

```javascript
var pacman = new Game(640, 480, Phaser.AUTO, "mygame");
```

--------------------------------

### Add Multiple Death Zones to a Phaser Particle Emitter (JavaScript)

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

Shows how to configure multiple death zones for a Phaser Particle Emitter using the `addDeathZone` method. Particles will be checked against all defined death zones, allowing for complex particle termination conditions. This example uses a circular death zone.

```js
const circle = new Phaser.Geom.Circle(0, 0, 160);

const emitter = this.add.particles(400, 300, 'metal');

emitter.addDeathZone({ type: 'onEnter', source: circle });
```

--------------------------------

### Tweening Particle Emitter Properties Directly in Phaser 3.60

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

This example demonstrates how to directly tween a particle emitter's `particleX` property using Phaser's tween manager. Before Phaser 3.60, this was not possible as `particleX` returned an `EmitterOp` instance instead of a numeric value. The update allows for more flexible and dynamic particle animation.

```javascript
this.tweens.add({
    targets: emitter,
    particleX: 400
});
```

--------------------------------

### Load and use TTF/OTF fonts in Phaser with FontFile

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.87/CHANGELOG-v3.87.md

This example demonstrates how to load OpenType fonts (`.otf`) directly into a Phaser game using the new `FontFile` loader in the `preload` function. Once loaded, the fonts can be applied to `Text Game Objects` in the `create` function by specifying the `fontFamily` in the text style object, eliminating the need for external font loaders or CSS.

```js
preload ()
{
    this.load.font('Caroni', 'assets/fonts/ttf/caroni.otf', 'opentype');
    this.load.font('troika', 'assets/fonts/ttf/troika.otf', 'opentype');
}

create ()
{
    this.add.text(32, 32, 'The face of the moon was in shadow.', { fontFamily: 'troika', fontSize: 80, color: '#ff0000' });
    this.add.text(150, 350, 'Waves flung themselves at the blue evening.', { fontFamily: 'Caroni', fontSize: 64, color: '#5656ee' });
}
```

--------------------------------

### Set Individual Sprite Properties When Adding to Phaser Group (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Groups

Building on the previous example, this code demonstrates how to set specific properties for each sprite as it's added to a Phaser Group within a loop. It assigns a health value of 50 and enables world bounds collision for each 'robot1' sprite, allowing for individual customization of group members.

```Javascript
maingroup = game.add.group();
for(var i=0; i < numberofBots; i++) {
  var robot01 = maingroup.create(game.world.randomX, 100, 'robot1');
  robot01.health = 50;
  robot01.collideWorldBounds = true;
  // Add animations and other sprite stuff here inside the brackets!!
}
```

--------------------------------

### Set Custom Particle Sort Order in Phaser Emitter

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

This example shows how to create a Phaser particle emitter and then use the 'setSortProperty' method to define a custom sort order for particles. In this case, particles are sorted based on their 'y' coordinate, which affects their rendering order relative to each other. This method can be called at runtime to dynamically change the sorting behavior.

```js
const emitter = this.add.particles(100, 300, 'blocks', {
    frame: 'redmonster',
    lifespan: 5000,
    angle: { min: -30, max: 30 },
    speed: 150,
    frequency: 200
});

emitter.setSortProperty('y', true);
```

--------------------------------

### Configure Phaser Particle Emitter with Relative Coordinates

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

When defining `x` and `y` coordinates within the emitter configuration object, they are treated as an offset relative to the `x` and `y` coordinates provided in the `this.add.particles` call. In this example, particles will emit from world coordinates (200, 400), combining the emitter's position (100, 300) and the particle's relative offset (100, 100).

```javascript
const emitter = this.add.particles(100, 300, 'flares', {
    x: 100,
    y: 100,
    frame: 'red',
    angle: { min: -30, max: 30 },
    speed: 150
});
```

--------------------------------

### Stop Phaser Particle Emitter after specific particle count with `stopAfter`

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

This example shows how to configure a Phaser Particle Emitter to stop after emitting a specific number of particles using the `stopAfter` property. Combined with `frequency` and `quantity`, it provides precise control over the total number of particles released. The emitter will stop and emit a `COMPLETE` event once the `stopAfter` count is reached.

```javascript
const emitter = this.add.particles(0, 0, 'texture', {
    x: { start: 400, end: 0 },
    y: { start: 300, end: 0 },
    lifespan: 3000,
    frequency: 250,
    stopAfter: 6,
    quantity: 1
});
```

--------------------------------

### Create a new Phaser game project using CLI tools

Source: https://github.com/phaserjs/phaser/blob/master/README.md

This CLI tool provides an interactive way to set up a new Phaser project. It offers a selection of official project templates and demo games, configuring the chosen package for you. It supports various package managers like npm, npx, yarn, pnpm, and bun.

```bash
npm create @phaserjs/game@latest
npx @phaserjs/create-game@latest
yarn create @phaserjs/game
pnpm create @phaserjs/game@latest
bun create @phaserjs/game@latest
```

--------------------------------

### Create a Phaser Game Instance

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Demonstrates the basic constructor for initializing a Phaser Game object. This constructor accepts parameters for dimensions, renderer type, parent HTML element, an optional initial state, transparency, and antialiasing.

```javascript
var game = new Game(width, height, renderer, parent, state, transparent, antialias);
```

--------------------------------

### Add Attractor Function to Phaser Matter Game Object in JavaScript

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.85/MatterAttractor.md

This code snippet demonstrates how to add a custom attractor function to a Matter game object in Phaser. The `attractors` property, an array of functions, is set during the object's creation. The example function calculates a force based on the relative positions of `bodyA` (the object with the attractor) and `bodyB` (the affected object), returning an object with `x` and `y` force components. This allows for simulating gravitational or other force-based interactions.

```javascript
    this.matter.add.image(x, y, 'key', null, {
        attractors: [
            (bodyA, bodyB) => ({
                x: (bodyA.position.x - bodyB.position.x) * 0.000001,
                y: (bodyA.position.y - bodyB.position.y) * 0.000001
            })
        ]
    });
```

--------------------------------

### Initialize Phaser Game Object with All Parameters (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Game

This snippet demonstrates the complete constructor signature for creating a Phaser Game object. It illustrates all seven possible parameters: width, height, renderer, parent, state, transparent, and antialias, which define the game's initial configuration and rendering behavior.

```javascript
var pacman = new Game(width, height, renderer, parent, state, transparent, antialias);
```

--------------------------------

### Initialize Phaser Game with Facebook Instant Games SDK

Source: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md

This HTML structure includes the Facebook Instant Games SDK and the Phaser Facebook Instant Games plugin. It demonstrates how to initialize a Phaser game instance only after the 'FBInstant.initializeAsync()' promise has resolved, ensuring the Facebook API is ready for use.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Phaser 3 Facebook Instant Games</title>
        <meta charset="utf-8">
        <script src="https://connect.facebook.net/en_US/fbinstant.6.2.js"></script>
        <script src="lib/phaser-facebook-instant-games.js"></script>
    </head>
    <body>

    FBInstant.initializeAsync().then(function() {

        var config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            scene: ...
        };

        new Phaser.Game(config);

    });

    </body>
</html>
```

--------------------------------

### Integrate Facebook Instant Games Preloader with Phaser Scene

Source: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md

This Phaser Scene extends 'Phaser.Scene' and demonstrates how to integrate the Facebook Instant Games preloader with the game's loading process. It uses 'this.facebook.showLoadProgress()' to update the Facebook loader and 'this.facebook.once('startgame', ...)' to transition to the main menu after all assets are loaded.

```javascript
class Preloader extends Phaser.Scene {

    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.facebook.showLoadProgress(this);
        this.facebook.once('startgame', this.startGame, this);

        //  Now load all of your assets
    }

    startGame ()
    {
        this.scene.start('MainMenu');
    }

}
```

--------------------------------

### Enabling Gamepad Support Detection in Phaser for CocoonJS

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-CocoonJS

Addresses Phaser's lack of gamepad support in CocoonJS by updating the gamepad detection logic. This modification to the `this._gamepadSupportAvailable` check in `phaser.js` includes `!!navigator.getGamepads`, making Phaser correctly recognize gamepad controllers available in the CocoonJS environment.

```javascript
this._gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads 
|| (navigator.userAgent.indexOf('Firefox/') != -1) || !!navigator.getGamepads;
```

--------------------------------

### Initialize a Phaser sprite for potential keyboard interactions

Source: https://github.com/phaserjs/phaser/wiki/Input

Demonstrates the basic creation of a sprite. While the code itself doesn't show keyboard event handling, it sets up the game object that would typically be controlled or affected by keyboard input later.

```javascript
var my_image = game.add.sprite(100, 100, "some_image"); // x, y, ref name
```

--------------------------------

### Create and configure a Phaser button with an action callback

Source: https://github.com/phaserjs/phaser/wiki/Input

Demonstrates how to add a button to the game, assign a callback function for clicks, and manipulate the button's appearance upon interaction. The button requires a sprite sheet for its visual states.

```javascript
var my_button = game.add.button(100, 100, "button_spriteSheet", actionOnclick, this, 2, 1, 0)// x, y, spriteSheet, callback, callbackContext, overFrame, outFrame, downFrame

function actionOnclick(obj) // obj is the button object which was passed to this function. We can manipulate it now.
{
   obj.alpha = 0.5
}
```

--------------------------------

### Preload Audio Assets in Phaser (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Audio

This snippet demonstrates how to preload an audio file in Phaser. It uses `game.load.audio` to register an audio asset with a reference name and provides paths to multiple formats (MP3 and OGG) for wider browser compatibility, as some browsers like Firefox may not support MP3.

```javascript
game.load.audio("my_sound", ["Audio/my_sound.mp3", "Audio/my_sound.ogg"]);
```

--------------------------------

### Enable touch input for a Phaser sprite

Source: https://github.com/phaserjs/phaser/wiki/Input

Shows how to create a sprite and then enable its input capabilities. This is a prerequisite for handling touch-specific interactions like dragging or snapping.

```javascript
var my_image = game.add.sprite(100, 100, "some_image"); // x, y, ref name
my_image.inputEnabled = true;
```

--------------------------------

### Create a Phaser Group Instance (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Groups

This code instantiates the `maingroup` variable as a new Phaser Group. This typically occurs within the game's `create` function, making the group ready to have game objects added to it.

```Javascript
maingroup = game.add.group();
```

--------------------------------

### Preload Sprite Sheet in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Loads a sprite sheet asset, defining its frames. This prepares the animation frames for use in a sprite, specifying the path, frame dimensions, and total number of frames.

```javascript
game.load.spritesheet("some_spritesheet", "Graphics/some_spritesheet.png", 30, 30, 18);
```

--------------------------------

### Initialize Vector Graphics Object in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Initializes a Phaser.Graphics object. This is a prerequisite for drawing any vector shapes, allowing the application of line styles and fill colors before drawing.

```javascript
var shape = game.add.graphics(0, 0);
shape.lineStyle(2, 0x0000FF, 1);
shape.beginFill(0xFFFF0B, 1);
```

--------------------------------

### Preload Image in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Loads an image asset into the Phaser game during the preload phase. It associates a reference name with the image file path for later use.

```javascript
game.load.image("some_image", "Graphics/some_image.png");
```

--------------------------------

### Create a Phaser Group in JavaScript

Source: https://github.com/phaserjs/phaser/wiki/Groups

This snippet demonstrates how to instantiate a new Phaser.Group object. A group allows you to manage multiple game objects as a single entity, useful for layering or performing bulk operations on related elements.

```javascript
var my_group = game.add.group();
```

--------------------------------

### Create Phaser Particle Emitter (Pre-3.60)

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ParticleEmitter.md

Prior to Phaser 3.60, creating a particle emitter involved first instantiating a `ParticleEmitterManager` using `this.add.particles`, and then calling `createEmitter` on the manager. This approach was less direct and has been deprecated in later versions, which now directly return a `ParticleEmitter`.

```javascript
const manager = this.add.particles('flares');

const emitter = manager.createEmitter({
    x: 100,
    y: 300,
    frame: 'red',
    angle: { min: -30, max: 30 },
    speed: 150
});
```

--------------------------------

### Include Phaser from a CDN in HTML

Source: https://github.com/phaserjs/phaser/blob/master/README.md

These script tags allow you to include the Phaser library directly into your HTML file from a Content Delivery Network (CDN) like jsDelivr or cdnjs. This method is convenient for quick prototyping or projects where a build step is not required. Both minified and unminified versions are available.

```html
<script src="//cdn.jsdelivr.net/npm/phaser@3.88.2/dist/phaser.js"></script>
<script src="//cdn.jsdelivr.net/npm/phaser@3.88.2/dist/phaser.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.88.2/phaser.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.88.2/phaser.min.js"></script>
```

--------------------------------

### Load Phaser Camera3D Plugin as External Script

Source: https://github.com/phaserjs/phaser/blob/master/plugins/camera3d/readme.md

This JavaScript code snippet demonstrates how to preload the Camera 3D plugin into a Phaser scene when using it as an external script. The `this.load.scenePlugin` method is used to register the plugin, specifying its key, path, and exposed name within the scene.

```javascript
function preload ()
{
    this.load.scenePlugin('Camera3DPlugin', 'plugins/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');
}
```

--------------------------------

### Create Image Sprite in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Graphics

Creates a new sprite object from a preloaded image. Specifies the initial position (x, y) and the reference name of the preloaded image.

```javascript
var my_image = game.add.sprite(100, 100, "some_image");
```

--------------------------------

### Define a Phaser State Object

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Shows how to create a standalone JavaScript object to represent a Phaser game state. This pattern involves defining a constructor function and then using its prototype to implement essential state lifecycle methods like 'preload', 'create', and 'update' for asset loading, initialization, and game logic respectively.

```javascript
var State1 = function(game) {  };  // State object created, a function accepting a game Object as parameter
State1.prototype = {
  preload: function() { /* download assets code here */ ;},
  create:  function() {/* initialize persistent game objects here */ ;},
  update:  function() {/* update movements, collisions, score here */ ;}
}
```

--------------------------------

### Configure Spatial Sound Playback in Phaser JavaScript

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/SpatialSound.md

This JavaScript code snippet demonstrates how to initialize a sound, set the listener's position, and play a sound with spatial properties in Phaser 3.60.0. It uses the new Web Audio Sound system to define the sound's 3D position, reference distance, and an object to automatically follow, enabling dynamic 3D audio effects.

```javascript
this.music = this.sound.add('theme');

this.sound.setListenerPosition(400, 300);

this.music.play({
    loop: true,
    source: {
        x: 400,
        y: 300,
        refDistance: 50,
        follow: this.playerSprite
    }
});
```

--------------------------------

### Configure Phaser Loader to load an image with a normal map

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.7.1/CHANGELOG-v3.7.1.md

This code demonstrates how to load an image and its associated normal map using the Phaser Loader. It utilizes a configuration object passed to `load.image` to specify the `key`, `url` for the main image, and `normalMap` for the normal map image. This method allows for structured loading of texture assets with additional maps, offering an alternative to the previous array-based method.

```javascript
load.image({
  key: 'shinyRobot',
  url: 'rob.png',
  normalMap: 'rob_n.png'
});
```

--------------------------------

### Control Audio Playback in Phaser (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Audio

This snippet provides various functions to control audio playback in Phaser. It includes methods for playing (`.play()`), pausing (`.pause()`), resuming (`.resume()`), setting volume (`.volume`), and debugging audio information using `game.debug.renderSoundInfo`.

```javascript
my_music.play()
my_music_loop.play("", 0, 1, true);
my_music.volume = 0.5;
my_nusic.pause();
my_music.resume();
game.debug.renderSoundInfo(my_music, 20, 20);
```

--------------------------------

### Configure Webpack for Phaser Facebook Instant Games Plugin

Source: https://github.com/phaserjs/phaser/blob/master/plugins/fbinstant/readme.md

This configuration snippet for Webpack's DefinePlugin ensures that the Phaser Facebook Instant Games plugin is included in the build. Setting this property to 'true' enables the plugin during the build process.

```javascript
"typeof PLUGIN_FBINSTANT": JSON.stringify(true)
```

--------------------------------

### Phaser DataManager: Setting Multiple Values from Object

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.10/CHANGELOG-v3.10.md

This code illustrates how the `data.set()` method in Phaser's DataManager can now accept an object containing key-value pairs as its first argument. This allows for setting multiple data values simultaneously in a single call.

```javascript
data.set({ name: 'Red Gem Stone', level: 2, owner: 'Link', gold: 50 })
```

--------------------------------

### Fixing Phaser Canvas Support Check for CocoonJS

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-CocoonJS

Addresses the 'DOMContentLoaded' error in Phaser when CocoonJS lacks 'CanvasRenderingContext2D'. This fix involves modifying the `Phaser.Device#_checkFeatures` method in `phaser.js` to explicitly check for the `this.iscocoonJS` property when determining canvas support, allowing the game to initialize correctly in a CocoonJS environment.

```javascript
this.canvas = !!window['CanvasRenderingContext2D'] || this.iscocoonJS;
```

--------------------------------

### Phaser State Properties Reference

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-States

Lists the essential properties and managers automatically available within any Phaser State object, such as 'this.game', 'this.add', 'this.camera', and 'this.world'. These properties provide direct access to core game functionalities, and developers are advised not to overwrite them with custom variables.

```javascript
this.game;		//	a reference to the currently running game
this.add;		//	used to add sprites, text, groups, etc
this.camera;		//	a reference to the game camera
this.cache;		//	the game cache
this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
this.load;		//	for preloading assets
this.math;		//	lots of useful common math operations
this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
this.stage;		//	the game stage
this.time;		//	the clock
this.tweens;		//	the tween manager
this.world;		//	the game world
this.particles;	//	the particle manager
this.physics;		//	the physics manager
this.rnd;		//	the repeatable random number generator
```

--------------------------------

### Calculating Screen Dimensions for Scaling in CocoonJS

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-CocoonJS

Provides a method to accurately calculate the width and height for game scaling in CocoonJS, specifically accounting for potential device pixel ratio issues. This snippet uses `window.innerWidth`, `window.innerHeight`, and `window.devicePixelRatio` to derive the effective screen dimensions, ensuring correct visual scaling.

```javascript
var width = window.innerWidth * window.devicePixelRatio;
var height = window.innerHeight * window.devicePixelRatio;
```

--------------------------------

### Initialize and Populate a Sprite Group in Phaser.js

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Sprites

This snippet demonstrates how to create a Phaser.js sprite group and efficiently populate it with multiple sprite instances. A loop is used to add ten 'fastcar' sprites to the 'cargroup', all initially positioned at (64, 70), enabling easier management of multiple similar objects.

```javascript
var cargroup;
cargroup = game.add.group();
for(var i = 0; i < 10; i++)
{
  car = cargroup.create(64, 70, 'fastcar');
}
```

--------------------------------

### Configure drag and snap functions for Phaser sprite touch input

Source: https://github.com/phaserjs/phaser/wiki/Input

Illustrates various touch input configurations for a sprite, including enabling drag, restricting horizontal movement, and setting up grid snapping on release. This requires input to be enabled on the sprite first.

```javascript
my_image.input.enableDrag(false); //lockCenter, bringToTop, pixelPerfect, alphaThreshold, boundsRect, boundsSprite
my_image.input.allowHorizontalDrag = false;
my_image.input.enableSnap(90,90,false,true) // snap on 90px size, not on drag, on release
```

--------------------------------

### Add Multiple Sprites to a Phaser Group with Loop (JavaScript)

Source: https://github.com/phaserjs/phaser/wiki/Phaser-General-Documentation-:-Groups

This snippet illustrates populating a Phaser Group with multiple instances of a sprite using a `for` loop. It creates 25 'robot1' sprites, each positioned randomly on the X-axis and at a fixed Y-axis, streamlining the creation of numerous similar game objects.

```Javascript
var numberofBots = 25
// Then in our group we do this: 
maingroup = game.add.group();
for(var i=0; i < numberofBots; i++) {
  var robot01 = maingroup.create(game.world.randomX, 100, 'robot1');
} 
```

--------------------------------

### Phaser 3 Load and Display Video Game Object

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.20/CHANGELOG-v3.20.md

This JavaScript code demonstrates how to preload a video file named 'nemo.mp4' into the Phaser game cache using `this.load.video` and then add it to the game display at coordinates (400, 300) as a standard Game Object using `this.add.video`. This allows videos to be treated similarly to sprites, enabling scaling, rotation, and other transformations within the game world.

```javascript
preload () {
  this.load.video('pixar', 'nemo.mp4');
}

create () {
  this.add.video(400, 300, 'pixar');
}
```

--------------------------------

### Importing Phaser Modules with ESM in JavaScript

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/ESMSupport.md

This JavaScript code demonstrates how to import specific Phaser modules (AUTO, Scene, Game) directly from the `phaser.esm.js` build using named imports. It sets up a basic Phaser game with a custom scene that displays text, showcasing the simplified syntax and workflow for developing Phaser applications with ESM without needing a bundler.

```js
import { AUTO, Scene, Game } from './phaser.esm.js';

class Test extends Scene
{
    constructor ()
    {
        super();
    }

    create ()
    {
        this.add.text(10, 10, 'Welcome to Phaser ESM');
    }
}

const config = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Test ]
};

const game = new Game(config);
```

--------------------------------

### Update Video Loading Parameters in Phaser

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.60/VideoGameObject.md

This JavaScript code demonstrates the simplified `this.load.video` method. Previously, it required five parameters including `loadEvent` and `asBlob`, which have now been removed. The updated method only requires the key, URL, and an optional `noAudio` boolean.

```javascript
//  Previously you had to do this. Note the 5 paramters:
this.load.video('wormhole', 'wormhole.mp4', 'loadeddata', false, true);

//  Now, you just specify the key, URL and the 'noAudio' boolean:
this.load.video('wormhole', 'wormhole.mp4', true);
```

--------------------------------

### Simulate WebGL Context Loss and Restore in Phaser

Source: https://github.com/phaserjs/phaser/blob/master/changelog/3.80/WebGLContextRestore.md

This JavaScript snippet demonstrates how to test WebGL context loss and restoration using Phaser's built-in `WEBGL_lose_context` extension. It simulates losing the WebGL context after one second and then restoring it one second later, providing a way to verify context recovery behavior.

```js
const webGLLoseContextExtension = game.renderer.getExtension('WEBGL_lose_context');

setTimeout(function () {
    webGLLoseContextExtension.loseContext();
    setTimeout(function () {
        webGLLoseContextExtension.restoreContext();
    }, 1000)
}, 1000);
```

--------------------------------

### Configure TypeScript definitions for Phaser in tsconfig.json

Source: https://github.com/phaserjs/phaser/blob/master/README.md

To ensure proper type checking and autocompletion for Phaser in a TypeScript project, these settings should be added to your `tsconfig.json` file. They specify the JavaScript libraries to include, the root directory for type definitions, and explicitly declare 'Phaser' as a type. This helps modern editors like VSCode detect Phaser types automatically.

```json
"lib": ["es6", "dom", "dom.iterable", "scripthost"],
"typeRoots": ["./node_modules/phaser/types"],
"types": ["Phaser"]
```