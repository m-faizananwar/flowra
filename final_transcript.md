# Stakeholder Interview – Final Transcript

**Project:** Flowra
**Date:** April 21, 2026
**Interviewer:** Faizan Anwar (Project Lead, Flowra)
**Stakeholder:** Tanguy De Branbandre (Founder & CEO, LYTE Studios)
**Duration:** ~36 minutes
**Format:** Video Call

---

[00:00:00] **Faizan:** Hey Tanguy! It's— it's really good to have you here in the meeting man. I genuinely appreciate you coming in. It really means a lot to me.

[00:00:20] **Tanguy:** Hey! Yeah, happy to be here. Thanks for having me.

[00:00:27] **Faizan:** Of course, of course. Uhh — okay so, for some context — Tanguy, you are here both as a founder and CEO of LYTE Studios. And I mean — you are, like, a genuinely successful person in this tech world. You're leading multiple projects and you're not just managing them from a distance, you're actually working on them yourself as a senior backend developer and Flutter developer. Like, Fixie, Tinrate, Jobr, Workr — those are all your products. That's— that's a lot, man.

[00:01:50] **Tanguy:** [laughs] Yeah, it keeps me busy, I won't lie.

[00:01:57] **Faizan:** It really does. And I — I just want to say that you are genuinely the best person I could have gotten for this meeting. Like, you have been working in this field for a long time and you've been managing teams yourself as well. You've really seen the market. So, again — it means a lot that you're here.

[00:02:40] **Tanguy:** I appreciate that, man. And yeah — you had sent me the idea, I have like a brief picture of what you're working on. But I think this meeting will make it more crystal clear for me. I'm genuinely interested in what you are doing, because — you know, most companies, ours included, we have CI/CD pipelines for identification and validation of our work. So I was thinking, yeah, something like this could help people out in the world. Let's see where it goes.

[00:03:36] **Faizan:** Yeah, exactly. That's — that's actually a great starting point. Okay so — before I even get into the product, I want to talk about the problem first. I have a few questions I'd love to get your honest take on.

[00:03:53] **Tanguy:** Sure, go ahead.

[00:03:58] **Faizan:** Okay so — we both know there exists this whole bunch of dev communities out there who genuinely love to build and ship products, right? Like, they are passionate, they are good at building things. But when it comes down to this specific part of like, actually reporting everything they've done — tracking what they've built, updating their tickets, documenting their progress — they are, honestly, the most sloppy people I know.

[00:04:55] **Tanguy:** [laughs] Yeah. Yeah, that's — that's a fair observation.

[00:05:05] **Faizan:** And you've been managing communities and dev teams for about five years now. So — in your experience, what is the most annoying part about tracking who is doing what? Like, what's the thing that really gets to you?

[00:05:32] **Tanguy:** Hmm. Okay. Yeah — so, I mean, it's a problem that genuinely exists in the world. It's a very bad thing. And — the thing is, whenever there is a human in the loop, there are mistakes. Right? That's just the reality. And in the modern day, since more and more things are being built with AI, we have certainly more risks and errors as well. Because — certainly, where there is AI, there is hallucination. So you're not just dealing with human error anymore, you're layering model error on top of that.

[00:07:05] **Faizan:** Right, exactly.

[00:07:11] **Tanguy:** And it's not just a problem for the developer — it's also a problem for the manager, who has to verify every single thing. Like, that verification loop never ends.

[00:07:35] **Faizan:** And you don't see that changing anytime soon? Like, without better tooling at least?

[00:07:45] **Tanguy:** Not unless the tooling changes, no. People are still people. You can optimize the process but you can't eliminate the human error unless you have something in the middle catching it before it becomes a real problem.

[00:08:07] **Faizan:** Yeah, yeah. That's — that's spot on. Okay, and like — getting a team to actually build something is one thing, but keeping them organized is genuinely another challenge. When you're managing a project, what is the absolute most annoying bottleneck you face when you're trying to get everyone to contribute efficiently?

[00:08:44] **Tanguy:** Hmm. I mean — it ties back to what I said. The verification piece. You can't always trust that what someone says is done is actually done. And when you're managing multiple people across multiple things, you just — you can't be everywhere at once. So the bottleneck is always this gap between what's being reported and what's actually happening.

[00:09:32] **Faizan:** Yeah. And — okay, I have to ask this because it's just too good to skip. We all know the pain of manual tracking in Jira or any other project tool. What is the most chaotic, most ridiculous excuse a developer has ever given you for why they didn't update their tickets for an entire week?

[00:09:56] **Tanguy:** [laughs] Oh man. Okay — I've heard some things. I've definitely heard some things. [laughs] Let's just say the excuses get very creative very quickly.

[00:10:19] **Faizan:** [laughs] I believe it. I fully believe it. Okay — so that's exactly the kind of thing we've been thinking about. And that brings me to the actual project. So — let me give you the quick elevator pitch.

[00:10:37] **Tanguy:** Yeah, let's hear it.

[00:10:41] **Faizan:** Okay. Flowra is an AI orchestration tool. The whole idea is — we are trying to kill manual Agile management. Instead of nagging developers to update Jira, Flowra just listens. It listens to Discord chats, Slack threads, GitHub commits — it verifies the work that's been done, and it syncs the Jira board automatically. No nagging, no manual update. And since you build tools to bridge gaps in Discord and manage communities, I wanted to, you know, get your read on how you handle this workflow today and whether this kind of solution would have made sense for you. And — uhh, the scope is not just limited to verification, by the way. We're also going to be evaluating people. We're going to be doing risk management of the project — like, based on GitHub commits and messages, flagging things like this certain commit or this team role has been a consistent issue. It will also help managers evaluate and rank their employees. The whole idea is to make managers less stressed about the day-to-day project stuff and more focused on the growth of the company — and more accurate too, because a manager genuinely cannot focus on every message or every single aspect of a product, and that's where negligence creeps in because of human limitations and biases.

[00:12:47] **Tanguy:** Hmm. Okay. So — I'll be honest with you. When I first read what you sent me, I thought the project was going to be somewhat more narrow than what you're describing now. Like, maybe I wasn't understanding it entirely from the brief. But the way you're describing it now — it's not just focused on the developer or the team members, it also includes the risk management aspect. Which is — that's a different scope than what I was picturing.

[00:13:36] **Faizan:** Yeah, yeah — it's a bit more layered than the brief might have showed.

[00:13:46] **Tanguy:** Right. And — look, I want to give you honest feedback because that's more useful to you. The use case you're describing makes sense. But there are other AI tools already working in this space — like OpenAI has been moving in that direction, Deepset is doing things in similar areas. So that specific domain of like, work verification and automation — I think it's already getting attention in the market. But the risk analysis part? That I find genuinely innovative. That's the part that's more differentiated.

[00:14:52] **Faizan:** Yeah, yeah — that's actually really helpful to hear. Okay, so — drilling into one specific feature. One of our core features is what we're calling the "Approval-First Sync." So Flowra detects that a task is done — through the chat and the GitHub activity — but instead of just moving the Jira card immediately, it waits. It waits for the PM to click approve on a dashboard. Would that kind of workflow actually save you time, or does it just feel like another screen to check?

[00:16:01] **Tanguy:** Uhh — I think it depends. Like, if the system is consistently accurate, over time you'll start to trust it and that approval becomes more of a formality. But having it there at the start is important. You don't want the first experience to be cards moving around without anyone seeing why.

[00:16:44] **Faizan:** Right, right. That makes sense — building trust before going fully automatic. And — as a manager, if Flowra's AI is reading GitHub commits and PRs to verify proof of work, what specific metrics or red flags would you want it to highlight for you? Like, what would actually be useful to see?

[00:17:16] **Tanguy:** Hmm. Good question. Things like commit frequency — if someone hasn't pushed anything in days, that's a signal. PR review times. Merge conflicts happening repeatedly in the same areas. And honestly, commit message quality — if everything is just "fix" or "update" with no context, that tells you something about how carefully this person is working.

[00:17:57] **Faizan:** Yeah — those are all really useful. The commit message quality one is kind of underrated actually. Like, the quality of someone's commit messages honestly tells you a lot about how seriously they're taking the work.

[00:18:15] **Tanguy:** Exactly. It's a proxy for professionalism. And it's the kind of thing that's hard to fake consistently. You can write one good commit message when you know you're being watched, but you can't fake all of them across a full sprint.

[00:18:40] **Faizan:** Yeah — yeah, that's a really solid point. Okay and — I want to talk about scope for a second because I think this can be even more dynamic than just code-related projects. Like, the environment is dynamic — we can connect to all kinds of social channels. So in theory this doesn't have to be limited to dev teams. It could help with a NASA project, game modelling, designing, a school initiative, even a construction project. Like, we can have a dashboard that shows you the entire overview of the project. Anywhere a project owner has set up communication channels for their product — that's potentially within our scope.

[00:19:50] **Tanguy:** Hmm. I agree with you somewhat — but not entirely. Like, construction site projects are more physically oriented. The communication channels don't really come into play on an active construction site — you've got a lead who is physically monitoring the workers on site, that's how things work there. Now, if a construction company has a finance department or any tech-related environment internally — sure, it can be useful there. But the finance department doesn't rely on communication channels to track their work — they rely on the platforms and methods they're using to track their finances. It's more structured, less dynamic. So I think for now, you are really just focused on the developer communication space. You're refining pipelines for your specific use cases, not making it truly generic. You're getting the right insights and pulling the right data, but it probably needs more data sources and inputs to live up to the expectations of a fully generic environment.

[00:21:35] **Faizan:** Yeah — yeah, you are completely right. And — look, the construction site example I gave was honestly entirely out of the point. I'm so sorry about that.

[00:21:54] **Tanguy:** [laughs] It's fine, man. It happens all the time, don't worry about it. But — you know what, this actually makes me think. If you modularize the product — like, make it so it can be connected to any platform, the way MCPs work or any connective approach you develop — you can nail it. Because then the finance department platform would just attach Flowra modules to their existing setup, and you listen to their data and give them insights on it. That makes it much more dynamic. That kind of modularization would introduce these dynamic environments all connected to Flowra as the core, and then you're doing evaluation, risk management, Jira board sync — all of it — but for whatever environment is plugged into you.

[00:23:34] **Faizan:** Hmm — yeah. Your points are making me think this way too. Like — it can be more modularized. That actually makes a lot of sense.

[00:23:53] **Tanguy:** Yeah, that's a good proposition. And — look, I'll be honest, before I was thinking you were solving a vertical problem instead of a horizontal one. Like, maybe what you were originally trying to solve wasn't quite the right problem. But I think it has potential now — especially if we're going to modularize it so it can survive dynamic environments. I like that direction. But — I still somewhat believe it's not entirely the right problem to solve. I could be wrong. But — a product manager or developer should be able to look into the backlogs and move things themselves. It keeps them more focused on what they're trying to do. That's literally their job. And the product manager's entire job is to monitor the team. Also — in the modern day, the job roles are getting closer together. Previously there was a fine line between frontend, backend, DevOps — but thanks to AI, anyone with the right model can do the right thing, even if it has some issues. Where teams used to have five members in one function, now they have two. Where people used to have ten roles in a team, that's down to three or four max. So there are fewer roles, less burden to manage, and therefore arguably less need for this kind of monitoring tool. But — yeah, if the product is modularized, then even outside of tech and developer products, you can have scope in other fields.

[00:26:04] **Faizan:** Yeah — and honestly, the MCP angle is interesting because that's exactly how OpenClaw is already structured. Like, it's modular by design, we just — haven't fully leaned into framing it that way publicly yet.

[00:26:22] **Tanguy:** Then lean into it. If the architecture already supports it, that should be your selling point. Lead with it.

[00:26:36] **Faizan:** Hmm. Yeah — I hear you. That's a solid point. But — I think there's another angle here. We are actually trying to give the bot a personality for the project. Like, a Flowra instance is going to live in your codebase, your social channels, amongst your team — watching everything the entire time, retaining all chat conversations, the git commit graph, PRs, everything — it's going to develop a persona that is completely specific to the product. And that persona knows more than anyone else on the team about what is actually going on in the product. And it can deliver that in a way the product manager can actually understand and act on. It's somewhat doing part of the PM's job, yeah — but it's doing it with more accuracy, because the PM will miss context in long conversations and can't obviously monitor every single commit or feature or risk. And — I agree with you about the team size getting shorter as we progress in the AI age. But the problem is — ninety percent of new products that enter the market fail. And they fail because they had weak security pipelines, no good management, no security audits, or they couldn't scale. Their product might have had all the features but it lacked security and audits because it was an absolutely new product. They closed the gaps between most jobs, but the security piece is what drowned them. You've seen it — like last year I heard about dating websites with data leaks because they were storing data in public buckets. So our product's risk analysis part may stand out in that aspect — monitoring codebases and chats, looking for those risks and minimizing them if not eliminating them entirely. What's your take on that?

[00:29:18] **Tanguy:** Yeah — based on my experience, I actually have a cheap knockoff version of this kind of automation at our company, Tinrate and Werkr as well — not with Jira though, we use Linear. And it helps. And then for the security side, we have tools like Kido — they're based in Belgium. Kido monitors and analyzes the risks and code leaks, shows you the possible solutions, and lets the user select which fix to apply. If you can somehow get to that level and max out the performance on that aspect — your product can seriously sky-rocket. You could even utilize a third-party service for the auditing piece, like Kido.

[00:30:28] **Faizan:** Yeah — you're completely right about that. We can utilize a third-party auditor too. I think that's actually a smart direction. Okay — I realize we are actually running short on time. I want to try to keep this meeting to thirty minutes. But — before I wrap up, one big question. Do you think this product can actually survive the market?

[00:31:08] **Tanguy:** Well — that's a big question. I think it has potential. But — I don't know for sure. I think you'd have to launch it first for me to really answer that.

[00:31:29] **Faizan:** Fair enough. Yeah — I'll keep you posted once we launch. And — uhh, by the way, would you be interested in being one of our first users?

[00:31:46] **Tanguy:** [laughs] Haha — we will see about that.

[00:31:52] **Faizan:** [laughs] Alright, I'll take that. Okay — I have one final question for you. And this is the fun one.

[00:32:05] **Tanguy:** Oh yeah?

[00:32:08] **Faizan:** So — Flowra basically lurks in Discord, reads chat logs, cross-references GitHub. On a scale of one to Skynet, how terrified do you think your devs will be when they realize an AI is verifying their "I'm almost done" messages?

[00:32:38] **Tanguy:** [laughs] Hahahaha — they sure are going to nag about it for a while. But eventually they'll get used to it. I mean, it's not on them to choose whether the company wants to opt into this method or not. Once you do it, they'll just adapt. Don't worry about it.

[00:33:13] **Faizan:** [laughs] For real though — they really don't get to choose about it. They just have to get used to it.

[00:33:25] **Tanguy:** [laughs] Exactly.

[00:33:29] **Faizan:** Alright — I think we are good to go. I'll keep you posted once we launch. And — I really appreciate you joining me in this meeting. It genuinely means a lot. I think this is actually the first time we've had a proper meeting in a while, right?

[00:34:04] **Tanguy:** Yeah — it's been two years. [laughs] I'm really happy I joined, man. Had a great time. Yeah, we should catch up sometime again.

[00:34:31] **Faizan:** Alright man — thanks for your time. Really.

[00:34:44] **Tanguy:** It's fine, man. Pleasure talking to you. All the best for your product.

[00:34:54] **Faizan:** Thanks for your time. See you.

[00:35:01] **Tanguy:** See ya. Goodbye.

[00:35:05] **Faizan:** Goodbye.

---

*[Recording ends — 00:35:09]*

---

*Transcript cleaned and formatted for readability. Filler words and natural speech patterns retained for authenticity.*

---

**Authentication & Verification:**

I, **Muhammad Faizan Anwar**, Lead Developer and Architect of Flowra, hereby certify that this transcription is an accurate and verbatim record of the interview conducted with Tanguy De Branbandre on April 21, 2026.

**Signature:**  
*M. Faizan Anwar*  
(Electronic Signature Verified)

---
