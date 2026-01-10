# Missing UI Features Implementation Guide

The following features exist in the store (`lib/store.ts`) but are not visible in the UI:

## 1. ⭐ Pin Notes (Notes Manager)

### Store Fields (Already Exist):
```typescript
export interface Note {
  pinned: boolean;  // ✅ Exists in store
}
```

### What to Add to UI:

**In NotesManager component** (`app/page.tsx` around line 1300):

1. **Add pin button to note cards in sidebar:**
```typescript
<div
  key={n.id}
  onClick={() => selectNote(n.id)}
  className={`p-3 rounded-lg cursor-pointer transition ${
    selectedNote === n.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
  }`}
>
  <div className="flex items-center justify-between mb-1">
    <h4 className="font-medium truncate flex-1">{n.name}</h4>
    <button
      onClick={(e) => {
        e.stopPropagation();
        updateNote(n.id, { pinned: !n.pinned });
      }}
      className={`p-1 rounded ${n.pinned ? 'text-yellow-400' : 'text-gray-500'}`}
    >
      <Icons.Pin />
    </button>
  </div>
  <p className="text-sm text-gray-400 truncate">{n.description || 'No description'}</p>
</div>
```

2. **Sort notes to show pinned first:**
```typescript
{data.notes
  .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  .map(n => (
    // ...note card
  ))}
```

---

## 2. ⭐ Favorite Scripts (Scripts Manager)

### Store Fields (Already Exist):
```typescript
export interface Script {
  favorite: boolean;  // ✅ Exists in store
}
```

### What to Add to UI:

**In ScriptsManager component** (`app/page.tsx` around line 1420):

1. **Add favorite button to script cards in sidebar:**
```typescript
<div
  key={s.id}
  onClick={() => selectScript(s.id)}
  className={`p-3 rounded-lg cursor-pointer transition ${
    selectedScript === s.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
  }`}
>
  <div className="flex items-center justify-between mb-1">
    <h4 className="font-medium truncate flex-1">{s.name}</h4>
    <button
      onClick={(e) => {
        e.stopPropagation();
        updateScript(s.id, { favorite: !s.favorite });
      }}
      className={`p-1 rounded ${s.favorite ? 'text-yellow-400' : 'text-gray-500'}`}
    >
      <Icons.Star />
    </button>
  </div>
  <p className="text-sm text-gray-400 truncate">{s.description || 'No description'}</p>
  <span className="text-xs text-gray-500">{s.language}</span>
</div>
```

2. **Sort scripts to show favorites first:**
```typescript
{data.scripts
  .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
  .map(s => (
    // ...script card
  ))}
```

---

## 3. 📁 Note Folders

### Store Fields (Already Exist):
```typescript
export interface Note {
  folder: string;  // ✅ Exists in store
}
```

### Store State (Need to Add):
```typescript
// In lib/store.ts, add to AppState interface:
selectedFolder: string;

// Add action:
setSelectedFolder: (folder: string) => set({ selectedFolder: folder }),
```

### What to Add to UI:

**In NotesManager component** (`app/page.tsx`):

1. **Add folder tabs above notes list:**
```typescript
function NotesManager() {
  const { data, selectedNote, selectNote, createNote, updateNote, deleteNote, selectedFolder, setSelectedFolder } = useStore();
  
  const folders = ['All', 'General', 'Work', 'Personal', 'Ideas', 'Archive'];
  
  const filteredNotes = selectedFolder === 'All' 
    ? data.notes 
    : data.notes.filter(n => n.folder === selectedFolder);

  return (
    <div className="h-full flex">
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Folder tabs */}
        <div className="p-2 border-b border-gray-700 flex flex-wrap gap-1">
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1 text-xs rounded-lg transition ${
                selectedFolder === folder 
                  ? 'bg-indigo-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <button onClick={handleCreate} className="...">
            <Icons.Plus /> New Note
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {filteredNotes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No notes in {selectedFolder}</p>
          ) : (
            filteredNotes
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map(n => (
                // ...note card with pin button
              ))
          )}
        </div>
      </div>
      {/* ...rest of notes manager */}
    </div>
  );
}
```

2. **Add folder selector in note detail:**
```typescript
<select
  value={note.folder}
  onChange={e => updateNote(note.id, { folder: e.target.value })}
  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
>
  <option value="General">General</option>
  <option value="Work">Work</option>
  <option value="Personal">Personal</option>
  <option value="Ideas">Ideas</option>
  <option value="Archive">Archive</option>
</select>
```

---

## 4. ⚙️ App Settings UI

### Store Fields (Already Exist):
```typescript
export interface AppSettings {
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'mono' | 'sans' | 'serif';
  sidebarWidth: 'narrow' | 'normal' | 'wide';
  editorLayout: 'split' | 'stacked';
}
```

### Store State (Need to Add):
```typescript
// In lib/store.ts, add to AppState interface:
settingsOpen: boolean;

// Add actions:
setSettingsOpen: (open: boolean) => set({ settingsOpen: open }),
updateSettings: (settings: Partial<AppSettings>) => {
  set(state => ({
    data: {
      ...state.data,
      settings: {
        ...state.data.settings,
        ...settings,
      },
    },
  }));
  triggerSave();
},
```

### What to Add to UI:

**1. Add Settings Icon in Header** (`app/page.tsx` around line 450):
```typescript
<button
  onClick={() => setSettingsOpen(true)}
  className="p-2 hover:bg-gray-700 rounded-lg transition"
  title="Settings"
>
  <Icons.Settings />
</button>
```

**2. Add Settings Icon Component:**
```typescript
Settings: () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
),
```

**3. Create SettingsModal Component:**
```typescript
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { data, updateSettings } = useStore();
  const settings = data.settings;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition">
            <Icons.Close />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <select
              value={settings.fontSize}
              onChange={e => updateSettings({ fontSize: e.target.value as any })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={e => updateSettings({ fontFamily: e.target.value as any })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="mono">Monospace</option>
              <option value="sans">Sans-serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          {/* Sidebar Width */}
          <div>
            <label className="block text-sm font-medium mb-2">Sidebar Width</label>
            <select
              value={settings.sidebarWidth}
              onChange={e => updateSettings({ sidebarWidth: e.target.value as any })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="narrow">Narrow (240px)</option>
              <option value="normal">Normal (320px)</option>
              <option value="wide">Wide (400px)</option>
            </select>
          </div>

          {/* Editor Layout */}
          <div>
            <label className="block text-sm font-medium mb-2">Editor Layout</label>
            <select
              value={settings.editorLayout}
              onChange={e => updateSettings({ editorLayout: e.target.value as any })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="split">Split (Side by Side)</option>
              <option value="stacked">Stacked (Top and Bottom)</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
```

**4. Apply Settings to UI:**
```typescript
// Add to app/globals.css:
.font-small { font-size: 0.875rem; }
.font-medium { font-size: 1rem; }
.font-large { font-size: 1.125rem; }

.font-mono { font-family: ui-monospace, monospace; }
.font-sans { font-family: ui-sans-serif, sans-serif; }
.font-serif { font-family: ui-serif, Georgia, serif; }

.sidebar-narrow { width: 240px; }
.sidebar-normal { width: 320px; }
.sidebar-wide { width: 400px; }
```

**5. Use Settings in Components:**
```typescript
// In NotesManager and ScriptsManager:
const { data } = useStore();
const settings = data.settings;

return (
  <div className="h-full flex">
    <div className={`bg-gray-800 border-r border-gray-700 flex flex-col ${
      settings.sidebarWidth === 'narrow' ? 'w-60' :
      settings.sidebarWidth === 'wide' ? 'w-96' :
      'w-80'
    }`}>
      {/* sidebar content */}
    </div>
    
    <div className="flex-1 flex flex-col">
      {/* Editor with font settings */}
      <textarea
        className={`flex-1 p-4 bg-transparent focus:outline-none resize-none ${
          settings.fontFamily === 'mono' ? 'font-mono' :
          settings.fontFamily === 'serif' ? 'font-serif' :
          'font-sans'
        } ${
          settings.fontSize === 'small' ? 'text-sm' :
          settings.fontSize === 'large' ? 'text-lg' :
          'text-base'
        }`}
        // ...
      />
    </div>
  </div>
);
```

---

## Summary of Changes Needed

### In `lib/store.ts`:
1. Add `selectedFolder: string` to AppState
2. Add `settingsOpen: boolean` to AppState
3. Add `setSelectedFolder` action
4. Add `setSettingsOpen` action
5. Add `updateSettings` action

### In `app/page.tsx`:
1. Add Settings icon to Icons object
2. Add Settings button to Header component
3. Create SettingsModal component
4. Add folder tabs to NotesManager
5. Add folder selector to note detail
6. Add pin button to note cards
7. Sort notes by pinned status
8. Add favorite button to script cards
9. Sort scripts by favorite status
10. Apply settings to editor components
11. Render SettingsModal when settingsOpen is true

### In `app/globals.css`:
1. Add font size classes
2. Add font family classes
3. Add sidebar width classes

---

## Quick Implementation Checklist

- [ ] Update store with missing state (selectedFolder, settingsOpen)
- [ ] Add Settings icon component
- [ ] Create SettingsModal component
- [ ] Add pin button to notes
- [ ] Add favorite button to scripts
- [ ] Add folder tabs to notes
- [ ] Apply settings to UI components
- [ ] Add CSS for settings classes

All the data structures already exist - we just need to expose them in the UI!
