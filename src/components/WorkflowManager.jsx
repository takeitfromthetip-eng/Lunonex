import React, { useState } from 'react';

/**
 * Workflow Manager - Cross-tool integration
 * Chain Design → Game Engine → Audio → Video workflows
 */

const WorkflowManager = ({ userId }) => {
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);

  const toolOptions = [
    { id: 'photo', name: 'Photo Editor', icon: '📸', outputs: ['image', 'layers'] },
    { id: 'design', name: 'Graphic Design', icon: '🎨', outputs: ['design', 'assets'] },
    { id: 'video', name: 'Video Editor', icon: '🎬', outputs: ['video', 'clips'] },
    { id: 'audio', name: 'Audio Studio', icon: '🎵', outputs: ['audio', 'tracks'] },
    { id: 'game', name: 'Game Engine', icon: '🎮', outputs: ['game', 'logic'] },
    { id: 'arvr', name: 'AR/VR Studio', icon: '🎭', outputs: ['scene', '3dmodel'] },
    { id: 'ai', name: 'AI Generator', icon: '🤖', outputs: ['content', 'media'] },
  ];

  const workflowTemplates = [
    {
      name: 'Design to Game',
      description: 'Create graphics in Design, import to Game Engine',
      steps: [
        { tool: 'design', action: 'Create sprites and UI' },
        { tool: 'game', action: 'Import assets and build game' },
      ]
    },
    {
      name: 'Photo to Video',
      description: 'Edit photos, compile into video with soundtrack',
      steps: [
        { tool: 'photo', action: 'Edit and enhance photos' },
        { tool: 'video', action: 'Create slideshow or montage' },
        { tool: 'audio', action: 'Add music and sound effects' },
      ]
    },
    {
      name: 'AI to Everything',
      description: 'Generate content with AI, refine in multiple tools',
      steps: [
        { tool: 'ai', action: 'Generate base content' },
        { tool: 'photo', action: 'Refine and enhance' },
        { tool: 'design', action: 'Add branding and effects' },
        { tool: 'video', action: 'Compile final video' },
      ]
    },
    {
      name: 'Full Production',
      description: 'Complete workflow from concept to finished product',
      steps: [
        { tool: 'design', action: 'Concept art and storyboard' },
        { tool: 'photo', action: 'Create/edit visual assets' },
        { tool: 'audio', action: 'Compose music and sound' },
        { tool: 'game', action: 'Build interactive experience' },
        { tool: 'video', action: 'Create promotional video' },
      ]
    },
  ];

  const createWorkflow = (template) => {
    const newWorkflow = {
      id: `workflow_${Date.now()}`,
      name: template.name,
      description: template.description,
      steps: template.steps,
      progress: 0,
      created: new Date().toISOString(),
    };
    setWorkflows([...workflows, newWorkflow]);
    setCurrentWorkflow(newWorkflow);
    setWorkflowSteps(template.steps);
  };

  const addCustomStep = (toolId) => {
    const tool = toolOptions.find(t => t.id === toolId);
    if (!tool) return;

    const newStep = {
      tool: toolId,
      action: `Use ${tool.name}`,
      completed: false,
    };
    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const markStepComplete = (index) => {
    const updated = [...workflowSteps];
    updated[index].completed = true;
    setWorkflowSteps(updated);

    if (currentWorkflow) {
      const progress = (updated.filter(s => s.completed).length / updated.length) * 100;
      const updatedWorkflow = { ...currentWorkflow, progress };
      setWorkflows(workflows.map(w => w.id === currentWorkflow.id ? updatedWorkflow : w));
      setCurrentWorkflow(updatedWorkflow);
    }
  };

  const openTool = (toolId) => {
    // Navigate to tool tab
    const event = new CustomEvent('ai-navigate', { detail: { tab: toolId } });
    window.dispatchEvent(event);
  };

  const saveWorkflow = () => {
    if (!currentWorkflow) {
      const newWorkflow = {
        id: `workflow_${Date.now()}`,
        name: 'Custom Workflow',
        description: 'Custom workflow',
        steps: workflowSteps,
        progress: 0,
        created: new Date().toISOString(),
      };
      setWorkflows([...workflows, newWorkflow]);
      alert('✅ Workflow saved!');
    } else {
      const updatedWorkflows = workflows.map(w =>
        w.id === currentWorkflow.id ? { ...currentWorkflow, steps: workflowSteps } : w
      );
      setWorkflows(updatedWorkflows);
      alert('✅ Workflow updated!');
    }
  };

  const exportWorkflow = () => {
    if (!currentWorkflow) return;
    const blob = new Blob([JSON.stringify(currentWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflow.name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔗 Workflow Manager</h1>
      <p style={styles.subtitle}>Chain tools together for seamless production workflows</p>

      <div style={styles.content}>
        {/* Templates */}
        <div style={styles.section}>
          <h2>Quick Start Templates</h2>
          <div style={styles.templateGrid}>
            {workflowTemplates.map((template, i) => (
              <div key={i} style={styles.templateCard} onClick={() => createWorkflow(template)}>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div style={styles.stepCount}>{template.steps.length} steps</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Workflow */}
        {currentWorkflow && (
          <div style={styles.section}>
            <h2>{currentWorkflow.name}</h2>
            <p>{currentWorkflow.description}</p>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${currentWorkflow.progress}%`}}>
                {Math.round(currentWorkflow.progress)}%
              </div>
            </div>

            <div style={styles.steps}>
              {workflowSteps.map((step, index) => {
                const tool = toolOptions.find(t => t.id === step.tool);
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.step,
                      background: step.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: step.completed ? '#10b981' : '#667eea',
                    }}
                  >
                    <div style={styles.stepHeader}>
                      <span style={styles.stepNumber}>{index + 1}</span>
                      <span style={styles.stepIcon}>{tool?.icon}</span>
                      <span style={styles.stepTool}>{tool?.name}</span>
                      {step.completed && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <p style={styles.stepAction}>{step.action}</p>
                    <div style={styles.stepButtons}>
                      <button onClick={() => openTool(step.tool)} style={styles.btnOpen}>
                        Open Tool
                      </button>
                      {!step.completed && (
                        <button onClick={() => markStepComplete(index)} style={styles.btnComplete}>
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.actions}>
              <button onClick={saveWorkflow} style={styles.btnSave}>💾 Save Workflow</button>
              <button onClick={exportWorkflow} style={styles.btnExport}>📤 Export JSON</button>
              <button onClick={() => { setCurrentWorkflow(null); setWorkflowSteps([]); }} style={styles.btnNew}>
                ✨ New Workflow
              </button>
            </div>
          </div>
        )}

        {/* Custom Workflow Builder */}
        <div style={styles.section}>
          <h2>Add Custom Step</h2>
          <div style={styles.toolGrid}>
            {toolOptions.map(tool => (
              <button key={tool.id} onClick={() => addCustomStep(tool.id)} style={styles.toolButton}>
                {tool.icon} {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Workflows */}
        {workflows.length > 0 && (
          <div style={styles.section}>
            <h2>Saved Workflows</h2>
            <div style={styles.savedGrid}>
              {workflows.map(wf => (
                <div key={wf.id} style={styles.savedCard} onClick={() => { setCurrentWorkflow(wf); setWorkflowSteps(wf.steps); }}>
                  <h3>{wf.name}</h3>
                  <p>{wf.steps.length} steps</p>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${wf.progress}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    minHeight: '100vh',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#888',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '3rem',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  templateCard: {
    padding: '1.5rem',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '2px solid #667eea',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  stepCount: {
    marginTop: '1rem',
    color: '#667eea',
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: '30px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '15px',
    overflow: 'hidden',
    marginTop: '1rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    transition: 'width 0.3s',
  },
  steps: {
    marginTop: '2rem',
  },
  step: {
    padding: '1.5rem',
    border: '2px solid',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  stepNumber: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
  },
  stepIcon: {
    fontSize: '1.5rem',
  },
  stepTool: {
    fontWeight: '600',
    fontSize: '1.1rem',
  },
  checkmark: {
    marginLeft: 'auto',
    fontSize: '1.5rem',
    color: '#10b981',
  },
  stepAction: {
    marginLeft: '40px',
    color: '#aaa',
  },
  stepButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    marginLeft: '40px',
  },
  btnOpen: {
    padding: '8px 16px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnComplete: {
    padding: '8px 16px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    justifyContent: 'center',
  },
  btnSave: {
    padding: '12px 24px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnExport: {
    padding: '12px 24px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnNew: {
    padding: '12px 24px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
  toolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  toolButton: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
  savedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  savedCard: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default WorkflowManager;
