// GitHub API utilities with OAuth token support

export interface GitHubFile {
  sha: string;
  content: string;
  encoding: string;
}

export interface SyncState {
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
  pendingChanges: boolean;
}

class GitHubAPI {
  private token: string = '';
  private repo: string = '';
  private syncQueue: Promise<any> = Promise.resolve();
  private shaCache: Map<string, string> = new Map();

  setCredentials(token: string, repo: string) {
    this.token = token;
    this.repo = repo;
    this.shaCache.clear();
  }

  setToken(token: string) {
    this.token = token;
  }

  setRepo(repo: string) {
    this.repo = repo;
    this.shaCache.clear();
  }

  getCredentials() {
    return { token: this.token, repo: this.repo };
  }

  hasCredentials() {
    return Boolean(this.token && this.repo);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async getUser(): Promise<any> {
    return this.request('/user');
  }

  async listUserRepos(): Promise<any[]> {
    const repos = await this.request('/user/repos?per_page=100&sort=updated');
    return repos;
  }

  async checkRepo(): Promise<boolean> {
    try {
      await this.request(`/repos/${this.repo}`);
      return true;
    } catch {
      return false;
    }
  }

  async createRepo(name: string, isPrivate: boolean = true): Promise<any> {
    return this.request('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        private: isPrivate,
        auto_init: true,
        description: 'DevHub data storage repository',
      }),
    });
  }

  async listFiles(): Promise<string[]> {
    try {
      const files = await this.request(`/repos/${this.repo}/contents`);
      if (Array.isArray(files)) {
        return files
          .filter((f: any) => f.name.endsWith('.json'))
          .map((f: any) => f.name.replace('.json', ''));
      }
      return [];
    } catch (error: any) {
      // If repo is empty or file not found, return empty array
      if (error.message.includes('404') || error.message.includes('empty')) {
        return [];
      }
      throw error;
    }
  }

  async loadFile(filename: string): Promise<{ data: any; sha: string } | null> {
    try {
      const file = await this.request(`/repos/${this.repo}/contents/${filename}.json`);
      const content = atob(file.content.replace(/\n/g, ''));
      const data = JSON.parse(content);
      this.shaCache.set(filename, file.sha);
      return { data, sha: file.sha };
    } catch (error: any) {
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async saveFile(filename: string, data: any, message?: string): Promise<string> {
    // Queue saves to prevent race conditions
    return new Promise((resolve, reject) => {
      this.syncQueue = this.syncQueue.then(async () => {
        try {
          console.log(`[GitHub] Saving ${filename}.json to ${this.repo}`);

          // Check if repo exists first
          const repoExists = await this.checkRepo();
          if (!repoExists) {
            const errorMsg = `Repository ${this.repo} not found. Please create it first or select a different repository.`;
            console.error('[GitHub] Repo check failed:', errorMsg);
            throw new Error(errorMsg);
          }
          console.log('[GitHub] Repo exists, proceeding with save');
          // Always get fresh SHA before saving to prevent conflicts
          let sha: string | undefined = this.shaCache.get(filename);

          try {
            console.log(`[GitHub] Checking if ${filename}.json exists...`);
            const existing = await this.request(`/repos/${this.repo}/contents/${filename}.json`);
            sha = existing.sha;
            if (sha) {
              this.shaCache.set(filename, sha);
            }
            console.log(`[GitHub] File exists, SHA: ${sha}`);
          } catch (e: any) {
            // File doesn't exist yet, that's ok
            if (!e.message.includes('404')) {
              console.error('[GitHub] Error checking file (not 404):', e.message);
              throw e;
            }
            console.log(`[GitHub] File doesn't exist yet, will create new file`);
            sha = undefined;
          }
          const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

          const body: any = {
            message: message || `Update ${filename} - ${new Date().toISOString()}`,
            content,
          };
          if (sha) {
            body.sha = sha;
          }
          console.log(`[GitHub] Sending PUT request to create/update ${filename}.json`);
          const result = await this.request(`/repos/${this.repo}/contents/${filename}.json`, {
            method: 'PUT',
            body: JSON.stringify(body),
          });
          const newSha = result.content.sha;
          if (newSha) {
            this.shaCache.set(filename, newSha);
          }
          console.log(`[GitHub] Successfully saved ${filename}.json, new SHA: ${newSha}`);
          resolve(newSha);
        } catch (error: any) {
          console.error(`[GitHub] Failed to save ${filename}.json:`, error.message);
          reject(error);
        }
      });
    });
  }

  async deleteFile(filename: string): Promise<void> {
    let sha = this.shaCache.get(filename);

    if (!sha) {
      try {
        const file = await this.request(`/repos/${this.repo}/contents/${filename}.json`);
        sha = file.sha;
      } catch {
        // File doesn't exist, nothing to delete
        return;
      }
    }

    await this.request(`/repos/${this.repo}/contents/${filename}.json`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete ${filename}`,
        sha: sha,
      }),
    });

    this.shaCache.delete(filename);
  }

  clearCache() {
    this.shaCache.clear();
  }
}

export const github = new GitHubAPI();

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
