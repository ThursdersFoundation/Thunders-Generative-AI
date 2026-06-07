/**
 * Thunders-GenerativeAI Desktop Studio — File System Service
 *
 * Provides file system operations for the renderer process,
 * delegating to the main process via the secure IPC bridge
 * exposed in the preload script. Includes read, write, watch,
 * and directory management with proper error handling.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  path: string;
}

export interface FileStat {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  modifiedTime: string;
  createdTime: string;
}

export interface FileWatchEvent {
  type: "created" | "modified" | "deleted" | "renamed";
  path: string;
  oldPath?: string; // For rename events
}

export interface FileSearchOptions {
  /** Pattern to match file names (glob-style) */
  pattern?: string;
  /** Maximum depth to search */
  maxDepth?: number;
  /** File extensions to include */
  extensions?: string[];
  /** Directories to exclude */
  excludeDirs?: string[];
  /** Maximum number of results */
  maxResults?: number;
}

export interface FileSearchResult {
  path: string;
  name: string;
  extension: string;
  size: number;
  modifiedTime: string;
}

// ─── File System Service ──────────────────────────────────────────────────────

export class FileSystemService {
  private watchListeners: Map<string, Set<(event: FileWatchEvent) => void>> = new Map();
  private recentFiles: string[] = [];
  private readonly MAX_RECENT_FILES = 20;

  // ── Read Operations ────────────────────────────────────────────────────

  /**
   * Read file content as text.
   */
  async readFile(filePath: string, encoding: BufferEncoding = "utf-8"): Promise<FileResult<string>> {
    try {
      return await window.electronAPI.fs.readFile(filePath, encoding);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Read file content as a structured object (parses JSON).
   */
  async readJSON<T = unknown>(filePath: string): Promise<FileResult<T>> {
    const result = await this.readFile(filePath);
    if (!result.success || result.data === undefined) {
      return result as FileResult<T>;
    }
    try {
      const parsed = JSON.parse(result.data) as T;
      return { success: true, data: parsed };
    } catch (error: any) {
      return { success: false, error: `JSON parse error: ${error.message}` };
    }
  }

  /**
   * Read specific lines from a file (1-indexed).
   */
  async readLines(
    filePath: string,
    startLine: number,
    endLine: number
  ): Promise<FileResult<string>> {
    const result = await this.readFile(filePath);
    if (!result.success || !result.data) return result;

    const lines = result.data.split("\n");
    const sliced = lines.slice(startLine - 1, endLine).join("\n");
    return { success: true, data: sliced };
  }

  // ── Write Operations ───────────────────────────────────────────────────

  /**
   * Write text content to a file. Creates parent directories if needed.
   */
  async writeFile(
    filePath: string,
    content: string,
    encoding: BufferEncoding = "utf-8"
  ): Promise<FileResult<void>> {
    try {
      const result = await window.electronAPI.fs.writeFile(filePath, content, encoding);
      if (result.success) {
        this.addToRecent(filePath);
        this.notifyWatchers(filePath, "modified");
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Write a JavaScript object as formatted JSON.
   */
  async writeJSON<T = unknown>(
    filePath: string,
    data: T,
    indent: number = 2
  ): Promise<FileResult<void>> {
    try {
      const content = JSON.stringify(data, null, indent);
      return await this.writeFile(filePath, content);
    } catch (error: any) {
      return { success: false, error: `JSON stringify error: ${error.message}` };
    }
  }

  /**
   * Append content to an existing file, or create if it doesn't exist.
   */
  async appendFile(filePath: string, content: string): Promise<FileResult<void>> {
    const existing = await this.readFile(filePath);
    const newContent = existing.success && existing.data
      ? existing.data + "\n" + content
      : content;
    return await this.writeFile(filePath, newContent);
  }

  // ── Directory Operations ───────────────────────────────────────────────

  /**
   * List directory contents.
   */
  async readDir(dirPath: string): Promise<FileResult<DirEntry[]>> {
    try {
      return await window.electronAPI.fs.readDir(dirPath);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Recursively list all files in a directory tree.
   */
  async readDirRecursive(
    dirPath: string,
    maxDepth: number = 10,
    currentDepth: number = 0
  ): Promise<FileResult<DirEntry[]>> {
    if (currentDepth > maxDepth) {
      return { success: true, data: [] };
    }

    const result = await this.readDir(dirPath);
    if (!result.success || !result.data) return result;

    const allEntries: DirEntry[] = [];

    for (const entry of result.data) {
      allEntries.push(entry);

      if (entry.isDirectory && !this.shouldSkipDirectory(entry.name)) {
        const subResult = await this.readDirRecursive(
          entry.path,
          maxDepth,
          currentDepth + 1
        );
        if (subResult.success && subResult.data) {
          allEntries.push(...subResult.data);
        }
      }
    }

    return { success: true, data: allEntries };
  }

  /**
   * Check if a file or directory exists.
   */
  async exists(filePath: string): Promise<boolean> {
    return await window.electronAPI.fs.exists(filePath);
  }

  /**
   * Get file/directory metadata.
   */
  async stat(filePath: string): Promise<FileResult<FileStat>> {
    try {
      return await window.electronAPI.fs.stat(filePath);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ── File Search ────────────────────────────────────────────────────────

  /**
   * Search for files matching a pattern within a directory.
   */
  async searchFiles(
    rootPath: string,
    options: FileSearchOptions = {}
  ): Promise<FileResult<FileSearchResult[]>> {
    const {
      pattern,
      maxDepth = 10,
      extensions,
      excludeDirs = ["node_modules", ".git", "dist", "build", ".next", "__pycache__"],
      maxResults = 100,
    } = options;

    const result = await this.readDirRecursive(rootPath, maxDepth);
    if (!result.success || !result.data) return result as FileResult<FileSearchResult[]>;

    const filtered: FileSearchResult[] = [];

    for (const entry of result.data) {
      if (filtered.length >= maxResults) break;
      if (!entry.isFile) continue;

      // Check extension filter
      if (extensions && extensions.length > 0) {
        const ext = entry.name.split(".").pop() ?? "";
        if (!extensions.includes(ext)) continue;
      }

      // Check pattern match
      if (pattern) {
        const regex = new RegExp(this.globToRegex(pattern), "i");
        if (!regex.test(entry.name)) continue;
      }

      // Check excluded directories
      const isInExcludedDir = excludeDirs.some(
        (dir) => entry.path.includes(`${dir}/`) || entry.path.includes(`\\${dir}\\`)
      );
      if (isInExcludedDir) continue;

      // Get file stats
      const stat = await this.stat(entry.path);
      filtered.push({
        path: entry.path,
        name: entry.name,
        extension: entry.name.split(".").pop() ?? "",
        size: stat.success && stat.data ? stat.data.size : 0,
        modifiedTime: stat.success && stat.data ? stat.data.modifiedTime : new Date().toISOString(),
      });
    }

    return { success: true, data: filtered };
  }

  /**
   * Search for text content within files (grep-like).
   */
  async searchInFiles(
    rootPath: string,
    searchTerm: string,
    options: {
      extensions?: string[];
      maxResults?: number;
      caseSensitive?: boolean;
    } = {}
  ): Promise<
    FileResult<
      Array<{
        filePath: string;
        line: number;
        column: number;
        text: string;
        context: string;
      }>
    >
  > {
    const { extensions, maxResults = 50, caseSensitive = false } = options;

    const fileResult = await this.searchFiles(rootPath, {
      extensions,
      maxResults: 500,
    });

    if (!fileResult.success || !fileResult.data) {
      return fileResult as FileResult<any>;
    }

    const matches: Array<{
      filePath: string;
      line: number;
      column: number;
      text: string;
      context: string;
    }> = [];

    const flags = caseSensitive ? "g" : "gi";

    for (const file of fileResult.data) {
      if (matches.length >= maxResults) break;

      // Skip binary-like extensions
      if (this.isBinaryExtension(file.extension)) continue;

      const content = await this.readFile(file.path);
      if (!content.success || !content.data) continue;

      const lines = content.data.split("\n");
      const regex = new RegExp(searchTerm, flags);

      for (let i = 0; i < lines.length; i++) {
        if (matches.length >= maxResults) break;

        const lineText = lines[i];
        const match = regex.exec(lineText);
        if (match && match.index !== undefined) {
          const start = Math.max(0, i - 2);
          const end = Math.min(lines.length, i + 3);
          matches.push({
            filePath: file.path,
            line: i + 1,
            column: match.index + 1,
            text: match[0],
            context: lines.slice(start, end).join("\n"),
          });
        }
        regex.lastIndex = 0; // Reset for next line
      }
    }

    return { success: true, data: matches };
  }

  // ── File Watching ──────────────────────────────────────────────────────

  /**
   * Register a watcher for file/directory changes.
   * In a full implementation, this would use chokidar or fs.watch via IPC.
   */
  watch(
    filePath: string,
    callback: (event: FileWatchEvent) => void
  ): () => void {
    if (!this.watchListeners.has(filePath)) {
      this.watchListeners.set(filePath, new Set());
    }
    this.watchListeners.get(filePath)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.watchListeners.get(filePath);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.watchListeners.delete(filePath);
        }
      }
    };
  }

  /**
   * Notify all watchers of a file change.
   */
  private notifyWatchers(path: string, type: FileWatchEvent["type"]): void {
    const event: FileWatchEvent = { type, path };

    // Notify exact path watchers
    this.watchListeners.get(path)?.forEach((cb) => cb(event));

    // Notify parent directory watchers
    for (const [watchPath, listeners] of this.watchListeners) {
      if (path.startsWith(watchPath) && watchPath !== path) {
        listeners.forEach((cb) => cb(event));
      }
    }
  }

  // ── Recent Files ───────────────────────────────────────────────────────

  private addToRecent(filePath: string): void {
    this.recentFiles = [
      filePath,
      ...this.recentFiles.filter((f) => f !== filePath),
    ].slice(0, this.MAX_RECENT_FILES);
  }

  getRecentFiles(): string[] {
    return [...this.recentFiles];
  }

  // ── Dialog Helpers ─────────────────────────────────────────────────────

  /**
   * Show native file open dialog.
   */
  async openFileDialog(
    options?: Electron.OpenDialogOptions
  ): Promise<string | null> {
    return await window.electronAPI.dialog.openFile(options);
  }

  /**
   * Show native directory open dialog.
   */
  async openDirectoryDialog(): Promise<string | null> {
    return await window.electronAPI.dialog.openDirectory();
  }

  /**
   * Show native save file dialog.
   */
  async saveFileDialog(defaultPath?: string): Promise<string | null> {
    return await window.electronAPI.dialog.saveFile(defaultPath);
  }

  // ─── Utility ────────────────────────────────────────────────────────────

  /**
   * Get the file extension from a path.
   */
  getExtension(filePath: string): string {
    return filePath.split(".").pop()?.toLowerCase() ?? "";
  }

  /**
   * Get the file name from a path.
   */
  getFileName(filePath: string): string {
    return filePath.split(/[\\/]/).pop() ?? filePath;
  }

  /**
   * Infer the programming language from a file extension.
   */
  inferLanguage(filePath: string): string {
    const ext = this.getExtension(filePath);
    const map: Record<string, string> = {
      ts: "TypeScript",
      tsx: "TypeScript React",
      js: "JavaScript",
      jsx: "JavaScript React",
      py: "Python",
      rs: "Rust",
      go: "Go",
      java: "Java",
      kt: "Kotlin",
      cs: "C#",
      cpp: "C++",
      c: "C",
      h: "C/C++ Header",
      rb: "Ruby",
      php: "PHP",
      swift: "Swift",
      dart: "Dart",
      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      toml: "TOML",
      xml: "XML",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      less: "LESS",
      md: "Markdown",
      sql: "SQL",
      sh: "Shell",
      bash: "Bash",
      dockerfile: "Dockerfile",
    };
    return map[ext] ?? "Plain Text";
  }

  /**
   * Check if a directory should be skipped during traversal.
   */
  private shouldSkipDirectory(name: string): boolean {
    const skip = new Set([
      "node_modules",
      ".git",
      ".svn",
      ".hg",
      "dist",
      "build",
      ".next",
      ".nuxt",
      "__pycache__",
      ".venv",
      "venv",
      ".env",
      ".tox",
      "target",
      "bin",
      "obj",
      ".idea",
      ".vscode",
      ".vs",
    ]);
    return skip.has(name) || name.startsWith(".");
  }

  /**
   * Check if a file extension likely indicates a binary file.
   */
  private isBinaryExtension(ext: string): boolean {
    const binaryExts = new Set([
      "png", "jpg", "jpeg", "gif", "bmp", "ico", "svg", "webp",
      "mp3", "mp4", "avi", "mov", "wav", "flac", "ogg",
      "zip", "tar", "gz", "rar", "7z", "bz2",
      "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
      "exe", "dll", "so", "dylib", "bin", "dat",
      "woff", "woff2", "ttf", "otf", "eot",
      "sqlite", "db",
    ]);
    return binaryExts.has(ext.toLowerCase());
  }

  /**
   * Convert a simple glob pattern to a regex string.
   */
  private globToRegex(glob: string): string {
    return glob
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

let _instance: FileSystemService | null = null;

export function getFileSystemService(): FileSystemService {
  if (!_instance) {
    _instance = new FileSystemService();
  }
  return _instance;
}

export function resetFileSystemService(): void {
  _instance = null;
}
