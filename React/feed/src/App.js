import React, { useState } from 'react';

const App = () => {
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Meeting Notes - Q4 Planning',
      content: '• Review Q3 performance metrics\n• Discuss upcoming product launches\n• Team capacity planning for Q4\n• Budget allocation for new initiatives',
      category: 'Work',
      date: '2024-12-22',
      starred: true
    },
    {
      id: 2,
      title: 'Project Ideas',
      content: 'Building a personal portfolio website:\n- Modern, minimalist design\n- Interactive project showcase\n- Blog section for tech articles\n- Contact form integration',
      category: 'Personal',
      date: '2024-12-21',
      starred: false
    },
    {
      id: 3,
      title: 'Shopping List',
      content: '🥑 Groceries:\n- Avocados\n- Greek yogurt\n- Quinoa\n- Cherry tomatoes\n- Olive oil\n\n🏠 Home supplies:\n- Paper towels\n- Dish soap',
      category: 'Personal',
      date: '2024-12-20',
      starred: false
    },
    {
      id: 4,
      title: 'Book Notes - Atomic Habits',
      content: 'Key takeaways:\n1. Small changes lead to remarkable results\n2. Focus on systems instead of goals\n3. Identity-based habits stick better\n4. Environment design > willpower',
      category: 'Learning',
      date: '2024-12-19',
      starred: true
    },
    {
      id: 5,
      title: 'Workout Routine',
      content: 'Monday - Push Day:\n• Bench Press: 4x8\n• Shoulder Press: 3x10\n• Tricep Extensions: 3x12\n\nWednesday - Pull Day:\n• Rows: 4x8\n• Pull-ups: 3x8\n• Bicep Curls: 3x12',
      category: 'Health',
      date: '2024-12-18',
      starred: false
    }
  ]);

  const patternStyle = {
    backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px), radial-gradient(#e5e7eb 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px'
  };

  const heroPattern = {
    backgroundColor: '#ffffff',
    
  };

  // Helper function to format date
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      fontFamily: 'Poppins, sans-serif',
    },
    sidebar: {
      width: '288px', // Equivalent to Tailwind's w-72 (18rem)
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      ...heroPattern
    },
    sidebarContent: {
      padding: '24px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '32px',
    },
    logoContainer: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(to top right, #2563eb, #3b82f6)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    logoIcon: {
      color: '#ffffff',
      fontSize: '24px',
    },
    title: {
      fontSize: '1.25rem', // Tailwind's text-xl
      fontWeight: 600,
      background: 'linear-gradient(to right, #2563eb, #3b82f6)',
      color: 'transparent',
      WebkitBackgroundClip: 'text',
      margin: 0,
    },
    newNoteButton: {
      width: '100%',
      background: 'linear-gradient(to right, #2563eb, #3b82f6)',
      color: '#ffffff',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
      cursor: 'pointer',
      transition: 'box-shadow 0.3s',
    },
    newNoteButtonIcon: {
      marginRight: '8px',
      transition: 'transform 0.3s',
    },
    buttonHover: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    menuButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px',
      color: '#4b5563',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    menuButtonHover: {
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    menuIcon: {
      marginRight: '12px',
      fontSize: '24px',
    },
    badge: {
      fontSize: '0.875rem',
      color: '#9ca3af',
      backgroundColor: '#f3f4f6',
      padding: '2px 8px',
      borderRadius: '9999px',
    },
    categoriesHeader: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      paddingLeft: '12px',
      marginBottom: '16px',
    },
    categoryButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px',
      color: '#4b5563',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    categoryDot: (category) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '12px',
      backgroundColor:
        category === 'Work' ? '#3b82f6' :
        category === 'Personal' ? '#10b981' :
        category === 'Learning' ? '#8b5cf6' :
        '#f97316',
    }),
    settingsButton: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '12px',
      color: '#4b5563',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      ...patternStyle
    },
    searchBarContainer: {
      padding: '24px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: '0',
      zIndex: '10',
    },
    searchBar: {
      width: '100%',
      padding: '12px 16px',
      paddingLeft: '48px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'box-shadow 0.3s, border-color 0.3s',
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      pointerEvents: 'none',
      fontSize: '24px',
    },
    notesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
    },
    noteCard: {
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'box-shadow 0.3s',
    },
    noteCardHover: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    moreOptionsButton: {
      padding: '8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    moreOptionsButtonHover: {
      backgroundColor: '#e5e7eb',
    },
    noteIcon: {
      marginRight: '8px',
      color: '#2563eb',
      fontSize: '24px',
    },
    noteTitle: {
      fontWeight: 500,
      fontSize: '1rem',
      margin: 0,
    },
    noteCategory: (category) => ({
      fontSize: '0.75rem',
      padding: '4px 12px',
      borderRadius: '9999px',
      backgroundColor:
        category === 'Work' ? '#bfdbfe' :
        category === 'Personal' ? '#d1fae5' :
        category === 'Learning' ? '#e9d5ff' :
        '#fde68a',
      color:
        category === 'Work' ? '#1e40af' :
        category === 'Personal' ? '#047857' :
        category === 'Learning' ? '#7c3aed' :
        '#92400e',
    }),
    noteDate: {
      fontSize: '0.75rem',
      color: '#9ca3af',
    },
    noteContent: {
      fontSize: '0.875rem',
      color: '#4b5563',
      whiteSpace: 'pre-line',
      display: '-webkit-box',
      WebkitLineClamp: 4,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    starIcon: {
      color: '#fbbf24',
      fontSize: '24px',
    }
  };

  // Media Queries for Responsive Grid
  const mediaQueries = `
    @media (min-width: 768px) {
      .notes-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .notes-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarContent}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <span className="material-symbols-rounded" style={styles.logoIcon}>edit_document</span>
            </div>
            <h1 style={styles.title}>Notes</h1>
          </div>

          {/* New Note Button */}
          <button
            style={styles.newNoteButton}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <span className="material-symbols-rounded" style={styles.newNoteButtonIcon}>add</span>
            New Note
          </button>

          {/* Menu Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* All Notes */}
            <button
              style={styles.menuButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.menuButtonHover.backgroundColor;
                e.currentTarget.style.boxShadow = styles.menuButtonHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-rounded" style={styles.menuIcon}>home</span>
                <span>All Notes</span>
              </div>
              <span style={styles.badge}>{notes.length}</span>
            </button>

            {/* Starred */}
            <button
              style={styles.menuButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.menuButtonHover.backgroundColor;
                e.currentTarget.style.boxShadow = styles.menuButtonHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-rounded" style={styles.menuIcon}>star</span>
                <span>Starred</span>
              </div>
              <span style={styles.badge}>{notes.filter(n => n.starred).length}</span>
            </button>

            {/* Recent */}
            <button
              style={styles.menuButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.menuButtonHover.backgroundColor;
                e.currentTarget.style.boxShadow = styles.menuButtonHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-rounded" style={styles.menuIcon}>schedule</span>
                <span>Recent</span>
              </div>
            </button>

            {/* Trash */}
            <button
              style={styles.menuButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.menuButtonHover.backgroundColor;
                e.currentTarget.style.boxShadow = styles.menuButtonHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-rounded" style={styles.menuIcon}>delete</span>
                <span>Trash</span>
              </div>
            </button>
          </div>

          {/* Categories */}
          <div style={{ marginTop: '32px' }}>
            <h2 style={styles.categoriesHeader}>Categories</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Work', 'Personal', 'Learning', 'Health'].map((category) => (
                <button
                  key={category}
                  style={styles.categoryButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = styles.menuButtonHover.backgroundColor;
                    e.currentTarget.style.boxShadow = styles.menuButtonHover.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={styles.categoryDot(category)}></div>
                    <span>{category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={{
          marginTop: 'auto',
          padding: '24px',
          borderTop: '1px solid #f3f4f6',
        }}>
          <button
            style={styles.settingsButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.menuButtonHover.backgroundColor;
              e.currentTarget.style.boxShadow = styles.menuButtonHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span className="material-symbols-rounded" style={{ marginRight: '12px', fontSize: '24px', color: '#4b5563' }}>settings</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Search Bar */}
        <div style={styles.searchBarContainer}>
          <div style={{ maxWidth: '448px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBar}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px #bfdbfe';
                e.target.style.borderColor = '#bfdbfe';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
            <span className="material-symbols-rounded" style={styles.searchIcon}>search</span>
          </div>
        </div>

        {/* Notes Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Responsive Grid */}
          <style>
            {mediaQueries}
          </style>
          <div className="notes-grid" style={styles.notesGrid}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={styles.noteCard}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = styles.noteCardHover.boxShadow}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* More Options Button */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                }} className="more-options">
                  <button
                    style={styles.moreOptionsButton}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.moreOptionsButtonHover.backgroundColor}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.moreOptionsButton.backgroundColor}
                  >
                    <span className="material-symbols-rounded" style={{ color: '#9ca3af', fontSize: '20px' }}>more_vert</span>
                  </button>
                </div>

                {/* Note Header */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="material-symbols-rounded" style={styles.noteIcon}>description</span>
                    <h3 style={styles.noteTitle}>{note.title}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.noteCategory(note.category)}>{note.category}</span>
                    <span style={styles.noteDate}>{formatDate(note.date)}</span>
                  </div>
                </div>

                {/* Note Content */}
                <p style={styles.noteContent}>
                  {note.content}
                </p>

                {/* Star Icon */}
                {note.starred && (
                  <div style={{ position: 'absolute', top: '16px', right: '48px' }}>
                    <span className="material-symbols-rounded" style={styles.starIcon}>star</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
