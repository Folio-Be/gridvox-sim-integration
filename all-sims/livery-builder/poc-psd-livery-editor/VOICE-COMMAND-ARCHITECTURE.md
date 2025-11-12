# Voice-Driven Livery Editor Architecture
## Command System for SimVox Voice Integration

**Date:** November 12, 2025  
**Goal:** Enable voice commands like "move the number decal left until I say stop" or "insert a Red Bull logo mask on layer 5"

---

## 🎤 Core Question: Does Fabric.js Support Undo/Redo?

### ❌ **Answer: NO - Fabric.js does NOT have built-in undo/redo**

**From Research:**
- Fabric.js is a **rendering library**, not a full application framework
- No native history stack or command pattern
- No built-in state management system
- You must implement your own undo/redo system

**Why This Matters for Voice Commands:**
- ✅ **Good News:** We MUST build a command system anyway (perfect for voice!)
- ✅ **Opportunity:** Design command system specifically for voice from day 1
- ✅ **Clean Architecture:** Command pattern is industry standard for undo/redo

---

## 🏗️ Command Pattern Architecture

### Why Command Pattern?

**Benefits:**
1. ✅ **Undo/Redo** - Every action is reversible
2. ✅ **Voice Integration** - Commands map perfectly to voice phrases
3. ✅ **Macro Recording** - Chain commands for automation
4. ✅ **Replay/Debugging** - Reconstruct exact user actions
5. ✅ **Network Sync** - Send commands to other users (collaboration)

### Core Interfaces

```typescript
// Base Command Interface
interface Command {
  type: string;           // "MoveObject", "AddImage", "ChangeColor"
  execute(): void;        // Perform the action
  undo(): void;           // Reverse the action
  redo(): void;           // Re-perform after undo
  
  // Voice-specific
  voicePhrase?: string;   // "move the number decal left"
  continuous?: boolean;   // Can command run continuously?
  
  // Metadata
  timestamp: Date;
  userId?: string;        // For collaboration
  targetId?: string;      // Which object affected
}

// Command History Manager
class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize = 100;
  
  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new action
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    // Fire event for UI update
    this.emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }
  
  undo(): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
      this.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
  }
  
  redo(): void {
    const command = this.redoStack.pop();
    if (command) {
      command.redo();
      this.undoStack.push(command);
      this.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
  }
  
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  // For debugging/replay
  getHistory(): Command[] {
    return [...this.undoStack];
  }
}
```

---

## 🎯 Concrete Command Examples

### 1. Move Object Command

```typescript
class MoveObjectCommand implements Command {
  type = 'MoveObject';
  voicePhrase: string;
  continuous = true; // Can be voice-controlled continuously
  
  private targetObject: fabric.Object;
  private oldPosition: { left: number; top: number };
  private newPosition: { left: number; top: number };
  
  constructor(
    target: fabric.Object,
    newLeft: number,
    newTop: number,
    voicePhrase?: string
  ) {
    this.targetObject = target;
    this.oldPosition = {
      left: target.left || 0,
      top: target.top || 0
    };
    this.newPosition = {
      left: newLeft,
      top: newTop
    };
    this.voicePhrase = voicePhrase || `move ${target.name || 'object'}`;
  }
  
  execute(): void {
    this.targetObject.set({
      left: this.newPosition.left,
      top: this.newPosition.top
    });
    this.targetObject.setCoords();
    canvas.requestRenderAll();
  }
  
  undo(): void {
    this.targetObject.set({
      left: this.oldPosition.left,
      top: this.oldPosition.top
    });
    this.targetObject.setCoords();
    canvas.requestRenderAll();
  }
  
  redo(): void {
    this.execute();
  }
  
  // For voice: Update position incrementally
  updatePosition(deltaX: number, deltaY: number): void {
    this.newPosition.left += deltaX;
    this.newPosition.top += deltaY;
    this.execute();
  }
}

// Usage with voice
const command = new MoveObjectCommand(numberDecal, 100, 200, "move the number decal left");
history.execute(command);

// Voice continuous control
voiceController.on('command:move:continuous', (direction, speed) => {
  const delta = speed * 2; // pixels per frame
  if (direction === 'left') {
    command.updatePosition(-delta, 0);
  }
});
```

### 2. Add Image Command

```typescript
class AddImageCommand implements Command {
  type = 'AddImage';
  voicePhrase: string;
  continuous = false;
  
  private canvas: fabric.Canvas;
  private imageObject?: fabric.Image;
  private imageUrl: string;
  private position: { left: number; top: number };
  private layerIndex?: number;
  
  constructor(
    canvas: fabric.Canvas,
    imageUrl: string,
    position: { left: number; top: number },
    layerIndex?: number,
    voicePhrase?: string
  ) {
    this.canvas = canvas;
    this.imageUrl = imageUrl;
    this.position = position;
    this.layerIndex = layerIndex;
    this.voicePhrase = voicePhrase || `add image ${imageUrl}`;
  }
  
  async execute(): Promise<void> {
    if (!this.imageObject) {
      // First execution - load image
      this.imageObject = await fabric.Image.fromURL(this.imageUrl);
      this.imageObject.set({
        left: this.position.left,
        top: this.position.top
      });
    }
    
    if (this.layerIndex !== undefined) {
      this.canvas.insertAt(this.layerIndex, this.imageObject);
    } else {
      this.canvas.add(this.imageObject);
    }
    
    this.canvas.requestRenderAll();
  }
  
  undo(): void {
    if (this.imageObject) {
      this.canvas.remove(this.imageObject);
      this.canvas.requestRenderAll();
    }
  }
  
  redo(): void {
    this.execute();
  }
}

// Voice usage: "insert a Red Bull logo mask on layer 5"
const logoUrl = await sponsorLibrary.getLogoUrl('Red Bull');
const command = new AddImageCommand(
  canvas,
  logoUrl,
  { left: 500, top: 300 },
  5, // layer index
  "insert a Red Bull logo mask on layer 5"
);
history.execute(command);
```

### 3. Change Color Command

```typescript
class ChangeColorCommand implements Command {
  type = 'ChangeColor';
  voicePhrase: string;
  
  private targetObject: fabric.Object;
  private property: 'fill' | 'stroke';
  private oldColor: string;
  private newColor: string;
  
  constructor(
    target: fabric.Object,
    property: 'fill' | 'stroke',
    newColor: string,
    voicePhrase?: string
  ) {
    this.targetObject = target;
    this.property = property;
    this.oldColor = target[property] as string;
    this.newColor = newColor;
    this.voicePhrase = voicePhrase || `change ${property} to ${newColor}`;
  }
  
  execute(): void {
    this.targetObject.set(this.property, this.newColor);
    canvas.requestRenderAll();
  }
  
  undo(): void {
    this.targetObject.set(this.property, this.oldColor);
    canvas.requestRenderAll();
  }
  
  redo(): void {
    this.execute();
  }
}

// Voice: "make the background red"
const command = new ChangeColorCommand(
  backgroundRect,
  'fill',
  '#ff0000',
  "make the background red"
);
history.execute(command);
```

### 4. Composite Command (Macro)

```typescript
class CompositeCommand implements Command {
  type = 'CompositeCommand';
  voicePhrase: string;
  
  private commands: Command[] = [];
  
  constructor(commands: Command[], voicePhrase: string) {
    this.commands = commands;
    this.voicePhrase = voicePhrase;
  }
  
  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }
  
  undo(): void {
    // Undo in reverse order
    [...this.commands].reverse().forEach(cmd => cmd.undo());
  }
  
  redo(): void {
    this.execute();
  }
}

// Voice: "apply team colors"
const applyTeamColors = new CompositeCommand([
  new ChangeColorCommand(hood, 'fill', '#1e3a8a', 'hood to blue'),
  new ChangeColorCommand(roof, 'fill', '#ffffff', 'roof to white'),
  new AddImageCommand(canvas, 'redbull-logo.png', { left: 100, top: 100 }, undefined, 'add logo')
], "apply team colors");

history.execute(applyTeamColors);
```

---

## 🎙️ Voice Command Integration

### Voice Command Parser

```typescript
class VoiceCommandParser {
  private canvas: fabric.Canvas;
  private history: CommandHistory;
  private sponsorLibrary: SponsorLibrary;
  
  constructor(canvas: fabric.Canvas, history: CommandHistory) {
    this.canvas = canvas;
    this.history = history;
  }
  
  // Parse voice transcript to command
  async parseVoiceCommand(transcript: string): Promise<Command | null> {
    const normalized = transcript.toLowerCase().trim();
    
    // Move commands
    if (normalized.includes('move')) {
      return this.parseMoveCommand(normalized);
    }
    
    // Add image commands
    if (normalized.includes('insert') || normalized.includes('add')) {
      return this.parseAddImageCommand(normalized);
    }
    
    // Color commands
    if (normalized.includes('make') && normalized.includes('color')) {
      return this.parseColorCommand(normalized);
    }
    
    // Undo/Redo
    if (normalized === 'undo') {
      this.history.undo();
      return null;
    }
    if (normalized === 'redo') {
      this.history.redo();
      return null;
    }
    
    return null;
  }
  
  private parseMoveCommand(transcript: string): Command | null {
    // "move the number decal left"
    const targetMatch = transcript.match(/move (?:the )?(\w+(?:\s+\w+)*?)(?:\s+to\s+|\s+)(left|right|up|down)/);
    if (!targetMatch) return null;
    
    const targetName = targetMatch[1];
    const direction = targetMatch[2];
    
    // Find target object
    const target = this.canvas.getObjects().find(obj => 
      obj.name?.toLowerCase().includes(targetName.toLowerCase())
    );
    
    if (!target) {
      console.warn(`Target "${targetName}" not found`);
      return null;
    }
    
    // Calculate new position
    const moveDistance = 10; // pixels
    let newLeft = target.left || 0;
    let newTop = target.top || 0;
    
    switch (direction) {
      case 'left': newLeft -= moveDistance; break;
      case 'right': newLeft += moveDistance; break;
      case 'up': newTop -= moveDistance; break;
      case 'down': newTop += moveDistance; break;
    }
    
    return new MoveObjectCommand(target, newLeft, newTop, transcript);
  }
  
  private async parseAddImageCommand(transcript: string): Promise<Command | null> {
    // "insert a Red Bull logo mask on layer 5"
    const logoMatch = transcript.match(/(?:insert|add)\s+(?:a\s+)?(.+?)\s+logo/i);
    const layerMatch = transcript.match(/(?:on\s+)?layer\s+(\d+)/i);
    
    if (!logoMatch) return null;
    
    const brandName = logoMatch[1];
    const layerIndex = layerMatch ? parseInt(layerMatch[1]) : undefined;
    
    // Get logo from sponsor library
    const logoUrl = await this.sponsorLibrary.getLogoUrl(brandName);
    if (!logoUrl) {
      console.warn(`Logo for "${brandName}" not found`);
      return null;
    }
    
    // Default position (center of canvas)
    const position = {
      left: this.canvas.width! / 2,
      top: this.canvas.height! / 2
    };
    
    return new AddImageCommand(this.canvas, logoUrl, position, layerIndex, transcript);
  }
  
  private parseColorCommand(transcript: string): Command | null {
    // "make the background red"
    const targetMatch = transcript.match(/make (?:the )?(\w+(?:\s+\w+)*?)\s+(\w+)/);
    if (!targetMatch) return null;
    
    const targetName = targetMatch[1];
    const colorName = targetMatch[2];
    
    // Find target
    const target = this.canvas.getObjects().find(obj =>
      obj.name?.toLowerCase().includes(targetName.toLowerCase())
    );
    
    if (!target) return null;
    
    // Convert color name to hex (basic mapping)
    const colorMap: Record<string, string> = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00',
      'yellow': '#ffff00',
      'white': '#ffffff',
      'black': '#000000'
    };
    
    const colorHex = colorMap[colorName.toLowerCase()] || colorName;
    
    return new ChangeColorCommand(target, 'fill', colorHex, transcript);
  }
}
```

### Continuous Voice Commands

```typescript
class ContinuousVoiceController {
  private canvas: fabric.Canvas;
  private currentCommand?: MoveObjectCommand;
  private animationFrame?: number;
  private isActive = false;
  
  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }
  
  // Start continuous movement
  startContinuousMove(
    target: fabric.Object,
    direction: 'left' | 'right' | 'up' | 'down',
    speed: number = 2
  ): void {
    if (this.isActive) {
      this.stop();
    }
    
    this.currentCommand = new MoveObjectCommand(
      target,
      target.left || 0,
      target.top || 0,
      `move ${target.name || 'object'} ${direction} continuously`
    );
    
    this.isActive = true;
    
    const animate = () => {
      if (!this.isActive) return;
      
      let deltaX = 0;
      let deltaY = 0;
      
      switch (direction) {
        case 'left': deltaX = -speed; break;
        case 'right': deltaX = speed; break;
        case 'up': deltaY = -speed; break;
        case 'down': deltaY = speed; break;
      }
      
      this.currentCommand!.updatePosition(deltaX, deltaY);
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  // Stop continuous movement (voice says "stop")
  stop(): void {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Add final command to history for undo
    if (this.currentCommand) {
      history.execute(this.currentCommand);
      this.currentCommand = undefined;
    }
  }
}

// Usage
const voiceController = new ContinuousVoiceController(canvas);

// User says: "move the number decal left"
const numberDecal = canvas.getObjects().find(obj => obj.name === 'number-decal');
if (numberDecal) {
  voiceController.startContinuousMove(numberDecal, 'left', 3);
}

// User says: "stop"
voiceController.stop();
```

---

## 🔊 Voice Recognition Integration

### Using Web Speech API

```typescript
class VoiceCommandManager {
  private recognition: SpeechRecognition;
  private parser: VoiceCommandParser;
  private continuousController: ContinuousVoiceController;
  private isListening = false;
  
  constructor(
    canvas: fabric.Canvas,
    history: CommandHistory
  ) {
    this.parser = new VoiceCommandParser(canvas, history);
    this.continuousController = new ContinuousVoiceController(canvas);
    
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.setupListeners();
  }
  
  private setupListeners(): void {
    this.recognition.onresult = async (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      
      console.log(`Voice (${isFinal ? 'final' : 'interim'}):`, transcript);
      
      if (isFinal) {
        await this.handleVoiceCommand(transcript);
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };
    
    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if we're still supposed to be listening
        this.recognition.start();
      }
    };
  }
  
  private async handleVoiceCommand(transcript: string): Promise<void> {
    const normalized = transcript.toLowerCase().trim();
    
    // Check for "stop" command (for continuous actions)
    if (normalized === 'stop') {
      this.continuousController.stop();
      return;
    }
    
    // Parse and execute command
    const command = await this.parser.parseVoiceCommand(transcript);
    if (command) {
      if (command.continuous) {
        // Start continuous action (like continuous move)
        // This is a simplification - real implementation would be more complex
        console.log('Starting continuous command:', command.voicePhrase);
      } else {
        history.execute(command);
        console.log('Executed command:', command.voicePhrase);
      }
    } else {
      console.warn('Could not parse voice command:', transcript);
    }
  }
  
  start(): void {
    this.isListening = true;
    this.recognition.start();
    console.log('🎤 Voice commands active');
  }
  
  stop(): void {
    this.isListening = false;
    this.recognition.stop();
    this.continuousController.stop();
    console.log('🔇 Voice commands stopped');
  }
}

// Usage in app
const voiceManager = new VoiceCommandManager(canvas, history);

// Start listening
voiceManager.start();

// Stop listening
voiceManager.stop();
```

---

## 🎯 Complete Voice Command Examples

### Example 1: "Move the number decal left until I say stop"

```typescript
// User says: "move the number decal left"
voiceManager.on('command:parsed', (transcript) => {
  if (transcript.includes('move') && transcript.includes('until')) {
    const target = findObjectByVoiceName(transcript);
    const direction = extractDirection(transcript);
    
    continuousController.startContinuousMove(target, direction, 3);
  }
});

// User says: "stop"
voiceManager.on('command:stop', () => {
  continuousController.stop();
});
```

### Example 2: "Insert a Red Bull logo mask on layer 5"

```typescript
// Voice parser automatically handles this
const command = await parser.parseAddImageCommand(
  "insert a Red Bull logo mask on layer 5"
);

// Result:
// - Loads Red Bull logo from sponsor library
// - Adds to canvas at layer index 5
// - Command is in history (can undo)
```

### Example 3: "Apply team colors"

```typescript
// Macro system
const teamColorsMacro = new CompositeCommand([
  new ChangeColorCommand(hood, 'fill', '#1e3a8a'),
  new ChangeColorCommand(roof, 'fill', '#ffffff'),
  new ChangeColorCommand(doors, 'fill', '#1e3a8a')
], "apply team colors");

// Register macro
macroRegistry.register('team colors', teamColorsMacro);

// User says: "apply team colors"
voiceManager.on('command:macro', (macroName) => {
  const macro = macroRegistry.get(macroName);
  if (macro) {
    history.execute(macro);
  }
});
```

---

## 📋 Implementation Checklist

### Phase 1: Command System Foundation ✅

- [ ] Implement `Command` interface
- [ ] Create `CommandHistory` class
- [ ] Build core commands:
  - [ ] `MoveObjectCommand`
  - [ ] `AddImageCommand`
  - [ ] `ChangeColorCommand`
  - [ ] `DeleteObjectCommand`
  - [ ] `TransformObjectCommand` (scale, rotate)
- [ ] Integrate with Fabric.js canvas
- [ ] Add UI for undo/redo buttons
- [ ] Test undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### Phase 2: Voice Recognition ✅

- [ ] Set up Web Speech API integration
- [ ] Create `VoiceCommandParser`
- [ ] Implement command parsing patterns:
  - [ ] Move commands
  - [ ] Add image commands
  - [ ] Color change commands
- [ ] Add visual feedback (voice indicator)
- [ ] Test basic voice commands

### Phase 3: Continuous Commands ✅

- [ ] Build `ContinuousVoiceController`
- [ ] Implement continuous move
- [ ] Add "stop" command detection
- [ ] Test continuous + stop workflow

### Phase 4: Advanced Features ✅

- [ ] Macro/Composite commands
- [ ] Custom command registration
- [ ] Voice command history/replay
- [ ] Command serialization (save/load sessions)
- [ ] Collaboration (send commands to other users)

---

## 🚀 Future Enhancements

### Natural Language Processing (NLP)

```typescript
// Use AI to parse complex commands
class AIVoiceCommandParser extends VoiceCommandParser {
  private llm: OpenAI;
  
  async parseVoiceCommand(transcript: string): Promise<Command | null> {
    // Use GPT to understand intent
    const response = await this.llm.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `You are a livery editor assistant. Parse voice commands into structured actions.
        Available commands: move, add, change_color, delete, scale, rotate.
        Respond with JSON: { "action": "move", "target": "number decal", "direction": "left", "distance": 10 }`
      }, {
        role: 'user',
        content: transcript
      }]
    });
    
    const intent = JSON.parse(response.choices[0].message.content);
    return this.intentToCommand(intent);
  }
}
```

### Voice Feedback

```typescript
// Speak responses back to user
class VoiceFeedback {
  private synth = window.speechSynthesis;
  
  speak(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.2;
    this.synth.speak(utterance);
  }
}

// Usage
voiceManager.on('command:executed', (command) => {
  voiceFeedback.speak(`Done: ${command.voicePhrase}`);
});

voiceManager.on('command:error', (error) => {
  voiceFeedback.speak(`Sorry, I couldn't do that: ${error.message}`);
});
```

---

## ✅ Summary

### Key Findings:

1. **Fabric.js does NOT have built-in undo/redo** ❌
   - Must implement our own command system

2. **Command Pattern is PERFECT for voice** ✅
   - Every action = command
   - Commands are reversible (undo/redo)
   - Commands have natural language mappings

3. **Voice Integration Strategy:**
   - Web Speech API for recognition
   - Command pattern for execution
   - Continuous commands for "until I say stop" scenarios
   - Macros for complex multi-step operations

4. **SimVox Differentiator:**
   - First livery editor with full voice control
   - Hands-free design workflow
   - Perfect for content creators (streaming, tutorials)

### Next Steps:

1. **Implement Command System** (Week 2-3)
   - Build core commands
   - Add undo/redo to UI
   
2. **Integrate Voice Recognition** (Week 4)
   - Web Speech API setup
   - Basic command parsing

3. **Test Voice Workflow** (Week 5)
   - User testing with voice commands
   - Refine parsing accuracy

This architecture gives SimVox a **unique competitive advantage** - no other livery editor has voice control!
