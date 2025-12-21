import React, { useState } from 'react';
import './HelpCenter.css';

/**
 * Comprehensive Help Center with full documentation
 * Detailed tutorials, command reference, and guides
 */

const HELP_SECTIONS = {
    getting_started: {
        title: '🚀 Getting Started',
        articles: [
            {
                id: 'welcome',
                title: 'Welcome to ForTheWeebs',
                content: `Welcome to your new creative home! ForTheWeebs is a professional creator platform designed for anime culture enthusiasts.

**What You Can Do:**
• Create stunning audio content with our Audio Editor
• Design manga and comics with the Comic Maker
• Craft beautiful graphics with the Graphic Designer
• Edit photos professionally with the Photo Editor
• Build immersive experiences with VR/AR Studio

**Getting Around:**
Press Ctrl+K anytime to open the Command Palette - your instant gateway to every feature!`
            },
            {
                id: 'first_project',
                title: 'Creating Your First Project',
                content: `Let's create something amazing!

**Step 1: Choose Your Tool**
Press Ctrl+K and type "new" to see all project types, or click the ⚡ Quick Actions button (bottom right) and select "New Project".

**Step 2: Start Creating**
Each tool opens with a blank canvas ready for your creativity. Your work auto-saves every 30 seconds!

**Step 3: Save & Export**
Press Ctrl+S to manually save, or Ctrl+E to export in PNG, JPG, or JSON format.

**Pro Tip:** Use the theme toggle (top corner) to switch between dark and light mode for comfortable creating at any time of day!`
            }
        ]
    },

    tools: {
        title: '🎨 Creator Tools',
        articles: [
            {
                id: 'audio_editor',
                title: 'Audio Editor Guide',
                content: `🎵 **Audio Editor** - Professional audio creation and editing

**Features:**
• Multi-track editing
• Effects and filters
• Waveform visualization
• Export to MP3, WAV, OGG

**Getting Started:**
1. Press Ctrl+K → Type "new audio"
2. Import audio files or start recording
3. Add effects and adjust levels
4. Export when ready (Ctrl+E)

**Keyboard Shortcuts:**
• Space - Play/Pause
• Ctrl+Z - Undo
• Ctrl+Y - Redo
• Ctrl+S - Save

**Pro Tips:**
• Use headphones for accurate mixing
• Save multiple versions as you work
• Export in WAV for highest quality`
            },
            {
                id: 'comic_maker',
                title: 'Comic Maker Guide',
                content: `📚 **Comic Maker** - Create manga and comics like a pro

**Features:**
• Panel layouts and templates
• Speech bubbles and effects
• Character libraries
• Professional typography

**Getting Started:**
1. Press Ctrl+K → Type "new comic"
2. Choose your panel layout
3. Add artwork and text
4. Customize speech bubbles
5. Export as PDF or image series

**Panel Layouts:**
• 1-panel: Impact scenes
• 2-panel: Comparisons
• 3-panel: Quick sequences
• 4-panel: Standard manga style
• Custom: Create your own

**Pro Tips:**
• Start with thumbnails to plan your story
• Keep text concise and readable
• Use varied panel sizes for dramatic effect
• Reference professional manga for inspiration`
            },
            {
                id: 'graphic_designer',
                title: 'Graphic Designer Guide',
                content: `🎨 **Graphic Designer** - Professional design tools

**Features:**
• Vector and raster editing
• Layers and masks
• Color palettes
• Typography tools
• Export to multiple formats

**Getting Started:**
1. Press Ctrl+K → Type "new graphic"
2. Choose canvas size or template
3. Add shapes, text, and images
4. Apply effects and filters
5. Export (Ctrl+E)

**Common Projects:**
• Social media posts (1080x1080, 1920x1080)
• YouTube thumbnails (1280x720)
• Banners (various sizes)
• Logos and branding
• Posters and flyers

**Pro Tips:**
• Use layers to organize elements
• Save color palettes for consistency
• Export in PNG for transparency
• Keep backups of your source files`
            },
            {
                id: 'photo_editor',
                title: 'Photo Editor Guide',
                content: `📷 **Photo Editor** - Professional photo editing

**Features:**
• Filters and adjustments
• Cropping and resizing
• Color correction
• Retouching tools
• Batch processing

**Getting Started:**
1. Press Ctrl+K → Type "new photo"
2. Upload your photo
3. Apply adjustments
4. Add filters and effects
5. Export (Ctrl+E)

**Common Adjustments:**
• Brightness/Contrast
• Saturation/Hue
• Sharpness
• Exposure
• White balance

**Filters:**
• Anime style
• Vintage
• Black & white
• Cyberpunk
• Custom presets

**Pro Tips:**
• Edit in RAW format when possible
• Use non-destructive editing
• Adjust brightness before color
• Save edited versions separately`
            },
            {
                id: 'vr_ar_studio',
                title: 'VR/AR Studio Guide',
                content: `🥽 **VR/AR Studio** - Immersive experience creation

**Features:**
• 3D model import
• Scene building
• Interactive elements
• VR headset preview
• Export for web or apps

**Getting Started:**
1. Press Ctrl+K → Type "new vr"
2. Import 3D models or use library
3. Arrange scene elements
4. Add interactivity
5. Test in VR preview
6. Export for deployment

**Supported Formats:**
• GLB/GLTF (recommended)
• FBX
• OBJ
• WebXR compatible

**Scene Tips:**
• Optimize models for performance
• Use lighting strategically
• Test on target devices
• Keep file sizes reasonable

**Pro Tips:**
• Start simple and add complexity
• Consider user comfort (motion sickness)
• Test with real users
• Provide fallback for non-VR users`
            }
        ]
    },

    features: {
        title: '⚡ Features & Tips',
        articles: [
            {
                id: 'command_palette',
                title: 'Command Palette (Ctrl+K)',
                content: `⚡ **Command Palette** - Your productivity superpower

**What It Does:**
Instant access to EVERY feature in ForTheWeebs. No more hunting through menus!

**How to Use:**
1. Press Ctrl+K (Cmd+K on Mac)
2. Type what you want to do
3. Use arrow keys to navigate
4. Press Enter to execute

**Example Commands:**
• "new audio" - Create audio project
• "export" - Export current project
• "dark" - Toggle theme
• "shortcuts" - View all shortcuts
• "settings" - Open settings
• "tutorial" - Restart tutorial

**Pro Tips:**
• You don't need to type the full command
• Use arrow keys for quick navigation
• Commands are organized by category
• Press Escape to close

**Categories:**
• Create - New projects
• Navigate - Go to pages
• Action - Do things
• View - Change display
• Help - Get assistance`
            },
            {
                id: 'keyboard_shortcuts',
                title: 'Keyboard Shortcuts',
                content: `⌨️ **Keyboard Shortcuts** - Work at the speed of thought

**Essential Shortcuts:**
• Ctrl+K - Command Palette (most important!)
• Ctrl+S - Save project
• Ctrl+E - Export project
• Ctrl+Z - Undo
• Ctrl+Y - Redo
• Shift+? - Show all shortcuts

**Navigation:**
• Ctrl+1 through Ctrl+5 - Switch tools
• Ctrl+Home - Go to dashboard
• Escape - Close dialogs

**Editing:**
• Ctrl+C - Copy
• Ctrl+V - Paste
• Ctrl+X - Cut
• Ctrl+A - Select all
• Delete - Remove selected

**View:**
• Ctrl+0 - Reset zoom
• Ctrl++ - Zoom in
• Ctrl+- - Zoom out
• F11 - Fullscreen

**Pro Tips:**
• Learn one shortcut per day
• Ctrl+K is your gateway to everything
• Customize shortcuts in settings
• Print a cheat sheet for your desk`
            },
            {
                id: 'auto_save',
                title: 'Auto-Save & Backups',
                content: `💾 **Auto-Save** - Never lose your work

**How It Works:**
Your projects automatically save every 30 seconds. No manual saving needed!

**Save Indicators:**
• ✓ Green checkmark = Saved
• 🔄 Spinning = Saving...
• ⚠️ Warning = Save failed

**Manual Save:**
Press Ctrl+S anytime to force a save immediately.

**Version History:**
Access previous versions from:
1. Command Palette (Ctrl+K)
2. Type "history"
3. Select version to restore

**Best Practices:**
• Name your projects descriptively
• Create manual saves before big changes
• Export important versions locally
• Keep your internet connection stable

**Recovery:**
If something goes wrong:
1. Check auto-save history
2. Look in project list for duplicates
3. Contact support if needed`
            },
            {
                id: 'achievements',
                title: 'Achievement System',
                content: `🏆 **Achievements** - Track your progress and unlock rewards

**How It Works:**
Complete tasks and unlock achievements! Each achievement awards points.

**Achievement Tiers:**
• Common (Gray) - 10-25 points
• Uncommon (Green) - 25-50 points
• Rare (Blue) - 50-100 points
• Epic (Purple) - 100-200 points
• Legendary (Gold) - 200+ points

**Available Achievements:**

**Common:**
• First Steps - Create your first project
• Getting Started - Create 5 projects
• Sharing is Caring - Export your first creation

**Uncommon:**
• Speed Demon - Use 5 keyboard shortcuts
• Night Owl - Create at 3 AM

**Rare:**
• Power User - Use all 5 creator tools

**Epic:**
• VIP Supporter - Subscribe to VIP tier

**Legendary:**
• Master Creator - Create 100 projects

**Tips:**
• Check achievements panel regularly
• Achievements unlock automatically
• Some are secret - discover them!
• Share your achievements on social media`
            },
            {
                id: 'collaboration',
                title: 'Sharing & Collaboration',
                content: `🔗 **Sharing Your Work** - Get your creations out there

**Export Options:**
• PNG - Images with transparency
• JPG - Compressed images
• JSON - Project data
• PDF - Documents (coming soon)

**Share Methods:**
1. **Export & Upload**
   • Export your work
   • Upload to your platform
   • Share the link

2. **Direct Share**
   • Click Share button
   • Choose platform
   • Post instantly

3. **Social Media**
   • Twitter
   • Facebook
   • Reddit
   • Instagram (via mobile)

**Public Projects:**
Make projects public to:
• Showcase your portfolio
• Get community feedback
• Inspire other creators
• Build your following

**Collaboration (Coming Soon):**
• Real-time co-editing
• Comments and feedback
• Version control
• Team workspaces`
            }
        ]
    },

    command_reference: {
        title: '📖 Command Reference',
        articles: [
            {
                id: 'all_commands',
                title: 'Complete Command List',
                content: `📋 **All Available Commands** (Use with Ctrl+K)

**CREATE COMMANDS:**
• "new audio" - New Audio Project
• "new comic" - New Comic Project
• "new graphic" - New Graphic Project
• "new photo" - New Photo Project
• "new vr" - New VR/AR Project

**NAVIGATE COMMANDS:**
• "dashboard" - Go to Dashboard
• "projects" - View All Projects
• "settings" - Open Settings
• "profile" - Your Profile

**ACTION COMMANDS:**
• "save" - Save Current Project (Ctrl+S)
• "export" - Export Project (Ctrl+E)
• "share" - Share Project
• "duplicate" - Duplicate Project
• "delete" - Delete Project
• "rename" - Rename Project

**VIEW COMMANDS:**
• "dark" / "light" / "theme" - Toggle Theme
• "fullscreen" - Toggle Fullscreen
• "sidebar" - Toggle Sidebar
• "zoom in" - Increase Zoom
• "zoom out" - Decrease Zoom
• "reset zoom" - Reset to 100%

**HELP COMMANDS:**
• "help" - Open Help Center
• "tutorial" - Restart Tutorial
• "shortcuts" - Show Keyboard Shortcuts
• "commands" - View This List
• "feedback" - Send Feedback
• "support" - Contact Support

**QUICK ACCESS:**
Type any tool name, feature, or action to find it instantly!

**Tips:**
• Commands are case-insensitive
• Partial matches work ("exp" finds "export")
• Use arrow keys to navigate results
• Press Enter to execute
• Press Escape to cancel`
            }
        ]
    },

    troubleshooting: {
        title: '🔧 Troubleshooting',
        articles: [
            {
                id: 'common_issues',
                title: 'Common Issues & Solutions',
                content: `🔧 **Troubleshooting Guide**

**Project Won't Save:**
✓ Check internet connection
✓ Clear browser cache
✓ Try incognito mode
✓ Check storage quota

**Command Palette Not Opening:**
✓ Try Cmd+K if on Mac
✓ Check for browser extension conflicts
✓ Reload the page (F5)
✓ Verify keyboard is working

**Export Failed:**
✓ Check file size limits
✓ Try different format
✓ Reduce project complexity
✓ Use Chrome/Firefox

**Slow Performance:**
✓ Close other tabs
✓ Reduce project complexity
✓ Clear browser cache
✓ Update your browser
✓ Check RAM usage

**Can't Upload Files:**
✓ Check file size (max 50MB)
✓ Verify file format support
✓ Check internet speed
✓ Try different file

**Theme Not Changing:**
✓ Clear browser cache
✓ Check localStorage
✓ Try incognito mode

**Still Need Help?**
• Press Ctrl+K → Type "support"
• Email: support@fortheweebs.com
• Discord: Join our community
• Twitter: @ForTheWeebs`
            }
        ]
    }
};

const HelpCenter = ({ initialSection = 'getting_started' }) => {
    const [activeSection, setActiveSection] = useState(initialSection);
    const [activeArticle, setActiveArticle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const currentSection = HELP_SECTIONS[activeSection];
    const currentArticle = activeArticle
        ? currentSection.articles.find(a => a.id === activeArticle)
        : null;

    const filteredArticles = searchQuery
        ? Object.values(HELP_SECTIONS)
            .flatMap(section => section.articles)
            .filter(article =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
        : currentSection.articles;

    return (
        <div className="help-center">
            <div className="help-sidebar">
                <div className="help-logo">
                    <h1>📚 Help Center</h1>
                </div>

                <div className="help-search">
                    <input
                        type="text"
                        placeholder="Search help articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <nav className="help-nav">
                    {Object.entries(HELP_SECTIONS).map(([key, section]) => (
                        <button
                            key={key}
                            className={`help-nav-item ${activeSection === key ? 'active' : ''}`}
                            onClick={() => {
                                setActiveSection(key);
                                setActiveArticle(null);
                                setSearchQuery('');
                            }}
                        >
                            {section.title}
                        </button>
                    ))}
                </nav>

                <div className="help-quick-actions">
                    <button onClick={() => window.startTutorial?.()}>
                        🎓 Restart Tutorial
                    </button>
                    <button onClick={() => alert('Feedback form coming soon!')}>
                        💬 Send Feedback
                    </button>
                </div>
            </div>

            <div className="help-content">
                {currentArticle ? (
                    <div className="help-article">
                        <button
                            className="back-button"
                            onClick={() => setActiveArticle(null)}
                        >
                            ← Back to {currentSection.title}
                        </button>

                        <h1>{currentArticle.title}</h1>
                        <div className="article-content">
                            {currentArticle.content.split('\n\n').map((paragraph, idx) => {
                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                    return <h3 key={idx}>{paragraph.replace(/\*\*/g, '')}</h3>;
                                }
                                if (paragraph.startsWith('•')) {
                                    const items = paragraph.split('\n');
                                    return (
                                        <ul key={idx}>
                                            {items.map((item, i) => (
                                                <li key={i}>{item.replace('• ', '')}</li>
                                            ))}
                                        </ul>
                                    );
                                }
                                return <p key={idx}>{paragraph}</p>;
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="help-articles">
                        <h2>{searchQuery ? 'Search Results' : currentSection.title}</h2>
                        <div className="articles-grid">
                            {filteredArticles.map(article => (
                                <div
                                    key={article.id}
                                    className="article-card"
                                    onClick={() => setActiveArticle(article.id)}
                                >
                                    <h3>{article.title}</h3>
                                    <p>{article.content.substring(0, 150)}...</p>
                                    <span className="read-more">Read more →</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpCenter;
export { HELP_SECTIONS };
