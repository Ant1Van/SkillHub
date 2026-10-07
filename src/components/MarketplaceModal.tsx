import { useState } from "react";
import { 
  X, 
  Download, 
  Search, 
  Sparkles, 
  Check, 
  AlertCircle,
  Star,
  Globe2,
  Layers,
  Loader2,
  ExternalLink
} from "lucide-react";
import { CURATED_MARKETPLACE_SKILLS, CommunitySkill } from "../data/marketplaceSkills";
import { api } from "../services/api";

interface GitHubSearchResult {
  name: string;
  repo: string;
  description: string;
  downloadUrl: string;
}

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedSkillIds: string[];
  onInstallDirect: (id: string, content: string) => Promise<void>;
  onInstallUrl: (url: string, customName?: string) => Promise<void>;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
  isOpen,
  onClose,
  installedSkillIds,
  onInstallDirect,
  onInstallUrl,
}) => {
  const [activeTab, setActiveTab] = useState<"curated" | "github">("curated");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // GitHub Search States
  const [githubQuery, setGithubQuery] = useState("");
  const [isSearchingGithub, setIsSearchingGithub] = useState(false);
  const [githubResults, setGithubResults] = useState<GitHubSearchResult[]>([]);

  if (!isOpen) return null;

  // 1-Click install curated skill
  const handleInstallCurated = async (skill: CommunitySkill) => {
    try {
      setInstallingId(skill.id);
      setError(null);
      await onInstallDirect(skill.id, skill.skillContent);
    } catch (err: any) {
      setError(err?.toString() || "Installation failed.");
    } finally {
      setInstallingId(null);
    }
  };

  // Live GitHub Search
  const searchGithubSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubQuery.trim()) return;

    try {
      setIsSearchingGithub(true);
      setError(null);
      
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          githubQuery + " claude skills"
        )}&sort=stars&order=desc&per_page=8`
      );

      if (!response.ok) {
        throw new Error("GitHub API rate limit or error. Try again shortly.");
      }

      const data = await response.json();
      const items: GitHubSearchResult[] = (data.items || []).map((repo: any) => ({
        name: repo.name,
        repo: repo.full_name,
        description: repo.description || "Community Claude skill repository",
        downloadUrl: repo.html_url,
      }));

      setGithubResults(items);
    } catch (err: any) {
      setError(err?.toString() || "Search failed.");
    } finally {
      setIsSearchingGithub(false);
    }
  };

  const handleInstallFromGithubRepo = async (repoUrl: string, name: string) => {
    try {
      setInstallingId(name);
      setError(null);
      await onInstallUrl(repoUrl, name);
    } catch (err: any) {
      setError(err?.toString() || "Installation failed.");
    } finally {
      setInstallingId(null);
    }
  };

  const categories = ["All", "Testing", "Security", "DevOps", "Design", "Database", "AI Agents"];

  const filteredCurated = CURATED_MARKETPLACE_SKILLS.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-2xl bg-[#141517] border border-zinc-800 rounded-xl shadow-2xl flex flex-col h-[600px] text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-[#16171a] shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Claude Skills Marketplace</h3>
              <p className="text-[11px] text-zinc-400">Discover and install skills in 1-click</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800/80 bg-[#0e0f11] px-4 shrink-0">
          <button
            onClick={() => setActiveTab("curated")}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-150
              ${
                activeTab === "curated"
                  ? "border-zinc-200 text-zinc-100"
                  : "border-transparent text-zinc-400 hover:text-zinc-300"
              }
            `}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Hub (1-Click)</span>
          </button>

          <button
            onClick={() => setActiveTab("github")}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-150
              ${
                activeTab === "github"
                  ? "border-zinc-200 text-zinc-100"
                  : "border-transparent text-zinc-400 hover:text-zinc-300"
              }
            `}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Discover on GitHub</span>
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded flex items-center gap-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Curated Hub */}
        {activeTab === "curated" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Categories */}
            <div className="p-3 border-b border-zinc-800/80 bg-[#121315] space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter curated skills..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0b0c0d] border border-zinc-800 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium transition-colors
                      ${
                        selectedCategory === cat
                          ? "bg-zinc-200 text-zinc-950"
                          : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredCurated.map((skill) => {
                const isInstalled = installedSkillIds.includes(skill.id);
                const isBusy = installingId === skill.id;

                return (
                  <div
                    key={skill.id}
                    className="flex items-start justify-between p-3.5 bg-[#18191c] border border-zinc-800/80 rounded-lg hover:border-zinc-700/80 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-zinc-100">{skill.name}</h4>
                        <span className="font-mono text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/50">
                          {skill.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-2">
                        {skill.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                        <span>by @{skill.author}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5 text-amber-400/90">
                          <Star className="w-2.5 h-2.5 fill-amber-400/90" />
                          {skill.stars}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      {skill.repoUrl && (
                        <button
                          type="button"
                          onClick={() => api.openBrowserUrl(skill.repoUrl)}
                          title="Open Repository on GitHub"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 rounded border border-zinc-700/50 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>GitHub</span>
                        </button>
                      )}

                      {isInstalled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded">
                          <Check className="w-3 h-3" />
                          Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstallCurated(skill)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3 h-3" />
                          {isBusy ? "Installing..." : "Install"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Live GitHub Search */}
        {activeTab === "github" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-zinc-800/80 bg-[#121315] shrink-0">
              <form onSubmit={searchGithubSkills} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={githubQuery}
                    onChange={(e) => setGithubQuery(e.target.value)}
                    placeholder="Search GitHub (e.g. testing, rust, nextjs, devops)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0b0c0d] border border-zinc-800 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingGithub || !githubQuery.trim()}
                  className="px-3.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded transition-colors disabled:opacity-50 shrink-0"
                >
                  {isSearchingGithub ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isSearchingGithub ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mb-2 text-zinc-400" />
                  Searching GitHub repositories for Claude skills...
                </div>
              ) : githubResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs text-center p-4">
                  <Globe2 className="w-6 h-6 mb-2 text-zinc-600" />
                  Search GitHub to discover open-source community skills.
                </div>
              ) : (
                githubResults.map((item) => {
                  const isInstalled = installedSkillIds.includes(item.name);
                  const isBusy = installingId === item.name;

                  return (
                    <div
                      key={item.repo}
                      className="flex items-start justify-between p-3.5 bg-[#18191c] border border-zinc-800/80 rounded-lg hover:border-zinc-700/80 transition-colors gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-100 mb-0.5">{item.name}</h4>
                        <p className="font-mono text-[10px] text-zinc-500 mb-1">{item.repo}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => api.openBrowserUrl(item.downloadUrl)}
                          title="Open Repository on GitHub"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 rounded border border-zinc-700/50 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>GitHub</span>
                        </button>

                        {isInstalled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded">
                            <Check className="w-3 h-3" />
                            Installed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInstallFromGithubRepo(item.downloadUrl, item.name)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded border border-zinc-700/60 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-3 h-3" />
                            {isBusy ? "Cloning..." : "Install"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
