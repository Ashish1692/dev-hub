import { create } from 'zustand';
import { github, debounce } from './github';

// Types
export interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
}

export interface Task {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | null;
  dueDate: string | null;
  labels: string[];
  assignees: string[];
  archived: boolean;
  timeTracking: TimeEntry[];
  totalTimeSpent: number; // in seconds
  comments: Comment[];
  versions: Version[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  timestamp: string;
}

export interface Version {
  id: string;
  timestamp: string;
  action: string;
  content: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Note {
  id: string;
  name: string;
  description: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  versions: Version[];
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  favorite: boolean;
  versions: ScriptVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ScriptVersion {
  id: string;
  timestamp: string;
  action: string;
  code: string;
}

export interface AppSettings {
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'mono' | 'sans' | 'serif';
  sidebarWidth: 'narrow' | 'normal' | 'wide';
  editorLayout: 'split' | 'stacked';
}

export interface WorkspaceData {
  kanban: {
    columns: Column[];
    archivedTasks: Task[];
  };
  notes: Note[];
  scripts: Script[];
  settings: AppSettings;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;

  // Repo selection
  repo: string;
  availableRepos: any[];
  repoSelected: boolean;

  // Workspaces
  workspaces: string[];
  currentWorkspace: string;

  // Data
  data: WorkspaceData;

  // UI State
  currentTab: 'kanban' | 'notes' | 'scripts';
  selectedNote: string | null;
  selectedScript: string | null;
  showArchived: boolean;
  searchQuery: string;
  globalSearchOpen: boolean;
  settingsOpen: boolean;
  calendarView: boolean;
  selectedFolder: string;

  // Sync State
  isSyncing: boolean;
  syncStatus: string;
  lastSynced: Date | null;
  hasUnsavedChanges: boolean;

  // Actions
  setSession: (user: any, accessToken: string) => void;
  clearSession: () => void;

  setRepo: (repo: string) => Promise<void>;
  loadAvailableRepos: () => Promise<void>;
  createNewRepo: (name: string) => Promise<void>;

  loadWorkspaces: () => Promise<void>;
  loadWorkspace: (name: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  deleteWorkspace: (name: string) => Promise<void>;
  switchWorkspace: (name: string) => Promise<void>;

  setCurrentTab: (tab: 'kanban' | 'notes' | 'scripts') => void;

  // Kanban Actions
  addColumn: (title: string) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (startIndex: number, endIndex: number) => void;
  addTask: (columnId: string, title: string) => void;
  updateTask: (columnId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (columnId: string, taskId: string) => void;
  archiveTask: (columnId: string, taskId: string) => void;
  restoreTask: (taskId: string, columnId: string) => void;
  moveTask: (fromColumnId: string, toColumnId: string, taskId: string) => void;
  addComment: (columnId: string, taskId: string, text: string) => void;
  deleteComment: (columnId: string, taskId: string, commentId: string) => void;
  setShowArchived: (show: boolean) => void;
  setCalendarView: (show: boolean) => void;
  startTimeTracking: (columnId: string, taskId: string) => void;
  stopTimeTracking: (columnId: string, taskId: string) => void;

  // Notes Actions
  createNote: (name: string) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  selectNote: (noteId: string | null) => void;
  setSelectedFolder: (folder: string) => void;

  // Scripts Actions
  createScript: (name: string) => void;
  updateScript: (scriptId: string, updates: Partial<Script>) => void;
  deleteScript: (scriptId: string) => void;
  selectScript: (scriptId: string | null) => void;

  // Sync
  syncNow: () => Promise<void>;
  saveToGitHub: () => Promise<void>;
  exportWorkspace: () => string;
  importWorkspace: (jsonData: string) => Promise<void>;

  // Search & Settings
  setSearchQuery: (query: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const getDefaultData = (): WorkspaceData => ({
  kanban: {
    columns: [
      { id: 'todo', title: 'To Do', tasks: [] },
      { id: 'inprogress', title: 'In Progress', tasks: [] },
      { id: 'review', title: 'Review', tasks: [] },
      { id: 'done', title: 'Done', tasks: [] },
    ],
    archivedTasks: [],
  },
  notes: [],
  scripts: [],
  settings: {
    fontSize: 'medium',
    fontFamily: 'mono',
    sidebarWidth: 'normal',
    editorLayout: 'split',
  },
});

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create<AppState>((set, get) => {
  // Debounced save function
  const debouncedSave = debounce(async () => {
    const state = get();
    if (!state.isAuthenticated || !state.repoSelected) return;

    try {
      set({ isSyncing: true, syncStatus: 'Saving...' });
      await github.saveFile(state.currentWorkspace, state.data);
      set({
        isSyncing: false,
        syncStatus: 'Saved',
        lastSynced: new Date(),
        hasUnsavedChanges: false
      });

      setTimeout(() => {
        set({ syncStatus: '' });
      }, 2000);
    } catch (error: any) {
      console.error('Save failed:', error);
      set({
        isSyncing: false,
        syncStatus: `Error: ${error.message}`,
        hasUnsavedChanges: true
      });
    }
  }, 1500);

  const triggerSave = () => {
    set({ hasUnsavedChanges: true, syncStatus: 'Unsaved changes...' });
    debouncedSave();
  };

  return {
    // Initial State
    isAuthenticated: false,
    user: null,
    accessToken: null,
    repo: '',
    availableRepos: [],
    repoSelected: false,
    workspaces: ['default'],
    currentWorkspace: 'default',
    data: getDefaultData(),
    currentTab: 'kanban',
    selectedNote: null,
    selectedScript: null,
    showArchived: false,
    searchQuery: '',
    globalSearchOpen: false,
    settingsOpen: false,
    calendarView: false,
    selectedFolder: 'All',
    isSyncing: false,
    syncStatus: '',
    lastSynced: null,
    hasUnsavedChanges: false,

    // Session Actions
    setSession: (user: any, accessToken: string) => {
      github.setToken(accessToken);
      set({
        isAuthenticated: true,
        user,
        accessToken,
      });

      // Load saved repo from localStorage
      const savedRepo = localStorage.getItem('devhub-repo');
      if (savedRepo) {
        get().setRepo(savedRepo);
      }
    },

    clearSession: () => {
      localStorage.removeItem('devhub-repo');
      github.clearCache();
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        repo: '',
        availableRepos: [],
        repoSelected: false,
        workspaces: ['default'],
        currentWorkspace: 'default',
        data: getDefaultData(),
        selectedNote: null,
        selectedScript: null,
      });
    },

    // Repo Actions
    loadAvailableRepos: async () => {
      try {
        const repos = await github.listUserRepos();
        set({ availableRepos: repos });
      } catch (error) {
        console.error('Failed to load repos:', error);
      }
    },

    setRepo: async (repo: string) => {
      github.setRepo(repo);
      localStorage.setItem('devhub-repo', repo);
      set({ repo, repoSelected: true });
      await get().loadWorkspaces();
    },

    createNewRepo: async (name: string) => {
      try {
        set({ isSyncing: true, syncStatus: 'Creating repository...' });
        const user = get().user;
        await github.createRepo(name, true);
        const fullName = `${user.login}/${name}`;

        // Wait a moment for GitHub to initialize the repo
        await new Promise(resolve => setTimeout(resolve, 1500));

        await get().setRepo(fullName);
        set({ isSyncing: false, syncStatus: 'Repository created' });
      } catch (error: any) {
        set({ isSyncing: false, syncStatus: `Error: ${error.message}` });
        throw error;
      }
    },

    // Workspace Actions
    loadWorkspaces: async () => {
      set({ isSyncing: true, syncStatus: 'Loading...' });

      try {
        const files = await github.listFiles();
        const workspaces = files.length > 0 ? files : ['default'];
        set({ workspaces });
        await get().loadWorkspace(workspaces[0]);
      } catch (error: any) {
        console.error('Failed to load workspaces:', error);
        set({
          workspaces: ['default'],
          isSyncing: false,
          syncStatus: `Error: ${error.message}`
        });
      }
    },

    loadWorkspace: async (name: string) => {
      set({ isSyncing: true, syncStatus: 'Loading workspace...' });

      try {
        const result = await github.loadFile(name);

        if (result) {
          // Migrate old data - ensure archivedTasks exists
          const migratedData = {
            ...result.data,
            kanban: {
              ...result.data.kanban,
              archivedTasks: result.data.kanban.archivedTasks || [],
            },
          };

          set({
            currentWorkspace: name,
            data: migratedData,
            isSyncing: false,
            syncStatus: 'Loaded',
            lastSynced: new Date(),
            hasUnsavedChanges: false,
            selectedNote: null,
            selectedScript: null,
          });
        } else {
          // File doesn't exist, create with default data
          const defaultData = getDefaultData();
          await github.saveFile(name, defaultData);
          set({
            currentWorkspace: name,
            data: defaultData,
            isSyncing: false,
            syncStatus: 'Created',
            lastSynced: new Date(),
            hasUnsavedChanges: false,
            selectedNote: null,
            selectedScript: null,
          });
        }

        setTimeout(() => set({ syncStatus: '' }), 2000);
      } catch (error: any) {
        set({
          isSyncing: false,
          syncStatus: `Error: ${error.message}`
        });
      }
    },

    createWorkspace: async (name: string) => {
      const { workspaces } = get();
      if (workspaces.includes(name)) {
        throw new Error('Workspace already exists');
      }

      set({ isSyncing: true, syncStatus: `Creating workspace "${name}"...` });

      try {
        const defaultData = getDefaultData();
        await github.saveFile(name, defaultData);

        set({
          workspaces: [...workspaces, name],
          currentWorkspace: name,
          data: defaultData,
          selectedNote: null,
          selectedScript: null,
          isSyncing: false,
          syncStatus: `Workspace "${name}" created`,
          lastSynced: new Date(),
          hasUnsavedChanges: false,
        });

        setTimeout(() => set({ syncStatus: '' }), 2000);
      } catch (error: any) {
        set({
          isSyncing: false,
          syncStatus: `Error creating workspace: ${error.message}`
        });
        throw error;
      }
    },

    deleteWorkspace: async (name: string) => {
      if (name === 'default') {
        throw new Error('Cannot delete default workspace');
      }

      await github.deleteFile(name);

      const { workspaces, currentWorkspace } = get();
      const newWorkspaces = workspaces.filter(w => w !== name);
      set({ workspaces: newWorkspaces });

      if (currentWorkspace === name) {
        await get().loadWorkspace('default');
      }
    },

    switchWorkspace: async (name: string) => {
      const { hasUnsavedChanges, currentWorkspace } = get();

      if (hasUnsavedChanges) {
        await get().saveToGitHub();
      }

      if (name !== currentWorkspace) {
        await get().loadWorkspace(name);
      }
    },

    setCurrentTab: (tab) => set({ currentTab: tab }),

    // Kanban Actions
    addColumn: (title: string) => {
      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            columns: [
              ...state.data.kanban.columns,
              { id: generateId(), title, tasks: [] },
            ],
          },
        },
      }));
      triggerSave();
    },

    renameColumn: (columnId: string, title: string) => {
      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId ? { ...col, title } : col
            ),
          },
        },
      }));
      triggerSave();
    },

    deleteColumn: (columnId: string) => {
      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            columns: state.data.kanban.columns.filter(c => c.id !== columnId),
          },
        },
      }));
      triggerSave();
    },

    reorderColumns: (startIndex: number, endIndex: number) => {
      set(state => {
        const columns = [...state.data.kanban.columns];
        const [removed] = columns.splice(startIndex, 1);
        columns.splice(endIndex, 0, removed);
        return {
          data: {
            ...state.data,
            kanban: {
              ...state.data.kanban,
              columns,
            },
          },
        };
      });
      triggerSave();
    },

    addTask: (columnId: string, title: string) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: generateId(),
        title,
        content: '',
        priority: null,
        dueDate: null,
        labels: [],
        assignees: [],
        archived: false,
        timeTracking: [],
        totalTimeSpent: 0,
        comments: [],
        versions: [{
          id: generateId(),
          timestamp: now,
          action: 'Created',
          content: '',
        }],
        createdAt: now,
        updatedAt: now,
      };

      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? { ...col, tasks: [...col.tasks, task] }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    updateTask: (columnId: string, taskId: string, updates: Partial<Task>) => {
      const now = new Date().toISOString();

      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            archivedTasks: state.data.kanban.archivedTasks || [],
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? {
                  ...col,
                  tasks: col.tasks.map(task => {
                    if (task.id !== taskId) return task;

                    const newVersions = updates.content !== undefined && updates.content !== task.content
                      ? [...task.versions, {
                        id: generateId(),
                        timestamp: now,
                        action: 'Content updated',
                        content: task.content,
                      }]
                      : task.versions;

                    return {
                      ...task,
                      ...updates,
                      versions: newVersions,
                      updatedAt: now,
                    };
                  }),
                }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    deleteTask: (columnId: string, taskId: string) => {
      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    archiveTask: (columnId: string, taskId: string) => {
      set(state => {
        const column = state.data.kanban.columns.find(c => c.id === columnId);
        const task = column?.tasks.find(t => t.id === taskId);
        if (!task) return state;

        return {
          data: {
            ...state.data,
            kanban: {
              ...state.data.kanban,
              columns: state.data.kanban.columns.map(col =>
                col.id === columnId
                  ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                  : col
              ),
              archivedTasks: [...(state.data.kanban.archivedTasks || []), { ...task, archived: true }],
            },
          },
        };
      });
      triggerSave();
    },

    restoreTask: (taskId: string, columnId: string) => {
      set(state => {
        const archivedTasks = state.data.kanban.archivedTasks || [];
        const task = archivedTasks.find(t => t.id === taskId);
        if (!task) return state;

        return {
          data: {
            ...state.data,
            kanban: {
              ...state.data.kanban,
              columns: state.data.kanban.columns.map(col =>
                col.id === columnId
                  ? { ...col, tasks: [...col.tasks, { ...task, archived: false }] }
                  : col
              ),
              archivedTasks: archivedTasks.filter(t => t.id !== taskId),
            },
          },
        };
      });
      triggerSave();
    },

    setShowArchived: (show) => set({ showArchived: show }),
    setCalendarView: (show) => set({ calendarView: show }),

    startTimeTracking: (columnId: string, taskId: string) => {
      const now = new Date().toISOString();
      const entry: TimeEntry = {
        id: generateId(),
        startTime: now,
        endTime: null,
        duration: 0,
      };

      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            archivedTasks: state.data.kanban.archivedTasks || [],
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? {
                  ...col,
                  tasks: col.tasks.map(task =>
                    task.id === taskId
                      ? { ...task, timeTracking: [...task.timeTracking, entry] }
                      : task
                  ),
                }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    stopTimeTracking: (columnId: string, taskId: string) => {
      const now = new Date().toISOString();

      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            archivedTasks: state.data.kanban.archivedTasks || [],
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? {
                  ...col,
                  tasks: col.tasks.map(task => {
                    if (task.id !== taskId) return task;

                    const lastEntry = task.timeTracking[task.timeTracking.length - 1];
                    if (!lastEntry || lastEntry.endTime) return task;

                    const duration = Math.floor(
                      (new Date(now).getTime() - new Date(lastEntry.startTime).getTime()) / 1000
                    );

                    const updatedTracking = task.timeTracking.map((entry, idx) =>
                      idx === task.timeTracking.length - 1
                        ? { ...entry, endTime: now, duration }
                        : entry
                    );

                    const totalTimeSpent = updatedTracking.reduce(
                      (sum, entry) => sum + entry.duration,
                      0
                    );

                    return {
                      ...task,
                      timeTracking: updatedTracking,
                      totalTimeSpent,
                    };
                  }),
                }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    moveTask: (fromColumnId: string, toColumnId: string, taskId: string) => {
      if (fromColumnId === toColumnId) return;

      const now = new Date().toISOString();

      set(state => {
        const fromColumn = state.data.kanban.columns.find(c => c.id === fromColumnId);
        const toColumn = state.data.kanban.columns.find(c => c.id === toColumnId);

        if (!fromColumn || !toColumn) return state;

        const task = fromColumn.tasks.find(t => t.id === taskId);
        if (!task) return state;

        const updatedTask = {
          ...task,
          versions: [...task.versions, {
            id: generateId(),
            timestamp: now,
            action: `Moved from "${fromColumn.title}" to "${toColumn.title}"`,
            content: task.content,
          }],
          updatedAt: now,
        };

        return {
          data: {
            ...state.data,
            kanban: {
              ...state.data.kanban,
              archivedTasks: state.data.kanban.archivedTasks || [],
              columns: state.data.kanban.columns.map(col => {
                if (col.id === fromColumnId) {
                  return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
                }
                if (col.id === toColumnId) {
                  return { ...col, tasks: [...col.tasks, updatedTask] };
                }
                return col;
              }),
            },
          },
        };
      });
      triggerSave();
    },

    addComment: (columnId: string, taskId: string, text: string) => {
      const comment: Comment = {
        id: generateId(),
        text,
        timestamp: new Date().toISOString(),
      };

      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            archivedTasks: state.data.kanban.archivedTasks || [],
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? {
                  ...col,
                  tasks: col.tasks.map(task =>
                    task.id === taskId
                      ? { ...task, comments: [...task.comments, comment] }
                      : task
                  ),
                }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    deleteComment: (columnId: string, taskId: string, commentId: string) => {
      set(state => ({
        data: {
          ...state.data,
          kanban: {
            ...state.data.kanban,
            archivedTasks: state.data.kanban.archivedTasks || [],
            columns: state.data.kanban.columns.map(col =>
              col.id === columnId
                ? {
                  ...col,
                  tasks: col.tasks.map(task =>
                    task.id === taskId
                      ? { ...task, comments: task.comments.filter(c => c.id !== commentId) }
                      : task
                  ),
                }
                : col
            ),
          },
        },
      }));
      triggerSave();
    },

    // Notes Actions
    createNote: (name: string) => {
      const now = new Date().toISOString();
      const note: Note = {
        id: generateId(),
        name,
        description: '',
        content: '',
        folder: 'General',
        tags: [],
        pinned: false,
        versions: [{
          id: generateId(),
          timestamp: now,
          action: 'Created',
          content: '',
        }],
        createdAt: now,
        updatedAt: now,
      };

      set(state => ({
        data: {
          ...state.data,
          notes: [...state.data.notes, note],
        },
        selectedNote: note.id,
      }));
      triggerSave();
    },

    updateNote: (noteId: string, updates: Partial<Note>) => {
      const now = new Date().toISOString();

      set(state => ({
        data: {
          ...state.data,
          notes: state.data.notes.map(note => {
            if (note.id !== noteId) return note;

            const newVersions = updates.content !== undefined && updates.content !== note.content
              ? [...note.versions, {
                id: generateId(),
                timestamp: now,
                action: 'Content updated',
                content: note.content,
              }]
              : note.versions;

            return {
              ...note,
              ...updates,
              versions: newVersions,
              updatedAt: now,
            };
          }),
        },
      }));
      triggerSave();
    },

    deleteNote: (noteId: string) => {
      set(state => ({
        data: {
          ...state.data,
          notes: state.data.notes.filter(n => n.id !== noteId),
        },
        selectedNote: state.selectedNote === noteId ? null : state.selectedNote,
      }));
      triggerSave();
    },

    selectNote: (noteId) => set({ selectedNote: noteId }),
    setSelectedFolder: (folder) => set({ selectedFolder: folder }),

    // Scripts Actions
    createScript: (name: string) => {
      const now = new Date().toISOString();
      const script: Script = {
        id: generateId(),
        name,
        favorite: false,
        description: '',
        code: '',
        language: 'javascript',
        versions: [{
          id: generateId(),
          timestamp: now,
          action: 'Created',
          code: '',
        }],
        createdAt: now,
        updatedAt: now,
      };

      set(state => ({
        data: {
          ...state.data,
          scripts: [...state.data.scripts, script],
        },
        selectedScript: script.id,
      }));
      triggerSave();
    },

    updateScript: (scriptId: string, updates: Partial<Script>) => {
      const now = new Date().toISOString();

      set(state => ({
        data: {
          ...state.data,
          scripts: state.data.scripts.map(script => {
            if (script.id !== scriptId) return script;

            const newVersions = updates.code !== undefined && updates.code !== script.code
              ? [...script.versions, {
                id: generateId(),
                timestamp: now,
                action: 'Code updated',
                code: script.code,
              }]
              : script.versions;

            return {
              ...script,
              ...updates,
              versions: newVersions,
              updatedAt: now,
            };
          }),
        },
      }));
      triggerSave();
    },

    deleteScript: (scriptId: string) => {
      set(state => ({
        data: {
          ...state.data,
          scripts: state.data.scripts.filter(s => s.id !== scriptId),
        },
        selectedScript: state.selectedScript === scriptId ? null : state.selectedScript,
      }));
      triggerSave();
    },

    selectScript: (scriptId) => set({ selectedScript: scriptId }),

    // Sync Actions
    syncNow: async () => {
      await get().loadWorkspace(get().currentWorkspace);
    },

    saveToGitHub: async () => {
      const state = get();
      if (!state.isAuthenticated || !state.repoSelected) return;

      set({ isSyncing: true, syncStatus: 'Saving...' });

      try {
        await github.saveFile(state.currentWorkspace, state.data);
        set({
          isSyncing: false,
          syncStatus: 'Saved',
          lastSynced: new Date(),
          hasUnsavedChanges: false,
        });
        setTimeout(() => set({ syncStatus: '' }), 2000);
      } catch (error: any) {
        set({
          isSyncing: false,
          syncStatus: `Error: ${error.message}`
        });
        throw error;
      }
    },

    exportWorkspace: () => {
      const state = get();
      return JSON.stringify(state.data, null, 2);
    },

    importWorkspace: async (jsonData: string) => {
      try {
        const data = JSON.parse(jsonData);
        set({ data });
        await get().saveToGitHub();
      } catch (error: any) {
        throw new Error('Invalid JSON data');
      }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
    setSettingsOpen: (open) => set({ settingsOpen: open }),

    updateSettings: (settings) => {
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
  };
});