import './style.css';

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Sort colors by HSL for display (returns sorted colors and mapping from display index to original index)
function sortColorsByHSLForDisplay(colors) {
  const withHsl = colors.map((color, index) => {
    const rgb = hexToRgb(color);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };
    return { color, index, hsl };
  });

  // Sort by hue first, then saturation, then lightness
  withHsl.sort((a, b) => {
    if (Math.abs(a.hsl.h - b.hsl.h) > 1) return a.hsl.h - b.hsl.h;
    if (Math.abs(a.hsl.s - b.hsl.s) > 1) return a.hsl.s - b.hsl.s;
    return a.hsl.l - b.hsl.l;
  });

  // Return sorted colors and mapping from display index to original index
  const sortedColors = withHsl.map(item => item.color);
  const sortedIndices = withHsl.map(item => item.index); // displayIndex -> originalIndex

  return { sortedColors, sortedIndices };
}

// Palette loader
async function loadPalette() {
  const response = await fetch('/palette.txt');
  const text = await response.text();
  const lines = text.split('\n');
  const colors = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith(';')) {
      // Format: FF000000 (ARGB) -> #000000 (RGB)
      const hex = trimmed.substring(2);
      colors.push('#' + hex);
    }
  }

  return colors;
}

// IndexedDB wrapper for persistent storage (replaces localStorage)
class IDB {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        this.db = req.result;
        resolve(this.db);
      };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async set(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async get(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

// Singleton DB instance
const db = new IDB('pixelart_editor', 'store');

// ASCII alphabet for color codes (single character per color)
const COLOR_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*()_+-=[]{};:,/<?`"';

// Generate color codes as single characters from the ASCII alphabet
function generateColorCodes(count) {
  const codes = [];

  for (let i = 0; i < count; i++) {
    if (i < COLOR_CHARS.length) {
      codes.push(COLOR_CHARS[i]);
    } else {
      // If we exceed the character set, fall back to hex (shouldn't happen with current palette)
      codes.push(i.toString(16).padStart(2, '0').toUpperCase());
    }
  }

  return codes;
}

// Frame data structure
class Frame {
  constructor(pixels = new Map()) {
    this.pixels = new Map(pixels);
    this.history = []; // Undo history per frame
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    // Initialize with first state
    this.saveState();
  }

  saveState(forceNew = false) {
    const now = Date.now();
    const state = {
      pixels: new Map(this.pixels),
      timestamp: now,
      preAction: forceNew
    };

    // Remove any states after current index (when undoing then making new changes)
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Time-based grouping: if last save was less than 3 seconds ago, replace it
    // But NOT if forceNew is true or last state was pre-action (pre-action saves must be preserved)
    const lastState = this.history[this.historyIndex];
    if (!forceNew && lastState && !lastState.preAction && lastState.timestamp && (now - lastState.timestamp) < 3000) {
      // Replace last state with current one (group rapid changes)
      this.history[this.historyIndex] = state;
    } else {
      // Add new state
      this.history.push(state);
      this.historyIndex = this.history.length - 1;

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.historyIndex--; // Adjust index when removing from front
      }
    }
  }

  undo() {
    if (this.historyIndex > 0 && this.history.length > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      if (state && state.pixels) {
        this.pixels = new Map(state.pixels);
        return true;
      }
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1 && this.history.length > 0) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      if (state && state.pixels) {
        this.pixels = new Map(state.pixels);
        return true;
      }
    }
    return false;
  }

  toJSON() {
    return {
      pixels: Array.from(this.pixels.entries()),
      history: this.history.map(h => ({
        pixels: Array.from(h.pixels.entries()),
        timestamp: h.timestamp || 0,
        preAction: h.preAction || false
      })),
      historyIndex: this.historyIndex
    };
  }

  static fromJSON(json) {
    const frame = new Frame();
    // Override the pixels set by constructor
    frame.pixels = new Map(json.pixels || []);
    // Override the history created by constructor
    frame.history = (json.history || []).map(h => ({
      pixels: new Map(h.pixels || []),
      timestamp: h.timestamp || 0,
      preAction: h.preAction || false
    }));
    frame.historyIndex = json.historyIndex ?? -1;
    // Ensure we have at least one state in history and valid index
    if (frame.history.length === 0) {
      // Create initial state without calling saveState (to avoid duplicate)
      frame.history.push({ pixels: new Map(frame.pixels), timestamp: Date.now(), preAction: false });
      frame.historyIndex = 0;
    } else if (frame.historyIndex < 0 || frame.historyIndex >= frame.history.length) {
      // Fix invalid history index
      frame.historyIndex = frame.history.length - 1;
    }
    return frame;
  }
}

// Editor state
class EditorState {
  constructor(width = 320, height = 240) {
    this.width = width;
    this.height = height;
    this.frames = [new Frame()]; // Array of frames
    this.currentFrameIndex = 0; // Currently active frame
    this.guidanceImages = []; // Array of guidance image objects
    this.selectedColorIndex = 0;
    this.toolSize = 1; // Per-tab tool size
    this.toolOpacity = 100; // Per-tab tool opacity
    this.zoom = 4; // Default zoom level
    this.scrollX = 0; // Scroll position X
    this.scrollY = 0; // Scroll position Y
    this.bgColor = '#1a1a1a'; // Canvas background color
    // Legacy support - keep for backward compatibility (deprecated, use frame history)
    this.history = []; // Deprecated - use frame history
    this.historyIndex = -1;
    this.maxHistorySize = 50;
  }

  getCurrentFrame() {
    if (this.currentFrameIndex >= 0 && this.currentFrameIndex < this.frames.length) {
      return this.frames[this.currentFrameIndex];
    }
    // Fallback - ensure we have at least one frame
    if (this.frames.length === 0) {
      this.frames.push(new Frame());
      this.currentFrameIndex = 0;
    }
    return this.frames[0];
  }

  addFrame(duplicateCurrent = true) {
    const currentFrame = this.getCurrentFrame();
    const newFrame = duplicateCurrent
      ? new Frame(currentFrame.pixels)
      : new Frame();
    newFrame.saveState(); // Initialize history
    this.frames.splice(this.currentFrameIndex + 1, 0, newFrame);
    this.currentFrameIndex++;
    return this.currentFrameIndex;
  }

  deleteFrame(index) {
    if (this.frames.length <= 1) return false; // Can't delete last frame
    this.frames.splice(index, 1);
    if (this.currentFrameIndex >= this.frames.length) {
      this.currentFrameIndex = this.frames.length - 1;
    }
    if (this.currentFrameIndex < 0) {
      this.currentFrameIndex = 0;
    }
    return true;
  }

  duplicateFrame(index) {
    const frameToDuplicate = this.frames[index];
    const newFrame = new Frame(frameToDuplicate.pixels);
    // Frame constructor already calls saveState(), so no need to call it again
    this.frames.splice(index + 1, 0, newFrame);
    if (index === this.currentFrameIndex) {
      this.currentFrameIndex++;
    }
    return index + 1;
  }

  moveFrame(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.frames.length) return false;
    if (toIndex < 0 || toIndex >= this.frames.length) return false;
    if (fromIndex === toIndex) return false;
    const [frame] = this.frames.splice(fromIndex, 1);
    this.frames.splice(toIndex, 0, frame);
    if (this.currentFrameIndex === fromIndex) {
      this.currentFrameIndex = toIndex;
    } else if (fromIndex < this.currentFrameIndex && toIndex >= this.currentFrameIndex) {
      this.currentFrameIndex--;
    } else if (fromIndex > this.currentFrameIndex && toIndex <= this.currentFrameIndex) {
      this.currentFrameIndex++;
    }
    return true;
  }

  setCurrentFrame(index) {
    if (index >= 0 && index < this.frames.length) {
      this.currentFrameIndex = index;
      return true;
    }
    return false;
  }

  saveState(forceNew = false) {
    // Save current frame state to history
    const frame = this.getCurrentFrame();
    frame.saveState(forceNew);
  }

  undo() {
    const frame = this.getCurrentFrame();
    return frame.undo();
  }

  redo() {
    const frame = this.getCurrentFrame();
    return frame.redo();
  }

  setPixel(x, y, colorIndex) {
    const key = `${x},${y}`;
    const frame = this.getCurrentFrame();
    if (colorIndex === null) {
      frame.pixels.delete(key);
    } else {
      frame.pixels.set(key, colorIndex);
    }
  }

  getPixel(x, y) {
    const frame = this.getCurrentFrame();
    return frame.pixels.get(`${x},${y}`) ?? null;
  }

  // Legacy support - get pixels for current frame
  get pixels() {
    return this.getCurrentFrame().pixels;
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      frames: this.frames.map(f => f.toJSON()),
      currentFrameIndex: this.currentFrameIndex,
      selectedColorIndex: this.selectedColorIndex,
      toolSize: this.toolSize ?? 1,
      toolOpacity: this.toolOpacity ?? 100,
      zoom: this.zoom ?? 4,
      scrollX: this.scrollX ?? 0,
      scrollY: this.scrollY ?? 0,
      bgColor: this.bgColor ?? '#1a1a1a',
      // Legacy support
      pixels: Array.from(this.getCurrentFrame().pixels.entries())
    };
  }

  static fromJSON(json) {
    const state = new EditorState(json.width, json.height);

    // Load frames if available, otherwise create from legacy pixels
    if (json.frames && json.frames.length > 0) {
      state.frames = json.frames.map(f => Frame.fromJSON(f));
      state.currentFrameIndex = json.currentFrameIndex ?? 0;
    } else {
      // Legacy support - convert old single frame to new format
      const legacyPixels = json.pixels ? new Map(json.pixels) : new Map();
      state.frames = [new Frame(legacyPixels)];
      state.currentFrameIndex = 0;
      state.frames[0].saveState();
    }

    state.selectedColorIndex = json.selectedColorIndex ?? 0;
    state.toolSize = json.toolSize ?? 1;
    state.toolOpacity = json.toolOpacity ?? 100;
    state.zoom = json.zoom ?? 4;
    state.scrollX = json.scrollX ?? 0;
    state.scrollY = json.scrollY ?? 0;
    state.bgColor = json.bgColor ?? '#1a1a1a';

    return state;
  }
}

// Tab manager
class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabIndex = 0;
    this.guidanceImages = new Map(); // tabId -> images array (in memory)
  }

  async createTab(name = null, width = 320, height = 240) {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tab = {
      id: tabId,
      name: name || `Drawing ${this.tabs.length + 1}`,
      state: new EditorState(width, height)
    };
    this.tabs.push(tab);
    this.guidanceImages.set(tabId, []);
    await this.saveTabs();
    return tab;
  }

  async deleteTab(index) {
    if (this.tabs.length <= 1) return false;
    const tab = this.tabs[index];
    this.guidanceImages.delete(tab.id);
    this.tabs.splice(index, 1);
    if (this.activeTabIndex >= this.tabs.length) {
      this.activeTabIndex = this.tabs.length - 1;
    }
    await this.saveTabs();
    return true;
  }

  getActiveTab() {
    return this.tabs[this.activeTabIndex];
  }

  getActiveGuidanceImages() {
    const tab = this.getActiveTab();
    if (!tab) return [];
    return this.guidanceImages.get(tab.id) || [];
  }

  setActiveGuidanceImages(images) {
    const tab = this.getActiveTab();
    if (!tab) return;
    this.guidanceImages.set(tab.id, images);
  }

  async renameTab(index, newName) {
    if (index >= 0 && index < this.tabs.length) {
      this.tabs[index].name = newName || `Drawing ${index + 1}`;
      await this.saveTabs();
      return true;
    }
    return false;
  }

  async duplicateTab(index) {
    if (index < 0 || index >= this.tabs.length) return null;
    const original = this.tabs[index];
    const cloneId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clonedState = EditorState.fromJSON(original.state.toJSON());
    const clonedTab = {
      id: cloneId,
      name: `${original.name} Copy`,
      state: clonedState
    };
    this.tabs.splice(index + 1, 0, clonedTab);

    const originalImages = this.guidanceImages.get(original.id) || [];
    const clonedImages = originalImages.map(img => ({ ...img }));
    this.guidanceImages.set(cloneId, clonedImages);

    this.activeTabIndex = index + 1;
    await this.saveTabs();
    return clonedTab;
  }

  async moveTab(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.tabs.length) return false;
    if (toIndex < 0 || toIndex >= this.tabs.length) return false;
    if (fromIndex === toIndex) return false;
    
    const [tab] = this.tabs.splice(fromIndex, 1);
    this.tabs.splice(toIndex, 0, tab);
    
    // Update activeTabIndex if it changed
    if (this.activeTabIndex === fromIndex) {
      this.activeTabIndex = toIndex;
    } else if (fromIndex < this.activeTabIndex && toIndex >= this.activeTabIndex) {
      this.activeTabIndex--;
    } else if (fromIndex > this.activeTabIndex && toIndex <= this.activeTabIndex) {
      this.activeTabIndex++;
    }
    
    await this.saveTabs();
    return true;
  }

  getStateData() {
    return {
      version: 2,
      activeTabIndex: this.activeTabIndex,
      tabs: this.tabs.map(tab => ({
        id: tab.id,
        name: tab.name,
        state: tab.state.toJSON(),
        guidanceImages: (this.guidanceImages.get(tab.id) || []).map(img => ({ ...img }))
      }))
    };
  }

  setStateData(data) {
    if (!data) return false;

    let tabsData;
    let activeIndex = 0;

    if (Array.isArray(data)) {
      // Legacy format (array of tabs without guidance images)
      tabsData = data;
    } else if (data.tabs && Array.isArray(data.tabs)) {
      tabsData = data.tabs;
      activeIndex = typeof data.activeTabIndex === 'number' ? data.activeTabIndex : 0;
    } else {
      return false;
    }

    if (!tabsData.length) return false;

    this.tabs = tabsData.map((item, idx) => {
      const tabId = item.id || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idx}`;
      return {
        id: tabId,
        name: item.name || `Drawing ${idx + 1}`,
        state: EditorState.fromJSON(item.state || item)
      };
    });

    this.guidanceImages = new Map();
    this.tabs.forEach((tab, idx) => {
      let images = [];
      const source = tabsData[idx];
      if (source && Array.isArray(source.guidanceImages)) {
        images = source.guidanceImages.map(img => ({ ...img }));
      }
      this.guidanceImages.set(tab.id, images);
    });

    this.activeTabIndex = Math.min(Math.max(activeIndex, 0), this.tabs.length - 1);
    return true;
  }

  async saveTabs() {
    const data = this.getStateData();
    try {
      await db.set('pixelart_tabs', data);
    } catch (e) {
      console.error('Failed to save tabs to IndexedDB:', e);
    }
  }

  async loadTabs() {
    try {
      const data = await db.get('pixelart_tabs');
      if (data) {
        if (this.setStateData(data)) {
          // Ensure guidance images exist for each tab
          this.tabs.forEach(tab => {
            if (!this.guidanceImages.has(tab.id)) {
              this.guidanceImages.set(tab.id, []);
            }
          });
          await this.saveTabs(); // Normalize stored format
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to load tabs from IndexedDB:', e);
      this.tabs = [];
    }
    if (this.tabs.length === 0) {
      this.createTab('Drawing 1');
    }
    return false;
  }
}

// Tools
const TOOLS = {
  CURSOR: 'cursor',
  PAINT: 'paint',
  ERASER: 'eraser',
  BUCKET: 'bucket',
  EYEDROPPER: 'eyedropper',
  SQUARE: 'square',
  SELECTION: 'selection',
  LINE: 'line',
  FLIP_H: 'flip-h',
  FLIP_V: 'flip-v'
};

// Main app
class PixelArtEditor {
  constructor() {
    this.palette = [];
    this.colorCodes = [];
    this.colorIndexMap = new Map(); // Maps old index to new sorted index
    this.tabManager = new TabManager();
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.selectedGuidanceImage = null;
    this.guidanceImageDragging = false;
    this.guidanceImageResizing = false;
    this.guidanceImageStartPos = { x: 0, y: 0 };
    this.guidanceImageStartSize = { w: 0, h: 0 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.panOffset = { x: 0, y: 0 };

    // Tool system
    this.currentTool = TOOLS.PAINT;
    // toolSize and toolOpacity are now per-tab (stored in EditorState)
    this.selection = null; // { x, y, width, height, pixels: Map }
    this.selectionStart = null;
    this.isSelecting = false;
    this.clipboard = null; // Copied selection
    this.squareStart = null;
    this.isDrawingSquare = false;
    this.squareEnd = null; // For preview
    this.lineStart = null;
    this.isDrawingLine = false;
    this.lineEnd = null;
    this.mousePos = { x: 0, y: 0 };
    this.isMovingSelection = false;
    this.selectionMoveStart = { x: 0, y: 0 };
    this.selectionResizeHandle = null; // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
    this.isResizingSelection = false;
    this.preAltTool = null; // Tool to restore after Alt key release
  }

  get pixelSize() {
    return this.getActiveState().zoom;
  }

  set pixelSize(value) {
    const state = this.getActiveState();
    if (state) {
      state.zoom = value;
      this.tabManager.saveTabs().catch(e => console.error('Failed to save tabs:', e));
    }
  }

  async init() {
    // Load palette - keep original order for codes
    this.originalPalette = await loadPalette();

    if (this.originalPalette.length === 0) {
      console.error('Failed to load palette');
      return;
    }

    // Generate codes based on original order
    this.colorCodes = generateColorCodes(this.originalPalette.length);

    // Sort colors by HSL for display only
    const { sortedColors, sortedIndices } = sortColorsByHSLForDisplay(this.originalPalette);
    this.displayPalette = sortedColors; // Sorted for display
    this.displayIndices = sortedIndices; // Maps display index to original index
    this.palette = this.originalPalette; // Keep original for codes

    // Load tabs
    await this.tabManager.loadTabs();

    // Initialize history for tabs - frames handle their own history
    // No need to initialize EditorState history (deprecated)

    // Ensure active tab has valid selected color
    const activeState = this.getActiveState();
    if (activeState.selectedColorIndex >= this.palette.length) {
      activeState.selectedColorIndex = 0;
    }

    // Render UI
    this.render();
    this.setupEventListeners();
    this.draw();

    // Load skip-empty preference
    const skipEmptyPref = await db.get('pixelart_skip_empty');
    if (skipEmptyPref !== null) {
      const skipEmptyCheckbox = document.getElementById('skip-empty');
      if (skipEmptyCheckbox) {
        skipEmptyCheckbox.checked = skipEmptyPref;
      }
    }
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="editor-container">
        <div class="editor-main">
          <div class="tabs-bar">
            ${this.tabManager.tabs.map((tab, idx) => `
               <div class="tab ${idx === this.tabManager.activeTabIndex ? 'active' : ''}" data-tab-index="${idx}" draggable="true">
                <span class="tab-name" data-tab-index="${idx}">${tab.name}</span>
                <button class="tab-close" data-tab-index="${idx}">×</button>
              </div>
            `).join('')}
            <button class="tab-add" id="add-tab">+</button>
            <button class="tab-duplicate" id="duplicate-tab" title="Duplicate Tab">⧉</button>
          </div>
          <div class="canvas-container">
            <div class="canvas-wrapper">
              <canvas id="editor-canvas"></canvas>
              <div id="guidance-layer"></div>
            </div>
          </div>
          <div class="timeline-container">
            <div class="timeline-header">
              <button id="add-frame" title="Add Frame (Ins)">+</button>
              <button id="duplicate-frame" title="Duplicate Frame">⧉</button>
              <button id="delete-frame" title="Delete Frame (Del)">×</button>
            </div>
            <div class="timeline-frames" id="timeline-frames"></div>
          </div>
        </div>
        <div class="editor-sidebar">
          <div class="sidebar-section">
            <h3>Tools</h3>
            <div class="tools-grid" id="tools-grid">
              <button class="tool-btn ${this.currentTool === TOOLS.CURSOR ? 'active' : ''}" data-tool="${TOOLS.CURSOR}" title="Cursor (Q)">
                <span class="tool-icon">👆</span>
                <span class="tool-shortcut">Q</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.PAINT ? 'active' : ''}" data-tool="${TOOLS.PAINT}" title="Paint (W)">
                <span class="tool-icon">🖌️</span>
                <span class="tool-shortcut">W</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.ERASER ? 'active' : ''}" data-tool="${TOOLS.ERASER}" title="Eraser (E)">
                <span class="tool-icon">🧹</span>
                <span class="tool-shortcut">E</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.BUCKET ? 'active' : ''}" data-tool="${TOOLS.BUCKET}" title="Bucket Fill (R)">
                <span class="tool-icon">🪣</span>
                <span class="tool-shortcut">R</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.EYEDROPPER ? 'active' : ''}" data-tool="${TOOLS.EYEDROPPER}" title="Eyedropper (A)">
                <span class="tool-icon">👁️</span>
                <span class="tool-shortcut">A</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.SQUARE ? 'active' : ''}" data-tool="${TOOLS.SQUARE}" title="Square (S)">
                <span class="tool-icon">⬜</span>
                <span class="tool-shortcut">S</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.LINE ? 'active' : ''}" data-tool="${TOOLS.LINE}" title="Line (D)">
                <span class="tool-icon">📏</span>
                <span class="tool-shortcut">D</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.SELECTION ? 'active' : ''}" data-tool="${TOOLS.SELECTION}" title="Selection (F)">
                <span class="tool-icon">🔲</span>
                <span class="tool-shortcut">F</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.FLIP_H ? 'active' : ''}" data-tool="${TOOLS.FLIP_H}" title="Flip Horizontal (Z)">
                <span class="tool-icon">↔️</span>
                <span class="tool-shortcut">Z</span>
              </button>
              <button class="tool-btn ${this.currentTool === TOOLS.FLIP_V ? 'active' : ''}" data-tool="${TOOLS.FLIP_V}" title="Flip Vertical (X)">
                <span class="tool-icon">↕️</span>
                <span class="tool-shortcut">X</span>
              </button>
            </div>
            <div class="config-row" style="margin-top: 12px;">
              <label>Size:</label>
              <input type="range" id="tool-size" min="1" max="20" value="${this.getActiveState().toolSize}">
              <span id="tool-size-value">${this.getActiveState().toolSize}</span>
            </div>
            <div class="config-row">
              <label>Opacity:</label>
              <input type="range" id="tool-opacity" min="1" max="100" value="${this.getActiveState().toolOpacity}">
              <span id="tool-opacity-value">${this.getActiveState().toolOpacity}%</span>
            </div>
          </div>
          <div class="sidebar-section">
            <h3>Palette</h3>
            <div class="palette-grid" id="palette-grid"></div>
          </div>
          <div class="sidebar-section">
            <h3>Canvas Size</h3>
            <div class="config-row">
              <label>Width:</label>
              <input type="number" id="canvas-width" value="${this.getActiveState().width}" min="1" max="1000">
            </div>
            <div class="config-row">
              <label>Height:</label>
              <input type="number" id="canvas-height" value="${this.getActiveState().height}" min="1" max="1000">
            </div>
            <button id="resize-canvas">Resize</button>
          </div>
          <div class="sidebar-section">
            <h3>Rotate</h3>
            <div style="display: flex; gap: 4px;">
              <button id="rotate-canvas-cw" style="flex: 1; margin: 0;" title="Rotate canvas 90° clockwise">↻ 90°</button>
              <button id="rotate-canvas-ccw" style="flex: 1; margin: 0;" title="Rotate canvas 90° counter-clockwise">↺ 90°</button>
            </div>
          </div>
          <div class="sidebar-section">
            <h3>Background</h3>
            <div class="config-row">
              <label>Color:</label>
              <input type="color" id="bg-color" value="${this.getActiveState().bgColor || '#1a1a1a'}">
            </div>
          </div>
          <div class="sidebar-section">
            <h3>Zoom</h3>
            <div class="config-row">
              <button id="zoom-out">-</button>
              <input type="range" id="zoom-slider" min="1" max="40" value="${this.getActiveState().zoom}">
              <button id="zoom-in">+</button>
            </div>
            <div class="config-row">
              <span id="zoom-value">${this.getActiveState().zoom}x</span>
              <button id="zoom-reset">Reset</button>
            </div>
          </div>
          <div class="sidebar-section" id="selection-controls" style="display: none;">
            <h3>Selection</h3>
            <button id="copy-selection">Copy (Ctrl+C)</button>
            <button id="paste-selection">Paste (Ctrl+V)</button>
            <button id="delete-selection">Delete</button>
            <div class="config-row" style="margin-top: 8px;">
              <label>Scale X:</label>
              <input type="range" id="scale-x" min="0.1" max="3" step="0.1" value="1">
              <span id="scale-x-value">100%</span>
            </div>
            <div class="config-row">
              <label>Scale Y:</label>
              <input type="range" id="scale-y" min="0.1" max="3" step="0.1" value="1">
              <span id="scale-y-value">100%</span>
            </div>
            <button id="apply-scale">Apply Scale</button>
            <div style="display: flex; gap: 4px; margin-top: 8px;">
              <button id="rotate-cw" style="flex: 1; margin: 0;" title="Rotate 90° clockwise">↻ 90°</button>
              <button id="rotate-ccw" style="flex: 1; margin: 0;" title="Rotate 90° counter-clockwise">↺ 90°</button>
              <button id="rotate-180" style="flex: 1; margin: 0;" title="Rotate 180°">↻ 180°</button>
            </div>
            <button id="clear-selection">Clear Selection</button>
          </div>
          <div class="sidebar-section">
            <h3>Guidance Image</h3>
            <button id="paste-image">Paste Image</button>
            <div id="paste-image-modal" style="display: none; margin-top: 8px; padding: 8px; background: #1a1a1a; border: 1px solid #444; border-radius: 4px;">
              <p style="font-size: 11px; color: #888; margin-bottom: 8px;">Set target dimensions for the imported image:</p>
              <div class="config-row">
                <label>Width:</label>
                <input type="number" class="fixed-width" id="paste-target-width" value="${this.getActiveState().width}" min="1" max="2000" style="width: 70px;">
              </div>
              <div class="config-row">
                <label>Height:</label>
                <input type="number" class="fixed-width" id="paste-target-height" value="${this.getActiveState().height}" min="1" max="2000" style="width: 70px;">
              </div>
              <button id="confirm-paste-image" style="margin-top: 8px;">Import</button>
              <button id="cancel-paste-image" style="margin-top: 4px; background: #444;">Cancel</button>
            </div>
            <div id="guidance-controls" style="display: none;">
              <div class="config-row">
                <label>Opacity:</label>
                <input type="range" id="guidance-opacity" min="0" max="100" value="50">
                <span id="opacity-value">50%</span>
              </div>
              <button id="remove-guidance">Remove</button>
            </div>
          </div>
          <div class="sidebar-section">
            <h3>Import</h3>
            <div class="config-row">
              <label>Target W:</label>
              <input type="number" class="fixed-width" id="import-target-width" value="${this.getActiveState().width}" min="1" max="2000" style="width: 60px;">
              <label>H:</label>
              <input type="number" class="fixed-width" id="import-target-height" value="${this.getActiveState().height}" min="1" max="2000" style="width: 60px;">
            </div>
            <textarea id="import-code" placeholder="Paste CSEF code here (width: 30, encoded: '...' or just the encoded string)" style="width: 100%; height: 60px; font-family: monospace; font-size: 11px; resize: vertical; margin-top: 8px;"></textarea>
            <button id="import-sprite" style="margin-top: 8px; width: 100%;">Load Sprite</button>
            <p style="font-size: 11px; color: #888; margin-top: 4px;">
              Supports CSEF format: width: 30, encoded: '...' or just the encoded string
            </p>
            <div style="margin-top: 12px; border-top: 1px solid #444; padding-top: 8px;">
              <p style="font-size: 11px; color: #888; margin-bottom: 8px;">Import image as pixel art:</p>
              <div class="config-row">
                <label>Width:</label>
                <input type="number" class="fixed-width" id="import-image-width" value="${this.getActiveState().width}" min="1" max="2000" style="width: 60px;">
              </div>
              <div class="config-row">
                <label>Height:</label>
                <input type="number" class="fixed-width" id="import-image-height" value="${this.getActiveState().height}" min="1" max="2000" style="width: 60px;">
              </div>
              <button id="import-image-btn" style="margin-top: 8px; width: 100%;">Import Image</button>
            </div>
          </div>
          <div class="sidebar-section">
            <h3>Export</h3>
            <div class="config-row">
              <label>
                <input type="checkbox" id="skip-empty">
                Skip empty spaces
              </label>
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 4px;">
              Export format: CSEF (Compact Sprite Encoding Format) with RLE compression
            </p>
            <button id="export-code">Export Code</button>
            <button id="copy-code" style="background: #666;">Copy Code</button>
            <textarea id="export-output" readonly rows="10"></textarea>
          </div>
          <div class="sidebar-section">
            <h3>Export Palette</h3>
            <div class="config-row">
              <label>
                <input type="checkbox" id="include-unused-colors" checked>
                Include non-used colors
              </label>
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 4px;">
              Generates a C-style palette array from the current palette
            </p>
            <button id="export-palette">Generate Palette</button>
            <button id="copy-palette" style="background: #666;">Copy Palette</button>
            <textarea id="palette-output" readonly rows="10"></textarea>
          </div>
          <div class="sidebar-section">
            <h3>App State</h3>
            <button id="save-app-state">Save App State</button>
            <button id="load-app-state">Load App State</button>
            <p style="font-size: 11px; color: #888; margin-top: 4px;">
              Saves a backup to IndexedDB (pixelart_app_state_backup) and restores it later.
            </p>
          </div>
          <div class="sidebar-section">
            <h3>Color Codes</h3>
            <div class="color-codes-list" id="color-codes-list"></div>
          </div>
        </div>
      </div>
    `;

    // Setup canvas - must be done after render
    this.canvas = document.getElementById('editor-canvas');
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    // Ensure context is properly initialized
    if (!this.ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    // Set image rendering mode for crisp pixels
    this.ctx.imageSmoothingEnabled = false;

    this.updateCanvasSize();

    // Render palette
    this.renderPalette();
    this.renderColorCodes();
    this.renderTimeline();
  }

  renderTimeline() {
    const timelineFrames = document.getElementById('timeline-frames');
    const state = this.getActiveState();

    if (!timelineFrames) return;

    timelineFrames.innerHTML = state.frames.map((frame, idx) => {
      const isActive = idx === state.currentFrameIndex;
      // Create a small thumbnail of the frame
      const thumbnailSize = 64;
      const scale = Math.min(thumbnailSize / state.width, thumbnailSize / state.height, 1);
      const thumbWidth = Math.floor(state.width * scale);
      const thumbHeight = Math.floor(state.height * scale);

      return `
        <div class="timeline-frame ${isActive ? 'active' : ''}" data-frame-index="${idx}" draggable="true">
          <div class="timeline-frame-thumbnail" data-frame-index="${idx}">
            <canvas class="frame-thumbnail-canvas" width="${thumbWidth}" height="${thumbHeight}" data-frame-index="${idx}"></canvas>
          </div>
          <div class="timeline-frame-number">${idx + 1}</div>
        </div>
      `;
    }).join('');

    // Draw thumbnails
    state.frames.forEach((frame, idx) => {
      const canvas = timelineFrames.querySelector(`.frame-thumbnail-canvas[data-frame-index="${idx}"]`);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const thumbWidth = canvas.width;
        const thumbHeight = canvas.height;
        const scaleX = thumbWidth / state.width;
        const scaleY = thumbHeight / state.height;

        // Clear
        ctx.fillStyle = state.bgColor || '#1a1a1a';
        ctx.fillRect(0, 0, thumbWidth, thumbHeight);

        // Draw pixels
        for (const [key, colorIndex] of frame.pixels.entries()) {
          const [x, y] = key.split(',').map(Number);
          if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
            const color = this.palette[colorIndex];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
            }
          }
        }
      }
    });
  }

  renderPalette() {
    const grid = document.getElementById('palette-grid');
    const selectedOriginalIndex = this.getActiveState().selectedColorIndex;

    // Display sorted palette, but track original indices
    grid.innerHTML = this.displayPalette.map((color, displayIdx) => {
      const originalIdx = this.displayIndices[displayIdx];
      const isSelected = originalIdx === selectedOriginalIndex;
      return `
        <div class="palette-color ${isSelected ? 'selected' : ''}"
             data-color-index="${originalIdx}"
             style="background-color: ${color}"
             title="${color} (${this.colorCodes[originalIdx]})">
        </div>
      `;
    }).join('');
  }

  renderColorCodes() {
    const list = document.getElementById('color-codes-list');
    // Show codes in original order
    list.innerHTML = this.originalPalette.map((color, idx) => {
      return `
        <div class="color-code-item">
          <span class="color-code-swatch" style="background-color: ${color}"></span>
          <span class="color-code-code">${this.colorCodes[idx]}</span>
          <span class="color-code-hex">${color}</span>
        </div>
      `;
    }).join('');
  }

  // Get the wrapper dimensions used for positioning
  getWrapperSize() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (wrapper && wrapper.style.width && wrapper.style.height) {
      return {
        w: parseInt(wrapper.style.width),
        h: parseInt(wrapper.style.height)
      };
    }
    return {
      w: window.innerWidth * 2,
      h: window.innerHeight * 2
    };
  }

  // Calculate the pixel coordinate at a given screen position (relative to container)
  // If screenX/screenY are omitted, uses the viewport center
  getPixelAtScreenPosition(screenX, screenY) {
    const container = document.querySelector('.canvas-container');
    if (!container || !this.canvas) return null;
    const wrapper = this.getWrapperSize();
    const canvasLeft = (wrapper.w - this.canvas.width) / 2;
    const canvasTop = (wrapper.h - this.canvas.height) / 2;
    const sx = screenX !== undefined ? screenX : container.clientWidth / 2;
    const sy = screenY !== undefined ? screenY : container.clientHeight / 2;
    const contentX = container.scrollLeft + sx;
    const contentY = container.scrollTop + sy;
    const pixelX = (contentX - canvasLeft) / this.pixelSize;
    const pixelY = (contentY - canvasTop) / this.pixelSize;
    return { x: pixelX, y: pixelY };
  }

  // Scroll so that the given pixel coordinate is at a specific screen position
  // If screenX/screenY are omitted, centers the pixel in the viewport
  scrollToPixel(pixelX, pixelY, screenX, screenY) {
    const container = document.querySelector('.canvas-container');
    if (!container || !this.canvas) return;
    const wrapper = this.getWrapperSize();
    const canvasLeft = (wrapper.w - this.canvas.width) / 2;
    const canvasTop = (wrapper.h - this.canvas.height) / 2;
    const sx = screenX !== undefined ? screenX : container.clientWidth / 2;
    const sy = screenY !== undefined ? screenY : container.clientHeight / 2;
    const contentX = canvasLeft + pixelX * this.pixelSize;
    const contentY = canvasTop + pixelY * this.pixelSize;
    container.scrollLeft = contentX - sx;
    container.scrollTop = contentY - sy;
  }

  updateCanvasSize(skipScrollRestore = false) {
    const state = this.getActiveState();
    const displayWidth = state.width * this.pixelSize;
    const displayHeight = state.height * this.pixelSize;
    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';

    // Position canvas to allow free panning
    const container = document.querySelector('.canvas-container');
    const wrapper = document.querySelector('.canvas-wrapper');
    if (container && wrapper) {
      // Set wrapper to double screen size for panning
      const wrapperWidth = window.innerWidth * 2;
      const wrapperHeight = window.innerHeight * 2;

      wrapper.style.width = wrapperWidth + 'px';
      wrapper.style.height = wrapperHeight + 'px';

      // Position canvas at center of wrapper
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = ((wrapperWidth - displayWidth) / 2) + 'px';
      this.canvas.style.top = ((wrapperHeight - displayHeight) / 2) + 'px';

      // Position guidance layer to cover full wrapper area for free movement
      const guidanceLayer = document.getElementById('guidance-layer');
      if (guidanceLayer) {
        guidanceLayer.style.position = 'absolute';
        guidanceLayer.style.left = '0px';
        guidanceLayer.style.top = '0px';
        guidanceLayer.style.width = wrapperWidth + 'px';
        guidanceLayer.style.height = wrapperHeight + 'px';
      }

      // Restore scroll position from state, or center if first time
      if (!skipScrollRestore) {
        const state = this.getActiveState();
        if (state.scrollX !== undefined && state.scrollY !== undefined) {
          // Restore saved scroll position
          container.scrollLeft = state.scrollX;
          container.scrollTop = state.scrollY;
        } else {
          // Center scroll initially (only if not already scrolled)
          const wasScrolled = container.dataset.wasScrolled === 'true';
          if (!wasScrolled) {
            const centerX = (wrapperWidth - container.clientWidth) / 2;
            const centerY = (wrapperHeight - container.clientHeight) / 2;
            container.scrollLeft = centerX;
            container.scrollTop = centerY;
            state.scrollX = centerX;
            state.scrollY = centerY;
            container.dataset.wasScrolled = 'true';
          }
        }
      }
    }

    this.draw();
    // Update guidance layer position
    setTimeout(() => this.drawGuidanceImages(), 0);
  }

  getActiveState() {
    const tab = this.tabManager.getActiveTab();
    return tab ? tab.state : new EditorState();
  }

  async saveScrollPosition() {
    const container = document.querySelector('.canvas-container');
    if (container) {
      const state = this.getActiveState();
      state.scrollX = container.scrollLeft;
      state.scrollY = container.scrollTop;
      await this.tabManager.saveTabs();
    }
  }

  // Update zoom slider UI and canvas size (instance method so wheel handler always uses current DOM)
  updateZoomUI(skipScrollRestore = false) {
    const state = this.getActiveState();
    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) zoomSlider.value = state.zoom;
    const zoomValue = document.getElementById('zoom-value');
    if (zoomValue) zoomValue.textContent = state.zoom + 'x';
    this.updateCanvasSize(skipScrollRestore);
  }

  restoreScrollPosition() {
    const container = document.querySelector('.canvas-container');
    if (container) {
      const state = this.getActiveState();
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        if (state.scrollX !== undefined && state.scrollY !== undefined) {
          container.scrollLeft = state.scrollX;
          container.scrollTop = state.scrollY;
        }
      }, 10);
    }
  }

  getCursorForTool() {
    switch (this.currentTool) {
      case TOOLS.PAINT: return 'crosshair';
      case TOOLS.ERASER: return 'cell';
      case TOOLS.BUCKET: return 'grab';
      case TOOLS.EYEDROPPER: return 'copy';
      case TOOLS.SQUARE: return 'crosshair';
      case TOOLS.LINE: return 'crosshair';
      case TOOLS.SELECTION: return 'crosshair';
      case TOOLS.CURSOR: return 'default';
      default: return 'crosshair';
    }
  }

  draw() {
    const state = this.getActiveState();
    const ctx = this.ctx;

    if (!ctx || !this.canvas) {
      console.error('Canvas context not available');
      return;
    }

    // Update cursor
    this.canvas.style.cursor = this.getCursorForTool();

    // Clear canvas
    ctx.fillStyle = state.bgColor || '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= state.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.pixelSize, 0);
      ctx.lineTo(x * this.pixelSize, state.height * this.pixelSize);
      ctx.stroke();
    }
    for (let y = 0; y <= state.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.pixelSize);
      ctx.lineTo(state.width * this.pixelSize, y * this.pixelSize);
      ctx.stroke();
    }

    // Draw pixels
    for (const [key, colorIndex] of state.pixels.entries()) {
      const [x, y] = key.split(',').map(Number);
      if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
        const color = this.palette[colorIndex];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
        }
      }
    }

    // Draw selection preview (square tool)
    if (this.isDrawingSquare && this.squareStart && this.squareEnd) {
      ctx.strokeStyle = '#4a9eff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      const minX = Math.min(this.squareStart.x, this.squareEnd.x) * this.pixelSize;
      const maxX = Math.max(this.squareStart.x, this.squareEnd.x) * this.pixelSize;
      const minY = Math.min(this.squareStart.y, this.squareEnd.y) * this.pixelSize;
      const maxY = Math.max(this.squareStart.y, this.squareEnd.y) * this.pixelSize;
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      ctx.setLineDash([]);
    }

    // Draw line preview
    if (this.isDrawingLine && this.lineStart && this.lineEnd) {
      ctx.strokeStyle = '#4a9eff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.lineStart.x * this.pixelSize, this.lineStart.y * this.pixelSize);
      ctx.lineTo(this.lineEnd.x * this.pixelSize, this.lineEnd.y * this.pixelSize);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw selection
    if (this.selection) {
      ctx.strokeStyle = '#4a9eff';
      ctx.fillStyle = 'rgba(74, 158, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      const x = this.selection.x * this.pixelSize;
      const y = this.selection.y * this.pixelSize;
      const w = this.selection.width * this.pixelSize;
      const h = this.selection.height * this.pixelSize;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Draw resize handles if cursor tool is active (only corners)
      if (this.currentTool === TOOLS.CURSOR) {
        const handleSize = 8;
        const handles = [
          { x: x, y: y }, // NW
          { x: x + w, y: y }, // NE
          { x: x, y: y + h }, // SW
          { x: x + w, y: y + h } // SE
        ];

        ctx.fillStyle = '#4a9eff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        handles.forEach(handle => {
          ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
      }
    }

    // Draw tool size preview - show actual pixels that will be drawn
    if (this.currentTool === TOOLS.PAINT || this.currentTool === TOOLS.ERASER) {
      const coords = this.getCanvasCoords({ clientX: this.mousePos.x, clientY: this.mousePos.y });
      if (coords) {
        const state = this.getActiveState();
        const radius = Math.floor(state.toolSize / 2);
        const x = coords.x;
        const y = coords.y;

        ctx.strokeStyle = '#fff';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 1]);

        // Draw preview of actual pixels that will be drawn (same logic as drawBrush)
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const px = x + dx;
            const py = y + dy;

            // Check bounds
            if (px < 0 || px >= state.width || py < 0 || py >= state.height) continue;

            // Circular brush check
            if (state.toolSize > 1) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > radius) continue;
            }

            // Draw preview pixel
            const previewX = px * this.pixelSize;
            const previewY = py * this.pixelSize;
            ctx.fillRect(previewX, previewY, this.pixelSize, this.pixelSize);
            ctx.strokeRect(previewX, previewY, this.pixelSize, this.pixelSize);
          }
        }
        ctx.setLineDash([]);
      }
    }

    // Draw guidance images
    this.drawGuidanceImages();

    // Update timeline thumbnail for current frame
    this.updateTimelineThumbnail();
  }

  updateTimelineThumbnail() {
    const state = this.getActiveState();
    const frameIndex = state.currentFrameIndex;
    const canvas = document.querySelector(`.frame-thumbnail-canvas[data-frame-index="${frameIndex}"]`);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const thumbWidth = canvas.width;
      const thumbHeight = canvas.height;
      const scaleX = thumbWidth / state.width;
      const scaleY = thumbHeight / state.height;
      const frame = state.getCurrentFrame();

      // Clear
      ctx.fillStyle = state.bgColor || '#1a1a1a';
      ctx.fillRect(0, 0, thumbWidth, thumbHeight);

      // Draw pixels
      for (const [key, colorIndex] of frame.pixels.entries()) {
        const [x, y] = key.split(',').map(Number);
        if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
          const color = this.palette[colorIndex];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
          }
        }
      }
    }
  }

  drawGuidanceImages() {
    const layer = document.getElementById('guidance-layer');
    const state = this.getActiveState();
    const images = this.tabManager.getActiveGuidanceImages();

    layer.innerHTML = '';
    // Layer size and position are set in updateCanvasSize() to cover full wrapper
    // Guidance layer itself is transparent to clicks; only images capture events
    layer.style.pointerEvents = 'none';

    images.forEach((imgData, idx) => {
      const imgEl = document.createElement('img');
      imgEl.src = imgData.dataUrl;
      imgEl.className = 'guidance-image';
      if (this.selectedGuidanceImage === idx) {
        imgEl.classList.add('selected');
      }
      imgEl.style.position = 'absolute';
      imgEl.style.left = imgData.x + 'px';
      imgEl.style.top = imgData.y + 'px';
      imgEl.style.width = imgData.width + 'px';
      imgEl.style.height = imgData.height + 'px';
      imgEl.style.opacity = imgData.opacity / 100;
      // Only allow interaction with guidance images when cursor tool is active
      // Other tools (selection, paint, etc.) need events to pass through to canvas
      imgEl.style.pointerEvents = this.currentTool === TOOLS.CURSOR ? 'auto' : 'none';
      imgEl.style.cursor = this.currentTool === TOOLS.CURSOR ? 'move' : 'default';
      imgEl.draggable = false; // Prevent native drag
      imgEl.dataset.guidanceIndex = idx;
      layer.appendChild(imgEl);

      // Selection handles
      if (this.selectedGuidanceImage === idx) {
        const handles = document.createElement('div');
        handles.className = 'guidance-handles';
        handles.style.position = 'absolute';
        handles.style.left = imgData.x + 'px';
        handles.style.top = imgData.y + 'px';
        handles.style.width = imgData.width + 'px';
        handles.style.height = imgData.height + 'px';
        handles.style.pointerEvents = 'none';
        layer.appendChild(handles);
      }
    });
  }

  switchToTab(index) {
    // Save current scroll position before switching
    this.saveScrollPosition();

    this.tabManager.activeTabIndex = index;

    // Restore tool settings for the new tab
    const state = this.getActiveState();

    this.render();
    this.setupEventListeners();

    // Update UI to reflect per-tab settings (after render so elements exist)
    setTimeout(() => {
      document.getElementById('tool-size').value = state.toolSize;
      document.getElementById('tool-size-value').textContent = state.toolSize;
      document.getElementById('tool-opacity').value = state.toolOpacity;
      document.getElementById('tool-opacity-value').textContent = state.toolOpacity + '%';
    }, 0);

    // Update canvas size and redraw (this will restore scroll position)
    this.updateCanvasSize();
    // Also restore scroll position after a brief delay to ensure DOM is ready
    this.restoreScrollPosition();
    // Render timeline for the new tab
    this.renderTimeline();
  }

  setupEventListeners() {
    // Tab management
    // Use instance variables for double-click detection so they persist across re-renders
    if (!this.lastTabClickTime) this.lastTabClickTime = 0;
    if (!this.lastTabClickIndex) this.lastTabClickIndex = -1;

    document.querySelectorAll('.tab').forEach(tab => {
      // Remove existing listeners to avoid duplicates
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);

      newTab.addEventListener('click', async (e) => {
        if (e.target.classList.contains('tab-close')) return;

        const index = parseInt(newTab.dataset.tabIndex);
        const currentTime = Date.now();

        // Check for double click on tab name
        if (e.target.classList.contains('tab-name')) {
          if (currentTime - this.lastTabClickTime < 500 && this.lastTabClickIndex === index) {
            // Double click detected - rename tab
            e.stopPropagation();
            e.preventDefault();
            await this.renameTab(index);
            this.lastTabClickTime = 0;
            this.lastTabClickIndex = -1;
            return; // Don't switch tab on double-click
          }
          this.lastTabClickTime = currentTime;
          this.lastTabClickIndex = index;
          // Continue to tab switch on single click (but wait a bit to see if it's a double-click)
          setTimeout(() => {
            // Only switch if no double-click occurred
            if (this.lastTabClickTime === currentTime && this.lastTabClickIndex === index) {
              // This was a single click, proceed with tab switch
              this.switchToTab(index);
            }
          }, 300);
          return;
        }

        // Single click on tab (not on name) - switch immediately
        this.switchToTab(index);
      });

      // Drag and drop for tab reordering
      newTab.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', newTab.dataset.tabIndex);
        newTab.classList.add('dragging');
      });

      newTab.addEventListener('dragend', (e) => {
        newTab.classList.remove('dragging');
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over'));
      });

      newTab.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const draggingTab = document.querySelector('.tab.dragging');
        if (draggingTab && draggingTab !== newTab) {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over'));
          newTab.classList.add('drag-over');
        }
      });

      newTab.addEventListener('dragleave', (e) => {
        newTab.classList.remove('drag-over');
      });

      newTab.addEventListener('drop', async (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(newTab.dataset.tabIndex);
        if (fromIndex !== toIndex && !isNaN(fromIndex) && !isNaN(toIndex)) {
          if (await this.tabManager.moveTab(fromIndex, toIndex)) {
            this.render();
            this.setupEventListeners();
            this.draw();
          }
        }
        newTab.classList.remove('drag-over');
      });
    });

    document.querySelectorAll('.tab-close').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.tabIndex);
        if (await this.tabManager.deleteTab(index)) {
          this.render();
          this.setupEventListeners();
          this.updateCanvasSize();
        }
      });
    });

    document.getElementById('add-tab').addEventListener('click', async () => {
      await this.tabManager.createTab();
      this.render();
      this.setupEventListeners();
      this.updateCanvasSize();
    });

    const duplicateTabBtn = document.getElementById('duplicate-tab');
    if (duplicateTabBtn) {
      duplicateTabBtn.addEventListener('click', async () => {
        const duplicated = await this.tabManager.duplicateTab(this.tabManager.activeTabIndex);
        if (duplicated) {
          this.render();
          this.setupEventListeners();
          this.updateCanvasSize();
          this.renderTimeline();
          this.draw();
          this.drawGuidanceImages();
        }
      });
    }

    // Frame management
    document.getElementById('add-frame').addEventListener('click', async () => {
      const state = this.getActiveState();
      state.addFrame(true); // Duplicate current frame
      await this.tabManager.saveTabs();
      this.renderTimeline();
      this.draw();
    });

    document.getElementById('duplicate-frame').addEventListener('click', async () => {
      const state = this.getActiveState();
      state.duplicateFrame(state.currentFrameIndex);
      await this.tabManager.saveTabs();
      this.renderTimeline();
      this.draw();
    });

    document.getElementById('delete-frame').addEventListener('click', async () => {
      const state = this.getActiveState();
      if (state.deleteFrame(state.currentFrameIndex)) {
        await this.tabManager.saveTabs();
        this.renderTimeline();
        this.draw();
      }
    });

    // Frame selection - use event delegation
    const timelineFrames = document.getElementById('timeline-frames');
    if (timelineFrames) {
      timelineFrames.addEventListener('click', async (e) => {
        const frameEl = e.target.closest('.timeline-frame');
        if (frameEl) {
          const frameIndex = parseInt(frameEl.dataset.frameIndex);
          const state = this.getActiveState();
          if (state.setCurrentFrame(frameIndex)) {
            await this.tabManager.saveTabs();
            this.renderTimeline();
            this.draw();
          }
        }
      });

      // Drag and drop for frame reordering
      timelineFrames.addEventListener('dragstart', (e) => {
        const frameEl = e.target.closest('.timeline-frame');
        if (frameEl) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', frameEl.dataset.frameIndex);
          frameEl.classList.add('dragging');
        }
      });

      timelineFrames.addEventListener('dragend', (e) => {
        const frameEl = e.target.closest('.timeline-frame');
        if (frameEl) {
          frameEl.classList.remove('dragging');
        }
        document.querySelectorAll('.timeline-frame').forEach(f => f.classList.remove('drag-over'));
      });

      timelineFrames.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const frameEl = e.target.closest('.timeline-frame');
        if (frameEl) {
          const draggingFrame = document.querySelector('.timeline-frame.dragging');
          if (draggingFrame && draggingFrame !== frameEl) {
            document.querySelectorAll('.timeline-frame').forEach(f => f.classList.remove('drag-over'));
            frameEl.classList.add('drag-over');
          }
        }
      });

      timelineFrames.addEventListener('dragleave', (e) => {
        const frameEl = e.target.closest('.timeline-frame');
        if (frameEl) {
          frameEl.classList.remove('drag-over');
        }
      });

      timelineFrames.addEventListener('drop', async (e) => {
        e.preventDefault();
        const frameEl = e.target.closest('.timeline-frame');
        if (frameEl) {
          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
          const toIndex = parseInt(frameEl.dataset.frameIndex);
          if (fromIndex !== toIndex && !isNaN(fromIndex) && !isNaN(toIndex)) {
            const state = this.getActiveState();
            if (state.moveFrame(fromIndex, toIndex)) {
              await this.tabManager.saveTabs();
              this.renderTimeline();
              this.draw();
            }
          }
          frameEl.classList.remove('drag-over');
        }
      });
    }

    // Palette selection - use event delegation so it works after re-renders
    const paletteGrid = document.getElementById('palette-grid');
    if (paletteGrid) {
      // Remove existing listener if any
      if (this.paletteClickHandler) {
        paletteGrid.removeEventListener('click', this.paletteClickHandler);
      }
      this.paletteClickHandler = (e) => {
        const colorEl = e.target.closest('.palette-color');
        if (colorEl) {
          const index = parseInt(colorEl.dataset.colorIndex);
          this.getActiveState().selectedColorIndex = index;
          this.renderPalette();
        }
      };
      paletteGrid.addEventListener('click', this.paletteClickHandler);
    }

    // Tool selection - update UI without full render
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTool = btn.dataset.tool;
        // Stop guidance image dragging if switching away from cursor tool
        if (this.currentTool !== TOOLS.CURSOR) {
          this.guidanceImageDragging = false;
          this.guidanceImageResizing = false;
        }
        // Update tool buttons without full render
        document.querySelectorAll('.tool-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.tool === this.currentTool);
        });
        // Update guidance layer pointer events based on tool
        this.drawGuidanceImages();
        this.draw();
      });
    });

    // Tool size and opacity (per-tab)
    document.getElementById('tool-size').addEventListener('input', async (e) => {
      const state = this.getActiveState();
      state.toolSize = parseInt(e.target.value);
      document.getElementById('tool-size-value').textContent = state.toolSize;
      await this.tabManager.saveTabs();
    });

    document.getElementById('tool-opacity').addEventListener('input', async (e) => {
      const state = this.getActiveState();
      state.toolOpacity = parseInt(e.target.value);
      document.getElementById('tool-opacity-value').textContent = state.toolOpacity + '%';
      await this.tabManager.saveTabs();
    });

    // Panning - attach to container so it works anywhere
    let canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.addEventListener('mousedown', async (e) => {
      // Middle mouse button for panning (works anywhere in container)
      if (e.button === 1) {
        e.preventDefault();
        this.isPanning = true;
        this.panStart = { x: e.clientX, y: e.clientY };
        this.panOffset = { x: canvasContainer.scrollLeft, y: canvasContainer.scrollTop };
        canvasContainer.style.cursor = 'grabbing';
        return;
      }

      // If clicking on a guidance image, let the guidance layer handle it
      if (e.target.closest('.guidance-image')) {
        return;
      }

      const coords = this.getCanvasCoords(e);
      if (!coords) return;

      const state = this.getActiveState();

      // Handle flip tools - apply immediately on click
      if (this.currentTool === TOOLS.FLIP_H || this.currentTool === TOOLS.FLIP_V) {
        await this.applyFlip(this.currentTool === TOOLS.FLIP_H);
        return;
      }

      // Save state before drawing (for undo) - but only once per stroke
      if (this.currentTool !== TOOLS.EYEDROPPER && this.currentTool !== TOOLS.SELECTION && !this.isDrawing) {
        state.saveState(true);
      }

      // Prioritize selection handling when cursor tool is active - check selection BEFORE guidance images
      if (this.currentTool === TOOLS.CURSOR && this.selection) {
        const x = this.selection.x;
        const y = this.selection.y;
        const w = this.selection.width;
        const h = this.selection.height;

        // First check if clicking inside selection (excluding corners)
        const isInside = coords.x >= x && coords.x < x + w && coords.y >= y && coords.y < y + h;

        // Corner detection - very precise, only exact corner or 1 pixel away
        // Reduced threshold for more precise corner clicking
        const cornerThreshold = 1;
        const cornerX = coords.x;
        const cornerY = coords.y;

        let handle = null;

        if (isInside) {
          // Check if we're exactly on or very close to a corner (within 1 pixel)
          const nearNW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
          const nearNE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
          const nearSW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;
          const nearSE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;

          // Only resize if explicitly clicking on corner, otherwise move
          if (nearNW) {
            handle = 'nw';
          } else if (nearNE) {
            handle = 'ne';
          } else if (nearSW) {
            handle = 'sw';
          } else if (nearSE) {
            handle = 'se';
          } else {
            // Clicked inside but not on corner - move (much larger area now)
            handle = 'move';
          }
        } else {
          // Outside selection - check if clicking exactly on a corner
          const nearNW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
          const nearNE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
          const nearSW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;
          const nearSE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;

          if (nearNW) {
            handle = 'nw';
          } else if (nearNE) {
            handle = 'ne';
          } else if (nearSW) {
            handle = 'sw';
          } else if (nearSE) {
            handle = 'se';
          }
        }

        if (handle) {
          if (handle === 'move') {
            this.isMovingSelection = true;
            this.selectionMoveStart = { x: coords.x - this.selection.x, y: coords.y - this.selection.y };
            this.selectionOriginalPos = { x: this.selection.x, y: this.selection.y };
            state.saveState(true);
          } else {
            // Corner resize
            this.isResizingSelection = true;
            this.selectionResizeHandle = handle;
            this.selectionResizeStart = {
              x: coords.x,
              y: coords.y,
              w: this.selection.width,
              h: this.selection.height,
              origX: this.selection.x,
              origY: this.selection.y
            };
            // Store original pixels on first resize
            if (!this.selection.originalPixels) {
              this.selection.originalPixels = new Map(this.selection.pixels);
              this.selection.originalWidth = this.selection.width;
              this.selection.originalHeight = this.selection.height;
            }
            state.saveState(true);
          }
        } else {
          // Clicked outside selection - only clear if not already moving/resizing
          if (!this.isMovingSelection && !this.isResizingSelection) {
            this.selection = null;
            document.getElementById('selection-controls').style.display = 'none';
            this.draw();
          }
        }
        // Selection was handled, return early
        return;
      }

      // Check for guidance images only if cursor tool is active and no selection was clicked
      if (this.currentTool === TOOLS.CURSOR) {
        const guidanceLayer = document.getElementById('guidance-layer');
        if (guidanceLayer) {
          const elements = document.elementsFromPoint(e.clientX, e.clientY);
          const clickedGuidanceImage = elements.find(el =>
            el.classList.contains('guidance-image') ||
            el.classList.contains('guidance-handles')
          );

          if (clickedGuidanceImage) {
            // Let guidance layer handle it (only when cursor tool is active and not clicking on selection)
            return;
          }
        }
      }

      // Continue with other tool logic
      if (this.currentTool === TOOLS.SQUARE) {
        this.squareStart = coords;
        this.isDrawingSquare = true;
        state.saveState(true); // Save before drawing square
      } else if (this.currentTool === TOOLS.LINE) {
        this.lineStart = coords;
        this.isDrawingLine = true;
        state.saveState(true); // Save before drawing line
      } else if (this.currentTool === TOOLS.SELECTION) {
        this.selectionStart = coords;
        this.isSelecting = true;
        this.selection = null;
        document.getElementById('selection-controls').style.display = 'none';
      } else {
        this.isDrawing = true;
        await this.drawPixel(e);
      }
    });

    // Track mouse position for preview
    // Mouse move on container for panning
    canvasContainer.addEventListener('mousemove', async (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };

      // Handle panning (works anywhere in container)
      if (this.isPanning) {
        const deltaX = e.clientX - this.panStart.x;
        const deltaY = e.clientY - this.panStart.y;
        canvasContainer.scrollLeft = this.panOffset.x - deltaX;
        canvasContainer.scrollTop = this.panOffset.y - deltaY;
        // Save scroll position as user pans
        this.saveScrollPosition();
        return;
      }

      // Don't interfere if dragging guidance images
      if (this.guidanceImageDragging || this.guidanceImageResizing) {
        return;
      }

      // Handle cursor tool - check for corner resize handles
      if (this.currentTool === TOOLS.CURSOR && this.selection && !this.isMovingSelection && !this.isResizingSelection) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          const x = this.selection.x;
          const y = this.selection.y;
          const w = this.selection.width;
          const h = this.selection.height;

          // Use same logic as mousedown - precise corner detection
          const isInside = coords.x >= x && coords.x < x + w && coords.y >= y && coords.y < y + h;
          const cornerThreshold = 1;
          const cornerX = coords.x;
          const cornerY = coords.y;

          let handle = null;

          if (isInside) {
            // Check if exactly on or very close to a corner (within 1 pixel)
            const nearNW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
            const nearNE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
            const nearSW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;
            const nearSE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;

            if (nearNW) {
              handle = 'nw';
            } else if (nearNE) {
              handle = 'ne';
            } else if (nearSW) {
              handle = 'sw';
            } else if (nearSE) {
              handle = 'se';
            } else {
              handle = 'move';
            }
          } else {
            // Outside - check corners
            const nearNW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
            const nearNE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - y) <= cornerThreshold;
            const nearSW = Math.abs(cornerX - x) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;
            const nearSE = Math.abs(cornerX - (x + w - 1)) <= cornerThreshold && Math.abs(cornerY - (y + h - 1)) <= cornerThreshold;

            if (nearNW) {
              handle = 'nw';
            } else if (nearNE) {
              handle = 'ne';
            } else if (nearSW) {
              handle = 'sw';
            } else if (nearSE) {
              handle = 'se';
            }
          }

          // Update cursor
          if (handle === 'nw' || handle === 'se') {
            this.canvas.style.cursor = 'nwse-resize';
          } else if (handle === 'ne' || handle === 'sw') {
            this.canvas.style.cursor = 'nesw-resize';
          } else if (handle === 'move') {
            this.canvas.style.cursor = 'move';
          } else {
            this.canvas.style.cursor = 'default';
          }
        }
      }

      // Redraw for preview
      if (this.currentTool === TOOLS.PAINT || this.currentTool === TOOLS.ERASER) {
        this.draw();
      }

      if (this.isMovingSelection && this.selection && this.selectionMoveStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          const newX = coords.x - this.selectionMoveStart.x;
          const newY = coords.y - this.selectionMoveStart.y;
          this.selection.x = newX;
          this.selection.y = newY;
          this.draw();
        }
      } else if (this.isResizingSelection && this.selection && this.selectionResizeHandle) {
        const coords = this.getCanvasCoords(e);
        if (coords && this.selectionResizeStart) {
          const state = this.getActiveState();
          const handle = this.selectionResizeHandle;
          const start = this.selectionResizeStart;
          const origX = start.origX;
          const origY = start.origY;
          const origW = start.w;
          const origH = start.h;

          let newX = origX;
          let newY = origY;
          let newW = origW;
          let newH = origH;

          // Calculate new bounds based on handle
          if (handle.includes('e')) {
            // East edge - adjust width
            newW = Math.max(1, coords.x - origX);
            newW = Math.min(newW, state.width - origX);
          }
          if (handle.includes('w')) {
            // West edge - adjust x and width
            newX = Math.max(0, coords.x);
            newW = Math.max(1, origX + origW - newX);
            newW = Math.min(newW, state.width - newX);
          }
          if (handle.includes('s')) {
            // South edge - adjust height
            newH = Math.max(1, coords.y - origY);
            newH = Math.min(newH, state.height - origY);
          }
          if (handle.includes('n')) {
            // North edge - adjust y and height
            newY = Math.max(0, coords.y);
            newH = Math.max(1, origY + origH - newY);
            newH = Math.min(newH, state.height - newY);
          }

          // Ensure bounds are valid
          newX = Math.max(0, Math.min(newX, state.width - 1));
          newY = Math.max(0, Math.min(newY, state.height - 1));
          newW = Math.max(1, Math.min(newW, state.width - newX));
          newH = Math.max(1, Math.min(newH, state.height - newY));

          // Scale pixels from original
          if (this.selection.originalPixels && this.selection.originalWidth && this.selection.originalHeight) {
            const scaleX = newW / this.selection.originalWidth;
            const scaleY = newH / this.selection.originalHeight;
            const scaledPixels = new Map();

            for (let y = 0; y < newH; y++) {
              for (let x = 0; x < newW; x++) {
                const srcX = Math.floor(x / scaleX);
                const srcY = Math.floor(y / scaleY);
                const key = `${srcX},${srcY}`;
                const colorIndex = this.selection.originalPixels.get(key);
                if (colorIndex !== null && colorIndex !== undefined) {
                  scaledPixels.set(`${x},${y}`, colorIndex);
                }
              }
            }

            // Update selection bounds and pixels
            this.selection.x = newX;
            this.selection.y = newY;
            this.selection.width = newW;
            this.selection.height = newH;
            this.selection.pixels = scaledPixels;
          } else {
            // If no original pixels, just update bounds
            this.selection.x = newX;
            this.selection.y = newY;
            this.selection.width = newW;
            this.selection.height = newH;
          }

          this.draw();
        }
      } else if (this.isDrawingSquare && this.squareStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          this.squareEnd = coords;
          this.draw(); // Will draw preview in draw() method
        }
      } else if (this.isDrawingLine && this.lineStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          this.lineEnd = coords;
          this.draw(); // Will draw preview in draw() method
        }
      } else if (this.isSelecting && this.selectionStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          this.selection = this.getSelection(this.selectionStart.x, this.selectionStart.y, coords.x, coords.y);
          this.draw(); // Redraw to show selection
        }
      } else if (this.isDrawing) {
        await this.drawPixel(e);
      }
    });

    document.addEventListener('mouseup', async (e) => {
      if (e.button === 1) {
        this.isPanning = false;
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
          canvasContainer.style.cursor = '';
        }
        // Save final scroll position
        this.saveScrollPosition();
      }

      if (this.isDrawingSquare && this.squareStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          const state = this.getActiveState();
          const colorIndex = state.selectedColorIndex;
          if (colorIndex >= 0 && colorIndex < this.palette.length) {
            // Shift key for filled rectangle
            this.drawRectangle(this.squareStart.x, this.squareStart.y, coords.x, coords.y, colorIndex, e.shiftKey);
            await this.tabManager.saveTabs();
            this.draw();
          } else {
            // If invalid color, restore state
            state.undo();
          }
        }
        this.isDrawingSquare = false;
        this.squareStart = null;
        this.squareEnd = null;
      } else if (this.isDrawingLine && this.lineStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          const state = this.getActiveState();
          const colorIndex = state.selectedColorIndex;
          if (colorIndex >= 0 && colorIndex < this.palette.length) {
            this.drawLine(this.lineStart.x, this.lineStart.y, coords.x, coords.y, colorIndex, state.toolSize);
            await this.tabManager.saveTabs();
            this.draw();
          } else {
            state.undo();
          }
        }
        this.isDrawingLine = false;
        this.lineStart = null;
        this.lineEnd = null;
      } else if (this.isSelecting && this.selectionStart) {
        const coords = this.getCanvasCoords(e);
        if (coords) {
          this.selection = this.getSelection(this.selectionStart.x, this.selectionStart.y, coords.x, coords.y);
          // Store original pixels for scaling
          if (this.selection && this.selection.pixels) {
            this.selection.originalPixels = new Map(this.selection.pixels);
            this.selection.originalWidth = this.selection.width;
            this.selection.originalHeight = this.selection.height;
          }
          document.getElementById('selection-controls').style.display = 'block';
          document.getElementById('scale-x').value = 1;
          document.getElementById('scale-y').value = 1;
          document.getElementById('scale-x-value').textContent = '100%';
          document.getElementById('scale-y-value').textContent = '100%';
          this.draw();
        }
        this.isSelecting = false;
        this.selectionStart = null;
      }

      if (this.isMovingSelection) {
        // Apply moved selection to canvas
        if (this.selection && this.selectionOriginalPos) {
          const state = this.getActiveState();
          const oldX = this.selectionOriginalPos.x;
          const oldY = this.selectionOriginalPos.y;
          const newX = this.selection.x;
          const newY = this.selection.y;

          // Clear only the pixels that were actually part of the selection
          for (const [key, colorIndex] of this.selection.pixels.entries()) {
            const [relX, relY] = key.split(',').map(Number);
            const x = oldX + relX;
            const y = oldY + relY;
            if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
              state.setPixel(x, y, null);
            }
          }

          // Draw at new position
          this.pasteSelection(this.selection, newX, newY);
          await this.tabManager.saveTabs();
          this.draw();
        }
        this.isMovingSelection = false;
        this.selectionOriginalPos = null;
      }
      if (this.isResizingSelection) {
        // Apply resized selection to canvas
        if (this.selection && this.selectionResizeStart) {
          const state = this.getActiveState();
          // Clear only the pixels that were actually part of the original selection
          const originalX = this.selectionResizeStart.origX;
          const originalY = this.selectionResizeStart.origY;

          // Use originalPixels if available, otherwise use current pixels
          const pixelsToClear = this.selection.originalPixels || this.selection.pixels;
          for (const [key, colorIndex] of pixelsToClear.entries()) {
            const [relX, relY] = key.split(',').map(Number);
            const x = originalX + relX;
            const y = originalY + relY;
            if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
              state.setPixel(x, y, null);
            }
          }

          // Draw new selection
          this.pasteSelection(this.selection, this.selection.x, this.selection.y);
          await this.tabManager.saveTabs();
          this.draw();
        }
        this.isResizingSelection = false;
        this.selectionResizeHandle = null;
      }

      if (this.isDrawing) {
        const state = this.getActiveState();
        state.saveState();
      }
      this.isDrawing = false;
      if (this.guidanceImageDragging || this.guidanceImageResizing) {
        this.guidanceImageDragging = false;
        this.guidanceImageResizing = false;
        this.tabManager.saveTabs();
      }
    });

    // Mouse leave: cancel active drawing/selection to prevent stuck state
    this.canvas.addEventListener('mouseleave', () => {
      if (this.isDrawing) {
        const state = this.getActiveState();
        state.saveState();
      }
      this.isDrawing = false;
      this.isDrawingSquare = false;
      this.squareStart = null;
      this.squareEnd = null;
      this.isDrawingLine = false;
      this.lineStart = null;
      this.lineEnd = null;
      this.isSelecting = false;
      this.selectionStart = null;
      this.isPanning = false;
      this.draw();
    });

    // Prevent middle mouse button from opening context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });

    // Guidance layer interactions - always allow selection, only drag with cursor tool
    const guidanceLayer = document.getElementById('guidance-layer');
    guidanceLayer.addEventListener('mousedown', (e) => {
      // Only process if the click actually hit an image element (not if it passed through)
      if (!e.target.closest('.guidance-image')) return;

      const rect = guidanceLayer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const images = this.tabManager.getActiveGuidanceImages();

      // Check if clicking on resize handle of selected image
      if (this.selectedGuidanceImage !== null && this.currentTool === TOOLS.CURSOR) {
        const img = images[this.selectedGuidanceImage];
        const handleSize = 15;
        const handleX = img.x + img.width;
        const handleY = img.y + img.height;

        if (x >= handleX - handleSize && x <= handleX + 5 &&
            y >= handleY - handleSize && y <= handleY + 5) {
          e.preventDefault();
          e.stopPropagation();
          this.guidanceImageResizing = true;
          this.guidanceImageStartPos = { x, y };
          this.guidanceImageStartSize = { w: img.width, h: img.height };
          return;
        }
      }

      // Check for guidance image click
      for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        if (x >= img.x && x <= img.x + img.width &&
            y >= img.y && y <= img.y + img.height) {
          e.preventDefault(); // Prevent default drag
          e.stopPropagation();
          this.selectedGuidanceImage = i;
          // Only allow dragging if cursor tool is active
          if (this.currentTool === TOOLS.CURSOR) {
            this.guidanceImageDragging = true;
            this.guidanceImageStartPos = {
              x: x - img.x,
              y: y - img.y
            };
          }
          document.getElementById('guidance-controls').style.display = 'block';
          document.getElementById('guidance-opacity').value = img.opacity;
          document.getElementById('opacity-value').textContent = img.opacity + '%';
          this.drawGuidanceImages();
          return;
        }
      }

      // Clicked outside, deselect
      this.selectedGuidanceImage = null;
      document.getElementById('guidance-controls').style.display = 'none';
      this.drawGuidanceImages();
    });

    guidanceLayer.addEventListener('mousemove', (e) => {
      // Only allow guidance image movement with cursor tool
      if (this.currentTool === TOOLS.CURSOR && (this.guidanceImageDragging || this.guidanceImageResizing)) {
        e.preventDefault();
        this.handleGuidanceImageMove(e);
      }
    });

    // Prevent drag on guidance images
    guidanceLayer.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Right click to erase
    this.canvas.addEventListener('contextmenu', async (e) => {
      e.preventDefault();
      this.isDrawing = true;
      await this.drawPixel(e, true);
      this.isDrawing = false;
    });

    // Canvas resize
    document.getElementById('resize-canvas').addEventListener('click', async () => {
      const width = parseInt(document.getElementById('canvas-width').value);
      const height = parseInt(document.getElementById('canvas-height').value);
      const state = this.getActiveState();
      state.width = width;
      state.height = height;
      // Clear pixels outside new bounds
      for (const [key] of state.pixels.entries()) {
        const [x, y] = key.split(',').map(Number);
        if (x >= width || y >= height) {
          state.pixels.delete(key);
        }
      }
      await this.tabManager.saveTabs();
      this.updateCanvasSize();
    });

    // Canvas rotation buttons
    document.getElementById('rotate-canvas-cw').addEventListener('click', async () => {
      await this.applyRotate(true);
    });

    document.getElementById('rotate-canvas-ccw').addEventListener('click', async () => {
      await this.applyRotate(false);
    });

    // Background color picker
    document.getElementById('bg-color').addEventListener('input', async (e) => {
      const state = this.getActiveState();
      state.bgColor = e.target.value;
      await this.tabManager.saveTabs();
      this.draw();
      this.renderTimeline();
    });

    // Zoom controls
    const zoomSlider = document.getElementById('zoom-slider');

    zoomSlider.addEventListener('input', (e) => {
      const centerPixel = this.getPixelAtScreenPosition();
      this.pixelSize = parseInt(e.target.value);
      this.updateZoomUI(true);
      if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
      this.saveScrollPosition();
    });

    document.getElementById('zoom-in').addEventListener('click', () => {
      const centerPixel = this.getPixelAtScreenPosition();
      this.pixelSize = Math.min(40, this.pixelSize + 1);
      this.updateZoomUI(true);
      if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
      this.saveScrollPosition();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
      const centerPixel = this.getPixelAtScreenPosition();
      this.pixelSize = Math.max(1, this.pixelSize - 1);
      this.updateZoomUI(true);
      if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
      this.saveScrollPosition();
    });

    document.getElementById('zoom-reset').addEventListener('click', () => {
      const centerPixel = this.getPixelAtScreenPosition();
      this.pixelSize = 4;
      this.updateZoomUI(true);
      if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
      this.saveScrollPosition();
    });

    // Mouse wheel zoom (relative to mouse position)
    // Always re-create so it uses the current DOM and current pixelSize getter
    this.wheelZoomHandler = async (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        return;
      }

      const canvasContainer = document.querySelector('.canvas-container');
      if (!canvasContainer || !this.canvas) return;

      const state = this.getActiveState();
      const oldZoom = state.zoom;
      // Smooth zoom factor
      const zoomFactor = 1.1;
      const zoomDirection = e.deltaY > 0 ? -1 : 1;
      let newZoom;
      if (zoomDirection > 0) {
        newZoom = Math.min(40, Math.round(oldZoom * zoomFactor));
      } else {
        newZoom = Math.max(1, Math.round(oldZoom / zoomFactor));
      }

      if (oldZoom <= 3) {
        if (zoomDirection > 0) {
          newZoom = Math.min(40, oldZoom + 1);
        } else {
          newZoom = Math.max(1, oldZoom - 1);
        }
      }

      if (newZoom !== oldZoom && newZoom >= 1 && newZoom <= 40) {
        const containerRect = canvasContainer.getBoundingClientRect();
        const mouseScreenX = e.clientX - containerRect.left;
        const mouseScreenY = e.clientY - containerRect.top;
        const pixel = this.getPixelAtScreenPosition(mouseScreenX, mouseScreenY);
        if (!pixel) return;

        state.zoom = newZoom;
        await this.tabManager.saveTabs();
        this.updateZoomUI(true);

        this.scrollToPixel(pixel.x, pixel.y, mouseScreenX, mouseScreenY);
        this.saveScrollPosition();
      }
    };

    const zoomContainer = document.querySelector('.canvas-container');
    if (zoomContainer) {
      zoomContainer.removeEventListener('wheel', this.wheelZoomHandler);
      zoomContainer.addEventListener('wheel', this.wheelZoomHandler, { passive: false });
    }

    // Document-level handler to prevent browser zoom with ctrl/cmd
    if (!this.documentWheelHandler) {
      this.documentWheelHandler = (e) => {
        if (e.ctrlKey || e.metaKey) {
          const editorContainer = document.querySelector('.canvas-container');
          if (editorContainer && (editorContainer.contains(e.target) || e.target === editorContainer || e.target.closest('.canvas-container'))) {
            e.preventDefault();
          }
        }
      };
      document.addEventListener('wheel', this.documentWheelHandler, { passive: false, capture: true });
    }

    // Paste image
    document.getElementById('paste-image').addEventListener('click', () => {
      const state = this.getActiveState();
      const modal = document.getElementById('paste-image-modal');
      const widthInput = document.getElementById('paste-target-width');
      const heightInput = document.getElementById('paste-target-height');
      widthInput.value = state.width;
      heightInput.value = state.height;
      modal.style.display = 'block';
    });

    document.getElementById('cancel-paste-image').addEventListener('click', () => {
      document.getElementById('paste-image-modal').style.display = 'none';
    });

    document.getElementById('confirm-paste-image').addEventListener('click', () => {
      const targetWidth = parseInt(document.getElementById('paste-target-width').value);
      const targetHeight = parseInt(document.getElementById('paste-target-height').value);
      document.getElementById('paste-image-modal').style.display = 'none';
      this.pasteImage(targetWidth, targetHeight);
    });

    // Guidance image controls
    document.getElementById('guidance-opacity').addEventListener('input', async (e) => {
      if (this.selectedGuidanceImage !== null) {
        const images = this.tabManager.getActiveGuidanceImages();
        images[this.selectedGuidanceImage].opacity = parseInt(e.target.value);
        document.getElementById('opacity-value').textContent = e.target.value + '%';
        this.drawGuidanceImages();
        await this.tabManager.saveTabs();
      }
    });

    document.getElementById('remove-guidance').addEventListener('click', async () => {
      if (this.selectedGuidanceImage !== null) {
        const images = this.tabManager.getActiveGuidanceImages();
        images.splice(this.selectedGuidanceImage, 1);
        this.tabManager.setActiveGuidanceImages(images);
        this.selectedGuidanceImage = null;
        document.getElementById('guidance-controls').style.display = 'none';
        this.drawGuidanceImages();
        await this.tabManager.saveTabs();
      }
    });

    // Import sprite from code
    document.getElementById('import-sprite').addEventListener('click', async () => {
      await this.importSprite();
    });

    // Import image as pixel art
    document.getElementById('import-image-btn').addEventListener('click', async () => {
      await this.importImageAsPixelArt();
    });

    // Export
    document.getElementById('export-code').addEventListener('click', () => {
      this.exportCode();
    });

    document.getElementById('copy-code').addEventListener('click', async () => {
      const state = this.getActiveState();
      const skipEmpty = document.getElementById('skip-empty').checked;
      const result = this.encodeCSEF(state, skipEmpty);
      if (result.size === 0) {
        document.getElementById('export-output').value = '// Empty canvas';
        return;
      }
      const code = result.encoded;
      try {
        await navigator.clipboard.writeText(code);
        const btn = document.getElementById('copy-code');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#4a9eff';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '#666';
        }, 1200);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });

    document.getElementById('skip-empty').addEventListener('change', async (e) => {
      await db.set('pixelart_skip_empty', e.target.checked);
    });

    // Export palette
    document.getElementById('export-palette').addEventListener('click', () => {
      this.exportPalette();
    });

    document.getElementById('copy-palette').addEventListener('click', async () => {
      const output = document.getElementById('palette-output').value;
      if (!output) {
        this.exportPalette();
      }
      const code = document.getElementById('palette-output').value;
      try {
        await navigator.clipboard.writeText(code);
        const btn = document.getElementById('copy-palette');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#4a9eff';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '#666';
        }, 1200);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });

    const saveAppStateBtn = document.getElementById('save-app-state');
    if (saveAppStateBtn) {
      saveAppStateBtn.addEventListener('click', async () => {
        try {
          const stateData = this.tabManager.getStateData();
          await db.set('pixelart_app_state_backup', stateData);
          const originalText = saveAppStateBtn.textContent;
          saveAppStateBtn.textContent = 'Saved!';
          saveAppStateBtn.style.background = '#4a9eff';
          setTimeout(() => {
            saveAppStateBtn.textContent = originalText;
            saveAppStateBtn.style.background = '';
          }, 1200);
        } catch (err) {
          console.error('Failed to save app state:', err);
          const originalText = saveAppStateBtn.textContent;
          saveAppStateBtn.textContent = 'Error!';
          saveAppStateBtn.style.background = '#ff4444';
          setTimeout(() => {
            saveAppStateBtn.textContent = originalText;
            saveAppStateBtn.style.background = '';
          }, 1200);
        }
      });
    }

    const loadAppStateBtn = document.getElementById('load-app-state');
    if (loadAppStateBtn) {
      loadAppStateBtn.addEventListener('click', async () => {
        try {
          const data = await db.get('pixelart_app_state_backup');
          if (!data) {
            const originalText = loadAppStateBtn.textContent;
            loadAppStateBtn.textContent = 'No backup!';
            loadAppStateBtn.style.background = '#ff4444';
            setTimeout(() => {
              loadAppStateBtn.textContent = originalText;
              loadAppStateBtn.style.background = '';
            }, 1200);
            return;
          }
          if (this.tabManager.setStateData(data)) {
            await this.tabManager.saveTabs();
            this.render();
            this.setupEventListeners();
            this.updateCanvasSize();
            this.renderTimeline();
            this.draw();
            this.drawGuidanceImages();
            const originalText = loadAppStateBtn.textContent;
            loadAppStateBtn.textContent = 'Loaded!';
            loadAppStateBtn.style.background = '#4a9eff';
            setTimeout(() => {
              loadAppStateBtn.textContent = originalText;
              loadAppStateBtn.style.background = '';
            }, 1200);
          } else {
            const originalText = loadAppStateBtn.textContent;
            loadAppStateBtn.textContent = 'Invalid!';
            loadAppStateBtn.style.background = '#ff4444';
            setTimeout(() => {
              loadAppStateBtn.textContent = originalText;
              loadAppStateBtn.style.background = '';
            }, 1200);
          }
        } catch (err) {
          console.error('Failed to load app state:', err);
          const originalText = loadAppStateBtn.textContent;
          loadAppStateBtn.textContent = 'Error!';
          loadAppStateBtn.style.background = '#ff4444';
          setTimeout(() => {
            loadAppStateBtn.textContent = originalText;
            loadAppStateBtn.style.background = '';
          }, 1200);
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', async (e) => {
      // Prevent browser zoom shortcuts (Ctrl/Cmd + Plus, Minus, 0)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0' || e.key === 'NumpadAdd' || e.key === 'NumpadSubtract' || e.key === 'Numpad0')) {
        e.preventDefault();
        e.stopPropagation();
        // Handle zoom with keyboard
        const state = this.getActiveState();
        const centerPixel = this.getPixelAtScreenPosition();
        if (e.key === '+' || e.key === '=' || e.key === 'NumpadAdd') {
          this.pixelSize = Math.min(40, this.pixelSize + 1);
          document.getElementById('zoom-slider').value = this.pixelSize;
          document.getElementById('zoom-value').textContent = this.pixelSize + 'x';
          this.updateCanvasSize(true);
          if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
          this.saveScrollPosition();
        } else if (e.key === '-' || e.key === 'NumpadSubtract') {
          this.pixelSize = Math.max(1, this.pixelSize - 1);
          document.getElementById('zoom-slider').value = this.pixelSize;
          document.getElementById('zoom-value').textContent = this.pixelSize + 'x';
          this.updateCanvasSize(true);
          if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
          this.saveScrollPosition();
        } else if (e.key === '0' || e.key === 'Numpad0') {
          this.pixelSize = 4;
          document.getElementById('zoom-slider').value = this.pixelSize;
          document.getElementById('zoom-value').textContent = this.pixelSize + 'x';
          this.updateCanvasSize(true);
          if (centerPixel) this.scrollToPixel(centerPixel.x, centerPixel.y);
          this.saveScrollPosition();
        }
        return;
      }

      // Tool shortcuts - grid layout on QWER/ASDF/ZXC
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        let toolChanged = false;
        switch (e.key.toLowerCase()) {
          case 'q': this.currentTool = TOOLS.CURSOR; toolChanged = true; break;
          case 'w': this.currentTool = TOOLS.PAINT; toolChanged = true; break;
          case 'e': this.currentTool = TOOLS.ERASER; toolChanged = true; break;
          case 'r': this.currentTool = TOOLS.BUCKET; toolChanged = true; break;
          case 'a': this.currentTool = TOOLS.EYEDROPPER; toolChanged = true; break;
          case 's': this.currentTool = TOOLS.SQUARE; toolChanged = true; break;
          case 'd': this.currentTool = TOOLS.LINE; toolChanged = true; break;
          case 'f': this.currentTool = TOOLS.SELECTION; toolChanged = true; break;
          case 'z': this.currentTool = TOOLS.FLIP_H; toolChanged = true; break;
          case 'x': this.currentTool = TOOLS.FLIP_V; toolChanged = true; break;
          case 'c':
            e.preventDefault();
            await this.applyRotate(true);
            break;
          case 'v':
            e.preventDefault();
            await this.applyRotate(false);
            break;
        }
        if (toolChanged) {
          // Stop guidance image dragging if switching away from cursor tool
          if (this.currentTool !== TOOLS.CURSOR) {
            this.guidanceImageDragging = false;
            this.guidanceImageResizing = false;
          }
          // Update tool buttons without full render
          document.querySelectorAll('.tool-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tool === this.currentTool);
          });
          // Update guidance layer pointer events based on tool
          this.drawGuidanceImages();
          this.draw();
        }
      }

      // Alt key: temporary eyedropper
      if (e.key === 'Alt') {
        e.preventDefault();
        if (this.currentTool !== TOOLS.EYEDROPPER) {
          this.preAltTool = this.currentTool;
          this.currentTool = TOOLS.EYEDROPPER;
          document.querySelectorAll('.tool-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tool === this.currentTool);
          });
          this.drawGuidanceImages();
          this.draw();
        }
      }

      // Escape key: clear selection
      if (e.key === 'Escape') {
        this.selection = null;
        this.isSelecting = false;
        this.selectionStart = null;
        this.isMovingSelection = false;
        this.isResizingSelection = false;
        document.getElementById('selection-controls').style.display = 'none';
        this.draw();
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const state = this.getActiveState();
        if (state.undo()) {
          await this.tabManager.saveTabs();
          this.draw();
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const state = this.getActiveState();
        if (state.redo()) {
          await this.tabManager.saveTabs();
          this.draw();
        }
      }

      // Copy selection
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (this.selection) {
          e.preventDefault();
          this.clipboard = {
            width: this.selection.width,
            height: this.selection.height,
            pixels: new Map(this.selection.pixels)
          };
        }
      }

      // Paste selection (only if not typing in an input/textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const activeElement = document.activeElement;
        const isInputElement = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable
        );

        // Don't intercept paste if user is typing in an input field
        if (isInputElement) {
          return; // Let the browser handle it normally
        }

        if (this.clipboard) {
          e.preventDefault();
          const state = this.getActiveState();
          // Paste at mouse position
          const coords = this.getCanvasCoords({ clientX: this.mousePos.x, clientY: this.mousePos.y });
          const pasteX = coords ? Math.max(0, Math.min(coords.x, state.width - this.clipboard.width)) : Math.floor(state.width / 2 - this.clipboard.width / 2);
          const pasteY = coords ? Math.max(0, Math.min(coords.y, state.height - this.clipboard.height)) : Math.floor(state.height / 2 - this.clipboard.height / 2);
          state.saveState(true);
          this.pasteSelection(this.clipboard, pasteX, pasteY);
          // Create selection for pasted content
          this.selection = {
            x: pasteX,
            y: pasteY,
            width: this.clipboard.width,
            height: this.clipboard.height,
            pixels: new Map(this.clipboard.pixels)
          };
          document.getElementById('selection-controls').style.display = 'block';
          await this.tabManager.saveTabs();
          this.draw();
        } else {
          // Fallback to paste image
          this.pasteImage();
        }
      }

      // Delete selection or guidance image
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent repeated key events from deleting frames after selection
        if (e.repeat) {
          e.preventDefault();
          return;
        }
        if (this.selection) {
          e.preventDefault();
          await this.deleteSelection();
        } else if (this.selectedGuidanceImage !== null) {
          e.preventDefault();
          const images = this.tabManager.getActiveGuidanceImages();
          images.splice(this.selectedGuidanceImage, 1);
          this.tabManager.setActiveGuidanceImages(images);
          this.selectedGuidanceImage = null;
          document.getElementById('guidance-controls').style.display = 'none';
          await this.tabManager.saveTabs();
          this.drawGuidanceImages();
        } else {
          // If no selection and no guidance image, delete current frame
          const state = this.getActiveState();
          if (state.deleteFrame(state.currentFrameIndex)) {
            await this.tabManager.saveTabs();
            this.renderTimeline();
            this.draw();
          }
        }
      }

      // Frame management shortcuts
      if (e.key === 'Insert' || (e.key === 'Enter' && e.ctrlKey)) {
        e.preventDefault();
        const state = this.getActiveState();
        state.addFrame(true); // Duplicate current frame
        await this.tabManager.saveTabs();
        this.renderTimeline();
        this.draw();
      }

      // Navigate frames with arrow keys (when not in input fields)
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          const state = this.getActiveState();
          let newIndex = state.currentFrameIndex;
          if (e.key === 'ArrowLeft') {
            newIndex = Math.max(0, state.currentFrameIndex - 1);
          } else if (e.key === 'ArrowRight') {
            newIndex = Math.min(state.frames.length - 1, state.currentFrameIndex + 1);
          }
          if (state.setCurrentFrame(newIndex)) {
            await this.tabManager.saveTabs();
            this.renderTimeline();
            this.draw();
          }
        }
      }
    });

    // Alt keyup: restore previous tool after temporary eyedropper
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Alt' && this.preAltTool !== null) {
        this.currentTool = this.preAltTool;
        this.preAltTool = null;
        document.querySelectorAll('.tool-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.tool === this.currentTool);
        });
        this.drawGuidanceImages();
        this.draw();
      }
    });

    // Selection controls
    document.getElementById('copy-selection').addEventListener('click', () => {
      if (this.selection) {
        this.clipboard = {
          width: this.selection.width,
          height: this.selection.height,
          pixels: new Map(this.selection.pixels)
        };
      }
    });

    document.getElementById('paste-selection').addEventListener('click', async () => {
      if (this.clipboard) {
        const coords = this.getCanvasCoords({
          clientX: this.canvas.getBoundingClientRect().left + this.canvas.width / 2,
          clientY: this.canvas.getBoundingClientRect().top + this.canvas.height / 2
        });
        if (coords) {
          const state = this.getActiveState();
          state.saveState(true);
          this.pasteSelection(this.clipboard, coords.x, coords.y);
          await this.tabManager.saveTabs();
          this.draw();
        }
      }
    });

    document.getElementById('delete-selection').addEventListener('click', async () => {
      await this.deleteSelection();
    });

    document.getElementById('clear-selection').addEventListener('click', () => {
      this.selection = null;
      document.getElementById('selection-controls').style.display = 'none';
      this.draw();
    });

    // Selection scaling
    document.getElementById('scale-x').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById('scale-x-value').textContent = Math.round(value * 100) + '%';
    });

    document.getElementById('scale-y').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById('scale-y-value').textContent = Math.round(value * 100) + '%';
    });

    document.getElementById('apply-scale').addEventListener('click', async () => {
      if (this.selection) {
        const scaleX = parseFloat(document.getElementById('scale-x').value);
        const scaleY = parseFloat(document.getElementById('scale-y').value);
        const state = this.getActiveState();
        state.saveState(true);

        // Clear original selection area
        for (const [key, colorIndex] of this.selection.pixels.entries()) {
          const [relX, relY] = key.split(',').map(Number);
          const x = this.selection.x + relX;
          const y = this.selection.y + relY;
          state.setPixel(x, y, null);
        }

        // Apply scaled selection
        const scaled = this.scaleSelection(this.selection, scaleX, scaleY);
        if (scaled) {
          this.pasteSelection(scaled, scaled.x, scaled.y);
          this.selection = scaled;
          await this.tabManager.saveTabs();
          this.draw();
        }
      }
    });

    // Selection rotation
    document.getElementById('rotate-cw').addEventListener('click', async () => {
      if (this.selection) {
        const state = this.getActiveState();
        state.saveState(true);
        // Clear original selection pixels
        for (const [key, colorIndex] of this.selection.pixels.entries()) {
          const [relX, relY] = key.split(',').map(Number);
          const x = this.selection.x + relX;
          const y = this.selection.y + relY;
          state.setPixel(x, y, null);
        }
        const rotated = this.rotateSelectionCW(this.selection);
        if (rotated) {
          this.pasteSelection(rotated, rotated.x, rotated.y);
          this.selection = rotated;
          await this.tabManager.saveTabs();
          this.draw();
        }
      }
    });

    document.getElementById('rotate-ccw').addEventListener('click', async () => {
      if (this.selection) {
        const state = this.getActiveState();
        state.saveState(true);
        // Clear original selection pixels
        for (const [key, colorIndex] of this.selection.pixels.entries()) {
          const [relX, relY] = key.split(',').map(Number);
          const x = this.selection.x + relX;
          const y = this.selection.y + relY;
          state.setPixel(x, y, null);
        }
        const rotated = this.rotateSelectionCCW(this.selection);
        if (rotated) {
          this.pasteSelection(rotated, rotated.x, rotated.y);
          this.selection = rotated;
          await this.tabManager.saveTabs();
          this.draw();
        }
      }
    });

    document.getElementById('rotate-180').addEventListener('click', async () => {
      if (this.selection) {
        const state = this.getActiveState();
        state.saveState(true);
        // Clear original selection pixels
        for (const [key, colorIndex] of this.selection.pixels.entries()) {
          const [relX, relY] = key.split(',').map(Number);
          const x = this.selection.x + relX;
          const y = this.selection.y + relY;
          state.setPixel(x, y, null);
        }
        const rotated = this.rotateSelection180(this.selection);
        if (rotated) {
          this.pasteSelection(rotated, rotated.x, rotated.y);
          this.selection = rotated;
          await this.tabManager.saveTabs();
          this.draw();
        }
      }
    });

    // Update guidance layer on scroll/resize
    const container = document.querySelector('.canvas-container');
    container.addEventListener('scroll', () => {
      this.drawGuidanceImages();
    });

    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.drawGuidanceImages();
      }, 100);
    });
  }

  getCanvasCoords(e) {
    const container = document.querySelector('.canvas-container');
    if (!container || !this.canvas) return null;

    const wrapper = this.getWrapperSize();
    const canvasLeft = (wrapper.w - this.canvas.width) / 2;
    const canvasTop = (wrapper.h - this.canvas.height) / 2;
    const containerRect = container.getBoundingClientRect();
    const contentX = container.scrollLeft + (e.clientX - containerRect.left);
    const contentY = container.scrollTop + (e.clientY - containerRect.top);
    const x = Math.floor((contentX - canvasLeft) / this.pixelSize);
    const y = Math.floor((contentY - canvasTop) / this.pixelSize);

    return { x, y };
  }

  // Draw pixels in a brush shape
  drawBrush(x, y, colorIndex, size = 1) {
    const state = this.getActiveState();
    const radius = Math.floor(size / 2);
    const opacity = state.toolOpacity / 100;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = x + dx;
        const py = y + dy;

        // Circular brush
        if (size > 1) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
        }

        // Opacity blending: if opacity < 100%, only apply based on opacity chance
        // For pixel art, we use dithering-like approach
        if (opacity < 1) {
          // Use pixel position for deterministic dithering
          const seed = (px * 73856093) ^ (py * 19349663);
          const rand = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
          if (rand > opacity) {
            continue;
          }
        }

        state.setPixel(px, py, colorIndex);
      }
    }
  }

  // Flood fill
  floodFill(x, y, targetColorIndex, fillColorIndex) {
    const state = this.getActiveState();
    const currentColor = state.getPixel(x, y);
    if (currentColor === fillColorIndex) return;
    if (currentColor !== targetColorIndex) return;

    // Limit flood fill to canvas bounds to prevent infinite loops on open shapes
    const minX = 0, maxX = state.width - 1;
    const minY = 0, maxY = state.height - 1;

    const stack = [[x, y]];
    const visited = new Set();

    while (stack.length > 0) {
      const [px, py] = stack.pop();
      const key = `${px},${py}`;

      if (visited.has(key)) continue;
      if (px < minX || px > maxX || py < minY || py > maxY) continue;

      const color = state.getPixel(px, py);
      if (color !== targetColorIndex) continue;

      visited.add(key);
      state.setPixel(px, py, fillColorIndex);

      stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
  }

  // Draw rectangle
  drawRectangle(x1, y1, x2, y2, colorIndex, fill = false) {
    const state = this.getActiveState();
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (fill) {
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          state.setPixel(x, y, colorIndex);
        }
      }
    } else {
      // Outline only
      for (let x = minX; x <= maxX; x++) {
        state.setPixel(x, minY, colorIndex);
        state.setPixel(x, maxY, colorIndex);
      }
      for (let y = minY; y <= maxY; y++) {
        state.setPixel(minX, y, colorIndex);
        state.setPixel(maxX, y, colorIndex);
      }
    }
  }

  // Get selection area
  getSelection(x1, y1, x2, y2) {
    const state = this.getActiveState();
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const pixels = new Map();
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const colorIndex = state.getPixel(x, y);
        if (colorIndex !== null) {
          pixels.set(`${x - minX},${y - minY}`, colorIndex);
        }
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      pixels: pixels
    };
  }

  // Paste selection
  pasteSelection(selection, x, y) {
    if (!selection || !selection.pixels) return;

    const state = this.getActiveState();
    for (const [key, colorIndex] of selection.pixels.entries()) {
      const [relX, relY] = key.split(',').map(Number);
      const px = x + relX;
      const py = y + relY;

      if (px >= 0 && px < state.width && py >= 0 && py < state.height) {
        state.setPixel(px, py, colorIndex);
      }
    }
  }

  // Flip selection horizontally
  flipSelectionHorizontal(selection) {
    if (!selection || !selection.pixels) return null;

    const flipped = new Map();
    for (const [key, colorIndex] of selection.pixels.entries()) {
      const [relX, relY] = key.split(',').map(Number);
      const newRelX = selection.width - 1 - relX;
      const newKey = `${newRelX},${relY}`;
      flipped.set(newKey, colorIndex);
    }

    return {
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
      pixels: flipped
    };
  }

  // Flip selection vertically
  flipSelectionVertical(selection) {
    if (!selection || !selection.pixels) return null;

    const flipped = new Map();
    for (const [key, colorIndex] of selection.pixels.entries()) {
      const [relX, relY] = key.split(',').map(Number);
      const newRelY = selection.height - 1 - relY;
      const newKey = `${relX},${newRelY}`;
      flipped.set(newKey, colorIndex);
    }

    return {
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
      pixels: flipped
    };
  }

  // Flip entire canvas horizontally
  flipCanvasHorizontal() {
    const state = this.getActiveState();
    const frame = state.getCurrentFrame();
    const newPixels = new Map();

    for (const [key, colorIndex] of frame.pixels.entries()) {
      const [x, y] = key.split(',').map(Number);
      const newX = state.width - 1 - x;
      const newKey = `${newX},${y}`;
      newPixels.set(newKey, colorIndex);
    }

    frame.pixels = newPixels;
    this.draw();
    this.updateTimelineThumbnail();
  }

  // Flip entire canvas vertically
  flipCanvasVertical() {
    const state = this.getActiveState();
    const frame = state.getCurrentFrame();
    const newPixels = new Map();

    for (const [key, colorIndex] of frame.pixels.entries()) {
      const [x, y] = key.split(',').map(Number);
      const newY = state.height - 1 - y;
      const newKey = `${x},${newY}`;
      newPixels.set(newKey, colorIndex);
    }

    frame.pixels = newPixels;
    this.draw();
    this.updateTimelineThumbnail();
  }

  // Apply flip operation (works on selection or whole canvas)
  async applyFlip(horizontal = true) {
    const state = this.getActiveState();
    state.saveState(true);

    if (this.selection) {
      // Flip the selection
      const flipped = horizontal
        ? this.flipSelectionHorizontal(this.selection)
        : this.flipSelectionVertical(this.selection);

      // Clear only the pixels that were actually part of the selection
      for (const [key, colorIndex] of this.selection.pixels.entries()) {
        const [relX, relY] = key.split(',').map(Number);
        const x = this.selection.x + relX;
        const y = this.selection.y + relY;
        state.setPixel(x, y, null);
      }

      // Paste the flipped selection back
      this.pasteSelection(flipped, flipped.x, flipped.y);
      this.selection = flipped;
    } else {
      // Flip the entire canvas
      if (horizontal) {
        this.flipCanvasHorizontal();
      } else {
        this.flipCanvasVertical();
      }
    }

    this.draw();
    await this.tabManager.saveTabs();
  }

  // Scale selection
  scaleSelection(selection, scaleX, scaleY) {
    if (!selection || !selection.pixels) return null;

    const newPixels = new Map();
    const newWidth = Math.max(1, Math.floor(selection.width * scaleX));
    const newHeight = Math.max(1, Math.floor(selection.height * scaleY));

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x / scaleX);
        const srcY = Math.floor(y / scaleY);
        const key = `${srcX},${srcY}`;
        const colorIndex = selection.pixels.get(key);
        if (colorIndex !== null) {
          newPixels.set(`${x},${y}`, colorIndex);
        }
      }
    }

    return {
      x: selection.x,
      y: selection.y,
      width: newWidth,
      height: newHeight,
      pixels: newPixels
    };
  }

  // Rotate selection 90 degrees clockwise
  rotateSelectionCW(selection) {
    if (!selection || !selection.pixels) return null;
    const rotated = new Map();
    for (const [key, colorIndex] of selection.pixels.entries()) {
      const [relX, relY] = key.split(',').map(Number);
      const newRelX = selection.height - 1 - relY;
      const newRelY = relX;
      rotated.set(`${newRelX},${newRelY}`, colorIndex);
    }
    return {
      x: selection.x,
      y: selection.y,
      width: selection.height,
      height: selection.width,
      pixels: rotated
    };
  }

  // Rotate selection 90 degrees counter-clockwise
  rotateSelectionCCW(selection) {
    if (!selection || !selection.pixels) return null;
    const rotated = new Map();
    for (const [key, colorIndex] of selection.pixels.entries()) {
      const [relX, relY] = key.split(',').map(Number);
      const newRelX = relY;
      const newRelY = selection.width - 1 - relX;
      rotated.set(`${newRelX},${newRelY}`, colorIndex);
    }
    return {
      x: selection.x,
      y: selection.y,
      width: selection.height,
      height: selection.width,
      pixels: rotated
    };
  }

  // Rotate selection 180 degrees
  rotateSelection180(selection) {
    if (!selection || !selection.pixels) return null;
    const rotated = new Map();
    for (const [key, colorIndex] of selection.pixels.entries()) {
      const [relX, relY] = key.split(',').map(Number);
      const newRelX = selection.width - 1 - relX;
      const newRelY = selection.height - 1 - relY;
      rotated.set(`${newRelX},${newRelY}`, colorIndex);
    }
    return {
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
      pixels: rotated
    };
  }

  // Rotate entire canvas 90 degrees clockwise
  rotateCanvasCW() {
    const state = this.getActiveState();
    const frame = state.getCurrentFrame();
    const newPixels = new Map();
    const newWidth = state.height;
    const newHeight = state.width;

    for (const [key, colorIndex] of frame.pixels.entries()) {
      const [x, y] = key.split(',').map(Number);
      const newX = state.height - 1 - y;
      const newY = x;
      newPixels.set(`${newX},${newY}`, colorIndex);
    }

    frame.pixels = newPixels;
    state.width = newWidth;
    state.height = newHeight;
    this.updateCanvasSize(true);
    this.draw();
    this.updateTimelineThumbnail();
  }

  // Rotate entire canvas 90 degrees counter-clockwise
  rotateCanvasCCW() {
    const state = this.getActiveState();
    const frame = state.getCurrentFrame();
    const newPixels = new Map();
    const newWidth = state.height;
    const newHeight = state.width;

    for (const [key, colorIndex] of frame.pixels.entries()) {
      const [x, y] = key.split(',').map(Number);
      const newX = y;
      const newY = state.width - 1 - x;
      newPixels.set(`${newX},${newY}`, colorIndex);
    }

    frame.pixels = newPixels;
    state.width = newWidth;
    state.height = newHeight;
    this.updateCanvasSize(true);
    this.draw();
    this.updateTimelineThumbnail();
  }

  // Apply rotation (works on selection or whole canvas)
  async applyRotate(cw = true) {
    const state = this.getActiveState();
    state.saveState(true);

    if (this.selection) {
      // Rotate the selection
      const rotated = cw
        ? this.rotateSelectionCW(this.selection)
        : this.rotateSelectionCCW(this.selection);

      // Clear only the pixels that were actually part of the selection
      for (const [key, colorIndex] of this.selection.pixels.entries()) {
        const [relX, relY] = key.split(',').map(Number);
        const x = this.selection.x + relX;
        const y = this.selection.y + relY;
        state.setPixel(x, y, null);
      }

      // Paste the rotated selection back
      this.pasteSelection(rotated, rotated.x, rotated.y);
      this.selection = rotated;
    } else {
      // Rotate the entire canvas
      if (cw) {
        this.rotateCanvasCW();
      } else {
        this.rotateCanvasCCW();
      }
    }

    this.draw();
    await this.tabManager.saveTabs();
  }

  async drawPixel(e, erase = false) {
    if (!this.canvas || !this.ctx) {
      console.error('Canvas not initialized');
      return;
    }

    const coords = this.getCanvasCoords(e);
    if (!coords) return;

    const { x, y } = coords;
    const state = this.getActiveState();

    if (erase || this.currentTool === TOOLS.ERASER) {
      this.drawBrush(x, y, null, state.toolSize);
    } else if (this.currentTool === TOOLS.PAINT) {
      const colorIndex = state.selectedColorIndex;
      if (colorIndex >= 0 && colorIndex < this.palette.length) {
        this.drawBrush(x, y, colorIndex, state.toolSize);
      }
    } else if (this.currentTool === TOOLS.BUCKET) {
      const targetColor = state.getPixel(x, y);
      const fillColor = state.selectedColorIndex;
      if (fillColor >= 0 && fillColor < this.palette.length) {
        state.saveState(true);
        this.floodFill(x, y, targetColor, fillColor);
        await this.tabManager.saveTabs();
      }
    } else if (this.currentTool === TOOLS.EYEDROPPER) {
      const colorIndex = state.getPixel(x, y);
      if (colorIndex !== null && colorIndex >= 0 && colorIndex < this.palette.length) {
        state.selectedColorIndex = colorIndex;
        this.renderPalette();
        // If we came from Alt key, switch to paint tool instead of restoring previous tool
        if (this.preAltTool !== null) {
          this.preAltTool = TOOLS.PAINT;
        }
      }
    }

    await this.tabManager.saveTabs();
    this.draw();
  }

  // Line tool helper (for future use)
  drawLine(x1, y1, x2, y2, colorIndex, size = 1) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      this.drawBrush(x, y, colorIndex, size);

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  // Convert blob to base64 data URL for persistence
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async pasteImage(targetWidth, targetHeight) {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/')));
          const base64Url = await this.blobToBase64(blob);

          const img = new Image();
          img.onload = () => {
            const state = this.getActiveState();
            const images = this.tabManager.getActiveGuidanceImages();

            // Use target dimensions if provided, otherwise scale to canvas
            const tw = targetWidth || state.width;
            const th = targetHeight || state.height;
            const scale = Math.min(
              (tw * this.pixelSize) / img.width,
              (th * this.pixelSize) / img.height
            );

            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            // Center image on canvas (canvas is centered in wrapper)
            const container = document.querySelector('.canvas-container');
            const wrapper = document.querySelector('.canvas-wrapper');
            const containerWidth = container ? window.innerWidth * 2 : state.width * this.pixelSize;
            const containerHeight = container ? window.innerHeight * 2 : state.height * this.pixelSize;
            const canvasX = (containerWidth - state.width * this.pixelSize) / 2;
            const canvasY = (containerHeight - state.height * this.pixelSize) / 2;

            // Center image within canvas area
            const x = canvasX + (state.width * this.pixelSize - scaledWidth) / 2;
            const y = canvasY + (state.height * this.pixelSize - scaledHeight) / 2;

            images.push({
              dataUrl: base64Url,
              x: x,
              y: y,
              width: scaledWidth,
              height: scaledHeight,
              opacity: 50,
              originalWidth: img.width,
              originalHeight: img.height
            });

            this.tabManager.setActiveGuidanceImages(images);
            this.selectedGuidanceImage = images.length - 1;
            document.getElementById('guidance-controls').style.display = 'block';
            document.getElementById('guidance-opacity').value = 50;
            document.getElementById('opacity-value').textContent = '50%';
            this.drawGuidanceImages();
            this.tabManager.saveTabs();
          };
          img.src = base64Url;
          return;
        }
      }
      alert('No image found in clipboard');
    } catch (err) {
      console.error('Failed to paste image:', err);
      alert('Failed to paste image. Make sure you have an image copied to clipboard.');
    }
  }

  async importImageAsPixelArt() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/')));
          const base64Url = await this.blobToBase64(blob);

          const img = new Image();
          img.onload = () => {
            const state = this.getActiveState();
            const targetWidth = parseInt(document.getElementById('import-image-width').value) || state.width;
            const targetHeight = parseInt(document.getElementById('import-image-height').value) || state.height;

            // Save state before import
            state.saveState(true);

            // Create offscreen canvas to read pixels
            const offCanvas = document.createElement('canvas');
            offCanvas.width = targetWidth;
            offCanvas.height = targetHeight;
            const offCtx = offCanvas.getContext('2d');
            offCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

            const imgData = offCtx.getImageData(0, 0, targetWidth, targetHeight);
            const pixels = imgData.data;

            // Clear canvas and resize if needed
            if (targetWidth !== state.width || targetHeight !== state.height) {
              state.width = targetWidth;
              state.height = targetHeight;
              state.pixels = new Map();
              state.undoStack = [];
              this.updateCanvasSize(true);
            } else {
              state.pixels.clear();
            }

            // Convert to palette colors
            const palette = this.palette;
            for (let y = 0; y < targetHeight; y++) {
              for (let x = 0; x < targetWidth; x++) {
                const i = (y * targetWidth + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];

                if (a < 128) continue; // Skip transparent pixels

                // Find closest palette color
                let closestColor = palette[0];
                let minDist = Infinity;
                for (const color of palette) {
                  const pr = parseInt(color.slice(1, 3), 16);
                  const pg = parseInt(color.slice(3, 5), 16);
                  const pb = parseInt(color.slice(5, 7), 16);
                  const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
                  if (dist < minDist) {
                    minDist = dist;
                    closestColor = color;
                  }
                }

                state.pixels.set(`${x},${y}`, closestColor);
              }
            }

            this.drawCanvas();
            this.tabManager.saveTabs();
            this.updateZoomUI();
          };
          img.src = base64Url;
          return;
        }
      }
      alert('No image found in clipboard');
    } catch (err) {
      console.error('Failed to import image:', err);
      alert('Failed to import image. Make sure you have an image copied to clipboard.');
    }
  }

  handleGuidanceImageInteraction(e) {
    const layer = document.getElementById('guidance-layer');
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const images = this.tabManager.getActiveGuidanceImages();

    // Check if clicking on a guidance image
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      if (x >= img.x && x <= img.x + img.width &&
          y >= img.y && y <= img.y + img.height) {
        return true; // Handled by guidance layer
      }
    }

    return false;
  }

  handleGuidanceImageMove(e) {
    if (this.selectedGuidanceImage === null) return;

    const layer = document.getElementById('guidance-layer');
    const rect = layer.getBoundingClientRect();
    const images = this.tabManager.getActiveGuidanceImages();
    const img = images[this.selectedGuidanceImage];

    if (this.guidanceImageResizing) {
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      const deltaX = newX - this.guidanceImageStartPos.x;
      const deltaY = newY - this.guidanceImageStartPos.y;

      // Maintain aspect ratio
      const aspectRatio = img.originalWidth / img.originalHeight;
      const delta = Math.max(deltaX, deltaY);
      const newWidth = Math.max(40, this.guidanceImageStartSize.w + delta);
      const newHeight = newWidth / aspectRatio;

      img.width = newWidth;
      img.height = newHeight;
    } else if (this.guidanceImageDragging) {
      const newX = e.clientX - rect.left - this.guidanceImageStartPos.x;
      const newY = e.clientY - rect.top - this.guidanceImageStartPos.y;

      // Allow free movement - no bounds restrictions
      img.x = newX;
      img.y = newY;
    }

    this.tabManager.setActiveGuidanceImages(images);
    this.drawGuidanceImages();
  }

  // CSEF Encoder - Compact Sprite Encoding Format
  encodeCSEF(state, skipEmpty = false) {
    // Map color index to CSEF color code
    const getColorCode = (colorIndex) => {
      if (colorIndex === null || colorIndex < 0 || colorIndex >= this.colorCodes.length) {
        return '.'; // Empty pixel uses '.' in CSEF
      }
      // Map to COLOR_CHARS alphabet (which excludes digits 0-9 and semantic codes ~, ^, and >)
      const code = this.colorCodes[colorIndex];
      // Ensure we don't use semantic codes as color codes
      if (code === '~' || code === '^' || code === '>') {
        // Fallback to a safe character if somehow a semantic code was assigned
        return 'A';
      }
      return code;
    };

    let width, height, startX = 0, startY = 0;

    if (skipEmpty) {
      // Find bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [key] of state.pixels.entries()) {
        const [x, y] = key.split(',').map(Number);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      if (minX === Infinity) {
        return { width: 0, height: 0, encoded: '', size: 0 };
      }

      width = maxX - minX + 1;
      height = maxY - minY + 1;
      startX = minX;
      startY = minY;
    } else {
      width = state.width;
      height = state.height;
    }

    // Flatten sprite: left-to-right, top-to-bottom
    const flattened = [];
    const rows = [];
    for (let y = startY; y < startY + height; y++) {
      const row = [];
      for (let x = startX; x < startX + width; x++) {
        const colorIndex = state.getPixel(x, y);
        const code = getColorCode(colorIndex);
        row.push(code);
        flattened.push(code);
      }
      rows.push(row);
    }

    // RLE encoding with semantic optimization
    const encoded = [];
    let lastRow = null;
    const emptyColor = '.'; // Empty pixel color code

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];

      // Check if this row is fully empty (all pixels are empty)
      const isFullyEmpty = row.every(code => code === emptyColor);
      if (isFullyEmpty) {
        encoded.push('~');
        lastRow = [...row]; // Store for row repetition check
        continue; // Skip encoding this row, use ~ instead
      }

      // Check if this row is identical to the previous row
      if (rowIdx > 0 && lastRow && row.every((code, idx) => code === lastRow[idx])) {
        encoded.push('^');
        continue; // Skip encoding this row, use ^ instead
      }

      // Check for horizontal symmetry (only for even widths)
      // A row is symmetric if left half mirrors to right half
      let isSymmetric = false;
      if (width % 2 === 0) {
        const leftHalf = row.slice(0, width / 2);
        const rightHalf = row.slice(width / 2);
        const mirroredRight = [...leftHalf].reverse();
        isSymmetric = rightHalf.every((code, idx) => code === mirroredRight[idx]);
      }

      if (isSymmetric) {
        // Encode only the left half, then add symmetry marker
        const leftHalf = row.slice(0, width / 2);
        let currentColor = null;
        let runLength = 0;

        for (let colIdx = 0; colIdx < leftHalf.length; colIdx++) {
          const color = leftHalf[colIdx];

          if (color === currentColor) {
            runLength++;
          } else {
            // Output previous run
            if (currentColor !== null && runLength > 0) {
              // Output run in chunks of max 9
              let remaining = runLength;
              while (remaining > 0) {
                const chunk = Math.min(remaining, 9);
                encoded.push(chunk.toString() + currentColor);
                remaining -= chunk;
              }
            }

            // Start new run
            currentColor = color;
            runLength = 1;
          }
        }

        // Output final run of the left half
        if (currentColor !== null && runLength > 0) {
          let remaining = runLength;
          while (remaining > 0) {
            const chunk = Math.min(remaining, 9);
            encoded.push(chunk.toString() + currentColor);
            remaining -= chunk;
          }
        }

        // Add symmetry marker
        encoded.push('>');
      } else {
        // Encode full row with RLE (no symmetry)
        let currentColor = null;
        let runLength = 0;

        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          const color = row[colIdx];

          if (color === currentColor) {
            runLength++;
          } else {
            // Output previous run
            if (currentColor !== null && runLength > 0) {
              // Output run in chunks of max 9
              let remaining = runLength;
              while (remaining > 0) {
                const chunk = Math.min(remaining, 9);
                encoded.push(chunk.toString() + currentColor);
                remaining -= chunk;
              }
            }

            // Start new run
            currentColor = color;
            runLength = 1;
          }
        }

        // Output final run of the row
        if (currentColor !== null && runLength > 0) {
          let remaining = runLength;
          while (remaining > 0) {
            const chunk = Math.min(remaining, 9);
            encoded.push(chunk.toString() + currentColor);
            remaining -= chunk;
          }
        }
      }

      lastRow = [...row]; // Store for row repetition check
    }

    const encodedString = encoded.join('');
    return {
      width: width,
      height: height,
      encoded: encodedString,
      size: encodedString.length
    };
  }

  // CSEF Decoder: Compact Sprite Encoding Format
  // Format: <digit><char> where digit is run-length (1-9) and char is color code
  // Semantic codes:
  //   ~ = full row of empty pixels (must appear at row boundary)
  //   ^ = repeat previous row
  //   > = horizontal symmetry marker (mirrors left half to right half, only for even widths)
  parseCSEF(s, w) {
    const r = [], p = [];
    for (let i = 0; i < s.length;) {
      if (!p.length) {
        // Row boundary semantic codes
        if (s[i] === '~') { r.push(Array(w).fill('.')); i++; continue; }
        if (s[i] === '^') { if (r.length) r.push([...r.at(-1)]); i++; continue; }
      }
      
      // Check for symmetry marker ">" (must be in middle of row, after at least half width)
      if (s[i] === '>') {
        // Validate: must have at least half the row decoded, and width must be even
        if (p.length < w / 2 || w % 2 !== 0) {
          // Invalid position - skip and continue
          i++;
          continue;
        }
        
        // Mirror the left half to complete the row
        const leftHalf = p.slice(0, w / 2);
        const rightHalf = [...leftHalf].reverse(); // Mirror
        p.length = 0; // Clear partial row
        p.push(...leftHalf, ...rightHalf);
        
        // Complete row is ready
        r.push(p.splice(0, w));
        i++;
        continue;
      }
      
      // Regular RLE encoding: <digit><char>
      const n = +s[i], c = s[i + 1];
      if (!n || n > 9) { i++; continue; }
      p.push(...Array(n).fill(c));
      
      // Check if row is complete (but not if we just processed a symmetry marker)
      while (p.length >= w) {
        r.push(p.splice(0, w));
      }
      i += 2;
    }
    if (p.length) r.push(p);
    return r;
  }

  // Import sprite from CSEF code
  async importSprite() {
    const input = document.getElementById('import-code').value.trim();
    if (!input) {
      alert('Please paste CSEF code');
      return;
    }

    const state = this.getActiveState();
    state.saveState(true);

    let width, encoded;

    // Try to parse full format: "width: 30, encoded: '...'"
    const fullFormatMatch = input.match(/width:\s*(\d+),\s*encoded:\s*['"]([^'"]+)['"]/);
    if (fullFormatMatch) {
      width = parseInt(fullFormatMatch[1]);
      encoded = fullFormatMatch[2];
    } else {
      // Try to parse just the encoded string (assume it's wrapped in quotes)
      const quotedMatch = input.match(/['"]([^'"]+)['"]/);
      if (quotedMatch) {
        encoded = quotedMatch[1];
      } else {
        // Assume the entire input is the encoded string
        encoded = input;
      }

      // Try to detect width from the encoded string or use default
      width = 30;

      // Try to extract width from comments if present
      const widthMatch = input.match(/width[:\s]+(\d+)/i);
      if (widthMatch) {
        width = parseInt(widthMatch[1]);
      }
    }

    if (!encoded) {
      alert('Could not parse CSEF code. Please check the format.');
      return;
    }

    // Parse the CSEF string into a 2D array
    const spriteData = this.parseCSEF(encoded, width);

    if (!spriteData || spriteData.length === 0) {
      alert('Failed to decode sprite. Please check the code.');
      return;
    }

    const height = spriteData.length;

    // Get target dimensions from inputs
    const targetWidth = parseInt(document.getElementById('import-target-width').value) || state.width;
    const targetHeight = parseInt(document.getElementById('import-target-height').value) || state.height;

    // Resize canvas to target dimensions if different
    if (targetWidth !== state.width || targetHeight !== state.height) {
      state.width = targetWidth;
      state.height = targetHeight;
      state.pixels = new Map();
      state.undoStack = [];
      this.updateCanvasSize(true);
    } else {
      state.pixels.clear();
    }

    // Calculate scale to fit sprite within target dimensions
    const scale = Math.min(targetWidth / width, targetHeight / height);
    const scaledWidth = Math.floor(width * scale);
    const scaledHeight = Math.floor(height * scale);

    // Center the scaled sprite on the canvas
    const startX = Math.floor((targetWidth - scaledWidth) / 2);
    const startY = Math.floor((targetHeight - scaledHeight) / 2);

    // Convert sprite data to pixels and paste (with scaling)
    for (let row = 0; row < scaledHeight; row++) {
      for (let col = 0; col < scaledWidth; col++) {
        // Map scaled position back to original sprite
        const srcCol = Math.floor((col / scaledWidth) * width);
        const srcRow = Math.floor((row / scaledHeight) * height);
        const char = spriteData[srcRow] ? spriteData[srcRow][srcCol] : null;
        
        const x = startX + col;
        const y = startY + row;

        if (x >= 0 && x < targetWidth && y >= 0 && y < targetHeight) {
          // Map character to color index
          if (char === '.' || char === ' ' || !char) {
            state.setPixel(x, y, null); // Empty pixel
          } else {
            // Find color index from color code
            const colorIndex = this.colorCodes.indexOf(char);
            if (colorIndex >= 0) {
              state.setPixel(x, y, colorIndex);
            } else {
              // Unknown character - set as empty
              state.setPixel(x, y, null);
            }
          }
        }
      }
    }

    this.draw();
    this.updateTimelineThumbnail();
    this.updateZoomUI();
    await this.tabManager.saveTabs();

    // Clear the input
    document.getElementById('import-code').value = '';
  }

  exportCode() {
    const state = this.getActiveState();
    const skipEmpty = document.getElementById('skip-empty').checked;

    const result = this.encodeCSEF(state, skipEmpty);

    if (result.size === 0) {
      document.getElementById('export-output').value = '// Empty canvas';
      return;
    }

    // Format output: width, encoded string
    const output = `width: ${result.width}, encoded: '${result.encoded}'`;
    document.getElementById('export-output').value = `// CSEF Format\n// Size: ${result.size} characters\n// Width: ${result.width}px, Height: ${result.height}px\n${output}`;
  }

  exportPalette() {
    const includeUnused = document.getElementById('include-unused-colors').checked;

    // Build set of used color indices across all tabs and frames
    let usedIndices = null;
    if (!includeUnused) {
      usedIndices = new Set();
      for (const tab of this.tabManager.tabs) {
        const state = tab.state;
        for (const frame of state.frames) {
          for (const colorIndex of frame.pixels.values()) {
            usedIndices.add(colorIndex);
          }
        }
      }
    }

    // Generate palette array
    const palette = this.originalPalette;
    const lines = [];
    const colorsPerLine = 8;

    for (let i = 0; i < palette.length; i += colorsPerLine) {
      const chunk = [];
      for (let j = 0; j < colorsPerLine && i + j < palette.length; j++) {
        const idx = i + j;
        let hexVal;
        if (!includeUnused && usedIndices && !usedIndices.has(idx)) {
          hexVal = '0';
        } else {
          const color = palette[idx];
          // Remove # prefix and convert to 0x format
          hexVal = '0x' + color.slice(1);
        }
        chunk.push(hexVal);
      }
      lines.push('  ' + chunk.join(', '));
    }

    const output = `const P_PAL = [\n${lines.join(',\n')}\n];`;
    document.getElementById('palette-output').value = output;
  }

  async deleteSelection() {
    if (this.selection) {
      const state = this.getActiveState();
      state.saveState(true);
      // Clear only the pixels that were actually part of the selection
      for (const [key, colorIndex] of this.selection.pixels.entries()) {
        const [relX, relY] = key.split(',').map(Number);
        const x = this.selection.x + relX;
        const y = this.selection.y + relY;
        if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
          state.setPixel(x, y, null);
        }
      }
      this.selection = null;
      document.getElementById('selection-controls').style.display = 'none';
      await this.tabManager.saveTabs();
      this.draw();
    }
  }

  async renameTab(index) {
    const tab = this.tabManager.tabs[index];
    if (!tab) return;

    const newName = prompt('Enter new tab name:', tab.name);
    if (newName !== null && newName.trim() !== '') {
      await this.tabManager.renameTab(index, newName.trim());
      // Just update the tab name in the UI without full render
      setTimeout(() => {
        const tabElement = document.querySelector(`.tab[data-tab-index="${index}"] .tab-name`);
        if (tabElement) {
          tabElement.textContent = newName.trim();
        }
      }, 0);
    }
  }
}

// Initialize app
const app = new PixelArtEditor();
app.init();

