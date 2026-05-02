import React, { useState, useEffect } from 'react';
import { 
  XCircle, Github, ExternalLink, Zap, 
  CheckCircle2, Loader2, GitPullRequest, 
  GitBranch, GitCommit, ShieldCheck,
  RefreshCw, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface GitHubConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration?: any;
}

export default function GitHubConnectorModal({ isOpen, onClose, integration: initialData }: GitHubConnectorModalProps) {
  const [step, setStep] = useState(initialData ? 3 : 1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [integrationData, setIntegrationData] = useState<any>(initialData);

  // GitHub App Config (Should be in env)
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    checkUser();
  }, [isOpen]);

  useEffect(() => {
    setIntegrationData(initialData);
    setStep(initialData ? 3 : 1);
  }, [initialData]);

  useEffect(() => {
    if (isOpen && integrationData?.credentials?.installation_id) {
      fetchRepositories();
    }
  }, [isOpen, integrationData]);

  const fetchRepositories = async () => {
    const activeIntegration = integrationData || initialData;
    if (!activeIntegration?.id) return;

    setLoadingRepos(true);
    try {
      const { data, error } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('integration_id', activeIntegration.id)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setRepositories(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load repositories");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleInstallClick = () => {
    if (!user?.id) {
      toast.error("Authentication pending... please wait a second.");
      return;
    }
    const url = `/api/auth/github/install?user_id=${encodeURIComponent(user.id)}`;
    window.open(url, '_blank');
    setStep(2);
  };

  const handleCompleteSetup = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('service_name', 'github')
        .single();

      if (error || !data?.is_active || !data?.credentials?.installation_id) {
        toast.error("Waiting for GitHub handshake... Please finish installation.");
        return;
      }

      setIntegrationData(data);
      toast.success("GitHub App connection established!");
      setStep(3);
    } catch (err) {
      toast.error("Handshake pending...");
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-[#0D1117] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Github className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-widest">GitHub Tunnel</h3>
              <p className="text-xs text-white/40 font-medium">Link your repositories for real-time monitoring.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <XCircle className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-white' : 'bg-white/5'}`}
              />
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-white/40" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Install Flowra App</h4>
                <p className="text-sm text-white/40 leading-relaxed max-w-[320px] mx-auto mb-8">
                  Flowra uses a secure GitHub App to monitor your PRs and Commits without ever needing your personal password.
                </p>
                <button 
                  onClick={handleInstallClick}
                  className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  Install App on GitHub
                </button>
              </div>
              <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-black">
                Secure OAuth 2.0 // AES-256 Verified
              </p>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Finalizing Connection</h4>
                <p className="text-sm text-white/40 leading-relaxed mb-8">
                  Waiting for GitHub installation to complete. Please ensure you have selected the repositories you want to monitor.
                </p>
                <button 
                  onClick={handleCompleteSetup}
                  disabled={isConnecting}
                  className="w-full h-14 bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Verify Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-white/20 uppercase tracking-widest">Active Repositories</h4>
                <button 
                  onClick={handleInstallClick}
                  className="text-[10px] font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add More
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {loadingRepos ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Scanning Repositories...</p>
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="py-12 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
                    <Github className="w-8 h-8 text-white/5" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center px-8">
                      No repositories selected yet.<br/>Please update your GitHub App installation.
                    </p>
                  </div>
                ) : (
                  repositories.map((repo) => (
                    <div 
                      key={repo.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                          <GitBranch className="w-5 h-5 text-white/40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{repo.full_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[9px] font-black text-white/20 uppercase tracking-tighter">
                              <GitPullRequest className="w-2.5 h-2.5" /> 12 PRs
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-black text-white/20 uppercase tracking-tighter">
                              <GitCommit className="w-2.5 h-2.5" /> 450 Commits
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Monitoring</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-Sync
                </button>
                <button 
                  onClick={onClose}
                  className="flex-[2] h-12 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-[1.02] transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Flowra Matrix // GitHub v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-white/40 cursor-help">Need Help?</span>
          </div>
        </div>
      </div>
    </div>
  );
}
