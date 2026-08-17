### Phaser Boot Callbacks

Source: https://docs.phaser.io/api-documentation/class/core-config

Defines functions to be executed at specific points during the Phaser game boot sequence. `postBoot` runs after all systems are initialized, while `preBoot` runs before Phaser starts, useful for external setup.

```APIDOC
postBoot: Phaser.Types.Core.BootCallback
  Description: A function to run at the end of the boot sequence. At this point, all the game systems have started and plugins have been loaded.
  Source: src/core/Config.js#L473

preBoot: Phaser.Types.Core.BootCallback
  Description: Called before Phaser boots. Useful for initializing anything not related to Phaser that Phaser may require while booting.
  Source: src/core/Config.js#L468
```

--------------------------------

### Phaser Input Plugin Lifecycle: START

Source: https://docs.phaser.io/api-documentation/event/input-events

The Input Plugin Start Event is dispatched by the Input Plugin once it has finished its setup. This event signals all internal systems to begin their operations.

```APIDOC
START:
  Description: The Input Plugin Start Event.
  Dispatched by: Input Plugin
  Trigger Condition: Input Plugin has finished setting up.
  Purpose: Signals all internal systems to start.
  Member of: Phaser.Input.Events
  Source: src/input/events/START_EVENT.js#L7
  Since: 3.0.0
```

--------------------------------

### Plugin Installation Configuration

Source: https://docs.phaser.io/api-documentation/constant/core

Configuration options for installing global and scene-level plugins, as well as defining default plugins for all scenes.

```APIDOC
installGlobalPlugins: any
  Description: An array of global plugins to be installed.

installScenePlugins: any
  Description: An array of Scene level plugins to be installed.

defaultPlugins: any
  Description: The plugins installed into every Scene (in addition to CoreScene and Global).
```

--------------------------------

### Phaser SmoothedKeyControl start() Method

Source: https://docs.phaser.io/api-documentation/class/cameras-controls-smoothedkeycontrol

Starts the Key Control running, provided it has been linked to a camera. Returns the Key Control instance.

```APIDOC
start(): Phaser.Cameras.Controls.SmoothedKeyControl
  Description: Starts the Key Control running, providing it has been linked to a camera.
  Returns: This Key Control instance.
  Since: 3.0.0
```

--------------------------------

### Phaser Aseprite Loader Example

Source: https://docs.phaser.io/api-documentation/class/animations-animationmanager

Example of how to load Aseprite animations using the Phaser loader and then create animations from them using `createFromAseprite`.

```javascript
function preload () {

    this.load.path = 'assets/animations/aseprite/';

    this.load.aseprite('paladin', 'paladin.png', 'paladin.json');

}

// Then, in a scene:
this.anims.createFromAseprite('paladin');
// Or to create only specific animations:
this.anims.createFromAseprite('paladin', [ 'step', 'War Cry', 'Magnum Break' ]);

// To play an animation:
this.add.sprite(400, 300).play('War Cry');
```

--------------------------------

### MatterPhysics start() Method

Source: https://docs.phaser.io/api-documentation/class/physics-matter-matterphysics

The start() method is automatically invoked by the Scene during its startup phase. Its primary role is to initialize local systems, properties, and set up listeners for Scene events. This method should not be called directly by the user.

```APIDOC
start(): void
  Description:
    This method is called automatically by the Scene when it is starting up. It is responsible for creating local systems, properties and listening for Scene events.
  Access: private
  Since: 3.5.0
```

--------------------------------

### Preload Video Example

Source: https://docs.phaser.io/api-documentation/class/loader-loaderplugin

Example of how to preload a video file within a Phaser Scene's `preload` method. This demonstrates adding a video with multiple format URLs to the loader.

```javascript
function preload () {
    this.load.video('intro', [ 'video/level1.mp4', 'video/level1.webm', 'video/level1.mov' ]);
}
```

--------------------------------

### Phaser Audio Loading Example

Source: https://docs.phaser.io/api-documentation/class/loader-loaderplugin

Example of how to preload audio files in a Phaser Scene's preload method.

```javascript
function preload () {
    this.load.audio('title', [ 'music/Title.ogg', 'music/Title.mp3', 'music/Title.m4a' ]);
}
```

--------------------------------

### Phaser Loader Script Example (module)

Source: https://docs.phaser.io/api-documentation/class/loader-loaderplugin

Example of loading a script file as a module using the Phaser Loader.

```javascript
function preload () {
    this.load.script('aliens', 'lib/aliens.js', 'module');
}
```

--------------------------------

### Global and Scene Plugin Installation

Source: https://docs.phaser.io/api-documentation/class/core-config

Configuration options for installing global and scene-specific plugins. These properties allow developers to specify arrays of plugins to be integrated into the game.

```APIDOC
installGlobalPlugins: any
  Description: An array of global plugins to be installed.
  Source: src/core/Config.js#L584

installScenePlugins: any
  Description: An array of Scene level plugins to be installed.
  Source: src/core/Config.js#L589
```

--------------------------------

### Phaser Loader Script Example (config object)

Source: https://docs.phaser.io/api-documentation/class/loader-loaderplugin

Example of loading a script file using a configuration object with the Phaser Loader.

```javascript
this.load.script({
    key: 'aliens',
    url: 'lib/aliens.js',
    type: 'script' // or 'module'
});
```

--------------------------------

### Phaser WebGLPipeline onBoot Method

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-utilitypipeline

Hook called once when the pipeline finishes setup during the boot process. Shaders are ready at this point.

```APIDOC
onBoot()
  - Description: Hook called once when the pipeline finishes setup during the boot process. Shaders are ready at this point.
  - Inherits: Phaser.Renderer.WebGL.WebGLPipeline#onBoot
```

--------------------------------

### Phaser BasePlugin start() Method

Source: https://docs.phaser.io/api-documentation/class/plugins-sceneplugin

The start method is called when a Global Plugin is started, and also if it's stopped and then started again. It's typically called after init. Scene Plugins do not use this method.

```javascript
/**
 * @method Phaser.Plugins.BasePlugin#start
 * @description The PluginManager calls this method on a Global Plugin when the plugin is started. If a plugin is stopped, and then started again, this will get called again. Typically called immediately after `BasePlugin.init`. On a Scene Plugin, this method is never called.
 */
```

--------------------------------

### Phaser LoaderPlugin start Method

Source: https://docs.phaser.io/api-documentation/class/loader-loaderplugin

Starts the Phaser Loader running. This resets progress and totals, emits a 'start' event, and begins loading files. It's automatically called if the queue is populated in the preload method, but manual invocation is needed otherwise.

```APIDOC
start(): Phaser.Loader.LoaderPlugin
  Description: Starts the Loader running. This will reset the progress and totals and then emit a start event. If there is nothing in the queue the Loader will immediately complete, otherwise it will start loading the first batch of files. The Loader is started automatically if the queue is populated within your Scenes preload method. However, outside of this, you need to call this method to start it. If the Loader is already running this method will simply return.
  Fires: Phaser.Loader.Events#event:START
  Source: src/loader/LoaderPlugin.js#L900
  Since: 3.0.0
```

--------------------------------

### DataManagerPlugin start() Method

Source: https://docs.phaser.io/api-documentation/class/data-datamanagerplugin

The start() method is automatically invoked by the Scene during its startup phase. It is responsible for initializing the plugin's internal systems and properties, and for setting up listeners for Scene events. This method should not be called directly by the user.

```APIDOC
DataManagerPlugin:
  start(): void
    Description: Called automatically by the Scene when it is starting up. Responsible for creating local systems, properties and listening for Scene events. Do not invoke it directly.
    Access: private
    Since: 3.5.0
```

--------------------------------

### START Event

Source: https://docs.phaser.io/api-documentation/namespace/input-events

Dispatched by the Input Plugin when it has finished setting up, signaling all its internal systems to start.

```APIDOC
START:
  description: The Input Plugin Start Event.
  since: 3.0.0
```

--------------------------------

### Phaser Input Plugin Initialization Method

Source: https://docs.phaser.io/api-documentation/class/input-inputplugin

Documentation for the start() method of the Phaser Input Plugin. This method is called automatically by the Scene during its startup phase to initialize local systems and properties.

```APIDOC
start()
  Description: This method is called automatically by the Scene when it is starting up. It is responsible for creating local systems, properties and listening for Scene events. Do not invoke it directly.
  Access: private
  Fires: [Phaser.Input.Events#event:START](https://docs.phaser.io/api-documentation/event/input-events#start)
  Since: 3.5.0
```

--------------------------------

### Get Current Game Time

Source: https://docs.phaser.io/api-documentation/class/game

Returns the timestamp for the start of the current game step, based on `performance.now`.

```APIDOC
getTime(): number
  Description:
    Returns the time that the current game step started at, as based on `performance.now`.
  Returns:
    number - The current game timestamp.
```

--------------------------------

### Phaser Pipeline Initialization and Boot Methods

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-bokehfxpipeline

Details methods for initializing and booting Phaser pipelines. `boot` is called when the Game is fully booted, and `bootFX` is called when a Post FX Pipeline is first used.

```APIDOC
boot()
  - Called when the Game has fully booted and the Renderer has finished setting up.
  - Allows for final pipeline tasks that rely on game systems.
  - Fires: Phaser.Renderer.WebGL.Pipelines.Events#event:BOOT
  - Inherits: Phaser.Renderer.WebGL.WebGLPipeline#boot

bootFX()
  - Called once when this Post FX Pipeline needs to be used.
  - Boots the pipeline and creates internal resources like Render Targets.
  - Inherits: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline#bootFX
```

--------------------------------

### Phaser Sprite Play Animation Example

Source: https://docs.phaser.io/api-documentation/class/gameobjects-sprite

Example of playing a created Phaser animation ('run') on a Sprite instance. Shows how to initiate animation playback directly.

```javascript
this.add.sprite(x, y).playReverse('run');
```

--------------------------------

### Phaser PathFollower startFollow

Source: https://docs.phaser.io/api-documentation/class/gameobjects-pathfollower

Starts the PathFollower following its given Path, optionally starting at a specific position.

```APIDOC
startFollow(config, startAt):
  Starts this PathFollower following its given Path.
  Parameters:
    config (Phaser.Types.GameObjects.PathFollower.PathConfig | Phaser.Types.Tweens.NumberTweenBuilderConfig, optional): Configuration for the path following. Defaults to {}.
    startAt (number, optional): Optional start position of the follow, between 0 and 1. Defaults to 0.
  Returns: Phaser.GameObjects.PathFollower - This Game Object.
```

--------------------------------

### Phaser Curve getStartPoint Method

Source: https://docs.phaser.io/api-documentation/class/curves-spline

Gets the starting point of the curve. This method overrides the base Curve class method.

```APIDOC
getStartPoint(out)
  - Parameters:
    - out ([Phaser.Math.Vector2], optional): A Vector2 object to store the result in. If not given, a new Vector2 object will be created.
  - Returns: [Phaser.Math.Vector2] - The coordinates of the starting point on the curve. If an `out` object was provided, it will be returned.
```

--------------------------------

### Phaser Pipeline Initialization and Boot Methods

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-gradientfxpipeline

Details methods for initializing and booting Phaser pipelines. `boot` is called when the Game is fully booted, and `bootFX` is called when a Post FX Pipeline is first used.

```APIDOC
boot()
  - Called when the Game has fully booted and the Renderer has finished setting up.
  - Allows for final pipeline tasks that rely on game systems.
  - Fires: Phaser.Renderer.WebGL.Pipelines.Events#event:BOOT
  - Inherits: Phaser.Renderer.WebGL.WebGLPipeline#boot

bootFX()
  - Called once when this Post FX Pipeline needs to be used.
  - Boots the pipeline and creates internal resources like Render Targets.
  - Inherits: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline#bootFX
```

--------------------------------

### Phaser WebGLPipeline onBoot Method

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-postfxpipeline

The onBoot method is called once after the pipeline has finished setup during the boot process, with shaders ready and configured.

```APIDOC
onBoot()
  Description:
    This method is called once when this pipeline has finished being set-up
    at the end of the boot process. By the time this method is called, all
    of the shaders are ready and configured.
```

--------------------------------

### Phaser Curve getStartPoint Method

Source: https://docs.phaser.io/api-documentation/class/curves-cubicbezier

Gets the starting point of the curve. This method overrides the base Curve class method.

```APIDOC
getStartPoint(out)
  - Gets the starting point on the curve.
  - Parameters:
    - out (Phaser.Math.Vector2, optional): A Vector2 object to store the result in. If not given will be created.
  - Overrides: Phaser.Curves.Curve#getStartPoint
  - Returns: Phaser.Math.Vector2 - The coordinates of the point on the curve. If an `out` object was given this will be returned.
```

--------------------------------

### Phaser Pipeline Initialization and Boot Methods

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-circlefxpipeline

Details methods for initializing and booting Phaser pipelines. `boot` is called when the Game is fully booted, and `bootFX` is called when a Post FX Pipeline is first used.

```APIDOC
boot()
  - Called when the Game has fully booted and the Renderer has finished setting up.
  - Allows for final pipeline tasks that rely on game systems.
  - Fires: Phaser.Renderer.WebGL.Pipelines.Events#event:BOOT
  - Inherits: Phaser.Renderer.WebGL.WebGLPipeline#boot

bootFX()
  - Called once when this Post FX Pipeline needs to be used.
  - Boots the pipeline and creates internal resources like Render Targets.
  - Inherits: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline#bootFX
```

--------------------------------

### Phaser Geom Line Instance Methods

Source: https://docs.phaser.io/api-documentation/class/geom-line

Provides documentation for instance methods of the Phaser Geom.Line class, such as getting the start and end points, and random points on the line.

```APIDOC
getPointA([vec2]): Phaser.Math.Vector2
  Description: Returns a Vector2 object that corresponds to the start of this Line.
  Parameters:
    vec2 (Phaser.Math.Vector2, optional): A Vector2 object to set the results in. If undefined a new Vector2 will be created.
  Returns: Phaser.Math.Vector2 - A Vector2 object that corresponds to the start of this Line.
  Source: src/geom/line/Line.js#L197
  Since: 3.0.0

getPointB([vec2]): Phaser.Math.Vector2
  Description: Returns a Vector2 object that corresponds to the end of this Line.
  Parameters:
    vec2 (Phaser.Math.Vector2, optional): A Vector2 object to set the results in. If undefined a new Vector2 will be created.
  Returns: Phaser.Math.Vector2 - A Vector2 object that corresponds to the end of this Line.
  Source: src/geom/line/Line.js#L218
  Since: 3.0.0

getPoints(quantity, [stepRate], [output]): Array.<Phaser.Geom.Point>
  Description: Get a number of points along a line's length. Provide a `quantity` to get an exact number of points along the line. Provide a `stepRate` to ensure a specific distance between each point on the line. Set `quantity` to `0` when providing a `stepRate`.
  Parameters:
    quantity (number): The number of points to place on the line. Set to `0` to use `stepRate` instead.
    stepRate (number, optional): The distance between each point on the line. When set, `quantity` is implied and should be set to `0`.
    output (Array.<Phaser.Geom.Point>, optional): An optional array of Points, or point-like objects, to store the coordinates of the points on the line.
  Returns: Array.<Phaser.Geom.Point> - An array of Points, or point-like objects, containing the coordinates of the points on the line.
  Source: src/geom/line/Line.js#L105
  Since: 3.0.0

getRandomPoint([point]): Phaser.Geom.Point
  Description: Get a random Point on the Line.
  Parameters:
    point (Phaser.Geom.Point, optional): An instance of a Point to be modified.
  Returns: Phaser.Geom.Point - A random Point on the Line.
  Source: src/geom/line/Line.js#L129
  Since: 3.0.0
```

--------------------------------

### Phaser Pipeline Initialization and Boot Methods

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-wipefxpipeline

Details methods for initializing and booting Phaser pipelines. `boot` is called when the Game is fully booted, and `bootFX` is called when a Post FX Pipeline is first used.

```APIDOC
boot()
  - Called when the Game has fully booted and the Renderer has finished setting up.
  - Allows for final pipeline tasks that rely on game systems.
  - Fires: Phaser.Renderer.WebGL.Pipelines.Events#event:BOOT
  - Inherits: Phaser.Renderer.WebGL.WebGLPipeline#boot

bootFX()
  - Called once when this Post FX Pipeline needs to be used.
  - Boots the pipeline and creates internal resources like Render Targets.
  - Inherits: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline#bootFX
```

--------------------------------

### Phaser Curve getStartPoint

Source: https://docs.phaser.io/api-documentation/class/curves-ellipse

Gets the starting point of the curve. An optional `out` Vector2 object can be provided to store the result, otherwise a new Vector2 will be created. This method overrides the base Curve's getStartPoint.

```APIDOC
getStartPoint(out)
  - Gets the starting point on the curve.
  - Parameters:
    - out (Phaser.Math.Vector2, optional): A Vector2 object to store the result in. If not given will be created.
  - Returns: Phaser.Math.Vector2 - The coordinates of the point on the curve. If an `out` object was given this will be returned.
```

--------------------------------

### Phaser Input Plugin Cache Install

Source: https://docs.phaser.io/api-documentation/function/input

Installs an input plugin onto a target object, typically a Phaser Scene. This makes the plugin's functionality available to the target.

```APIDOC
Phaser.Input.InputPluginCache.install(target)

Parameters:
  target: The target object to install the plugin onto.

Description:
Installs an input plugin onto a target.
```

--------------------------------

### Phaser Scene init Method

Source: https://docs.phaser.io/api-documentation/class/scenes-systems

Initializes the Scene, setting up plugins and references. Called once by the Scene Manager during instantiation. Do not call directly.

```APIDOC
init(game: Phaser.Game):
  description: This method is called only once by the Scene Manager when the Scene is instantiated. It is responsible for setting up all of the Scene plugins and references. It should never be called directly.
  access: protected
  parameters:
    - name: game
      type: Phaser.Game
      optional: No
      description: A reference to the Phaser Game instance.
  fires: Phaser.Scenes.Events#event:BOOT
  source: src/scene/Systems.js#L307
  since: 3.0.0
```

--------------------------------

### Phaser TweenDataConfig API

Source: https://docs.phaser.io/api-documentation/typedef/types-tweens

Defines the configuration object for individual tween data, specifying properties like target, key, duration, ease, and repeat behavior. It includes callbacks for getting start, end, and active values.

```APIDOC
TweenDataConfig:
  target: any (No) - The target to tween.
  index: number (No) - The target index within the Tween targets array.
  key: string (No) - The property of the target being tweened.
  getActiveValue: function (No) - Callback invoked immediately when the TweenData is running, sets the target property.
  getEndValue: function (No) - Callback that returns the property value at the END of the Tween.
  getStartValue: function (No) - Callback that returns the property value at the START of the Tween.
  ease: function (No) - The ease function this tween uses.
  duration: number (Yes, default: 0) - Duration of the tween in milliseconds, excludes time for yoyo or repeats.
  totalDuration: number (Yes, default: 0) - The total calculated duration of this TweenData (based on duration, repeat, delay and yoyo).
  delay: number (Yes, default: 0) - Time in milliseconds before tween will start.
  yoyo: boolean (Yes, default: false) - Cause the tween to return back to its start value after hold has expired.
  hold: number (Yes, default: 0) - Time in milliseconds the tween will pause before running the yoyo or starting a repeat.
  repeat: number (Yes, default: 0) - Number of times to repeat the tween. The tween will always run once regardless, so a repeat value of '1' will play the tween twice.
  repeatDelay: number (Yes, default: 0) - Time in milliseconds before the repeat will start.
  flipX: boolean (Yes, default: false) - Automatically call toggleFlipX when the TweenData yoyos or repeats.
  flipY: boolean (Yes, default: false) - Automatically call toggleFlipY when the TweenData yoyos or repeats.
  progress: number (Yes, default: 0) - Between 0 and 1 showing completion of this TweenData.
  elapsed: number (Yes, default: 0) - Delta counter.
  repeatCounter: number (Yes, default: 0) - How many repeats are left to run?
  start: number (Yes, default: 0) - The property value at the start of the ease.
  current: number (Yes, default: 0) - The current propety value.
  previous: number (Yes, default: 0) - The previous property value.
  end: number (Yes, default: 0) - The property value at the end of the ease.
  gen: object (Yes) - LoadValue generation functions.
  state: number (Yes, default: 0) - TWEEN_CONST.CREATED
```

--------------------------------

### GetValueOp: Build Tween Value Operations

Source: https://docs.phaser.io/api-documentation/function/tweens

Generates functions to get the active, start, and end values for a tween property. Supports absolute numbers, relative string operations (add, subtract, multiply, divide), and custom functions for precise control over tween values.

```javascript
/**
 * Returns `getActive`, `getStart` and `getEnd` functions for a TweenData based on a target property and end value.
 *
 * `getActive` if not null, is invoked _immediately_ as soon as the TweenData is running, and is set on the target property.
 * `getEnd` is invoked once any start delays have expired and returns what the value should tween to.
 * `getStart` is invoked when the tween reaches the end and needs to either repeat or yoyo, it returns the value to go back to.
 *
 * If the end value is a number, it will be treated as an absolute value and the property will be tweened to it.
 * A string can be provided to specify a relative end value which consists of an operation
 * (`+=` to add to the current value, `-=` to subtract from the current value, `*=` to multiply the
 * current value, or `/=` to divide the current value) followed by its operand.
 *
 * A function can be provided to allow greater control over the end value; it will receive the target
 * object being tweened, the name of the property being tweened, and the current value of the property
 * as its arguments and must return a value.
 *
 * If both the starting and the ending values need to be controlled, an object with `getStart` and `getEnd`
 * callbacks, which will receive the same arguments, can be provided instead. If an object with a `value`
 * property is provided, the property will be used as the effective value under the same rules described here.
 *
 * @method Phaser.Tweens.Builders.GetValueOp
 * @since 3.0.0
 *
 * @param {string} key - The name of the property to modify.
 * @param {*} propertyValue - The ending value of the property, as described above.
 *
 * @return {function} An array of functions, `getActive`, `getStart` and `getEnd`, which return the starting and the ending value of the property based on the provided value.
 */
static GetValueOp (key, propertyValue)

```

--------------------------------

### Phaser PluginManager API Documentation

Source: https://docs.phaser.io/api-documentation/class/plugins-pluginmanager

This section details the methods available in the Phaser PluginManager class. It covers functionalities for managing plugins, including creating, starting, and retrieving plugin instances. The documentation includes method signatures, parameter types and descriptions, return values, and source code references.

```APIDOC
PluginManager:
  createEntry(key, [runAs])
    Description: Creates a new instance of a global plugin, adds an entry into the plugins array and returns it.
    Access: private
    Parameters:
      key (string): The key of the plugin to create an instance of.
      runAs (string, optional): Run the plugin under a new key. This allows you to run one plugin multiple times.
    Returns: Phaser.Plugins.BasePlugin - The plugin that was started, or `null` if invalid key given.
    Source: src/plugins/PluginManager.js#L578
    Since: 3.9.0

  addToScene(sys, globalPlugins, scenePlugins)
    Description: Adds a plugin to the scene.
    Access: public

  boot()
    Description: Boots the plugin manager.
    Access: public

  destroy()
    Description: Destroys the plugin manager.
    Access: public

  get(key, [autoStart])
    Description: Gets a plugin instance by its key.
    Access: public
    Parameters:
      key (string): The key of the plugin to retrieve.
      autoStart (boolean, optional): Whether to automatically start the plugin if it's not already running.
    Returns: Phaser.Plugins.BasePlugin - The plugin instance, or null if not found.

  getClass(key)
    Description: Gets the plugin class associated with a given key.
    Access: public
    Parameters:
      key (string): The key of the plugin.
    Returns: object - The plugin class.

  getDefaultScenePlugins()
    Description: Gets the default scene plugins.
    Access: public
    Returns: Array.<string> - An array of default scene plugin keys.

  getEntry(key)
    Description: Gets a plugin entry by its key.
    Access: public
    Parameters:
      key (string): The key of the plugin entry.
    Returns: Phaser.Types.Plugins.GlobalPlugin - The plugin entry object.

  getIndex(key)
    Description: Gets the index of a plugin entry by its key.
    Access: public
    Parameters:
      key (string): The key of the plugin entry.
    Returns: number - The index of the plugin entry.

  install(key, plugin, [start], [mapping], [data])
    Description: Installs a plugin.
    Access: public
    Parameters:
      key (string): The key for the plugin.
      plugin (object): The plugin object.
      start (boolean, optional): Whether to start the plugin immediately.
      mapping (object, optional): A mapping object for the plugin.
      data (object, optional): Data to pass to the plugin.

  installScenePlugin(key, plugin, [mapping], [addToScene], [fromLoader])
    Description: Installs a scene plugin.
    Access: public
    Parameters:
      key (string): The key for the scene plugin.
      plugin (object): The scene plugin object.
      mapping (object, optional): A mapping object for the scene plugin.
      addToScene (boolean, optional): Whether to add the plugin to the scene.
      fromLoader (boolean, optional): Whether the plugin is being installed from a loader.

  isActive(key)
    Description: Checks if a plugin is active.
    Access: public
    Parameters:
      key (string): The key of the plugin to check.
    Returns: boolean - True if the plugin is active, false otherwise.
```

--------------------------------

### Phaser Game Object Data Management

Source: https://docs.phaser.io/api-documentation/class/gameobjects-dynamicbitmaptext

Demonstrates how to set and get data for Phaser Game Objects. Includes examples of setting single key-value pairs, multiple pairs using an object, and accessing data directly. Also covers event emissions for data changes.

```APIDOC
setData(key, [data])
  - Description: Allows you to store a key value pair within this Game Objects Data Manager. If the Game Object has not been enabled for data (via `setDataEnabled`) then it will be enabled before setting the value. If the key doesn't already exist in the Data Manager then it is created.
  - Parameters:
    - key (string | object): The key to set the value for. Or an object of key value pairs. If an object the `data` argument is ignored.
    - data (*): The value to set for the given key. If an object is provided as the key this argument is ignored.
  - Returns: [Phaser.GameObjects.DynamicBitmapText](https://docs.phaser.io/api-documentation/class/gameobjects-dynamicbitmaptext) - This GameObject.
  - Events:
    - `setdata`: Emitted when a new key is set.
    - `changedata`: Emitted when an existing key is updated.
    - `changedata-<key>`: Emitted when a specific key is updated.
  - Notes:
    - Data keys are case-sensitive.
    - Keys must be valid JavaScript Object property strings.
  - Example:
    sprite.setData('name', 'Red Gem Stone');
    sprite.setData({ name: 'Red Gem Stone', level: 2, owner: 'Link', gold: 50 });
    sprite.getData('gold');
    sprite.data.values.gold += 50;
  - Inherits: [Phaser.GameObjects.GameObject#setData](https://docs.phaser.io/api-documentation/class/gameobjects-gameobject#setdata)
  - Source: [src/gameobjects/GameObject.js#L295](https://github.com/phaserjs/phaser/blob/v3.87.0/src/gameobjects/GameObject.js#L295)
  - Since: 3.0.0

setDataEnabled()
  - Description: Adds a Data Manager component to this Game Object.
  - Returns: [Phaser.GameObjects.DynamicBitmapText](https://docs.phaser.io/api-documentation/class/gameobjects-dynamicbitmaptext) - This GameObject.
  - Inherits: [Phaser.GameObjects.GameObject#setDataEnabled](https://docs.phaser.io/api-documentation/class/gameobjects-gameobject#setdataenabled)
  - Source: [src/gameobjects/GameObject.js#L276](https://github.com/phaserjs/phaser/blob/v3.87.0/src/gameobjects/GameObject.js#L276)
  - Since: 3.0.0
```

--------------------------------

### Phaser FixedKeyControl Methods

Source: https://docs.phaser.io/api-documentation/class/cameras-controls-fixedkeycontrol

Documentation for the public methods of the Phaser FixedKeyControl class, including initialization, starting, stopping, and destruction.

```APIDOC
destroy()
  Description: Destroys this Key Control.
  Since: 3.0.0

setCamera(camera: Phaser.Cameras.Scene2D.Camera): Phaser.Cameras.Controls.FixedKeyControl
  Description: Binds this Key Control to a camera.
  Parameters:
    camera: The camera to bind this Key Control to.
  Returns: This Key Control instance.
  Since: 3.0.0

start(): Phaser.Cameras.Controls.FixedKeyControl
  Description: Starts the Key Control running, providing it has been linked to a camera.
  Returns: This Key Control instance.
  Since: 3.0.0

stop(): Phaser.Cameras.Controls.FixedKeyControl
  Description: Stops this Key Control from running. Call `start` to start it again.
  Returns: This Key Control instance.
  Since: 3.0.0

update()
  Description: Updates the Key Control. This method is typically called internally by the game loop.
  Since: 3.0.0
```

--------------------------------

### Phaser Tween Start Event

Source: https://docs.phaser.io/api-documentation/namespace/tweens-events

The Tween Start Event is dispatched by a Tween when it starts tweening its first property. This event fires after any delay has expired. Listen to it using `Tween.on('start', listener)`.

```javascript
var tween = this.tweens.add({

    targets: image,

    x: 500,

    ease: 'Power1',

    duration: 3000

});

tween.on('start', listener);
```

--------------------------------

### Phaser Game Initialization

Source: https://docs.phaser.io/api-documentation/class/game

Demonstrates the initialization of a Phaser Game instance using a configuration object. The Game instance is the main controller for the entire Phaser game, handling boot process, configuration parsing, renderer creation, and global systems setup.

```javascript
new Phaser.Game(gameConfig);
```

--------------------------------

### GameObjectFactory Methods

Source: https://docs.phaser.io/api-documentation/class/gameobjects-gameobjectfactory

Provides documentation for the methods available on the Phaser GameObjectFactory class, including shutdown and start.

```APIDOC
GameObjectFactory:
  shutdown(): void
    Description: Shuts down the factory and releases its resources.
    Related: start()

  start(): void
    Description: Starts the factory, preparing it for use.
    Related: shutdown()
```

--------------------------------

### Matter Physics Sleep Start Event

Source: https://docs.phaser.io/api-documentation/namespace/physics-matter-events

The Matter Physics Sleep Start Event is dispatched when a Body starts sleeping. Listen to this event from a Scene using `this.matter.world.on('sleepstart', listener)`. It provides the Sleep Event object and the body that started sleeping.

```javascript
this.matter.world.on('sleepstart', listener);
```

--------------------------------

### UpdateList start() Method

Source: https://docs.phaser.io/api-documentation/class/gameobjects-updatelist

This method is called automatically by the Scene when it is starting up. It is responsible for creating local systems, properties and listening for Scene events. Do not invoke it directly. Access: private.

```javascript
start()

Description:
This method is called automatically by the Scene when it is starting up.
It is responsible for creating local systems, properties and listening for Scene events.
Do not invoke it directly.
Access: private
Since: 3.5.0
```

--------------------------------

### Phaser Game Object Pipeline Management

Source: https://docs.phaser.io/api-documentation/class/gameobjects-grid

Manages the initialization and setting of WebGL pipelines for Phaser Game Objects. `initPipeline` is for initial setup during instantiation, while `initPostPipeline` handles post-processing effects.

```APIDOC
initPipeline([pipeline]): boolean
  Description: Sets the initial WebGL Pipeline of this Game Object. Should only be called during instantiation.
  Parameters:
    pipeline (string | Phaser.Renderer.WebGL.WebGLPipeline): The string-based name of the pipeline, or a pipeline instance.
  Returns: boolean - true if the pipeline was set successfully, otherwise false.

initPostPipeline([preFX]): void
  Description: Initializes post-processing pipelines. Called by default by core Game Objects during instantiation.
  Parameters:
    preFX (boolean): Does this Game Object support Pre FX? (optional, default: false)
  Inherits: Phaser.GameObjects.Components.PostPipeline#initPostPipeline
```

--------------------------------

### Phaser ParticleEmitter start Method

Source: https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter

Starts or restarts the particle emitter. It can advance the emission by a specified time and limit the emission duration. This method emits the START event.

```APIDOC
start([advance], [duration])
  Parameters:
    advance (number, optional): Advance this number of ms in time through the emitter. Default: 0
    duration (number, optional): Limit this emitter to only emit particles for the given number of ms. Default: 0
  Returns: Phaser.GameObjects.Particles.ParticleEmitter - This Particle Emitter.
  Fires: Phaser.GameObjects.Particles.Events#event:START
```

--------------------------------

### Phaser Renderer Boot API

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-pointlightpipeline

Called when the Game has fully booted and the Renderer has finished setting up. Allows for final pipeline tasks that rely on game systems. Inherited from Phaser.Renderer.WebGL.WebGLPipeline.

```APIDOC
boot()
  Fires: Phaser.Renderer.WebGL.Pipelines.Events#event:BOOT
  Inherits: Phaser.Renderer.WebGL.WebGLPipeline#boot
  Since: 3.11.0
```

--------------------------------

### Phaser Loader Plugin START Event

Source: https://docs.phaser.io/api-documentation/namespace/loader-events

The Loader Plugin Start Event is dispatched when the Loader starts running. At this point, load progress is zero. This event is dispatched even if there aren't any files in the load queue. Listen to it from a Scene using: `this.load.on('start', listener)`. It provides a reference to the Loader Plugin.

```javascript
this.load.on('start', (loader) => {
  console.log('Loader has started.');
});
```

--------------------------------

### Camera Fade Out Start Event

Source: https://docs.phaser.io/api-documentation/namespace/cameras-scene2d-events

The Camera Fade Out Start Event is dispatched by a Camera instance when the Fade Out Effect starts. It includes details about the camera, effect, duration, and color channels.

```APIDOC
FADE_OUT_START:
  description: The Camera Fade Out Start Event.
  parameters:
    camera: The camera that the effect began on.
    effect: A reference to the effect instance.
    duration: The duration of the effect.
    red: The red color channel value.
    green: The green color channel value.
    blue: The blue color channel value.
```

--------------------------------

### Phaser TweenManager start() Method

Source: https://docs.phaser.io/api-documentation/class/tweens-tweenmanager

Starts the Tween Manager.

```APIDOC
start(): void
  Description:
    Starts the Tween Manager.
```

--------------------------------

### Phaser Input Plugin Lifecycle and Management Methods

Source: https://docs.phaser.io/api-documentation/class/input-inputplugin

Includes methods for managing the plugin's lifecycle and internal processes. `boot` initializes the plugin, `destroy` cleans up resources, `onGameOut` and `onGameOver` handle game state changes, and `preUpdate` is a hook for pre-update logic.

```APIDOC
boot()
  - Initializes the Input Plugin.

destroy()
  - Destroys the Input Plugin and releases its resources.

onGameOut()
  - Handles the event when the game loses focus or goes out of bounds.

onGameOver()
  - Handles the event when the game is over.

preUpdate()
  - A hook called before the update loop, used for pre-update logic.
```

--------------------------------

### Phaser ColorMatrixFXPipeline Constructor

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-colormatrixfxpipeline

API documentation for the ColorMatrixFXPipeline constructor in Phaser. It initializes the pipeline with a reference to the Phaser Game instance.

```APIDOC
ColorMatrixFXPipeline:
  new ColorMatrixFXPipeline(game)
    Parameters:
      game: Phaser.Game - A reference to the Phaser Game instance.
```

--------------------------------

### Phaser Scene START Event

Source: https://docs.phaser.io/api-documentation/event/scenes-events

The Scene Systems Start Event is dispatched during the Scene Systems start process, primarily used by Scene Plugins. Listeners can react to the Scene's initialization.

```APIDOC
START:
  Description: The Scene Systems Start Event.
  Dispatched by: Scene during Scene Systems start process.
  Listen via: `this.events.on('start', listener)`
  Purpose: Primarily used by Scene Plugins for initialization.
  Parameters:
    - sys: [Phaser.Scenes.Systems] - Reference to the Scene Systems class.
  Member of: [Phaser.Scenes.Events]
  Source: src/scene/events/START_EVENT.js#L7
  Since: 3.0.0
```

--------------------------------

### Phaser Lights Plugin Boot API

Source: https://docs.phaser.io/api-documentation/class/gameobjects-lightsplugin

Boots the Lights Plugin, initializing its systems and making it ready for use within a Phaser scene. This is typically called automatically when the plugin is added to a scene.

```APIDOC
boot()
  Description: Boot the Lights Plugin.
  Source: src/gameobjects/lights/LightsPlugin.js#L78
  Since: 3.0.0
```

--------------------------------

### Phaser Scene START Event

Source: https://docs.phaser.io/api-documentation/namespace/scenes-events

The Scene Systems Start Event is dispatched during the Scene Systems start process, primarily utilized by Scene Plugins. It signals the beginning of a Scene's active state.

```APIDOC
START:
  Description: The Scene Systems Start Event.
  Dispatched by: Scene during Scene Systems start process.
  Listen via: `this.events.on('start', listener)`
  Purpose: Primarily used by Scene Plugins to initialize.
  Parameters:
    - sys: Phaser.Scenes.Systems (No) - Reference to the Scene Systems class.
  Source: src/scene/events/START_EVENT.js#L7
  Since: 3.0.0
```

--------------------------------

### Phaser Tween Start Event

Source: https://docs.phaser.io/api-documentation/event/tweens-events

The Tween Start Event is dispatched by a Tween when it begins tweening its first property. This event fires once after any delay has expired. It is emitted from a Tween instance using `Tween.on('start', listener)`.

```javascript
var tween = this.tweens.add({

    targets: image,

    x: 500,

    ease: 'Power1',

    duration: 3000

});

tween.on('start', listener);
```

--------------------------------

### Phaser Animation Creation Example

Source: https://docs.phaser.io/api-documentation/class/physics-arcade-sprite

Demonstrates how to create a global animation using the Animation Manager in Phaser. This animation can then be played by multiple sprites. The example shows setting the key, frames, frame rate, and repeat behavior.

```javascript
var config = {
    key: 'run',
    frames: 'muybridge',
    frameRate: 15,
    repeat: -1
};

// This code should be run from within a Scene:
this.anims.create(config);
```

--------------------------------

### Phaser WebGLPipeline onBoot Method

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-fx-bloomfxpipeline

The onBoot method is called once after the pipeline has finished its setup during the boot process. At this point, all shaders are ready and configured.

```APIDOC
onBoot()
  Description:
    This method is called once when this pipeline has finished being set-up
    at the end of the boot process. By the time this method is called, all
    of the shaders are ready and configured.
```

--------------------------------

### Matter Physics Drag Start Event

Source: https://docs.phaser.io/api-documentation/namespace/physics-matter-events

The Matter Physics Drag Start Event is dispatched by a Matter Physics World instance when a Pointer Constraint starts dragging a body. Listen to it using: `this.matter.world.on('dragstart', listener)`.

```APIDOC
DRAG_START:
  description: The Matter Physics Drag Start Event. This event is dispatched by a Matter Physics World instance when a Pointer Constraint starts dragging a body.
  listen_via: this.matter.world.on('dragstart', listener)
  parameters:
    body: MatterJS.BodyType No The Body that has started being dragged. This is a Matter Body, not a Phaser Game Object.
    part: MatterJS.BodyType No The part of the body that was clicked on.
    constraint: [Phaser.Physics.Matter.PointerConstraint] No The Pointer Constraint that is dragging the body.
  since: 3.16.2
```

--------------------------------

### Phaser API Documentation Overview

Source: https://docs.phaser.io/api-documentation/class/gameobjects-dynamicbitmaptext

Provides links to various sections of the Phaser API documentation, including namespaces, game objects, physics, events, classes, functions, constants, and typedefs.

```APIDOC
Phaser API Documentation:
  - Phaser 3.87.0 API Documentation: https://docs.phaser.io/api-documentation/api-documentation
  - Namespaces: https://docs.phaser.io/api-documentation/namespace
  - Game Objects: https://docs.phaser.io/api-documentation/gameobjects
  - Physics: https://docs.phaser.io/api-documentation/physics
  - Events: https://docs.phaser.io/api-documentation/event
  - Class: https://docs.phaser.io/api-documentation/class
  - Functions: https://docs.phaser.io/api-documentation/function
  - Constants: https://docs.phaser.io/api-documentation/constant
  - Typedefs: https://docs.phaser.io/api-documentation/typedef
```

--------------------------------

### Particle Emitter START Event

Source: https://docs.phaser.io/api-documentation/namespace/gameobjects-particles-events

This event is dispatched when a Particle Emitter starts emission of particles. Listen for it on a Particle Emitter instance using `ParticleEmitter.on('start', listener)`. The event provides a reference to the Particle Emitter that just completed.

```APIDOC
START Event:
  Description: The Particle Emitter Start Event.
  Parameters:
    emitter | [Phaser.GameObjects.Particles.ParticleEmitter](https://docs.phaser.io/api-documentation/class/gameobjects-particles-particleemitter) | No | A reference to the Particle Emitter that just completed.
  Source: src/gameobjects/particles/events/START_EVENT.js#L7
  Since: 3.60.0
```

--------------------------------

### Phaser WebGLPipeline Boot Method

Source: https://docs.phaser.io/api-documentation/class/renderer-webgl-pipelines-utilitypipeline

The boot method is called when the Game has fully booted and the Renderer is set up. It allows for final pipeline tasks that depend on game systems like the Texture Manager.

```APIDOC
boot()
  Description: Called when the Game has fully booted and the Renderer has finished setting up. Perform final tasks relying on game systems.
  Fires: [Phaser.Renderer.WebGL.Pipelines.Events#event:BOOT]
  Inherits: [Phaser.Renderer.WebGL.WebGLPipeline#boot]
  Since: 3.11.0
```

--------------------------------

### Phaser Rectangle Point Example

Source: https://docs.phaser.io/api-documentation/class/geom-rectangle

Example of how to define points for use with the FromPoints method.

```javascript
const points = [
    [100, 200],
    [200, 400],
    { x: 30, y: 60 }
]
```