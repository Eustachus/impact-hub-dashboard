const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const email = process.argv[2] || 'yefacoj448@smkanba.com';

  console.log(`Granting access to: ${email}\n`);

  // 1. Find user by email
  const { data: targetUser, error: userError } = await supabase
    .from('User')
    .select('id, name, email')
    .eq('email', email)
    .maybeSingle();

  if (userError || !targetUser) {
    console.error('User not found. They must register first at http://localhost:3000/register');
    process.exit(1);
  }

  console.log(`Found user: ${targetUser.name || 'No name'} (${targetUser.id})`);

  // 2. Get all workspaces that have projects
  const { data: projects } = await supabase
    .from('Project')
    .select('id, name, workspaceId');

  const workspaceIds = [...new Set((projects || []).map(p => p.workspaceId))];
  console.log(`Found ${workspaceIds.length} workspace(s) with ${projects?.length || 0} project(s)\n`);

  if (workspaceIds.length === 0) {
    console.log('No workspaces found.');
    return;
  }

  // 3. Check existing memberships
  const { data: existing } = await supabase
    .from('WorkspaceMember')
    .select('workspaceId')
    .eq('userId', targetUser.id)
    .in('workspaceId', workspaceIds);

  const existingIds = new Set((existing || []).map(m => m.workspaceId));
  const newIds = workspaceIds.filter(id => !existingIds.has(id));

  // 4. Add to new workspaces
  if (newIds.length === 0) {
    console.log('User is already a member of all workspaces.');
    return;
  }

  const inserts = newIds.map(workspaceId => ({
    userId: targetUser.id,
    workspaceId,
    role: 'MEMBER',
  }));

  const { error: insertError } = await supabase
    .from('WorkspaceMember')
    .insert(inserts);

  if (insertError) {
    console.error('Insert error:', insertError.message);
    process.exit(1);
  }

  // 5. Show results
  for (const workspaceId of newIds) {
    const wsProjects = (projects || []).filter(p => p.workspaceId === workspaceId);
    console.log(`  + Added to: ${wsProjects.map(p => p.name).join(', ')}`);
  }

  console.log(`\nDone. Added to ${newIds.length} workspace(s).`);
}

main();
