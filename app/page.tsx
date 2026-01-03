'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import { useStore, Task, Note, Script } from '@/lib/store';

// Icons
const Icons = {
  GitHub: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  Sync: ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
  ),
  Comment: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  ),
  History: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
  ),
  Folder: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
    </svg>
  ),
  Archive: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
    </svg>
  ),
  Pin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  Play: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  Stop: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
    </svg>
  ),
};

// Login Screen
function LoginScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icons.GitHub />
        </div>
        <h1 className="text-3xl font-bold mb-2">DevHub</h1>
        <p className="text-gray-400 mb-8">Kanban, Notes & Scripts Manager</p>

        <button
          onClick={() => signIn('github')}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-3"
        >
          <Icons.GitHub />
          Sign in with GitHub
        </button>

        <p className="text-xs text-gray-500 mt-6">
          Secure OAuth authentication. Your data is stored in your own GitHub repository.
        </p>
      </div>
    </div>
  );
}

// Repository Selector
function RepoSelector() {
  const { user, availableRepos, loadAvailableRepos, setRepo, createNewRepo, isSyncing, syncStatus,isAuthenticated } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRepoName, setNewRepoName] = useState('devhub-data');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Only load repos when authenticated (token is set)
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const loadRepos = async () => {
      try {
        setError('');
        await loadAvailableRepos();
      } catch (err: any) {
        console.error('Failed to load repos:', err);
        setError(err.message || 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    };
    loadRepos();
  }, [loadAvailableRepos, isAuthenticated]);


  const filteredRepos = availableRepos.filter(repo =>
    repo.full_name.toLowerCase().includes(filter.toLowerCase())
  );
  const handleCreateRepo = async () => {
    try {
      setError('');
      await createNewRepo(newRepoName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create repository');
    }
  };
  const handleSelectRepo = async (repoName: string) => {
    try {
      setLoading(true);
      setError('');
      await setRepo(repoName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to select repository');
    } finally {
      setLoading(false);
    }
  };
  const handleRetry = () => {
    setLoading(true);
    setError('');
    loadAvailableRepos()
      .catch(err => {
        console.error('Retry failed:', err);
        setError(err.message || 'Failed to load repositories');
      })
      .finally(() => setLoading(false));
  };
  if (loading || isSyncing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icons.Sync className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-400">{syncStatus || 'Loading repositories...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {user?.image && (
              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <h2 className="font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-400">@{user?.login}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="ml-auto p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
              title="Sign out"
            >
              <Icons.Logout />
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Repository</h3>
          <p className="text-sm text-gray-400">Choose a repository to store your DevHub data</p>
        </div>

        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Icons.Plus /> Create New Repository
          </button>

          {showCreate && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newRepoName}
                onChange={e => setNewRepoName(e.target.value)}
                placeholder="Repository name"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateRepo}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
              >
                Create
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="text-xs text-red-300 hover:text-red-200 underline"
              >
                Click here to retry
              </button>
            </div>
          )}

          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search repositories..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-indigo-500"
          />

          <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
            {availableRepos.length === 0 && !error ? (
              <div className="text-center text-gray-500 py-4">
                <p className="mb-2">No repositories found</p>
                <p className="text-xs">Create a new repository above to get started</p>
              </div>
            ) : filteredRepos.length === 0 && filter ? (
              <p className="text-center text-gray-500 py-4">No repositories match "{filter}"</p>
            ) : (
              filteredRepos.map(repo => (
                <button
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo.full_name)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-left"
                >
                  <Icons.Folder />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{repo.name}</p>
                    <p className="text-xs text-gray-400 truncate">{repo.full_name}</p>
                  </div>
                  {repo.private && (
                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">Private</span>
                  )}
                </button>
              ))
            )}
          </div>

          {availableRepos.length > 0 && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Showing {filteredRepos.length} of {availableRepos.length} repositories
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  const { data: session } = useSession();
  const {
    currentTab, setCurrentTab, workspaces, currentWorkspace,
    switchWorkspace, syncNow, isSyncing, syncStatus, repo,
    hasUnsavedChanges, clearSession, saveToGitHub
  } = useStore();

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const handleSignOut = () => {
    clearSession();
    signOut();
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-indigo-400">DevHub</h1>
            <div className="flex items-center gap-2">
              <select
                value={currentWorkspace}
                onChange={e => switchWorkspace(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
              >
                {workspaces.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <button
                onClick={() => setShowWorkspaceModal(true)}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition"
                title="Manage Workspaces"
              >
                <Icons.Plus />
              </button>
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">{repo}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${hasUnsavedChanges ? 'text-yellow-400' : 'text-gray-400'}`}>
              {syncStatus}
            </span>
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="p-2 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
              title="Sync with GitHub (Pull)"
            >
              <Icons.Sync className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            {/* <button
              onClick={saveToGitHub}
              disabled={isSyncing || !hasUnsavedChanges}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
              title="Manual Save to GitHub"
            >
              Save
            </button> */}
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
              title="Sign out"
            >
              <Icons.Logout />
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4">
          {(['kanban', 'notes', 'scripts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition capitalize ${
                currentTab === tab
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {showWorkspaceModal && (
        <WorkspaceModal onClose={() => setShowWorkspaceModal(false)} />
      )}
    </>
  );
}

// Workspace Modal
function WorkspaceModal({ onClose }: { onClose: () => void }) {
  const { workspaces, createWorkspace, deleteWorkspace, exportWorkspace, importWorkspace } = useStore();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createWorkspace(newName.trim());
      setNewName('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm(`Delete workspace "${name}"?`)) {
      try {
        await deleteWorkspace(name);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleExport = () => {
    const data = exportWorkspace();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub-workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await importWorkspace(text);
      setError('');
      alert('Workspace imported successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Manage Workspaces</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition">
            <Icons.Close />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="New workspace name"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
            >
              Create
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition text-sm"
            >
              Export Current
            </button>
            <label className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm cursor-pointer text-center">
              {importing ? 'Importing...' : 'Import'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {workspaces.map(w => (
              <div key={w} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span>{w}</span>
                {w !== 'default' && (
                  <button
                    onClick={() => handleDelete(w)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Kanban Board Component with ALL Enhancements
function KanbanBoard() {
  const {
    data, addColumn, deleteColumn, renameColumn, reorderColumns,
    addTask, moveTask, showArchived, setShowArchived, archiveTask, restoreTask,
    calendarView, setCalendarView, startTimeTracking, stopTimeTracking
  } = useStore();
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; columnId: string } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<{ task: Task; columnId: string } | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [columnTitle, setColumnTitle] = useState('');

  const handleDragStart = (e: React.DragEvent, taskId: string, columnId: string) => {
    setDraggedTask({ taskId, columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumn(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumn !== null && draggedColumn !== dropIndex) {
      reorderColumns(draggedColumn, dropIndex);
    }
    setDraggedColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedTask && draggedTask.columnId !== targetColumnId) {
      moveTask(draggedTask.columnId, targetColumnId, draggedTask.taskId);
    }
    setDraggedTask(null);
  };

  const handleAddColumn = () => {
    const title = prompt('Column title:');
    if (title) addColumn(title);
  };

  const handleDeleteColumn = (columnId: string, columnTitle: string, taskCount: number) => {
    if (taskCount > 0) {
      if (!confirm(`Delete column "${columnTitle}" and all ${taskCount} tasks inside?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete column "${columnTitle}"?`)) {
        return;
      }
    }
    deleteColumn(columnId);
  };

  const handleRenameColumn = (columnId: string, currentTitle: string) => {
    setEditingColumn(columnId);
    setColumnTitle(currentTitle);
  };

  const handleSaveColumnName = (columnId: string) => {
    if (columnTitle.trim()) {
      renameColumn(columnId, columnTitle.trim());
    }
    setEditingColumn(null);
  };

  const handleAddTask = (columnId: string) => {
    const title = prompt('Task title:');
    if (title) addTask(columnId, title);
  };

  // Get all unique labels
  const allLabels = Array.from(
    new Set(
      data.kanban.columns.flatMap(col =>
        col.tasks.flatMap(task => task.labels)
      )
    )
  );

  // Filter tasks
  const filterTask = (task: Task) => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesLabel = filterLabel === 'all' || task.labels.includes(filterLabel);
    return matchesPriority && matchesLabel;
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Get active time entry for a task
  const getActiveTimeEntry = (task: Task) => {
    return task.timeTracking.find(entry => !entry.endTime);
  };

  // Group tasks by due date for calendar view
  const getTasksByDate = () => {
    const tasksByDate: { [key: string]: { task: Task; columnId: string; columnTitle: string }[] } = {};

    data.kanban.columns.forEach(column => {
      column.tasks.filter(filterTask).forEach(task => {
        if (task.dueDate) {
          if (!tasksByDate[task.dueDate]) {
            tasksByDate[task.dueDate] = [];
          }
          tasksByDate[task.dueDate].push({ task, columnId: column.id, columnTitle: column.title });
        }
      });
    });

    return tasksByDate;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getLabelColor = (label: string) => {
    const hash = label.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500'
    ];
    return colors[hash % colors.length];
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex gap-3 items-center flex-wrap">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={filterLabel}
            onChange={e => setFilterLabel(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Labels</option>
            {allLabels.map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>

          <button
            onClick={() => setCalendarView(!calendarView)}
            className={`px-3 py-2 text-sm rounded-lg transition flex items-center gap-2 ${
              calendarView ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Icons.Calendar /> {calendarView ? 'Board' : 'Calendar'} View
          </button>

          <button
            // onClick={() => setShowArchived(!showArchived)}
            className={`hidden px-3 py-2 text-sm rounded-lg transition flex items-center gap-2 ${
              showArchived ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Icons.Archive /> {showArchived ? 'Hide' : 'Show'} Archive
          </button>
        </div>

        {/* Calendar View or Kanban Columns */}
        {calendarView ? (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-4">
              {Object.keys(getTasksByDate()).length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks with due dates</p>
              ) : (
                Object.entries(getTasksByDate())
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, tasks]) => (
                    <div key={date} className="bg-gray-800 rounded-xl p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icons.Calendar />
                        {format(new Date(date), 'PPPP')}
                        <span className="text-sm text-gray-400">({tasks.length} tasks)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tasks.map(({ task, columnId, columnTitle }) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask({ task, columnId })}
                            className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium flex-1">{task.title}</h4>
                              {task.priority && (
                                <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ml-2 mt-1.5`}></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-2">📍 {columnTitle}</p>
                            {task.labels.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {task.labels.map(label => (
                                  <span key={label} className={`${getLabelColor(label)} text-xs px-2 py-0.5 rounded text-white`}>
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max">
            {data.kanban.columns.map((column, index) => (
              <div
                key={column.id}
                className="w-80 bg-gray-800 rounded-xl flex flex-col"
                draggable
                onDragStart={e => handleColumnDragStart(e, index)}
                onDragOver={handleColumnDragOver}
                onDrop={e => handleColumnDrop(e, index)}
              >
                <div className="p-3 font-semibold flex items-center justify-between border-b border-gray-700">
                  {editingColumn === column.id ? (
                    <input
                      type="text"
                      value={columnTitle}
                      onChange={e => setColumnTitle(e.target.value)}
                      onBlur={() => handleSaveColumnName(column.id)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveColumnName(column.id)}
                      className="flex-1 bg-gray-700 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1">{column.title}</span>
                  )}
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                      {column.tasks.filter(filterTask).length}
                    </span>
                    <button
                      onClick={() => handleRenameColumn(column.id, column.title)}
                      className="p-1 hover:bg-gray-600 rounded transition"
                      title="Rename column"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column.id, column.title, column.tasks.length)}
                      className="p-1 hover:bg-red-600 rounded transition text-red-400 hover:text-white"
                      title="Delete column"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>

                <div
                  className="flex-1 p-2 space-y-2 kanban-column overflow-y-auto scrollbar-thin"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, column.id)}
                >
                  {column.tasks.filter(filterTask).map(task => (
                    <div
                      key={task.id}
                      className="task-card bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                      draggable
                      onDragStart={e => handleDragStart(e, task.id, column.id)}
                      onClick={() => setSelectedTask({ task, columnId: column.id })}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium flex-1">{task.title}</h4>
                        {task.priority && (
                          <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ml-2 mt-1.5`} title={task.priority}></span>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {task.content.replace(/[#*`]/g, '').substring(0, 80) || 'No content'}
                      </p>

                      {task.labels.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {task.labels.map(label => (
                            <span
                              key={label}
                              className={`${getLabelColor(label)} text-xs px-2 py-0.5 rounded text-white`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Icons.Calendar />
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                        {task.comments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Icons.Comment /> {task.comments.length}
                          </span>
                        )}
                        {task.versions.length > 1 && (
                          <span className="flex items-center gap-1">
                            <Icons.History /> v{task.versions.length}
                          </span>
                        )}
                        {task.totalTimeSpent > 0 && (
                          <span className="flex items-center gap-1">
                            <Icons.Clock /> {formatTime(task.totalTimeSpent)}
                          </span>
                        )}
                        {getActiveTimeEntry(task) && (
                          <span className="flex items-center gap-1 text-green-400 animate-pulse">
                            <Icons.Clock /> Tracking...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-gray-700">
                  <button
                    onClick={() => handleAddTask(column.id)}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-1"
                  >
                    <Icons.Plus /> Add Task
                  </button>
                </div>
              </div>
            ))}

            <div className="w-80 flex-shrink-0">
              <button
                onClick={handleAddColumn}
                className="w-full py-3 bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center gap-2"
              >
                <Icons.Plus /> Add Column
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Archive Section */}
        {showArchived && data.kanban.archivedTasks.length > 0 && (
          <div className="border-t border-gray-700 p-4 bg-gray-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icons.Archive /> Archived Tasks ({data.kanban.archivedTasks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto scrollbar-thin">
              {data.kanban.archivedTasks.map(task => (
                <div key={task.id} className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                    {task.content.substring(0, 60) || 'No content'}
                  </p>
                  <button
                    onClick={() => {
                      const columnId = data.kanban.columns[0]?.id;
                      if (columnId) restoreTask(task.id, columnId);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask.task}
          columnId={selectedTask.columnId}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}

// Enhanced Task Modal with all features
function TaskModal({ task, columnId, onClose }: { task: Task; columnId: string; onClose: () => void }) {
  const { updateTask, deleteTask, addComment, deleteComment, archiveTask, startTimeTracking, stopTimeTracking } = useStore();
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [labels, setLabels] = useState<string[]>(task.labels);
  const [assignees, setAssignees] = useState<string[]>(task.assignees);
  const [newLabel, setNewLabel] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  const activeTimeEntry = task.timeTracking.find(entry => !entry.endTime);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleSave = () => {
    updateTask(columnId, task.id, {
      title,
      content,
      priority,
      dueDate: dueDate || null,
      labels,
      assignees
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask(columnId, task.id);
      onClose();
    }
  };

  const handleArchive = () => {
    archiveTask(columnId, task.id);
    onClose();
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      const updated = [...labels, newLabel.trim()];
      setLabels(updated);
      updateTask(columnId, task.id, { labels: updated });
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    const updated = labels.filter(l => l !== label);
    setLabels(updated);
    updateTask(columnId, task.id, { labels: updated });
  };

  const handleAddAssignee = () => {
    if (newAssignee.trim() && !assignees.includes(newAssignee.trim())) {
      const updated = [...assignees, newAssignee.trim()];
      setAssignees(updated);
      updateTask(columnId, task.id, { assignees: updated });
      setNewAssignee('');
    }
  };

  const handleRemoveAssignee = (assignee: string) => {
    const updated = assignees.filter(a => a !== assignee);
    setAssignees(updated);
    updateTask(columnId, task.id, { assignees: updated });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(columnId, task.id, newComment.trim());
      setNewComment('');
    }
  };

  type TaskVersion = Task['versions'][0];

  const handleRestoreVersion = (version: TaskVersion) => {
    setContent(version.content);
    updateTask(columnId, task.id, { content: version.content });
    setShowVersions(false);
  };

  const getLabelColor = (label: string) => {
    const hash = label.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500'
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-lg font-semibold bg-transparent focus:outline-none focus:bg-gray-700 px-2 py-1 rounded flex-1"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition ml-2">
            <Icons.Close />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Priority, Due Date, Archive */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority || ''}
                onChange={e => {
                  const val = e.target.value as Task['priority'];
                  setPriority(val || null);
                  updateTask(columnId, task.id, { priority: val || null });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => {
                  setDueDate(e.target.value);
                  updateTask(columnId, task.id, { dueDate: e.target.value || null });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-end gap-2">
              {activeTimeEntry ? (
                <button
                  onClick={() => stopTimeTracking(columnId, task.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2"
                >
                  <Icons.Stop /> Stop Timer
                </button>
              ) : (
                <button
                  onClick={() => startTimeTracking(columnId, task.id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2"
                >
                  <Icons.Play /> Start Timer
                </button>
              )}
              <button
                // onClick={handleArchive}
                className="hidden bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2"
              >
                <Icons.Archive /> Archive
              </button>
            </div>
          </div>

          {/* Time Tracking Display */}
          {task.totalTimeSpent > 0 && (
            <div className="bg-gray-700 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icons.Clock /> Time Tracking
              </h4>
              <div className="text-2xl font-bold text-indigo-400 mb-2">
                {formatTime(task.totalTimeSpent)}
              </div>
              {task.timeTracking.length > 0 && (
                <div className="space-y-1 text-xs text-gray-400">
                  {task.timeTracking.slice(-3).reverse().map((entry, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{format(new Date(entry.startTime), 'PPp')}</span>
                      <span>{entry.endTime ? formatTime(entry.duration) : 'In progress...'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium mb-2">Labels</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {labels.map(label => (
                <span
                  key={label}
                  className={`${getLabelColor(label)} text-sm px-3 py-1 rounded-full text-white flex items-center gap-2`}
                >
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Add label..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddLabel()}
              />
              <button
                onClick={handleAddLabel}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium mb-2">Assignees</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {assignees.map(assignee => (
                <span
                  key={assignee}
                  className="bg-purple-600 text-sm px-3 py-1 rounded-full text-white flex items-center gap-2"
                >
                  {assignee}
                  <button
                    onClick={() => handleRemoveAssignee(assignee)}
                    className="hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                placeholder="Add assignee..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddAssignee()}
              />
              <button
                onClick={handleAddAssignee}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Content (Markdown)</label>
              <button
                onClick={() => setShowVersions(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Icons.History /> Version History ({task.versions.length})
              </button>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onBlur={handleSave}
              rows={6}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono text-sm resize-none"
              placeholder="Write markdown content..."
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div className="markdown-preview bg-gray-700 p-4 rounded-lg min-h-[100px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content*'}
              </ReactMarkdown>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-2">Comments</label>
            <div className="space-y-2 mb-3">
              {task.comments.map(comment => (
                <div key={comment.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.timestamp), 'PPp')}
                    </span>
                    <button
                      onClick={() => deleteComment(columnId, task.id, comment.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="markdown-preview text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-between">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm"
          >
            Delete Task
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition text-sm"
          >
            Close
          </button>
        </div>

        {showVersions && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col rounded-2xl">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Version History</h3>
              <button onClick={() => setShowVersions(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                <Icons.Close />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[...task.versions].reverse().map((version) => (
                <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{version.action}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(version.timestamp), 'PPp')}
                    </span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded text-sm text-gray-300 mb-2 max-h-32 overflow-y-auto">
                    {version.content || <em className="text-gray-500">Empty</em>}
                  </div>
                  <button
                    onClick={() => handleRestoreVersion(version)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Restore this version
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notes Manager Component
function NotesManager() {
  const { data, selectedNote, selectNote, createNote, updateNote, deleteNote } = useStore();
  const note = data.notes.find(n => n.id === selectedNote);
  const [showVersions, setShowVersions] = useState(false);

  const handleCreate = () => {
    const name = prompt('Note name:');
    if (name) createNote(name);
  };

  const handleDelete = () => {
    if (note && confirm('Delete this note?')) {
      deleteNote(note.id);
    }
  };

  type NoteVersion = Note['versions'][0];

  const handleRestoreVersion = (version: NoteVersion) => {
    if (note) {
      updateNote(note.id, { content: version.content });
      setShowVersions(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Icons.Plus /> New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {data.notes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No notes yet</p>
          ) : (
            data.notes.map(n => (
              <div
                key={n.id}
                onClick={() => selectNote(n.id)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedNote === n.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <h4 className="font-medium truncate">{n.name}</h4>
                <p className="text-sm text-gray-400 truncate">{n.description || 'No description'}</p>
                <span className="text-xs text-gray-500">
                  {format(new Date(n.updatedAt), 'PP')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        {note ? (
          <>
            <div className="p-4 border-b border-gray-700 space-y-3">
              <input
                type="text"
                value={note.name}
                onChange={e => updateNote(note.id, { name: e.target.value })}
                placeholder="Note name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-lg font-semibold"
              />
              <input
                type="text"
                value={note.description}
                onChange={e => updateNote(note.id, { description: e.target.value })}
                placeholder="Description"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVersions(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Icons.History /> Version History ({note.versions.length})
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-300 ml-auto"
                >
                  Delete Note
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">
                  Editor (Markdown)
                </div>
                <textarea
                  value={note.content}
                  onChange={e => updateNote(note.id, { content: e.target.value })}
                  className="flex-1 p-4 bg-transparent focus:outline-none resize-none font-mono text-sm"
                  placeholder="Start writing..."
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">Preview</div>
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin markdown-preview">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.content || '*Start writing...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {showVersions && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Version History</h3>
                  <button onClick={() => setShowVersions(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                    <Icons.Close />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {[...note.versions].reverse().map(version => (
                    <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{version.action}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(version.timestamp), 'PPp')}
                        </span>
                      </div>
                      <div className="bg-gray-800 p-2 rounded text-sm text-gray-300 mb-2 max-h-32 overflow-y-auto markdown-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {version.content || '*Empty*'}
                        </ReactMarkdown>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Restore this version
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}

// Scripts Manager Component
function ScriptsManager() {
  const { data, selectedScript, selectScript, createScript, updateScript, deleteScript } = useStore();
  const script = data.scripts.find(s => s.id === selectedScript);
  const [showVersions, setShowVersions] = useState(false);

  const languages = [
    'javascript', 'typescript', 'python', 'bash', 'sql',
    'html', 'css', 'json', 'markdown', 'yaml', 'go', 'rust'
  ];

  const handleCreate = () => {
    const name = prompt('Script name:');
    if (name) createScript(name);
  };

  const handleDelete = () => {
    if (script && confirm('Delete this script?')) {
      deleteScript(script.id);
    }
  };

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script.code);
    }
  };

  type ScriptVersion = Script['versions'][0];

  const handleRestoreVersion = (version: ScriptVersion) => {
    if (script) {
      updateScript(script.id, { code: version.code });
      setShowVersions(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Icons.Plus /> New Script
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {data.scripts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No scripts yet</p>
          ) : (
            data.scripts.map(s => (
              <div
                key={s.id}
                onClick={() => selectScript(s.id)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedScript === s.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <h4 className="font-medium truncate">{s.name}</h4>
                <p className="text-sm text-gray-400 truncate">{s.description || 'No description'}</p>
                <span className="text-xs text-gray-500">{s.language}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        {script ? (
          <>
            <div className="p-4 border-b border-gray-700 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={script.name}
                  onChange={e => updateScript(script.id, { name: e.target.value })}
                  placeholder="Script name"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-lg font-semibold"
                />
                <select
                  value={script.language}
                  onChange={e => updateScript(script.id, { language: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={script.description}
                onChange={e => updateScript(script.id, { description: e.target.value })}
                placeholder="Description"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVersions(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Icons.History /> Version History ({script.versions.length})
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  <Icons.Copy /> Copy Code
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-300 ml-auto"
                >
                  Delete Script
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">Code Editor</div>
                <textarea
                  value={script.code}
                  onChange={e => updateScript(script.id, { code: e.target.value })}
                  className="flex-1 p-4 bg-transparent focus:outline-none resize-none font-mono text-sm"
                  placeholder="// Start coding..."
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">
                  Syntax Highlighted Preview
                </div>
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language={script.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      minHeight: '100%',
                    }}
                    showLineNumbers
                  >
                    {script.code || '// Start coding...'}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>

            {showVersions && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Version History</h3>
                  <button onClick={() => setShowVersions(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                    <Icons.Close />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {[...script.versions].reverse().map(version => (
                    <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{version.action}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(version.timestamp), 'PPp')}
                        </span>
                      </div>
                      <div className="bg-gray-800 rounded overflow-hidden mb-2 max-h-40 overflow-y-auto">
                        <SyntaxHighlighter
                          language={script.language}
                          style={vscDarkPlus}
                          customStyle={{ margin: 0, padding: '0.5rem', fontSize: '0.75rem' }}
                        >
                          {version.code || '// Empty'}
                        </SyntaxHighlighter>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Restore this version
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a script or create a new one
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function Home() {
  const { data: session, status } = useSession();
  const { isAuthenticated, repoSelected, currentTab, setSession } = useStore();

  useEffect(() => {
    if (session?.user && session?.accessToken) {
      setSession(session.user, session.accessToken);
    }
  }, [session, setSession]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Icons.Sync className="w-10 h-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Not authenticated - show login
  if (!session) {
    return <LoginScreen />;
  }

  // Authenticated but no repo selected
  if (!repoSelected) {
    return <RepoSelector />;
  }

  // Full app
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        {currentTab === 'kanban' && <KanbanBoard />}
        {currentTab === 'notes' && <NotesManager />}
        {currentTab === 'scripts' && <ScriptsManager />}
      </main>
    </div>
  );
}
