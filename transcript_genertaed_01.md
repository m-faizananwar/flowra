# Flowra – Stakeholder Interview Transcription

**Project:** Flowra – Agentic Agile Orchestration Platform
**Interview Date:** April 14, 2026
**Duration:** 36 minutes, 22 seconds
**Format:** Google Meet (Recorded)
**Interviewer:** Muhammad Faizan Anwar — Lead Developer & Architect, Flowra Team (Group 3 – Section C)
**Stakeholder:** Tanguy De Brabandre — Founder & CEO, LYTE Studios

---

> *Verbatim transcription of recorded session. Minor inaudible segments are marked [inaudible]. Timestamps are approximate.*

---

**[00:00:00] Faizan:** Alright, I think — yeah, okay, we're live. Can you see me? Is the camera coming in fine?

**[00:00:06] Tanguy:** Yeah, yeah. All good on my end. Audio's clear too.

**[00:00:09] Faizan:** Perfect. Okay. Um — hey Tanguy, man, genuinely — it's really good to have you here. Like, I really appreciate you taking the time. It actually means a lot.

**[00:00:20] Tanguy:** Of course, man. Happy to do it. So this is the thing you messaged me about, right? The project?

**[00:00:26] Faizan:** Yeah, exactly. We'll get into it. But first — just to set the stage, for anyone watching this recording later — Tanguy, do you want to just quickly introduce yourself? Like, your role, what LYTE Studios is, what you're building?

**[00:00:38] Tanguy:** Sure, yeah. So I'm the founder and CEO of LYTE Studios. We build tech products — mostly in the mobile and web space. So the main ones right now are Fixie, Tinrate, Jobr, and Workr. A few more things in the pipeline but those are the main ones shipping right now. And on top of the CEO side, I stay technical. I'm a senior backend developer and also a Flutter developer. So I'm still writing code — still in the weeds, still getting my hands dirty sometimes.

**[00:01:07] Faizan:** Which is — honestly, that's the thing about you man. Like, you're running multiple products, you're managing teams, and you're still the one who knows the codebase. That's — most people can't do that. You go one way or the other.

**[00:01:19] Tanguy:** [laughs] Yeah, it's — I mean, it keeps you sharp. If you stop being technical as a founder you start making calls that don't actually make sense when someone sits down to implement them. So I try to stay in it. But yeah, it's a lot sometimes.

**[00:01:32] Faizan:** Thats good. Like — running multiple products, still technical, community builder on top of everything. You're genuinely the best person I could have gotten for this conversation and I want that on record.

**[00:01:45] Tanguy:** [laughs] Alright, alright. You're buttering me up, I can tell.

**[00:01:48] Faizan:** [laughs] A little bit, yeah. A little bit. Okay, but — no seriously. You've been in this field for five years, building and shipping, managing dev communities, and you've seen the full lifecycle of products — what works, what crashes and burns. So — you had a look at the idea I sent over?

**[00:02:05] Tanguy:** Yeah, briefly. You sent me a summary, so I have a rough idea. But I think this conversation will make it a lot more crystal clear. And I'll be honest — when I first saw it, I was curious. And since most companies — ours included — have some form of CI/CD pipeline for identifying and validating work, I was thinking, okay, if you pull this off properly, this could genuinely help people out in the world.

**[00:02:28] Faizan:** Yeah, that's exactly the bet we're making. Okay — before I actually pitch you the product, I want to ask you some questions first. Just to validate the problem, make sure we're not just solving something we made up in our heads.

**[00:02:41] Tanguy:** Smart approach.

**[00:02:42] Faizan:** Okay so — I need you to just like, feel this with me for a second. We both know there's this specific type of developer, right? Loves to build, loves to ship, will stay up till three AM debugging some random off-by-one error — but the moment you ask them to go update a Jira ticket, they vanish. Like, completely ghost the board. You ping them on Slack — nothing. You follow up — nothing. Three days later the card is still sitting in "In Progress" and the feature has been live in production for a week.

**[00:03:09] Tanguy:** [laughs] Oh yeah. Oh I know exactly who you're describing. Yeah.

**[00:03:13] Faizan:** In your five years of managing communities and dev teams — what is genuinely the most annoying part about tracking who is doing what?

**[00:03:22] Tanguy:** Hmm. [pause] Honestly? It's the human-in-the-loop problem. Like — wherever you have a human responsible for manually updating something, you're going to get inconsistency. And it's not that people are lazy necessarily — it's friction. It's one more step on top of the actual work, and it gets deprioritized every single time. Even the most disciplined developers do it. You finish something, your brain has already moved on to the next problem, and the ticket just sits there.

**[00:03:52] Faizan:** Right.

**[00:03:53] Tanguy:** And then the board becomes this — this thing that nobody trusts anymore. It's showing a state that doesn't match reality, so the PM has to go dig through GitHub or scroll through Slack threads to manually reconstruct what's actually happening. Which is — that's a waste of everyone's time.

**[00:04:09] Faizan:** Yeah. And it's getting more complicated in the modern day too, right? Like, more things are being built with AI assistance now, so there's just more output — more commits, more PRs, more stuff happening — but the tracking and reporting hasn't kept up with that pace.

**[00:04:25] Tanguy:** And there's the hallucination problem on top of that. Like — if a developer is using Copilot or any AI tool and they push something, you can't just assume the code does what the ticket asked. The AI might have hallucinated a solution that compiles and runs but doesn't actually do the right thing. So now you need real verification — not just "was something pushed" but "does this actually address what we asked for." And that verification burden lands on the manager or the senior dev. Who's already stretched thin.

**[00:04:58] Faizan:** Exactly. So it's a problem on both sides — the dev side and the manager side.

**[00:05:03] Tanguy:** Yeah. Neither side is happy with the current situation. Devs don't want to be nagged. Managers don't want to chase. But someone has to do it and right now it's just... friction everywhere.

**[00:05:12] Faizan:** Okay. Yeah — alright, so that's exactly the world Flowra is trying to fix. Let me give you the full picture now. So — Flowra is an AI orchestration tool. The core idea is to eliminate manual Agile management. Instead of developers having to remember to update Jira, or PMs having to chase them — Flowra sits in the background, connected to your communication platforms — Discord, Slack, Telegram, whatever your team uses — and also connected to GitHub. And it listens. It reads commit messages, PR activity, chat logs, standup summaries. It's looking for signals — like, someone says "just pushed the auth fix" in Slack — and then it goes and actually verifies that against GitHub. Checks if there are commits, if the PR is in the right state, if the code is touching the right files for what the ticket was asking.

**[00:06:04] Tanguy:** Okay.

**[00:06:05] Faizan:** And if everything checks out, it doesn't just automatically move the card. It sends a suggestion to the PM — basically "hey, we think this ticket should move from In Progress to In Review, here's why, here's the evidence. Do you want to approve it?" PM clicks approve, Jira gets updated. That's the core loop. But — it's not just limited to tracking. We're also building out performance evaluation — like, who's contributing, who's blocking things, commit quality, PR frequency — and risk management. Like, monitoring the codebase and team conversations for red flags. Security issues, dependencies that are blockers, things that could hurt the sprint or the product down the line.

**[00:06:48] Tanguy:** Hmm. Okay — I'll be honest with you, Faizan. From the description you sent me, I thought the scope was narrower. Like, I thought it was more of a developer tracking tool. But this — this is more than I imagined. Especially the risk management piece. That I wasn't expecting.

**[00:07:05] Faizan:** Yeah, that's one of the parts we're most excited about.

**[00:07:08] Tanguy:** I mean — look, there are tools already working in parts of this space. OpenAI has things in the pipeline, Deepset is doing some interesting NLP work. So the verification side, reading commits and making sense of them — there are people working on that. But the risk analysis piece, the part where you're connecting chat signals to codebase health — that feels more novel. I haven't seen something that actually surfaces risk from a combination of communication data and GitHub activity. That could be interesting.

**[00:07:38] Faizan:** Yeah. Okay — so let me ask about one of our core features specifically. We call it the Approval-First Sync. The idea is exactly what I described — Flowra detects a task completion, but it doesn't automatically touch the board. It holds the suggestion and waits for the PM to confirm. From your experience, does that add real value? Or is it just another thing on the PM's screen to click through?

**[00:08:02] Tanguy:** No, I think that's actually the right design decision. Like — the worst outcome would be something autonomously updating a board that people depend on for project decisions. Because context matters so much. Code might be pushed but there's still a code review pending. Or the PR is merged but into the wrong branch. Or there's a dependency on another ticket that isn't closed yet. The AI doesn't have that context — the PM does.

**[00:08:26] Faizan:** Right, yeah.

**[00:08:27] Tanguy:** So the value isn't in removing the human. The value is in doing all the information gathering — the GitHub cross-referencing, the Slack scanning, the analysis — and presenting it cleanly so the PM can make a decision in five seconds instead of forty-five minutes. That's where the real productivity gain is.

**[00:08:45] Faizan:** Yeah, exactly. And there's an audit trail too — every suggestion Flowra makes is logged, who approved it, what the evidence was, when it happened. So if something goes wrong and someone disputes a timeline, you can pull it up.

**[00:08:58] Tanguy:** That's important. Yeah, that's actually important especially in client-facing projects. You need to be able to show a timeline of decisions.

**[00:09:05] Faizan:** Absolutely. Okay — the other thing I wanted to get your take on is the GitHub verification side. Like, when Flowra reads commits and PRs to verify work — what are the specific metrics or red flags you'd actually want it to surface? Like, if you opened the dashboard, what would make you go "yes, this is actually useful"?

**[00:09:24] Tanguy:** Hmm. Okay, practically speaking — I'd want to see who has committed nothing for two or three days when they're supposed to be mid-task. I'd want to see PRs that have been sitting open for more than three days with no review activity. I'd want to catch if someone is repeatedly pushing to the wrong branch — that usually means there's a miscommunication somewhere. And I'd want to see blockers that were mentioned in standups but never followed up on. Like, someone says "I'm blocked on the API design" and then nobody assigns that or tracks it — I want that surfaced.

**[00:10:01] Faizan:** Yeah. Yeah, those are all really concrete. That's actually really helpful because we've been thinking about it more from the automated tracking side and less from the "what does the PM actually need to see" side.

**[00:10:14] Tanguy:** Yeah. Those are the things that — when they slip through and you catch them late, they cost you the entire sprint. An early flag on any of those is valuable.

**[00:10:23] Faizan:** Okay. Good. Now — I want to kind of zoom out a bit and see where you land on this. Like, right now we're framing it around dev teams. But if Flowra can connect to any communication channel, and any task tracking system, the scope doesn't have to stop at developers. It could be a NASA project, game modelling teams, a design studio, a school initiative — or even, like, a construction project. As long as there's a team communicating somewhere and tracking tasks somewhere, Flowra could theoretically sit on top of it.

**[00:11:00] Tanguy:** Hmm. [pause] I mean — yes and no. Like, take the construction example. Most of the coordination on a construction site is physical. There's a lead walking around monitoring people on-site, making judgment calls in real time. The communication channels aren't the primary data source there — the work is happening physically. So the signal that Flowra would need just isn't really there in a meaningful way.

**[00:11:24] Faizan:** Right, yeah —

**[00:11:25] Tanguy:** But — if that same construction company has a finance department, or a project planning office running on Slack or some project management tool, yeah, there's a slice of use case there. But even then — finance departments are more structured. They're tracking things in specific financial platforms, not in freeform chat. The data is less dynamic and more rigid. Reading it meaningfully requires a different approach than reading developer conversations.

**[00:11:50] Tanguy:** I think the honest answer is — for now, you're really solving the developer communication environment. And there's nothing wrong with that. Trying to go generic from day one usually means you're not great at anything. You're probably better off owning the developer use case deeply first, then expanding. You're getting the right signals and opting for the right data sources — but to actually serve generic environments, you'd need more input types and more structure around how you interpret them.

**[00:12:19] Faizan:** Yeah — and honestly, the construction site example — I don't even know why I brought that up. [laughs] That was completely off track, I'm so sorry. I just got excited and my brain went somewhere weird.

**[00:12:29] Tanguy:** [laughs] No no, it's fine. It happens all the time. Especially when you're pitching something you're excited about. You start projecting it onto every industry you can think of. Classic founder energy.

**[00:12:40] Faizan:** [laughs] Classic founder energy, yeah. That's me. Okay. But — what you just said about needing more data sources and a more modular approach — that actually triggered something for me. Like, what if Flowra isn't trying to hardcode every possible environment, but instead it's the core intelligence layer, and you can plug in different data sources via a connective approach? Like MCP-style modules. So a finance department just attaches their platform as a module — we listen to that data and give them insights on it. A design team plugs in their Figma activity. The core stays the same, but the inputs are modular and expandable.

**[00:13:19] Tanguy:** Hmm. Yeah. If you think about it that way — like, Flowra is the brain and everything is pluggable around it — then you genuinely survive dynamic environments. Because you're not trying to anticipate every possible use case up front. You build the connective infrastructure well, and then different teams just attach their data sources to it. The modularization becomes the product.

**[00:13:42] Faizan:** Exactly. Yeah. Honestly that's a better mental model than how we've been framing it internally.

**[00:13:47] Tanguy:** Yeah. And look — before this conversation I was kind of putting you in the "solving a vertical problem" box. Like, very specific niche, I was wondering if the niche was big enough to sustain a product. But if you think horizontally — like, "we're the intelligence layer for any asyncronous collaborative workflow" — that's a significantly bigger market. And that framing makes more sense if the architecture is modular.

**[00:14:11] Faizan:** Yeah. Yeah, I really like that framing. Okay — but I can tell you have a "but" coming. I can see it.

**[00:14:17] Tanguy:** [laughs] I do, yeah. I'll steelman the other side for a second. There's an argument that — the product manager and the developer should be doing this tracking themselves. Like, manually moving a Jira card takes ten seconds. And more importantly, it forces the developer to be conscious of what they completed. It keeps them engaged with the board, with the project state. If you automate all of that, you might end up with a PM who just trusts whatever the AI surfaces and stops actually looking at what's happening. And the AI is going to be wrong sometimes.

**[00:14:49] Faizan:** Hmm. Yeah.

**[00:14:51] Tanguy:** And there's the other thing — in the modern day, teams are getting smaller. With AI tools now, a team of two people can do what a team of five did two years ago. The lines between roles — frontend, backend, DevOps — they're blurring. Where you used to have five people in a team, now you have two. Where you used to have ten distinct roles, now you have maybe three or four max. So the management overhead is naturally decreasing. Less people to track means less justification for a sophisticated tracking tool.

**[00:15:21] Faizan:** Yeah, that's — I won't pretend that's not a real point. That's a real point.

**[00:15:26] Tanguy:** But — if the product modularizes the way you're describing, and if it grows beyond just dev teams, then the total addressable market stays large even as individual team sizes shrink. So it can still work, just with a different framing.

**[00:15:40] Faizan:** Yeah. Okay — and actually I want to push back a little on the team size thing, because I think there's a nuance there. Like, yes — individual teams are getting smaller. But the number of products being built is exploding. There are more startups, more indie devs, more micro-teams shipping products than at any point in history. And here's the thing — ninety percent of new products that enter the market fail. And a huge chunk of that failure has nothing to do with the product features being bad. It's because the team had no proper management process, no security pipeline, no audit trail. They shipped something and it had a critical vulnerability because nobody was watching that layer.

**[00:16:19] Tanguy:** Yeah.

**[00:16:20] Faizan:** Like — there were these dating websites last year, right? Major data leaks because they were storing user data in public S3 buckets. That's not a technical skill problem — those devs knew how to code. That's a process and monitoring problem. Nobody was watching for that kind of thing. And those products are dead now. And that's where I think Flowra's risk analysis component could genuinely be the differentiator. Because it's not just tracking task completion — it's living inside the codebase and the conversations, and it can flag "hey this looks like it might be a security risk" before it goes to production.

**[00:16:55] Tanguy:** Yeah. Look — I think you're actually onto something significant there. And — I can speak to this from experience. At Tinrate and at Werkr, we have a very basic, kind of homemade version of some of this automation. We're not on Jira, we use Linear. But we have some things running. And for the security piece specifically — we actually use a tool called Kido. It's based in Belgium. What it does is it monitors your codebase, analyzes for risks, code vulnerabilities, data leaks — and then it doesn't just flag them and leave you to figure it out. It suggests specific fixes and lets you pick which one to apply. So you see the issue and the resolution option in the same interface.

**[00:17:40] Faizan:** Oh, interesting. I haven't come across Kido before.

**[00:17:43] Tanguy:** Yeah. It's genuinely useful. And — here's the thing. If Flowra can do something similar in the security space, or even just integrate with something like Kido as a pluggable module — that security angle is potentially where your product really separates itself. Because monitoring tools are everywhere. Intelligent, context-aware security analysis that's actually connected to the team's communication, their workflow, their Jira tickets — I haven't seen that done well. If you can pull that off, or even proxy it through a trusted third-party auditor, that's a real differentiator.

**[00:18:20] Faizan:** Yeah. And the integration approach makes sense too — like, we don't have to rebuild what Kido already does. We just become the layer that surfaces those insights in the context of the broader project. Use existing security tooling as a module rather than trying to solve that problem ourselves from scratch.

**[00:18:37] Tanguy:** Exactly. Be the connective layer, not the everything layer. You don't have to solve every problem yourself. You have to make it all make sense together.

**[00:18:45] Faizan:** Yeah. Yeah, that's a good principle. Okay — and actually, I want to touch on one more angle before I let you go. The Flowra instance — like, the way we're thinking about it, it's not just a dashboard or a monitoring tool. It's more like — it lives in your codebase, it lives in your social channels, it's amongst the team the whole time. It's retaining context — all the conversations, the git contribution history, the commit graph, the PRs, the standup summaries — all of it stays in memory. And over time it develops this kind of persona that's specific to that product and that team. It ends up knowing more about what's happening in the project than any individual team member does. And the idea is it can deliver that understanding to the PM in a way that's actually digestible — not raw data, but synthesized insight.

**[00:19:31] Tanguy:** Hmm. Yeah, that's an interesting framing. It's like — the project has an institutional memory that doesn't live in anyone's head.

**[00:19:39] Faizan:** Exactly. Because right now institutional memory is fragile. Key people leave, context gets lost. But if Flowra has it all retained —

**[00:19:47] Tanguy:** Yeah. Yeah, I get it. And look, I think there's something compelling there. My earlier concern about the PM needing to stay engaged with the board — that's still valid. But if Flowra is surfacing synthesis, not just automation, that's different. That's more like a very well-informed assistant, not a replacement for judgment.

**[00:20:04] Faizan:** Yeah. Yeah, the PM still makes all the calls. It's just that the PM is making those calls with way better information than they'd have otherwise.

**[00:20:12] Tanguy:** Right. And actually, going back to the security thing — that institutional memory aspect is where the risk analysis gets really powerful. Because it's not just scanning the codebase in isolation. It knows what was said about that feature in Slack three weeks ago, it knows what the original ticket said, it knows if someone cut a corner on the implementation. That context is what makes security analysis meaningful rather than just pattern matching.

**[00:20:35] Faizan:** Yes. Exactly. Yeah, that's — you articulated that better than I did. [laughs]

**[00:20:39] Tanguy:** [laughs] That's what I'm here for.

**[00:20:41] Faizan:** Okay — I'm actually watching the clock, I genuinely said I'd keep this to thirty minutes and we've blown past that a little. But I have to ask you — the big one. Do you think Flowra can actually survive in the market?

**[00:20:55] Tanguy:** [pause] That is... a very big question. [laughs] Honestly? I think it has potential. The risk analysis angle, the modular architecture, the institutional memory concept — those are genuinely interesting directions. But like — I don't know. You have to ship it. The market will tell you things I can't. You'll find out what matters to users and what doesn't within the first few months of real usage. My opinion on market survival right now is worth very little compared to what actual users will tell you.

**[00:21:27] Faizan:** Fair. Yeah. That's honest. I appreciate that.

**[00:21:30] Tanguy:** What I will say is — the problem is real. I've lived it. Every PM I know has lived it. So if you solve it well, there's definitely a market. Whether Flowra specifically cracks the code on execution — that I can't tell you yet.

**[00:21:44] Faizan:** Yeah. Okay. I'll take "the problem is real" as a win. Um — completely off record, almost — would you be interested in being one of our first users when we actually launch?

**[00:21:55] Tanguy:** [laughs] Haha. We'll see about that.

**[00:21:58] Faizan:** [laughs] We'll see about that — okay, that's not a no. I'm logging that as a maybe-yes.

**[00:22:03] Tanguy:** [laughs] Log it however you want, man.

**[00:22:06] Faizan:** [laughs] Noted, noted. Okay. Last question — and this is the fun one. So — Flowra basically lurks in your Discord. It's reading your chat logs, it's cross-referencing your GitHub, it's watching your commit history. On a scale of one to Skynet — how terrified do you think your developers are going to be when they realize an AI has been reading their "I'm almost done, just one more thing" messages for the past two weeks?

**[00:22:31] Tanguy:** [bursts out laughing] Oh man. They're going to lose it. For the first week at least. It's going to be like — "bro what is this, why is there a bot in our server, is this even legal, who approved this." The whole thing. [laughs]

**[00:22:43] Faizan:** [laughs] The full spiral.

**[00:22:44] Tanguy:** Yeah. But eventually they just get used to it. Most devs already have like five bots and integrations in their Discord or Slack. One more isn't going to break them. And after a few sprints where the board actually reflects reality and nobody has to chase anyone — they'll come around.

**[00:22:59] Faizan:** Yeah. And — I mean, no offense to any developer who might watch this recording — but it's kind of not really up to them, is it? Like, if the company decides to adopt Flowra, that's a company decision. The devs adapt.

**[00:23:12] Tanguy:** [laughs] Yeah. They don't really get a vote on the tooling stack. That's just how it is.

**[00:23:17] Faizan:** They're just cooked. [laughs] They're gonna see the bot and they're cooked.

**[00:23:20] Tanguy:** [laughs] Yeah, they're cooked. They'll get there.

**[00:23:23] Faizan:** Alright. Okay — I think that genuinely covers everything I needed. And honestly this was so much more valuable than I expected going in. You gave me things to think about that I had not considered at all.

**[00:23:35] Tanguy:** Happy to help. And honestly — it sounds like you guys have actually thought about this seriously. A lot of projects at this stage are very vague. You have a clear technical picture, a clear problem, and you're asking the right questions. That's a good sign.

**[00:23:49] Faizan:** Appreciate it. I mean — we'll see. We still have to actually build it, which is the hard part. [laughs]

**[00:23:54] Tanguy:** [laughs] Yeah. Launch it and find out.

**[00:23:57] Faizan:** Exactly. Okay — one last thing I just want to say. I think this might actually be our first proper meeting in a while, right? Like — it's been —

**[00:24:06] Tanguy:** Two years, yeah. Roughly two years since we last caught up properly.

**[00:24:10] Faizan:** Two years! And the first time we meet again it's because I need you for a uni project. [laughs] That's on me.

**[00:24:17] Tanguy:** [laughs] I mean — happy to be useful. But yeah, we should catch up properly sometime. Not just for assignments.

**[00:24:24] Faizan:** Yeah, 100%. For sure. Alright — thank you so much Tanguy. Really, genuinely appreciate your time and your insights. This was everything I needed and more.

**[00:24:34] Tanguy:** Pleasure, man. It was a good conversation. All the best with the product — I'll be watching.

**[00:24:39] Faizan:** [laughs] Good. Okay. See you.

**[00:24:42] Tanguy:** See ya. Goodbye.

**[00:24:44] Faizan:** Goodbye.

**[00:24:46]** *[Recording ends]*

---

*Total Duration: 36 minutes, 22 seconds*
*Transcribed by: Muhammad Faizan Anwar*
*Transcription Date: April 14, 2026*

