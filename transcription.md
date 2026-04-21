# Flowra – Stakeholder Interview Transcript

**Date:** April 21, 2026
**Participants:**
- Faizan Anwar — Interviewer / Project Lead, Flowra
- Tanguy De Branbandre — Stakeholder / CEO, LYTE Studios
**Duration:** 36 minutes 14 seconds
**Format:** Video Call (Recorded)

---

[00:00:00] **Faizan:** Okay I think — yeah, yeah the recording's going. Okay. Let me just — alright, I can see myself on screen. Good. And I can see you, Tanguy?

[00:00:10] **Tanguy:** Yeah yeah, I'm here. Can you hear me alright?

[00:00:13] **Faizan:** Yeah, clear. Perfect. Okay, good. Uhh — and I realize the irony of opening a meeting about an AI monitoring tool by saying "yes I'm recording you right now." [laughs]

[00:00:24] **Tanguy:** [laughs] Yeah, it's already very on-brand for what you're building. Flowra is basically already here.

[00:00:30] **Faizan:** [laughs] Right, exactly. It just hasn't launched yet. Okay. Okay — Tanguy! Good to finally have you here man. Like, seriously.

[00:00:39] **Tanguy:** Hey! Yeah, good to be here. Good to see you.

[00:00:42] **Faizan:** Good to see you too. And uhh — okay, first things first — it genuinely means a lot that you made time for this. Like I know your calendar is absolutely insane and I— I don't take that for granted at all.

[00:00:53] **Tanguy:** No no, I'm happy to be here. You reached out and I was like, yeah, let's do it. So, here I am.

[00:00:59] **Faizan:** Here you are. [laughs] Okay so — for anyone watching this later, we have Tanguy De Branbandre with us today. He is the founder and CEO of LYTE Studios. And Tanguy — okay, I say this every time I talk about you — you are not just the guy who sits in the meeting and nods at things. You are an active senior backend developer, you're a Flutter developer as well, and you are simultaneously building and running multiple products. Like we're talking Fixie, Tinrate, Jobr, Workr — that is four products right now.

[00:01:33] **Tanguy:** [laughs] Yeah. Give or take. It's a lot, I'll be honest.

[00:01:37] **Faizan:** How— how are you even functioning right now? Like, genuinely. How?

[00:01:42] **Tanguy:** [laughs] Coffee. A lot of coffee. And— and a really good team, honestly. Like I couldn't do any of it without the team. That's not a cliché, it's actually true.

[00:01:52] **Faizan:** That's real. And — speaking of teams, that's kind of the whole thread of what I want to talk about today. But first — give me like the quick version of what LYTE Studios actually is. Like for someone watching this with no context.

[00:02:06] **Tanguy:** Sure, yeah. So — LYTE Studios is kind of the umbrella. We build tools, mostly around developer tooling, community management, workflow automation. A lot of backend-heavy work, some Flutter on the mobile side. And the through-line across everything is like — we're trying to help teams and communities communicate better and move faster. That's the common thread.

[00:02:29] **Faizan:** Yeah. And— like you're not just operating from the manager side of that, right? Like you're actually in the code yourself. You ship code.

[00:02:37] **Tanguy:** Yeah, exactly. I'm still very much in the weeds on the technical side. Like I think that's important — if you're building developer tools you probably should be a developer yourself. Otherwise you're just guessing at what people actually need.

[00:02:50] **Faizan:** Right, you have that like, dual perspective. You're a builder and you manage builders. And that's exactly why I wanted you here specifically for this. Because honestly, for what we're building, I needed someone who understood both sides of that equation. And you've been in this space for what, five, six years?

[00:03:08] **Tanguy:** Yeah, around five or six years actively. Building, managing, the whole cycle.

[00:03:13] **Faizan:** And in that time you've seen teams at literally every stage, right? Early stage, scaling stage, distributed teams —

[00:03:20] **Tanguy:** Yeah. All of it. I've worked with very early teams — like three people in a Discord server kind of thing — all the way up to more structured engineering orgs. So yeah, I've seen the full range.

[00:03:31] **Faizan:** Perfect. And look, being the best person I could get in this meeting for this specific topic — that is genuinely not an exaggeration. I mean that.

[00:03:41] **Tanguy:** Haha — okay, okay, you're going to make me blush now. [laughs]

[00:03:45] **Faizan:** [laughs] I'm serious man. Okay. Uhh — you saw what I sent you, right? Like you had a look at the brief before the call?

[00:03:52] **Tanguy:** Yeah, I did. I had a look. I have like a general picture of what you're building. It's not completely clear to me yet — like I think there are parts I didn't fully understand from the brief — but I was interested. Because you know, we have our own internal pipelines at LYTE — validation pipelines, identification flows for the work we're doing — and even with what we have, I still feel the pain points. So reading about what you're trying to do I was like, yeah, if this is executed well this could actually help a lot of people.

[00:04:23] **Faizan:** Yeah. And that's — that's actually like the perfect starting point, because before I even go into the solution I want to hear the problem from your side first. Like I want to understand it from someone who has actually lived it. So — I have some questions before I pitch you anything.

[00:04:38] **Tanguy:** Sure. Go for it.

[00:04:40] **Faizan:** Okay. So — you know, we both know there exists this entire world of dev communities who like, genuinely love to build and ship products. They are passionate, they are skilled, they move fast. But when it comes down to the actual reporting of everything they've done — tracking tasks, updating tickets, documenting what happened — they are like the most sloppy, most disorganized people I have ever seen in my entire life. And I say that with so much love.

[00:05:05] **Tanguy:** [laughs] Yeah, no — you're not wrong about that. That is completely accurate.

[00:05:10] **Faizan:** And in your five years of managing dev communities and teams, what is like, the most annoying part about tracking who is doing what? Like what's the specific thing that drives you genuinely insane?

[00:05:22] **Tanguy:** Hmm. Okay so — for me, honestly, it's the gap. The gap between what someone says they're doing and what is actually getting done. You run a standup — whether it's live or async on Slack — and everyone says "yeah I'm almost done, I'll push by end of day." And then end of day comes, and there is nothing. No commit, no ticket update, nothing. And you go to the person like — okay, so what happened?

[00:05:48] **Faizan:** [laughs] Right. And then you get the explanations.

[00:05:51] **Tanguy:** And then you get the explanations. [laughs] Which are always very creative.

[00:05:55] **Faizan:** Okay I have to ask this because it is too good to skip. Like — what is the most chaotic, most unhinged excuse a developer has ever given you for why they didn't update their Jira tickets for an entire week? Give me the best story you have.

[00:06:09] **Tanguy:** [laughs] Okay, I can't name names. But — okay, so I had this one developer. Full week. Nothing on the board. No updates, no movement, tickets just sitting there like monuments to laziness. I go to him, I'm like, "hey what happened this week, what's going on?" And he goes — completely straight-faced, zero shame — "Oh, I updated it." And I said "where? I don't see anything." And he goes, "yeah I updated it in my head. Like, I meant to do it."

[00:06:40] **Faizan:** [LAUGHS] "Updated it in his HEAD." The Jira board of the mind! Fully organized, extremely well maintained, completely inaccessible to everyone else on the team!

[00:06:51] **Tanguy:** [laughs] Yes exactly! The internal ticket system. Very thorough. Only visible to him.

[00:06:56] **Faizan:** [laughs] That is simultaneously the funniest and the saddest thing I have ever heard. Okay. Okay I'm good. Alright — so from a pure management perspective, when you're running a project and trying to get everyone actually contributing efficiently, what is like the absolute biggest bottleneck? The one thing that consistently slows everything down the most?

[00:07:17] **Tanguy:** Uhh — the verification piece, honestly. Like whenever there is a human in the loop there are mistakes. Right? And in the modern day — since now so much more is being built with AI assistance — we have even more risk and error layered on top of the usual human error. Because where there is AI there is hallucination. It's just the reality. So now you don't just have "developer said they did something and didn't" — you also potentially have "AI generated code that looks correct and actually isn't." And the manager has to somehow verify all of it. Not just for the developers but also for themselves — like the manager is also verifying their own understanding of the project. And it creates this loop that never ends.

[00:08:00] **Faizan:** Right. And — like, the manager ends up spending most of their cognitive bandwidth just tracking what people are doing rather than actually making real product decisions.

[00:08:09] **Tanguy:** Exactly. You end up constantly reactive. You're chasing information instead of making decisions. And the more people on the team, the worse that gets — the surface area of things you need to track just keeps growing. And nobody has enough hours in the day to stay on top of all of it.

[00:08:25] **Faizan:** Yeah. And that — that is honestly like, the origin story of what we're building. And so — can I flip into the pitch now?

[00:08:33] **Tanguy:** Yeah, let's hear it.

[00:08:35] **Faizan:** Okay. So — to give you the quick elevator pitch. Flowra is an AI orchestration tool. The entire goal is to kill manual Agile management. Right now, what happens in basically every dev team is — someone closes a pull request or finishes a feature, and then hours later, sometimes days later, sometimes genuinely never — they go into Jira and manually update the ticket. Meanwhile somewhere there's a PM who is manually monitoring all of this, chasing people, sending "hey did you update the ticket" messages in Slack, trying to piece together what the actual status of the project is from a dozen different sources. Like we are doing this exact same painful loop on every single project everywhere. So Flowra's core idea is — instead of relying on the human to self-report, we just listen. We plug into your Discord, your Slack, your GitHub — and we are reading everything that happens. If someone says in Slack "yo I just pushed the auth flow," Flowra cross-references that statement against the actual commits on that branch, validates that the work exists and is real, and syncs the Jira board automatically. No nagging, no manual update, no friction.

[00:09:41] **Tanguy:** Okay. I'm following.

[00:09:43] **Faizan:** And the scope isn't limited to just that verification layer. We're also building a risk management layer — so Flowra is constantly analyzing patterns in the commits and in the conversations. If a feature branch has been sitting for two weeks with zero activity, that surfaces as a risk. If a certain team member's commits are consistently causing build failures, that's a flag. And then we have an evaluation layer as well — so managers can use all of this aggregated data to actually rank and assess their team members objectively rather than going off vibes. The whole idea is to take the cognitive load off the PM so they can focus on product direction and growth rather than babysitting the ticket board.

[00:10:27] **Tanguy:** Hmm. Okay. So — let me sit with this for a second. When you first sent me the brief, I thought this was going to be more narrow than what you're describing right now. Like, I was imagining it was more of a developer-facing tool — something that just automatically moves your Jira cards based on GitHub activity. But hearing you talk about it now, it also includes the risk management piece and the team evaluation piece. That's — that's a different product than what I initially pictured.

[00:10:55] **Faizan:** Yeah, it's more layered than it might seem on the surface.

[00:10:58] **Tanguy:** Right. And — look, I want to be direct with you because I think being straight is more useful than just telling you it sounds great.

[00:11:06] **Faizan:** Please. That is exactly why you're here.

[00:11:09] **Tanguy:** So — the verification piece, the automatic Jira sync — there are already players moving in that space. OpenAI has been going in that direction, Deepset has things that touch similar areas, there are a few others. So if you're just pitching "we automatically update Jira from GitHub," that alone is not what's going to make you stand out. That feature space is getting commoditized.

[00:11:30] **Faizan:** Right, right.

[00:11:32] **Tanguy:** But the risk analysis piece — the part where you're correlating communication patterns with actual delivery risk, flagging things a manager would never catch because they'd have to read ten thousand Slack messages to find it — that I find genuinely more innovative. Like, I haven't seen that done well. The extraction of meaningful insight from project communication data combined with code activity, and using that to surface risk proactively — that's more interesting. That's the part that could actually matter.

[00:12:02] **Faizan:** Yes! And that's — that is exactly where we think the actual differentiation is. Not the sync, the intelligence. Okay so — let me get more specific. One of the core features we have is something we're calling the "Approval-First Sync." So Flowra detects that a task is done — reads the chat, checks the commits, validates the work — but instead of automatically moving the Jira card right away, it pauses and sends a notification to the manager's dashboard. Something like "hey, this looks done — approve to update the board?" PM clicks approve, and then it moves. So there's still a human touchpoint before anything changes. Would that workflow actually save you time in practice, or does it just feel like another screen to babysit?

[00:12:47] **Tanguy:** That's — hmm, that's actually a good question. I think it depends on how much trust the PM has built with the system over time. Like if the AI is consistently accurate — and I mean consistently — after a while you're going to start rubber-stamping those approvals. You'll see the notification, glance at it, approve it, because it's always been right before. And then it kind of becomes a formality. But — I think having that step is important at the beginning. You don't want the very first experience with Flowra to be "an AI moved my cards around while I was in a meeting and I didn't see it happen." That is going to freak people out.

[00:13:26] **Faizan:** [laughs] Yeah, yeah. That's a fair concern.

[00:13:29] **Tanguy:** So approval-first builds trust. And once the trust is established, you could offer like an "auto-approve" mode for teams that are comfortable enough to flip that switch.

[00:13:38] **Faizan:** Oh — that's actually a really clean product progression. You start with approval-first and you graduate to full-auto once the team has built confidence in the model. Like a trust ramp.

[00:13:48] **Tanguy:** Yeah, exactly. A trust ramp.

[00:13:51] **Faizan:** I'm using that. Okay — and specifically from your side, as someone who manages projects, if Flowra's AI is reading GitHub commits and PRs to verify proof of work — like what are the specific metrics or red flags you would actually want it to surface for you? What would be most useful on that dashboard?

[00:14:09] **Tanguy:** Uhh — okay. Commit frequency. If someone's pushing once a week when they should be pushing daily, that's a flag. PR review time — how long are pull requests sitting open before anyone looks at them, because a PR that's been open for four days with no review is a bottleneck. Merge conflict patterns — if you're consistently seeing conflicts on the same files or the same modules, that's telling you there's a coordination problem between people who are not talking enough. And then commit message quality honestly — like if every commit is just "fix" or "update" or literally nothing, that tells me this person is not thinking carefully about what they're shipping.

[00:14:50] **Faizan:** Right. And all of those are things a PM would have to go and dig for manually. Like you'd have to open GitHub yourself, scroll through the commit history — and nobody does that proactively. You find out there's a problem after the problem has already caused damage.

[00:15:05] **Tanguy:** Exactly. It's always reactive. You find out something was broken after it's already affected something else. Having those signals surfaced proactively would genuinely change how you manage.

[00:15:16] **Faizan:** That's — yeah, that's like exactly the value prop. Okay, I want to talk about scope for a second because I think this is an interesting conversation. Right now we're framing this around software teams — GitHub, Slack, Discord, Jira. But those are just the default channels we're starting with. The underlying capability is — connecting to communication channels and project data sources and extracting intelligence from them. So theoretically you could use this for a NASA engineering project, a game development studio, a design team, a school initiative, even like a construction project. Like anywhere project owners have set up communication channels for their work, that's within our scope potentially. We can plug in and show you the full dashboard overview regardless of what kind of work it is.

[00:16:04] **Tanguy:** Hmm. Okay — so I agree with you on some of that. Like for design teams, game studios, school projects — totally. Communication channels are central to those workflows and what you're describing makes complete sense in those contexts. But — let me push back a little on some of the more extreme examples.

[00:16:22] **Faizan:** Yeah, please.

[00:16:24] **Tanguy:** So — a construction site. That's physically oriented. The actual work is happening in the real world. You have a lead on site who is physically watching the workers. The source of truth is whether the wall got built, not what someone said in a group chat. And if a construction company has a finance department or an internal tech team, sure — Flowra could make sense for that slice of the organization. But the finance department doesn't rely on Slack to track their work. They're in their accounting platform, structured spreadsheets, rigidly defined processes. That's not the dynamic async communication-first environment you're optimized for. So for now I think you are very much in the developer and tech communication space, and what you're really doing is refining pipelines for those specific use cases. Which is fine — but the construction site example is probably a bit out of scope.

[00:17:13] **Faizan:** Yeah — okay, yeah. You are one hundred percent right. And honestly the construction site example I just — I'm so sorry. [laughs] That was completely out of pocket, like what was I even saying. I just got excited and started listing things.

[00:17:26] **Tanguy:** [laughs] No no, it's fine, it happens all the time! The energy is good.

[00:17:30] **Faizan:** [laughs] Thank you. But — what you said about the finance department actually made me think of something. Like what if we modularize Flowra? So instead of trying to go to all these different environments natively — we build Flowra as a core intelligence engine and then we have a connectable module system. Like the way MCPs work — model context protocol — where Flowra has a core and you can attach modules to basically any platform. So even the finance team's accounting software could just attach a Flowra module, start feeding us their workflow data, and we analyze it and give them insights the same way we'd give a dev team insights. Like we are doing this thing where Flowra is the central brain and different environments plug their data into us rather than us trying to natively understand every industry.

[00:18:22] **Tanguy:** Hmm. Okay. Now that — that I actually like a lot. That's a genuinely good proposition. Because then you're not trying to redesign how every single industry tracks work. You're just saying — wherever your data lives, we can connect to it and listen to it. And we'll make sense of it. That is a much more defensible and scalable position to be in.

[00:18:44] **Faizan:** Right! And like — the modularization introduces these dynamic environments all connected to Flowra as the core, and we're doing the evaluation and the risk management and the board sync — but for whatever the client is plugging into us. So the intelligence layer becomes universal even if the integrations are specific.

[00:19:01] **Tanguy:** Yeah. And honestly — the reason I find this direction more interesting than the original framing is because before, I was a bit worried that you were solving a vertical problem when maybe the horizontal problem is the more interesting one to go after. Like "we do this for dev teams on Jira" is very vertical. "We do this for any organized team with communication channels and a workflow" is horizontal. And with modularization you're starting to think horizontally. That's the right direction to push in.

[00:19:29] **Faizan:** Yeah. Yeah — that framing of vertical versus horizontal is like, really clean actually. I'm absolutely using that.

[00:19:36] **Tanguy:** [laughs] Go for it.

[00:19:38] **Faizan:** But — I also feel like there's a "but" coming.

[00:19:41] **Tanguy:** There's always a but. [laughs] So — I want to be transparent with you because I think it's more useful than just validating everything. I still somewhat believe this might not be entirely the right problem to solve. And I say that carefully because I could genuinely be wrong. But — hear me out. A product manager's entire job is to monitor the team and manage the backlog. Like that is literally what they're paid to do. If they are not doing that, no tool is going to fix that — that is a people problem, not a tooling problem. And there is also something to be said about keeping the PM close to the actual detail of the work. Because when you're reviewing tickets yourself, when you're seeing the progress yourself, it keeps you sharp. It keeps you focused and aware of what the team is building. If Flowra is auto-summarizing everything and moving things for you, there's a real risk the PM starts losing that granular awareness — and that awareness is actually what makes them good at their job.

[00:20:39] **Faizan:** Hmm. Yeah. That's — that's actually a really valid concern. And I appreciate you saying it because it's the kind of thing that's easy to dismiss but it's real.

[00:20:48] **Tanguy:** And then — the broader context. In the modern day, roles are collapsing. Previously you had a very clear line between frontend, backend, DevOps — they were three separate worlds. Now with AI assistance, one person with the right tools and the right model can do a reasonable job across all three. Previously where teams had five people in one function, now they have two. Where a project had ten distinct roles, it now has three or four max. So there's less to manage, less coordination overhead. Which arguably means the need for a heavy monitoring and orchestration tool is actually going down over time, not up. That's the tension I see.

[00:21:27] **Faizan:** Yeah — I hear you completely on that. And I don't want to just dismiss it. But — can I push back a little?

[00:21:33] **Tanguy:** Yeah, please. Go ahead.

[00:21:35] **Faizan:** Okay. So — one of the things we're building into Flowra is actually a personality layer. Like, a specific persona for each product instance. A Flowra instance is going to live in your codebase, live in your Slack, live in your Discord — it's there the entire time. It retains every conversation, every commit, every PR, every chat thread, all of it. And because it's always there and always retaining everything, over time it develops this contextual awareness that is completely specific to your product. Like, the Flowra instance for your team knows the history of every decision, every feature, every debate that happened in the channels. And that instance — that Flowra bot — knows more about what is actually happening in the project than any individual human on the team. Including the PM. Because the PM is a human being. They can't read every single message. They can't review every commit. Context gets lost in long conversations, especially in async teams where things happen over weeks across dozens of channels. But Flowra doesn't lose context. And instead of dumping all of that raw information on the PM — which would be overwhelming and useless — Flowra delivers the right insight at the right moment in a way the PM can actually act on. So the PM still exercises judgment. But they're exercising it on much better information than they'd have otherwise.

[00:22:47] **Tanguy:** Hmm. Okay — yeah. The context retention angle is actually interesting. Because you're right. In async teams especially, where things happen over weeks across many channels, a PM is going to miss things. It's not a skill issue, it's a human limitation. And having something that retains all of it and surfaces what matters — I can see the value in that. Because the problem isn't always that the PM doesn't care. Sometimes they just literally cannot keep up.

[00:23:17] **Faizan:** Exactly. And this connects to something I want to specifically bring up because I think it's the most underrated part of what we're building. The security angle.

[00:23:27] **Tanguy:** Okay.

[00:23:29] **Faizan:** So — you talked about team sizes shrinking, roles collapsing. And that's true. But here's the thing — ninety percent of new products that enter the market fail. And a lot of them — a lot of them — fail not because the product wasn't good or there wasn't demand for it. They fail because they had no security pipelines, no audit trails, no real risk management from day one. They closed the gap between roles, they moved fast, they shipped fast — and then the security gap? They fell straight through it. Because when you collapse roles and reduce headcount, the first thing that gets deprioritized is security. Nobody volunteers to own security on a four-person team. There's no security engineer. And you've probably seen this — like last year there were all these data leaks from early-stage startups. Dating apps storing user data in completely public storage buckets. Unencrypted. Publicly accessible. Not because they were bad developers — because nobody owned that responsibility.

[00:24:23] **Tanguy:** Yeah. Yeah, I know exactly what you're talking about. It happens way more than people realize and it's usually not stupidity, it's just — nobody had the bandwidth to think about it.

[00:24:33] **Faizan:** Right. And so our risk analysis module — the part where Flowra monitors the codebase and the communication channels and actively looks for security red flags. Exposed credentials in commits. Suspicious configuration changes. Data handling conversations that raise flags. Patterns that suggest something is being stored insecurely — that could genuinely protect these smaller teams that can't afford a dedicated security person. Because Flowra is always watching and it has full project context. Whats your take on that part specifically?

[00:25:05] **Tanguy:** Okay. Yeah. So — based on my own experience at LYTE — because we actually have something like a cheap knockoff version of this automation internally. Not as sophisticated as what you're describing, and we use Linear instead of Jira, but we have some pipeline automation. And even basic automation makes a real difference. You catch things earlier, you firefight less. And for the security part specifically — we use Kido. They're a security auditor based in Belgium. What Kido does is it monitors your codebase, analyzes for risks and potential leaks, and when it finds something it presents you with a set of possible fixes and lets you choose which one to apply. And honestly it's pretty solid. And — if Flowra's security module can get to that level, like genuinely useful and not just surfacing noise — that's where the product really differentiates.

[00:25:57] **Faizan:** Yeah. And actually — what you said about Kido is interesting because it makes me think we don't necessarily have to build the entire security detection engine from scratch ourselves. We could integrate with an existing third-party auditor — even something like Kido — and then Flowra becomes the orchestration layer that connects the security insights with the project context. So when Kido flags a vulnerability, Flowra already has the full context — who touched that file last, what was said about it in Slack, whether it's linked to an active ticket, who reviewed the related PR — and it surfaces all of that together. The security finding plus the project intelligence in one place.

[00:26:36] **Tanguy:** Yeah, that's — that's actually the smart approach. Don't reinvent the security detection part. Integrate something that's already proven at it, and make your value-add the context layer that sits on top of it. That's actually how a lot of great products get built — you focus on what only you can provide and you partner or integrate for the rest.

[00:26:55] **Faizan:** Right. Like we are doing this thing where we're not trying to build every piece from scratch — we're orchestrating the best existing tools and adding the one layer that nobody else has, which is the cross-channel project intelligence. That's kind of the whole philosophy.

[00:27:10] **Tanguy:** And if you can max out the performance on that security and risk side — like if that module is genuinely good — I think that is the thing that could make this product sky-rocket. Because the auto-Jira-sync by itself is a nice feature, but it's not a moat. It's not what people pay a premium for. The security and risk intelligence surfaced from project communications? Companies will pay for that. Especially companies that have been burned before. And most of them have.

[00:27:40] **Faizan:** Yeah. That's — I think that's also the angle we lead with when we go to market. Not "we sync your Jira automatically" but like, "we watch your project so you don't get blindsided."

[00:27:51] **Tanguy:** Yeah. That's a much better message.

[00:27:54] **Faizan:** Okay. Uhh — I'm realizing I said I'd keep this to thirty minutes and I have completely blown past that — [laughs]

[00:28:02] **Tanguy:** [laughs] It's fine, it's fine. We're having a good conversation. Don't worry about it.

[00:28:07] **Faizan:** [laughs] Okay, good. Okay — let me ask you the big picture question, and you can be completely real with me on this. Like no filter. Do you think this product can actually survive the market? If we execute on it properly — if the modular approach works, if the security analysis is genuinely solid — does it have a real shot?

[00:28:27] **Tanguy:** Hmm. That's — that is a big question. Honestly? I think it has potential. But — I can't sit here and tell you "yes this will definitely work" because nobody can tell you that. The market is the ultimate judge and a lot of products that make complete sense on paper just don't survive contact with the real world. What I can say is — it's more interesting to me now than when I first read the brief. The modularization angle, the security focus, the context retention — those things make the pitch more compelling. But my honest answer? Launch it. Get it in front of real users. Get actual signal. That is the only way to really know if the market wants this.

[00:29:11] **Faizan:** Yeah. Yeah, it's — it's a bit of a scary answer to hear but it's also like, the correct one. And I appreciate that you're not just saying "yeah man go for it, it'll totally work."

[00:29:22] **Tanguy:** Look — you're asking the right questions. That's already a good sign. A lot of founders don't think about the risk analysis or the market positioning until it's too late. The fact that you're interrogating this stuff now, before you launch — that matters.

[00:29:36] **Faizan:** I appreciate that. Okay — and speaking of launching, this is a semi-serious question. Once we do actually launch — would you be interested in being one of our first users?

[00:29:47] **Tanguy:** [laughs] Haha. We will see about that.

[00:29:51] **Faizan:** [laughs] Okay — I am writing that down. That is a soft yes. I am officially taking that as a soft yes.

[00:29:57] **Tanguy:** [laughs] You can interpret it however you like.

[00:30:00] **Faizan:** [laughs] Perfect. That is all I need. Okay — last question. This is the fun one, I've been saving it.

[00:30:08] **Tanguy:** Oh, I'm nervous now. [laughs]

[00:30:10] **Faizan:** [laughs] No no, it's good, I promise. Okay so — Flowra, as we've described it today, is basically permanently lurking in your team's Discord and Slack. It's reading every chat log, cross-referencing GitHub commits, monitoring all conversations around the clock, and verifying people's claims in real time. So when a developer types "I'm almost done" in Slack at 4pm, Flowra is literally sitting there checking the branch, running the diff, and comparing what was said to what was actually committed. So — on a scale of one to Skynet — how terrified do you think your developers would be when they first realize an AI has been sitting there this whole time, quietly verifying every "I'm almost done" message?

[00:30:55] **Tanguy:** [laughs] Oh man. Okay — they are one hundred percent going to nag about it for a while. Like, there will be a period — probably the first month — where every developer on the team is going "this is surveillance, this is dystopian, I didn't sign up for this, I want to talk to HR." That is going to happen without question.

[00:31:16] **Faizan:** [laughs] Yeah I fully expect that phase. I'm mentally prepared for it.

[00:31:21] **Tanguy:** But — eventually they just get used to it. Because at the end of the day, it's not really their choice whether the company opts in or not. That's a management decision. And once it's just part of the workflow, it becomes invisible. Like — remember when Slack added read receipts and everyone was briefly very upset about it? And now nobody even thinks about it.

[00:31:40] **Faizan:** [laughs] Yeah exactly! Every tool that felt like surveillance at first eventually just becomes normal.

[00:31:46] **Tanguy:** Exactly. You adapt. And I think over time — if the product is good and people see that Flowra is actually helping the project run better — they'll start to appreciate it. Because developers also hate chaos. They also hate when projects fail because of bad management. So if Flowra fixes that, most of them will come around.

[00:32:04] **Faizan:** Yeah. And honestly — for real though. Like, they don't actually get to choose. It's just how the project runs. They just have to adapt. [laughs]

[00:32:13] **Tanguy:** [laughs] That's — yeah. That's the honest truth.

[00:32:17] **Faizan:** They just have to get used to it. Okay — alright. I think that is genuinely a wrap on the questions. And Tanguy — man. I cannot overstate how useful this conversation was. Like you pushed back on the right things — the vertical problem concern, the PM awareness issue — and you validated the right things — the security angle, the modularization direction. And you gave me angles I genuinely was not thinking about — the vertical versus horizontal framing, the trust ramp idea, the Kido integration concept. All of that goes directly back to the team.

[00:32:50] **Tanguy:** I'm really glad. And I — I enjoyed this honestly. This was a good conversation. You came in with real questions and you actually listened to the pushback, which is — that's rarer than you'd think.

[00:33:03] **Faizan:** [laughs] Okay that's actually — that genuinely means a lot. Thank you. And uhh — also like, this is actually the first time we've had a proper sit-down in a while, right? It's been like—

[00:33:15] **Tanguy:** Two years I think. Around two years, yeah.

[00:33:18] **Faizan:** Two years. That is wild. Time just — it goes.

[00:33:22] **Tanguy:** It really does. [laughs]

[00:33:24] **Faizan:** We should do this again. Like not just for project reasons. Just — catch up.

[00:33:30] **Tanguy:** Yeah, definitely. Let's actually make that happen. Not two years from now.

[00:33:34] **Faizan:** [laughs] Not two years from now. Deal. Okay — uhh, actually before I let you go — how long do you think it's gonna take before you guys actually feel like you need something like Flowra at LYTE? Like, at what stage of growth does a team start feeling that pain hard enough to actually adopt a tool like this?

[00:33:52] **Tanguy:** Hmm. That's — that's a good question actually. I think the threshold is probably around like, ten to fifteen people working on the same product. Under that, you can manage it manually — it's messy but doable. Once you're past fifteen, the surface area just becomes too big for any one person to hold in their head. That's when you start feeling the real pain.

[00:34:12] **Faizan:** Okay. So the sweet spot for the initial user base is probably teams in that ten to twenty range — like they're big enough to have coordination problems but small enough that they haven't already built out some heavy internal tooling.

[00:34:26] **Tanguy:** Yeah, I'd say so. Because the larger companies already have dedicated tooling or dedicated operations people managing this stuff. But the mid-size teams — the ones growing fast, the ones trying to scale from ten to thirty people — those are the ones who feel this pain the most acutely.

[00:34:42] **Faizan:** Yeah. Yeah that's — that's actually a really useful data point. Like I'm going to bring that back to the team when we're thinking about who we're targeting first.

[00:34:51] **Tanguy:** And look — when you're ready to go to market, I think the narrative should be really clear. You're not selling to a developer, you're selling to a founder or a CTO or a head of engineering who is losing sleep over coordination problems. That's your buyer.

[00:35:05] **Faizan:** The person who is losing sleep. Yeah. Yeah that's — that's a solid way to think about it. I love that.

[00:35:12] **Tanguy:** [laughs] Happy to help.

[00:35:15] **Faizan:** Okay for real this time — I will keep you posted. Once we launch, once we have something real — you're going to be one of the first people I reach out to.

[00:35:24] **Tanguy:** Please do. I genuinely want to see where this goes.

[00:35:28] **Faizan:** Okay. Alright man — thank you so much. I really appreciate you. Take care.

[00:35:33] **Tanguy:** Of course. Pleasure talking to you. And — all the best for the product. Really.

[00:35:39] **Faizan:** Thank you man. See you.

[00:35:41] **Tanguy:** See ya. Goodbye.

[00:35:44] **Faizan:** Goodbye.

---

*[Recording ends — 00:35:47]*

*[Total session including pre-meeting setup: 36:14]*

---

*Note: Transcript has been cleaned and formatted for readability. Natural speech patterns including filler words, pauses, laughter, and hesitation markers have been retained throughout to preserve authentic conversational flow. Timestamps are approximate based on recorded session.*
