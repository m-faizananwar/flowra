import supabase from "./lib/supabase";

async function audit() {
  console.log("--- STARTING IDENTITY AUDIT ---");
  
  // 1. Check Humans
  const { data: humans } = await supabase.from("members").select("*");
  console.log(`Found ${humans?.length || 0} Humans:`);
  humans?.forEach(h => console.log(`- [${h.id}] Name: ${h.full_name}, Role: ${h.role}`));

  // 2. Check Profiles
  const { data: profiles } = await supabase.from("integration_members").select("*");
  console.log(`\nFound ${profiles?.length || 0} Integration Profiles:`);
  profiles?.forEach(p => console.log(`- [${p.id}] Service: ${p.service_name}, Username: ${p.username}, Linked to Human: ${p.member_id}, UserID: ${p.user_id}`));

  console.log("\n--- AUDIT COMPLETE ---");
}

audit();
