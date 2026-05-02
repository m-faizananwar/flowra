"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Settings2, 
  Trash2, 
  Link as LinkIcon, 
  UserCircle, 
  Search,
  ExternalLink,
  Save,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: any;
}

export default function MembersModal({ isOpen, onClose, integration }: MembersModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [allHumans, setAllHumans] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allConnections, setAllConnections] = useState<Record<string, string[]>>({});
  const [activeDropdown, setActiveDropdown] = useState<{ id: string, type: 'role' | 'link' } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdown && !(e.target as HTMLElement).closest('.relative')) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchAllHumans();
    }
  }, [isOpen, integration.id]);

  const handleRemoveIdentity = async (id: string) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setAllHumans(allHumans.filter(h => h.id !== id));
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data: intMembers, error } = await supabase
      .from("integration_members")
      .select(`
        *,
        members (*)
      `)
      .eq("integration_id", integration.id)
      .order("created_at", { ascending: false });

    if (!error && intMembers) {
      setMembers(intMembers);
      
      // Fetch connections for all members found
      const memberIds = intMembers.map(m => m.member_id).filter(Boolean);
      if (memberIds.length > 0) {
        const { data: otherConns } = await supabase
          .from("integration_members")
          .select("member_id, integrations(service_name)")
          .in("member_id", memberIds);
        
        const connMap: Record<string, string[]> = {};
        otherConns?.forEach(conn => {
          if (!connMap[conn.member_id]) connMap[conn.member_id] = [];
          const svc = (conn.integrations as any)?.service_name;
          if (svc && !connMap[conn.member_id].includes(svc)) {
            connMap[conn.member_id].push(svc);
          }
        });
        setAllConnections(connMap);
      }
    }
    setLoading(false);
  };

  const fetchAllHumans = async () => {
    const { data: humans } = await supabase
      .from("members")
      .select("*")
      .eq("user_id", integration.user_id);
    
    if (humans && humans.length > 0) {
      const { data: conns } = await supabase
        .from("integration_members")
        .select("member_id, integrations(service_name)")
        .in("member_id", humans.map(h => h.id));

      const newConnMap = { ...allConnections };
      conns?.forEach(conn => {
        if (!newConnMap[conn.member_id]) newConnMap[conn.member_id] = [];
        const svc = (conn.integrations as any)?.service_name;
        if (svc && !newConnMap[conn.member_id].includes(svc)) {
          newConnMap[conn.member_id].push(svc);
        }
      });
      setAllConnections(newConnMap);
      setAllHumans(humans);
    }
  };

  const PRESET_ROLES = [
    "Architect",
    "Software Engineer",
    "AI Engineer",
    "Product Designer",
    "Product Manager",
    "QA Engineer",
    "DevOps"
  ];

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setSaving(memberId);
    const { error } = await supabase
      .from("members")
      .update({ role: newRole })
      .eq("id", memberId);
    
    if (!error) {
      setMembers(members.map(m => m.members?.id === memberId ? { ...m, members: { ...m.members, role: newRole } } : m));
    }
    setSaving(null);
  };

  const handleUpdateAlias = async (memberId: string, newAlias: string) => {
    setSaving(memberId);
    const { error } = await supabase
      .from("members")
      .update({ full_name: newAlias })
      .eq("id", memberId);
    
    if (!error) {
      setMembers(members.map(m => m.members?.id === memberId ? { ...m, members: { ...m.members, full_name: newAlias } } : m));
    }
    setSaving(null);
  };

  const handleLinkMember = async (intMemberId: string, humanId: string) => {
    setSaving(intMemberId);
    const { error } = await supabase
      .from("integration_members")
      .update({ member_id: humanId })
      .eq("id", intMemberId);
    
    if (!error) {
      await fetchMembers();
      setEditingId(null);
    }
    setSaving(null);
  };

  if (!isOpen) return null;

  const filteredMembers = members.filter(m => 
    m.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-6xl bg-[#0F0F12] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col h-[85vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-inner">
              <Users className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Identity & Role Management</h3>
              <p className="text-sm text-white/40 font-medium">Define roles and bridge platform profiles to unified identities.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center transition-all border border-transparent hover:border-white/10 group"
          >
            <XCircle className="w-7 h-7 text-white/20 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Search members by name or username..."
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition-all focus:bg-black/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/30 text-sm font-medium tracking-wide animate-pulse uppercase">Synchronizing Identities...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">No profiles captured yet</h4>
              <p className="text-sm max-w-[300px] leading-relaxed">Profiles will appear here automatically as soon as the bot detects activity in your channels.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-40">
              {filteredMembers.map((member) => {
                const isEditing = editingId === member.id;
                const connections = member.member_id ? allConnections[member.member_id] || [] : [];
                const currentRole = member.members?.role || "";
                const isCustomRole = currentRole && !PRESET_ROLES.includes(currentRole);
                
                return (
                  <div 
                    key={member.id}
                    className={cn(
                      "group relative rounded-2xl border transition-all duration-500",
                      isEditing 
                        ? "bg-violet-500/[0.03] border-violet-500/30 shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)]" 
                        : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="p-5 flex items-center gap-6">
                      {/* Member Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-black flex-shrink-0 shadow-lg">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                              <UserCircle className="w-6 h-6 text-violet-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white font-bold text-base truncate">{member.display_name}</span>
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded">@{member.username}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ID: {member.external_user_id}
                            </div>
                            {member.members?.role && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[9px] text-violet-300 font-bold uppercase tracking-widest">
                                {member.members.role}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connections Column */}
                      <div className="hidden md:flex flex-col items-center gap-1.5 min-w-[100px]">
                        <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Footprint</span>
                        <div className="flex items-center gap-1">
                          {connections.length > 0 ? connections.map(svc => (
                            <div key={svc} title={svc} className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                              {svc === 'discord' && <div className="w-3 h-3 bg-[#5865F2] rounded-full" />}
                              {svc === 'slack' && <div className="w-3 h-3 bg-[#E01E5A] rounded-full" />}
                              {svc === 'telegram' && <div className="w-3 h-3 bg-[#0088cc] rounded-full" />}
                            </div>
                          )) : (
                            <span className="text-[9px] text-white/10 italic">Single</span>
                          )}
                        </div>
                      </div>

                      {/* Fields Column */}
                      <div className="flex items-center gap-4">
                        {/* Global Alias */}
                        <div className="flex flex-col gap-1 w-32">
                          <label className="text-[9px] text-white/20 font-black uppercase tracking-widest pl-1">Global Alias</label>
                          {isEditing ? (
                            <input 
                              type="text"
                              defaultValue={member.members?.full_name}
                              onBlur={(e) => handleUpdateAlias(member.members?.id, e.target.value)}
                              className="w-full bg-black/60 border border-violet-500/30 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500/60 transition-all"
                              placeholder="Name..."
                            />
                          ) : (
                            <div className="py-2 px-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white/80 font-medium truncate">
                              {member.members?.full_name || "—"}
                            </div>
                          )}
                        </div>

                        {/* Professional Role */}
                        <div className="flex flex-col gap-1 w-44 relative">
                          <label className="text-[9px] text-white/20 font-black uppercase tracking-widest pl-1">Prof. Role</label>
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5">
                              <button 
                                onClick={() => setActiveDropdown(activeDropdown?.id === member.id && activeDropdown.type === 'role' ? null : { id: member.id, type: 'role' })}
                                className="w-full bg-black/60 border border-violet-500/30 rounded-xl py-2 px-3 text-xs text-white flex items-center justify-between hover:border-violet-500/60 transition-all"
                              >
                                <span className="truncate">{isCustomRole ? "Custom..." : (currentRole || "Select Role...")}</span>
                                <ChevronDown className={cn("w-3 h-3 text-white/20 transition-transform", activeDropdown?.id === member.id && activeDropdown.type === 'role' && "rotate-180")} />
                              </button>
                              
                              {activeDropdown?.id === member.id && activeDropdown.type === 'role' && (
                                <div className="absolute top-[110%] left-0 w-full bg-[#16161A] border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                    <button 
                                      onClick={() => { handleUpdateRole(member.members?.id, ""); setActiveDropdown(null); }}
                                      className="w-full text-left px-3 py-2 text-[11px] text-white/40 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                      No Role
                                    </button>
                                    {PRESET_ROLES.map(r => (
                                      <button 
                                        key={r}
                                        onClick={() => { handleUpdateRole(member.members?.id, r); setActiveDropdown(null); }}
                                        className="w-full text-left px-3 py-2 text-[11px] text-white/80 hover:bg-violet-500/20 hover:text-white rounded-lg transition-colors flex items-center justify-between group"
                                      >
                                        {r}
                                        {currentRole === r && <CheckCircle2 className="w-3 h-3 text-violet-400" />}
                                      </button>
                                    ))}
                                    <button 
                                      onClick={() => { setActiveDropdown({ id: member.id, type: 'role' }); /* Keep open to show input */ }}
                                      className="w-full text-left px-3 py-2 text-[11px] text-violet-400 font-bold hover:bg-violet-500/10 rounded-lg transition-colors"
                                    >
                                      Custom...
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {(isCustomRole || (activeDropdown?.id === member.id && activeDropdown.type === 'role')) && (
                                <input 
                                  type="text"
                                  autoFocus={isCustomRole}
                                  placeholder="Enter custom role..."
                                  defaultValue={isCustomRole ? currentRole : ""}
                                  onBlur={(e) => {
                                    if (e.target.value) handleUpdateRole(member.members?.id, e.target.value);
                                  }}
                                  className="w-full bg-violet-500/5 border border-violet-500/30 rounded-xl py-2 px-3 text-[10px] text-violet-200 placeholder:text-violet-500/40 focus:outline-none focus:border-violet-500/60 transition-all animate-in slide-in-from-top-1"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="py-2 px-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-violet-300/80 font-bold tracking-tight truncate">
                              {member.members?.role || "—"}
                            </div>
                          )}
                        </div>

                        {/* Identity Link */}
                        <div className="flex flex-col gap-1 w-44 relative">
                          <label className="text-[9px] text-white/20 font-black uppercase tracking-widest pl-1">Identity Link</label>
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => setActiveDropdown(activeDropdown?.id === member.id && activeDropdown.type === 'link' ? null : { id: member.id, type: 'link' })}
                                className="w-full bg-black/60 border border-violet-500/30 rounded-xl py-2 px-3 text-xs text-white flex items-center justify-between hover:border-violet-500/60 transition-all"
                              >
                                <span className="truncate">{member.members?.full_name || "Unlinked Profile"}</span>
                                <ChevronDown className={cn("w-3 h-3 text-white/20 transition-transform", activeDropdown?.id === member.id && activeDropdown.type === 'link' && "rotate-180")} />
                              </button>

                              {activeDropdown?.id === member.id && activeDropdown.type === 'link' && (
                                <div className="absolute top-[110%] left-0 w-full bg-[#16161A] border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                                    <button 
                                      onClick={() => { handleLinkMember(member.id, ""); setActiveDropdown(null); }}
                                      className="w-full text-left px-3 py-2 text-[11px] text-white/40 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                      Unlink Profile
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    {allHumans.map(human => {
                                      const footprint = allConnections[human.id] || [];
                                      return (
                                        <div 
                                          key={human.id}
                                          className="w-full flex items-center gap-1 group/item px-1"
                                        >
                                          <button 
                                            onClick={() => { handleLinkMember(member.id, human.id); setActiveDropdown(null); }}
                                            className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-violet-500/20 group transition-all"
                                          >
                                            <div className="flex items-center justify-between mb-0.5">
                                              <span className="text-[11px] text-white group-hover:text-white font-medium">{human.full_name || 'Unnamed'}</span>
                                              {member.member_id === human.id && <CheckCircle2 className="w-3 h-3 text-violet-400" />}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                              {footprint.map(svc => (
                                                <span key={svc} className="text-[8px] uppercase font-black tracking-tighter text-white/40 group-hover:text-violet-300">{svc}</span>
                                              ))}
                                              {footprint.length === 0 && <span className="text-[8px] text-white/20">Empty Identity</span>}
                                            </div>
                                          </button>
                                          {footprint.length === 0 && (
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleRemoveIdentity(human.id); }}
                                              className="p-2 text-white/20 hover:text-rose-500 transition-colors"
                                              title="Delete Empty Identity"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 py-2 px-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white/80 font-medium">
                              <LinkIcon className="w-3 h-3 text-white/20" />
                              <span className="truncate">{member.members?.full_name || "Unlinked"}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingId(isEditing ? null : member.id)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border group",
                            isEditing 
                              ? "bg-violet-500 text-white border-violet-400" 
                              : "bg-white/5 text-white/20 border-white/10 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10"
                          )}
                        >
                          {isEditing ? <CheckCircle2 className="w-5 h-5" /> : <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform" />}
                        </button>
                        
                        {saving === member.id && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 animate-in fade-in duration-200">
                            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
              {members.length} Total Nodes
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              {allHumans.length} Unified Identities
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/10">Flowra Identity Layer</span>
            <span className="text-white/40 font-black">•</span>
            <span>v2.5.0-PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
