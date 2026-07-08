import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  XCircle, Search, Users, Settings2, Trash2, 
  ChevronDown, CheckCircle2, Save, AlertCircle,
  Hash, Shield, Cpu, ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const WORKSPACE_ROLES = ["Admin", "Developer", "Viewer", "Contributor", "Manager"];

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: any;
}

const PRESET_ROLES = [
  "Core Contributor",
  "Moderator",
  "Early Adopter",
  "Developer",
  "Designer",
  "Community Manager",
  "Strategic Partner"
];

const BrandIcons: Record<string, any> = {
  discord: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
    </svg>
  ),
  slack: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.52 2.521h-2.522v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.167 0a2.527 2.527 0 0 1 2.521 2.522v6.312zM15.167 18.958a2.528 2.528 0 0 1 2.521 2.522 2.528 2.528 0 0 1-2.521 2.52A2.528 2.528 0 0 1 12.646 21.48v-2.522h2.521zM15.167 17.688a2.527 2.527 0 0 1-2.521-2.521 2.527 2.527 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.167a2.528 2.528 0 0 1-2.521 2.521h-6.312z" />
    </svg>
  ),
  telegram: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.812 8.121l-1.994 9.404c-.15.674-.55 8.38-1.112.562l-3.037-2.237-1.462 1.406c-.162.162-.3.3-.612.3l.212-3.012 5.487-4.962c.237-.212-.05-.337-.362-.125l-6.787 4.275-2.925-.912c-.637-.2-.65-.637.137-.937l11.413-4.4c.525-.187.987.125.837.737z" />
    </svg>
  ),
  github: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
};

export default function MembersModal({ isOpen, onClose, integration }: MembersModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [integrationProfiles, setIntegrationProfiles] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<{ id: string, type: string } | null>(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState<string | null>(null);
  const [showFusionConfirm, setShowFusionConfirm] = useState<{
    primaryId: string;
    ghostId: string;
    ghostName: string;
    service: string;
  } | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: masterRows } = await supabase
        .from("members")
        .select("*")
        .eq("user_id", integration.user_id);

      const memberIds = (masterRows || []).map(m => m.id);

      const { data: profiles } = await supabase
        .from("integration_members")
        .select("*, integrations!inner(service_name)")
        .in("member_id", memberIds);

      const grouped: Record<string, any[]> = { github: [], discord: [], slack: [], telegram: [] };
      
      const { data: unlinkedProfiles } = await supabase
        .from("integration_members")
        .select("*, integrations!inner(service_name, user_id)")
        .is("member_id", null)
        .eq("integrations.user_id", integration.user_id);

      [...(profiles || []), ...(unlinkedProfiles || [])].forEach(p => {
        const serviceName = p.integrations?.service_name;
        if (!p || !serviceName) return;
        const svc = serviceName.toLowerCase();
        if (!grouped[svc]) grouped[svc] = [];
        if (!grouped[svc].find(gp => gp.id === p.id)) {
          grouped[svc].push(p);
        }
      });
      setIntegrationProfiles(grouped);

      const rowsWithLinks = (masterRows || []).map(row => {
        const links: Record<string, any> = {};
        profiles?.forEach(p => {
          const serviceName = p.integrations?.service_name || p.service_name;
          if (p.member_id === row.id && serviceName) {
            links[serviceName.toLowerCase()] = p;
          }
        });
        return { ...row, links };
      });

      setMembers(rowsWithLinks);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [integration]);

  useEffect(() => {
    if (isOpen) Promise.resolve().then(fetchAllData);
  }, [isOpen, fetchAllData]);

  const handleStartEdit = (member: any) => {
    setEditingId(member.id);
    setPendingChanges({
      full_name: member.full_name,
      alias: member.alias,
      role: member.role,
      links: { ...member.links }
    });
  };

  const handleApplyPendingChanges = async (isFusionConfirmed = false) => {
    if (!editingId || !pendingChanges) return;

    // 0. Pre-Check for Fusion (Merging two Humans)
    if (!isFusionConfirmed) {
      for (const svc of ['github', 'discord', 'slack', 'telegram']) {
        const pendingProfile = pendingChanges.links[svc];
        const originalProfile = (members.find(m => m.id === editingId))?.links[svc];
        
        if (pendingProfile && pendingProfile.member_id && pendingProfile.member_id !== editingId && JSON.stringify(pendingProfile) !== JSON.stringify(originalProfile)) {
          setShowFusionConfirm({
            primaryId: editingId,
            ghostId: pendingProfile.member_id,
            ghostName: members.find(m => m.id === pendingProfile.member_id)?.full_name || "Another Human",
            service: svc
          });
          setShowSaveConfirm(null);
          return; // Stop and wait for fusion confirmation
        }
      }
    }

    setSaving(editingId);
    try {
      const original = members.find(m => m.id === editingId);
      if (!original) return;

      const currentSvc = integration.service_name?.toLowerCase();

      // 1. Update Member Table (Primary Overrides)
      const updates: any = {};
      if (pendingChanges.full_name !== original.full_name) updates.full_name = pendingChanges.full_name;
      if (pendingChanges.alias !== original.alias) updates.alias = pendingChanges.alias;
      if (pendingChanges.role !== original.role) updates.role = pendingChanges.role;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("members").update(updates).eq("id", editingId);
        if (error) throw error;
      }

      // 2. Handle Link Changes and FUSION
      for (const svc of ['github', 'discord', 'slack', 'telegram']) {
        const pendingProfile = pendingChanges.links[svc];
        const originalProfile = original.links[svc];

        if (JSON.stringify(pendingProfile) !== JSON.stringify(originalProfile)) {
          // Unlink old if it existed
          if (originalProfile) {
            await supabase.from("integration_members").update({ member_id: null }).eq("id", originalProfile.id);
          }

          // Link new with FUSION logic
          if (pendingProfile) {
            // If this profile already belongs to another Human, MERGE them
            if (pendingProfile.member_id && pendingProfile.member_id !== editingId) {
              console.log(`FUSION: Merging Ghost Member ${pendingProfile.member_id} into Primary ${editingId}`);
              
              const { error: mergeError } = await supabase.rpc('merge_members', {
                target_member_id: editingId,
                source_member_id: pendingProfile.member_id,
                // If we are linking from THIS service's modal, let this service's data override the Human
                new_name: currentSvc === svc ? pendingProfile.username : undefined,
                new_alias: currentSvc === svc ? pendingProfile.username : undefined
              });

              if (mergeError) throw mergeError;
            } else {
              // Normal Link
              const { error } = await supabase
                .from("integration_members")
                .update({ member_id: editingId })
                .eq("id", pendingProfile.id);
              if (error) throw error;
            }
          }
        }
      }

      toast.success(isFusionConfirmed ? "Identity Fusion Successful" : "Identity Updated");
      setEditingId(null);
      setPendingChanges(null);
      setShowSaveConfirm(null);
      setShowFusionConfirm(null);
      await fetchAllData();
    } catch (err: any) {
      console.error(err);
      toast.error("Process failed: " + err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveIdentity = async (id: string) => {
    try {
      // CASCADE: Deleting the member now automatically wipes all integration_members via DB constraint
      const { error: memberError } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      
      if (memberError) throw memberError;

      setMembers(members.filter(m => m.id !== id));
      toast.success("Identity and all links wiped successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Deep Wipe failed: " + err.message);
    }
  };

  const handleAddMember = async () => {
    const { data, error } = await supabase
      .from("members")
      .insert([{ 
        user_id: integration.user_id,
        full_name: "New Member",
        alias: "@new_member",
        role: "New Role"
      }])
      .select()
      .single();
    
    if (!error && data) {
      setMembers([...members, { ...data, links: {} }]);
      handleStartEdit({ ...data, links: {} });
      toast.success("New member created");
    }
  };

  const [showAll, setShowAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentService = integration.service_name?.toLowerCase();
  const BrandLogo = BrandIcons[currentService] || Users;

  const filteredMembers = members.filter(m => {
    if (editingId === m.id) return true;
    const matchesSearch = 
      m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // Contextual Filter: Only show members linked to this platform unless showAll is active
    if (showAll) return true;
    const svc = integration.service_name?.toLowerCase();
    return !!m.links?.[svc];
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-[1450px] bg-[#0F0F12] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] flex flex-col h-[85vh] animate-in zoom-in-95 duration-300 mx-4">
        
        {showFusionConfirm && (
          <div className="absolute inset-0 z-[210] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#16161A] border border-violet-500/50 p-10 rounded-[2.5rem] max-w-md w-full shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)] animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              
              <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-8 relative">
                <Cpu className="w-10 h-10 text-violet-400 animate-pulse" />
                <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
              </div>

              <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Identity Fusion</h4>
              
              <div className="space-y-4 mb-10 text-left">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Primary Record</p>
                    <p className="text-sm font-bold text-emerald-400">{pendingChanges.full_name}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-[#16161A] p-1 rounded-full border border-white/10">
                    <ChevronDown className="w-4 h-4 text-white/20" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-widest mb-1">Ghost Record (To be Deleted)</p>
                    <p className="text-sm font-bold text-rose-500/60 line-through decoration-rose-500/40">{showFusionConfirm.ghostName}</p>
                  </div>
                  <XCircle className="w-5 h-5 text-rose-500/40" />
                </div>

                <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Data Override Protocol
                  </p>
                  <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                    Since you are linking via <span className="text-violet-400 font-bold uppercase">{showFusionConfirm.service}</span>, that platform&apos;s alias and identity data will become the <b>new primary</b> for this Human.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowFusionConfirm(null)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest transition-all border border-white/5"
                >
                  Abort
                </button>
                <button 
                  onClick={() => handleApplyPendingChanges(true)}
                  className="flex-[1.5] px-6 py-4 bg-violet-500 hover:bg-violet-600 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest transition-all shadow-[0_20px_40px_-10px_rgba(139,92,246,0.5)] border border-violet-400/50"
                >
                  Confirm Fusion
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveConfirm && (
          <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#16161A] border border-emerald-500/30 p-8 rounded-3xl max-w-sm w-full shadow-2xl shadow-emerald-500/10 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Save className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Save Changes?</h4>
              <p className="text-sm text-white/40 mb-8 leading-relaxed">This will update the identity across all connected platforms. This action is secure and verified.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveConfirm(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => handleApplyPendingChanges()}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-emerald-500/20"
                >
                  {saving ? "Saving..." : "Confirm Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#16161A] border border-rose-500/30 p-8 rounded-3xl max-w-sm w-full shadow-2xl shadow-rose-500/10 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Delete Identity?</h4>
              <p className="text-sm text-white/40 mb-8 leading-relaxed">This will permanently remove this identity row and all linked integration profiles.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { handleRemoveIdentity(confirmDelete!); setConfirmDelete(null); }}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-rose-500/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-inner group overflow-hidden">
                <BrandLogo className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent pointer-events-none" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.1em] flex items-center gap-3">
                {integration.service_name} Members
                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-1 rounded border border-violet-500/30 tracking-widest font-black uppercase">Secure</span>
              </h3>
              <p className="text-sm text-white/40 font-medium">Manage platform accounts and assignments for your {integration.service_name} team.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1 mr-2">
              <button 
                onClick={() => setShowAll(false)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  !showAll ? "bg-violet-600 text-white shadow-lg" : "text-white/30 hover:text-white"
                )}
              >
                {integration.service_name} Only
              </button>
              <button 
                onClick={() => setShowAll(true)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  showAll ? "bg-violet-600 text-white shadow-lg" : "text-white/30 hover:text-white"
                )}
              >
                Show All
              </button>
            </div>
            <button 
              onClick={handleAddMember}
              className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/20 flex items-center gap-3 border border-violet-400/50 group"
            >
              <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Add Member
            </button>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-rose-500/10 flex items-center justify-center transition-all border border-white/10 group"
            >
              <XCircle className="w-6 h-6 text-white/20 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="px-8 py-5 bg-white/[0.02] border-b border-white/5 flex items-center gap-4 flex-shrink-0">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text"
              placeholder={`Quick search across all ${showAll ? 'team identities' : integration.service_name + ' members'}...`}
              className="w-full bg-black/60 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar px-8 pb-10">
          <div className="min-w-[1350px] space-y-4 pr-12">
            {/* Unified Header */}
            <div className="grid grid-cols-[2.6fr_1.6fr_1fr_1fr_1fr_1fr_140px] gap-8 px-12 py-6 bg-white/[0.03] rounded-[2.5rem] border border-white/5 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] items-center mt-6 sticky top-0 z-20 backdrop-blur-xl">
              <div>Team Alias</div>
              <div>Prof. Role</div>
              <div className="flex items-center gap-2"><BrandIcons.github className="w-4 h-4 opacity-60" /> GitHub</div>
              <div className="flex items-center gap-2"><BrandIcons.discord className="w-4 h-4 opacity-60" /> Discord</div>
              <div className="flex items-center gap-2"><BrandIcons.slack className="w-4 h-4 opacity-60" /> Slack</div>
              <div className="flex items-center gap-2"><BrandIcons.telegram className="w-4 h-4 opacity-60" /> Telegram</div>
              <div className="text-right pr-4">Actions</div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-5">
                <div className="w-12 h-12 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 shadow-2xl">
                  <BrandLogo className="w-10 h-10 text-white/10" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">No members found</h4>
                <p className="text-sm text-white/30 max-w-[340px] leading-relaxed mx-auto font-medium">
                  {searchQuery 
                    ? `No identities match your search for "${searchQuery}". Try a different term or show all workspace members.`
                    : `This list is empty. Connect a ${integration.service_name} bot or add a member manually to begin.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => {
                  const isEditing = editingId === member.id;
                  return (
                    <div 
                      key={member.id}
                      className={cn(
                        "group relative rounded-[2rem] border transition-all duration-500",
                        isEditing 
                          ? "bg-violet-600/[0.08] border-violet-500/50 shadow-[0_20px_50px_-20px_rgba(139,92,246,0.4)] ring-1 ring-violet-500/20 z-[100]" 
                          : "bg-white/[0.02] border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] hover:translate-y-[-2px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
                      )}
                    >
                      {isEditing && <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,1)] rounded-l-[2rem]" />}
                      <div className={cn(
                        "grid grid-cols-[2.6fr_1.6fr_1fr_1fr_1fr_1fr_140px] gap-8 items-center px-12 transition-all duration-500",
                        isEditing ? "py-8" : "py-7"
                      )}>
                        <div className="relative">
                          {isEditing ? (
                            <div className="flex flex-col gap-2 animate-in slide-in-from-left-2 duration-300">
                              <input 
                                type="text"
                                autoFocus
                                value={pendingChanges?.full_name || ""}
                                onChange={(e) => setPendingChanges({ ...pendingChanges, full_name: e.target.value, alias: e.target.value.toLowerCase().startsWith('@') ? e.target.value.toLowerCase() : `@${e.target.value.toLowerCase().replace(/\s+/g, '_')}` })}
                                className="w-full bg-black/60 border border-violet-500/40 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-all shadow-inner font-bold"
                                placeholder="Primary Identity"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-5">
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex-shrink-0 shadow-2xl group-hover:border-violet-500/50 transition-colors">
                                {member.avatar_url ? (
                                  <Image src={member.avatar_url} alt="" className="w-full h-full object-cover" unoptimized />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-violet-500/10">
                                    <Users className="w-7 h-7 text-violet-400/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-lg font-black text-white group-hover:text-violet-400 transition-colors truncate tracking-tight leading-none">{member.full_name || "Unnamed Entity"}</span>
                                <span className="text-[11px] text-white/30 font-black uppercase tracking-[0.2em] mt-1 truncate">{member.alias || "@unknown"}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="relative dropdown-container">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => setActiveDropdown(activeDropdown?.id === member.id && activeDropdown.type === 'role' ? null : { id: member.id, type: 'role' })}
                                className="w-full bg-black/60 border border-violet-500/40 rounded-xl py-3 px-4 text-xs text-white flex items-center justify-between hover:border-violet-500 transition-all shadow-inner"
                              >
                                <span className={cn("truncate", !pendingChanges?.role && "text-white/20")}>{pendingChanges?.role || "Role"}</span>
                                <ChevronDown className="w-4 h-4 text-violet-400" />
                              </button>
                              {activeDropdown?.id === member.id && activeDropdown.type === 'role' && (
                                <div className="absolute top-[110%] left-0 w-64 bg-[#16161A] border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-[200] overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-2xl ring-1 ring-white/5">
                                  <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 px-3 py-1">Select Role</span>
                                  </div>
                                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                                    {WORKSPACE_ROLES.map((role) => (
                                      <button
                                        key={role}
                                        onClick={() => {
                                          setPendingChanges({ ...pendingChanges, role });
                                          setActiveDropdown(null);
                                        }}
                                        className={cn(
                                          "w-full text-left px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-between group/item",
                                          pendingChanges?.role === role ? "bg-violet-600 text-white font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                                        )}
                                      >
                                        <span>{role}</span>
                                        {pendingChanges?.role === role && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="inline-flex px-5 py-2.5 rounded-2xl bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest shadow-[0_15px_25px_-5px_rgba(139,92,246,0.6)] border border-violet-400/50 hover:bg-violet-500 transition-all cursor-default group-hover:scale-105">
                              {member.role || "UNASSIGNED"}
                            </div>
                          )}
                        </div>

                        {['github', 'discord', 'slack', 'telegram'].map((svc, idx) => {
                          const linkedProfile = member.links?.[svc.toLowerCase()];
                          const profiles = integrationProfiles[svc.toLowerCase()] || [];
                          const dropdownId = `${member.id}-${svc}`;
                          
                          return (
                            <div key={svc} className="relative dropdown-container">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={() => setActiveDropdown(activeDropdown?.id === dropdownId ? null : { id: dropdownId, type: svc })}
                                    className={cn(
                                      "w-full rounded-xl py-3 px-4 text-[10px] flex items-center justify-between transition-all border font-black uppercase tracking-widest shadow-inner",
                                      pendingChanges?.links?.[svc] 
                                        ? "bg-white text-black border-white shadow-lg" 
                                        : "bg-black/60 border-white/10 text-white/30 hover:border-violet-500/50"
                                    )}
                                  >
                                    <span className="truncate">{pendingChanges?.links?.[svc] ? pendingChanges.links[svc].username : "LINK"}</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                                  </button>
                                  {activeDropdown?.id === dropdownId && (
                                    <div className="absolute top-[110%] left-0 w-64 bg-[#16161A] border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-[200] overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-2xl ring-1 ring-white/5">
                                      <div className="p-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Link {svc}</span>
                                        <div className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[8px] font-bold uppercase tracking-tighter border border-violet-500/20">
                                          {profiles.length} Found
                                        </div>
                                      </div>
                                      <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                                        {profiles.length === 0 ? (
                                          <div className="p-8 text-center">
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No profiles found</p>
                                          </div>
                                        ) : (
                                          profiles.map((profile: any) => (
                                            <button
                                              key={profile.id}
                                              onClick={() => {
                                                setPendingChanges({
                                                  ...pendingChanges,
                                                  links: {
                                                    ...pendingChanges.links,
                                                    [svc]: profile
                                                  }
                                                });
                                                setActiveDropdown(null);
                                              }}
                                              className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-between group/item",
                                                pendingChanges?.links?.[svc]?.username === profile.username 
                                                  ? "bg-violet-600 text-white font-bold" 
                                                  : "text-white/60 hover:bg-white/5 hover:text-white"
                                              )}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                                                  {(profile.avatar_url || profile.metadata?.avatar_url) ? (
                                                    <Image src={profile.avatar_url || profile.metadata.avatar_url} alt="" className="w-full h-full object-cover" unoptimized />
                                                  ) : (
                                                    <Users className="w-3.5 h-3.5 opacity-20" />
                                                  )}
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="font-bold">{profile.username}</span>
                                                  <span className="text-[8px] opacity-40 uppercase tracking-tighter">ID: {profile.external_id?.slice(0, 8)}...</span>
                                                </div>
                                              </div>
                                              {pendingChanges?.links?.[svc]?.username === profile.username && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center">
                                  {linkedProfile ? (
                                    <div className="px-4 py-2.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white shadow-[0_15px_30px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-110 hover:shadow-[0_20px_40px_-5px_rgba(255,255,255,0.6)]">
                                      <div className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,1)] animate-pulse" />
                                      <span className="truncate max-w-[80px]">{linkedProfile.username}</span>
                                    </div>
                                  ) : (
                                    <div className="px-4 py-2.5 rounded-2xl bg-white/[0.05] text-white/20 border border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-white/10" />
                                      NONE
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="flex items-center justify-end gap-3 pr-2">
                          <button 
                            onClick={() => isEditing ? setShowSaveConfirm(member.id) : handleStartEdit(member)}
                            className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl group",
                              isEditing 
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/40 border border-emerald-400" 
                                : "bg-white/[0.05] text-white/40 hover:bg-violet-600 hover:text-white hover:shadow-violet-600/40 border border-white/10 hover:border-violet-400"
                            )}
                          >
                            {isEditing ? <Save className="w-6 h-6" /> : <Settings2 className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />}
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(member.id)}
                            className="w-12 h-12 flex items-center justify-center bg-white/[0.05] text-white/40 hover:bg-rose-600 hover:text-white hover:shadow-rose-600/40 border border-white/10 hover:border-rose-400 rounded-2xl transition-all shadow-xl group"
                          >
                            <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between text-white/20 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
              {members.length} Identities Verified
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/10 italic">Integration Matrix System</span>
            <span className="text-white/40 font-black">•</span>
            <span>v3.5.0-SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
