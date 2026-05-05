import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { command, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    // 1. Authenticate the User
    let { data: integrations, error: dbError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service_name', 'jira')
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbError || !integrations || integrations.length === 0) {
      return NextResponse.json({ error: 'No Jira integration found. Please connect first.' }, { status: 404 });
    }

    let integration = integrations[0];
    let { access_token, cloud_id } = integration.credentials;

    // Helper for fetching with 401 retry
    const jiraFetch = async (url: string, options: any = {}) => {
        let res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json'
            }
        });

        if (res.status === 401) {
            console.log('Jira API 401 detected in Frontend. Fetching latest token from DB...');
            // Re-fetch from Supabase
            const { data: latest } = await supabase
                .from('integrations')
                .select('*')
                .eq('id', integration.id)
                .single();
            
            if (latest && latest.credentials.access_token !== access_token) {
                access_token = latest.credentials.access_token;
                console.log('New token found in DB. Retrying request...');
                res = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${access_token}`,
                        Accept: 'application/json'
                    }
                });
            }
        }
        return res;
    };

    // 2. Fetch User's Projects for Context
    const projRes = await jiraFetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/project`);
    const projectsResponse = await projRes.json();
    
    let projectsArr = [];
    if (Array.isArray(projectsResponse)) projectsArr = projectsResponse;
    else if (projectsResponse.values) projectsArr = projectsResponse.values;
    else if (projectsResponse.errorMessages) throw new Error(projectsResponse.errorMessages.join(', '));

    if (projectsArr.length === 0) {
        throw new Error(`You don't have any projects in Jira! Raw Response: ${JSON.stringify(projectsResponse)}`);
    }

    const availableProjects = projectsArr.map((p: any) => ({ key: p.key, name: p.name }));

    // ... (rest of the logic using jiraFetch)
    // Note: I will only update the main fetchers for now to demonstrate the fix.
    
    // 3. Initialize Groq AI
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'GROQ_API_KEY is missing in your .env file! Please add it and restart the server.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 4. Send to Groq for Natural Language Processing
    const systemPrompt = `
You are the Flowra Agentic AI, an advanced Agile Orchestrator designed to seamlessly translate natural language into precise Jira operations.
Your core directive is to process user commands, identify intent, and output highly structured, deterministic JSON.

### CONTEXT
You have access to the following Jira Projects for the current user:
${JSON.stringify(availableProjects, null, 2)}

### INSTRUCTIONS
1. Analyze the user's input to determine the primary Agile action.
2. If "create_card", deduce the target projectKey.
3. If "create_project", extract the desired 'projectName' and invent a short, uppercase 3-5 letter 'projectKey' for it.
4. If "transition_card" (or move card), identify the target 'issueKey' (e.g. "FURQAN-12") and the 'targetStatus' (e.g., "Done", "In Progress"). If the user uses a title instead of a key, try to infer the key if possible, or set it as the title and we'll handle it.
5. If the user asks to list projects, set action to "list_projects".

### OUTPUT SCHEMA
You must respond with ONLY valid JSON matching this schema exactly.
{
  "action": "create_card" | "list_projects" | "create_project" | "transition_card" | "unknown",
  "projectKey": "The exact key of the project",
  "projectName": "For create_project only",
  "issueKey": "FURQAN-12",
  "targetStatus": "Done",
  "issueType": "Task" | "Bug" | "Story",
  "summary": "Professional summary",
  "description": "Expanded description"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: command }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
    let responseMessage = "";
    let data = null;

    // 5. Execute Action based on AI Decision
    if (aiResponse.action === 'list_projects') {
        responseMessage = `I found ${projectsArr.length} projects.`;
        data = availableProjects;

    } else if (aiResponse.action === 'create_card') {
        
        const targetProjectKey = aiResponse.projectKey || projectsArr[0].key;

        // Try to create the issue
        const createRes = await jiraFetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/issue`, {
            method: 'POST',
            body: JSON.stringify({
                fields: {
                    project: { key: targetProjectKey },
                    summary: aiResponse.summary || `Flowra Auto-Card: ${command}`,
                    description: {
                        type: "doc",
                        version: 1,
                        content: [{ type: "paragraph", content: [{ type: "text", text: aiResponse.description || "Created via Flowra Agent" }] }]
                    },
                    issuetype: { name: aiResponse.issueType || "Task" }
                }
            })
        });

        const createData = await createRes.json();
        
        if (createData.errorMessages) {
             responseMessage = `Failed to create card in project ${targetProjectKey}: ${createData.errorMessages.join(", ")}`;
        } else {
             responseMessage = `Success! I created a card with key: ${createData.key} in project ${targetProjectKey}.`;
             data = createData;
        }

    } else if (aiResponse.action === 'create_project') {
        
        // 1. We must get the user's Account ID to be the project lead
        const meRes = await jiraFetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/myself`);
        const meData = await meRes.json();
        const accountId = meData.accountId;

        // 2. Create the project
        const createProjRes = await jiraFetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/project`, {
            method: 'POST',
            body: JSON.stringify({
                key: aiResponse.projectKey || "NEWP",
                name: aiResponse.projectName || "Flowra Auto Project",
                projectTypeKey: "software",
                projectTemplateKey: "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban",
                description: "Project created automatically by Flowra Agentic Orchestrator",
                leadAccountId: accountId
            })
        });

        const pData = await createProjRes.json();
        if (pData.errorMessages || pData.errors) {
            responseMessage = `Failed to create project: ${JSON.stringify(pData)}`;
        } else {
            responseMessage = `Boom! I just created a brand new project called "${aiResponse.projectName}" with Key: ${pData.projectKey}.`;
            data = pData;
        }

    } else if (aiResponse.action === 'transition_card') {
        
        // For moving cards, Jira requires us to get the available "Transition IDs" first
        const transRes = await jiraFetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/issue/${aiResponse.issueKey}/transitions`);
        const transData = await transRes.json();
        
        if (transData.errorMessages) {
             responseMessage = `I couldn't find the card ${aiResponse.issueKey}. Make sure you provide the exact Jira Key (e.g., FURQAN-11).`;
        } else {
             // Find a transition that matches the target status (e.g., "Done", "In Progress")
             const targetWord = (aiResponse.targetStatus || "Done").toLowerCase();
             const transition = transData.transitions.find((t: any) => t.name.toLowerCase().includes(targetWord) || t.to.name.toLowerCase().includes(targetWord));
             
             if (!transition) {
                 responseMessage = `Card found, but I couldn't find a valid way to move it to "${aiResponse.targetStatus}". Available moves: ${transData.transitions.map((t:any) => t.name).join(", ")}`;
             } else {
                 // Execute transition
                 const execRes = await jiraFetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/issue/${aiResponse.issueKey}/transitions`, {
                     method: 'POST',
                     body: JSON.stringify({ transition: { id: transition.id } })
                 });
                 
                 if (execRes.ok) {
                     responseMessage = `Successfully moved card ${aiResponse.issueKey} to ${transition.name}!`;
                 } else {
                     responseMessage = `Failed to move card. Jira rejected the transition.`;
                 }
             }
        }

    } else {
        responseMessage = "I didn't understand that command. Try asking me to 'Get projects', 'Create a card in the Furqan project', or 'Create a new project called Testing'.";
    }

    return NextResponse.json({
      message: responseMessage,
      details: data,
      ai_decision: aiResponse
    });

  } catch (error: any) {
    console.error('Agent Test Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
