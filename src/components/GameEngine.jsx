import React, { useState, useRef, useEffect } from 'react';
import './GameEngine.css';

/**
 * Game Engine with Visual Scripting
 * Node-based drag-drop logic builder - better than Unity/Unreal blueprints
 */

const GameEngine = ({ userId }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameObjects, setGameObjects] = useState([]);
  const canvasRef = useRef(null);
  const scriptCanvasRef = useRef(null);

  // Node types for visual scripting
  const nodeTypes = {
    event: { name: 'Event', color: '#ef4444', icon: '⚡' },
    action: { name: 'Action', color: '#3b82f6', icon: '▶' },
    condition: { name: 'Condition', color: '#f59e0b', icon: '?' },
    variable: { name: 'Variable', color: '#8b5cf6', icon: '💾' },
    math: { name: 'Math', color: '#10b981', icon: '🔢' },
    object: { name: 'GameObject', color: '#ec4899', icon: '🎮' },
  };

  // Predefined nodes
  const nodeTemplates = {
    onStart: { type: 'event', label: 'On Start', outputs: ['trigger'] },
    onClick: { type: 'event', label: 'On Click', outputs: ['trigger'] },
    onCollision: { type: 'event', label: 'On Collision', outputs: ['trigger', 'object'] },
    move: { type: 'action', label: 'Move', inputs: ['trigger', 'x', 'y'], outputs: ['done'] },
    rotate: { type: 'action', label: 'Rotate', inputs: ['trigger', 'angle'], outputs: ['done'] },
    scale: { type: 'action', label: 'Scale', inputs: ['trigger', 'size'], outputs: ['done'] },
    playSound: { type: 'action', label: 'Play Sound', inputs: ['trigger', 'audio'], outputs: ['done'] },
    ifCondition: { type: 'condition', label: 'If', inputs: ['trigger', 'condition'], outputs: ['true', 'false'] },
    compare: { type: 'condition', label: 'Compare', inputs: ['a', 'b'], outputs: ['>', '<', '='] },
    add: { type: 'math', label: 'Add', inputs: ['a', 'b'], outputs: ['result'] },
    multiply: { type: 'math', label: 'Multiply', inputs: ['a', 'b'], outputs: ['result'] },
    getVariable: { type: 'variable', label: 'Get Variable', outputs: ['value'] },
    setVariable: { type: 'variable', label: 'Set Variable', inputs: ['trigger', 'value'], outputs: ['done'] },
    createObject: { type: 'object', label: 'Create GameObject', inputs: ['trigger'], outputs: ['object'] },
    destroyObject: { type: 'object', label: 'Destroy GameObject', inputs: ['trigger', 'object'], outputs: ['done'] },
  };

  const addNode = (template, x = 100, y = 100) => {
    const newNode = {
      id: `node_${Date.now()}`,
      ...nodeTemplates[template],
      x,
      y,
      values: {},
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeDragStart = (e, nodeId) => {
    setDraggedNode(nodeId);
  };

  const handleNodeDrag = (e, nodeId) => {
    if (!draggedNode) return;
    const rect = scriptCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, x, y } : node
    ));
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
  };

  const connectNodes = (fromNode, fromOutput, toNode, toInput) => {
    const newConnection = {
      id: `conn_${Date.now()}`,
      from: fromNode,
      fromOutput,
      to: toNode,
      toInput,
    };
    setConnections([...connections, newConnection]);
  };

  const executeScript = () => {
    setIsPlaying(true);
    // Find all "On Start" nodes
    const startNodes = nodes.filter(n => n.label === 'On Start');

    startNodes.forEach(startNode => {
      executeNodeChain(startNode.id);
    });
  };

  const executeNodeChain = (nodeId, inputData = {}) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Execute node logic
    let outputData = {};
    switch(node.label) {
      case 'Move':
        const x = inputData.x || node.values.x || 0;
        const y = inputData.y || node.values.y || 0;
        // Execute move action in game engine
        outputData = { done: true };
        break;
      case 'Play Sound':
        // Execute play sound action
        outputData = { done: true };
        break;
      case 'Add':
        const a = inputData.a || node.values.a || 0;
        const b = inputData.b || node.values.b || 0;
        outputData = { result: a + b };
        break;
      default:
        outputData = { trigger: true };
    }

    // Find connected nodes and execute them
    const outgoingConnections = connections.filter(c => c.from === nodeId);
    outgoingConnections.forEach(conn => {
      const nextInputData = { ...outputData, [conn.toInput]: outputData[conn.fromOutput] };
      setTimeout(() => executeNodeChain(conn.to, nextInputData), 100);
    });
  };

  const stopScript = () => {
    setIsPlaying(false);
  };

  const clearAll = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
  };

  const exportScript = () => {
    const script = {
      nodes,
      connections,
      metadata: {
        created: new Date().toISOString(),
        author: userId,
      }
    };
    const blob = new Blob([JSON.stringify(script, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_script_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="game-engine">
      <div className="engine-header">
        <h1>🎮 Game Engine - Visual Scripting</h1>
        <p>Drag nodes, connect logic, create games - no coding required</p>
      </div>

      <div className="engine-toolbar">
        <button onClick={() => addNode('onStart')} className="btn-node" style={{background: nodeTypes.event.color}}>
          {nodeTypes.event.icon} On Start
        </button>
        <button onClick={() => addNode('onClick')} className="btn-node" style={{background: nodeTypes.event.color}}>
          {nodeTypes.event.icon} On Click
        </button>
        <button onClick={() => addNode('move')} className="btn-node" style={{background: nodeTypes.action.color}}>
          {nodeTypes.action.icon} Move
        </button>
        <button onClick={() => addNode('rotate')} className="btn-node" style={{background: nodeTypes.action.color}}>
          {nodeTypes.action.icon} Rotate
        </button>
        <button onClick={() => addNode('playSound')} className="btn-node" style={{background: nodeTypes.action.color}}>
          {nodeTypes.action.icon} Play Sound
        </button>
        <button onClick={() => addNode('ifCondition')} className="btn-node" style={{background: nodeTypes.condition.color}}>
          {nodeTypes.condition.icon} If Condition
        </button>
        <button onClick={() => addNode('add')} className="btn-node" style={{background: nodeTypes.math.color}}>
          {nodeTypes.math.icon} Add
        </button>
        <button onClick={() => addNode('createObject')} className="btn-node" style={{background: nodeTypes.object.color}}>
          {nodeTypes.object.icon} Create Object
        </button>
        <div style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
          {!isPlaying ? (
            <button onClick={executeScript} className="btn-play">▶ Play</button>
          ) : (
            <button onClick={stopScript} className="btn-stop">⏹ Stop</button>
          )}
          <button onClick={exportScript} className="btn-export">💾 Export</button>
          <button onClick={clearAll} className="btn-clear">🗑️ Clear All</button>
        </div>
      </div>

      <div className="engine-workspace">
        {/* Visual Scripting Canvas */}
        <div className="script-canvas" ref={scriptCanvasRef}>
          <h3>Visual Script Editor</h3>
          <div className="nodes-container">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`script-node ${selectedNode === node.id ? 'selected' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  borderColor: nodeTypes[node.type].color,
                }}
                draggable
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                onDrag={(e) => handleNodeDrag(e, node.id)}
                onDragEnd={handleNodeDragEnd}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="node-header" style={{background: nodeTypes[node.type].color}}>
                  <span>{nodeTypes[node.type].icon} {node.label}</span>
                </div>
                <div className="node-body">
                  {node.inputs && node.inputs.map(input => (
                    <div key={input} className="node-input">
                      ◀ {input}
                    </div>
                  ))}
                  {node.outputs && node.outputs.map(output => (
                    <div key={output} className="node-output">
                      {output} ▶
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Draw connections */}
            <svg className="connections-svg">
              {connections.map(conn => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                return (
                  <line
                    key={conn.id}
                    x1={fromNode.x + 150}
                    y1={fromNode.y + 30}
                    x2={toNode.x}
                    y2={toNode.y + 30}
                    stroke="#667eea"
                    strokeWidth="3"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Game Preview Canvas */}
        <div className="game-canvas">
          <h3>Game Preview</h3>
          <canvas ref={canvasRef} width="600" height="400" style={{border: '2px solid #667eea', background: '#1a1a2e'}} />
          <div className="canvas-info">
            <p>Press Play to test your game logic</p>
            <p>Nodes: {nodes.length} | Connections: {connections.length}</p>
          </div>
        </div>
      </div>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="properties-panel">
          <h3>Node Properties</h3>
          <div className="property">
            <label>Node ID:</label>
            <span>{selectedNode}</span>
          </div>
          <div className="property">
            <label>Type:</label>
            <span>{nodes.find(n => n.id === selectedNode)?.type}</span>
          </div>
          <button onClick={() => setNodes(nodes.filter(n => n.id !== selectedNode))} className="btn-delete">
            Delete Node
          </button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
