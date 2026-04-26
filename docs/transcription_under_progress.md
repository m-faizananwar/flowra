# Flowra – Stakeholder Interview Transcript

**Date:** April 21, 2026
**Participants:**
- Faizan Anwar — Interviewer / Project Lead, Flowra
- Tanguy De Branbandre — Stakeholder / CEO, LYTE Studios
**Duration:** 36 minutes 14 seconds
**Format:** Video Call (Recorded)


> [!IMPORTANT]
> **Technical Note:** Due to a technical error during the recording process that resulted in silent audio, the original vocal recording for this session was lost. This transcript has been manually reconstructed and simulated based on detailed meeting notes, original phrases exchanged, and project documentation to accurately preserve the insights and decisions made during the 30-minute stakeholder interview.

---


[00:00:00] **Faizan:** Okay I think — yeah, yeah the recording's going. Okay. Let me just — alright, I can see myself on screen. Good. And I can see you, Tanguy?

[00:00:10] **Tanguy:** Yeah yeah, I'm here. Can you hear me alright?

[00:00:13] **Faizan:** Yeah, clear. Perfect. Okay, good. So I already shared a brief idea of what I'm trying to build before this meeting, right?

[00:00:24] **Tanguy:** [laughs] Yeah, it's already very on-brand for what you're building. flowra is basically already here.

[00:00:30] **Faizan:** [laughs] Right, exactly. It just hasn't launched yet. But hey Tanguy, It's good to have you here in the meeting. I really appreciate you coming in. It really means a lot to me. Seriously.

[00:00:45] **Tanguy:** Yeah, good to be here. Good to see you.

[00:00:59] **Faizan:** You are here both as a founder and — CEO of LYTE Studios. You are a successful person in this tech world leading multiple projects and working on some of them as senior backend and flutter developer as well like Fixie, Tinrate, Jobr, and Workr. I mean, I see you working on all these and running them successfully. Honestly man — you are the best person I could get in this meeting.


[00:01:42] **Faizan:** I'm serious. You have been working here for long time in this field and sometimes managing them yourself as well. and you have seen the market. So I really value your take.

[00:02:06] **Tanguy:** Well, I appreciate that. You had sent me the idea. I have a brief idea about it. About it, but I guess this meeting will make it more crystal clear. But I'm interested in what you are doing and since most of the companies, ours as well have CI/CD pipeline of identification and validation of our work, so I was thinking it can help out people out in the world.

[00:02:50] **Faizan:** That's exactly it. And look, being the best person I could get in this meeting for this specific topic — that is genuinely not an exaggeration. I mean that.

[00:03:08] **Tanguy:** Haha — thanks man. Let's see what you've got.


[00:03:30] **Faizan:** Okay, so before I get into the project, I want to talk about the problem. We both know there exists a bunch of dev communities who love to build and ship products, but when it comes down to this specific reporting of everything they have done so far, they are the most sloppy people I know.

[00:04:10] **Tanguy:** [laughs] Yeah, no — you're not wrong about that. It's a problem that exists in the world. It's a very bad thing to do, but it happens.

[00:04:23] **Faizan:** Exactly. And in your five years of managing communities and dev teams, what is the most annoying part about tracking who is doing what?

[00:04:40] **Tanguy:** Hmm. Honestly, whenever there is a human in the loop there are mistakes. And in the modern day, since more things are being built by AI, we have certainly more risks and errors as well. Certainly where there is AI there is hallucination. Not only is this a problem for developers but for managers as well to verify every single thing.

[00:05:22] **Faizan:** That's so real. Tanguy, getting a team to actually build something is one thing, but keeping them organized is another. When you're managing a project, what is the absolute most annoying bottleneck you face when trying to get everyone to contribute efficiently?

[00:05:55] **Tanguy:** It's the manual follow-up. You spend so much time just trying to confirm if what was said is actually what was done.

[00:06:40] **Faizan:** We all know the pain of manual tracking in jira boards or any other applications. What is the most chaotic, ridiculous excuse a developer has ever given you for why they didn't update their tickets for an entire week?

[00:07:17] **Tanguy:** [laughs] Oh man. I've had guys tell me they updated it "in their head" or they thought the ticket would just "know" it was done. It's bad. It makes it impossible for managers to verify every single thing but on other aspect it also helps the community to stay focused on their tasks, what they need to do.

[00:08:35] **Faizan:** So, we thought of a solution. Giving you a quick overview — flowra is an AI orchestration tool. We're trying to kill manual Agile management. Instead of nagging devs to update jira, flowra listens to discord chats, slack threads, and github commits, verifies the work, and syncs the jira board automatically.

[00:09:41] **Tanguy:** Okay. I'm following.

[00:09:43] **Faizan:** But wait, there's more. Not only its scope is limited to verification, but we also will be evaluating people and accessing risk management of the project based on github commits and the messages, like this certain commit or team role has been a pain in the ass or a cog in the machine. It will also help managers to evaluate and rank their employees. Since the product idea is to make managers less tensed about the project and more focused on the growth of the company and focus on accuracy as well, because certainly the manager can't focus on the entire messages or each aspect of the product and that is where the negligence comes into play because of human limitations and biases.

[00:10:55] **Tanguy:** Hmm. Okay. I thought the project was somewhat more narrow than what I imagined or maybe I'm not understanding it entirely. I thought it was more focused on the developer or the team members but it also includes the aspect of risk management as well. There are other AI tools already working on the same domain, such as OpenAI and Deepset. Things like such I think are already in focus in the market, but the risk analysis part is very innovative.

[00:11:30] **Faizan:** That's exactly where we stand out. One of our core features is the 'Approval-First Sync.' flowra detects a task is done via chat and github, but instead of moving the jira card immediately, it waits for the PM to click approve on a dashboard. Would that workflow save you time, or just add another screen to check?

[00:12:47] **Tanguy:** I think it can be used for the usecase you mentioned. It gives that control back to the manager.

[00:13:51] **Faizan:** And also, we are implementing AI to read github commits and PRs to verify the 'Proof of Work.' As a manager, what specific metrics or red flags would you want that AI to highlight for you?

[00:14:50] **Tanguy:** Well, looking at code leaks and risk analysis is huge. If you can max out that part your product can surely sky rocket.

[00:15:16] **Faizan:** It can be more dynamic! It's not just limited to code-related projects. I guess the environment is dynamic and since we can connect all social channels so we can do whatever we want. It can help us out in a NASA project, game modelling, designing or a school initiative project — even on a construction project! We can have a dashboard that can show you the entire overview of the project. So anywhere the project owners have set up the communication channels for the product there can be, you know, the scope of our project.

[00:16:22] **Tanguy:** Ahhh, I agree with you somewhat, not entirely though. Since the construction site projects are more physically oriented and the communication channels don't come into play. In such projects, we have a guy who is lead and is monitoring all the coworkers on the construction site; I guess that's how things are done there. But he said if the construction department has a finance department or any tech-related environment, then sure it can be useful there. But the finance department doesn't rely on the communication channels; rather, it depends on the platform or the method they are using to track their finances. It's more structured and less dynamic. I guess for now it's just focusing on the developer communication site. You are just refining pipelines to your use cases and not making it dynamic. You surely are getting the right insights and opting the right data, but probably it needs to have more data sources and input to live up to the generic environment's expectations.

[00:17:13] **Faizan:** Yes, you are right; we should think that way as well and I guess the construction site project example I gave you was entirely out of the point, I'm so sorry for that. I was just excited.

[00:17:30] **Tanguy:** [laughs] It's fine man, happens all the time. But I think if we modularize our product so that it can be connected to any website like we have MCPs or other things and can be connected to our project via connective approach we develop, we certainly can nail it. Since the finance department platform would just attach other modules to their existing one and then we listen to their data and give them insights on their data. Making it more dynamic. Such modularization will introduce dynamic environments connected to flowra as core and we will be evaluating, risk management and doing things for them for jira boards as well.

[00:18:22] **Faizan:** Your points made me think this way, that it can be more modularized. I guess you are right about it to some extent.

[00:19:29] **Tanguy:** Yes, that's a good proposition. Although before, I was thinking you were solving a vertical problem instead of a horizontal one. Maybe what you were trying to solve wasn't the right problem to solve. But I think it has some potential now that if we are going to modularize it that way so it can survive dynamic environments. I like it but... I still somewhat believe it's a bit not the right problem to solve. I may be wrong, but the product manager or the developer should be able to look inside and should look into the backlogs and move them themselves since it keeps them more focused on what they are trying to do. It's their job and they should really stay focused on it and the PM's entire job is to monitor them.

[00:20:39] **Faizan:** I see your point. But in this modern day, jobs and roles are getting closer. Previously there was a fine line between roles like frontend, backend and DevOps, but thanks to AI anyone with the right model can do the right thing although it will, of course, be having some issues. Previously where teams used to have 5 members in one team now they have 2 and where people used to have 10 roles in a team now that has reduced down to 3-4 max.

[00:21:27] **Tanguy:** Exactly. In the modern day since there are less roles so therefore less burden to manage and hence less need for this kind of monitoring tool. But yeah i agree with you if the product is modularized then if not in tech field or the developer products we can have scope in other fields too.

[00:22:47] **Faizan:** Hmm, sounds like a solid hit. I guess you are right about it to some extent, but we are trying to give the bot a personality for the project. Since a flowra instance is going to live in your codebase, your social channels and amongst your team looking at them the entire time and retaining all chats, conversations and git contribution commits graph, PRs and everything in its memory, it's going to develop a persona just specific to the product and I guess that the persona knows more than anyone else in the team what's going on in the product and will be able to deliver that in a way that the product manager can understand easily. Although it's somewhat doing the product manager's job part, but it's doing it with more accuracy since the PM will miss out on the context in long conversations and he can't monitor obviously every aspect of the project like each commit or feature or risks.

[00:23:17] **Faizan:** Also I agree with the team size getting shorter as we progress in the AI age. But the problem is 90% of new products that enter into the market fail because they had least security pipelines, no good management, security audits or they were not able to scale up. Since their product does have all the features but it lacks security and audits since it's an absolutely new product. Since they closed gaps between most of the jobs, the security feature point made them drown. You have seen how the new projects like last year — I heard about dating website data leaks because they were storing data in a public bucket. So our product's risk analysis part may stand out in such aspect when monitoring the codebases and chats and look for such risks and minimize them if not wipe it entirely. What's your take on this?

[00:24:23] **Tanguy:** Sure, based on my experience since I have a cheap knockoff version of such automation on our company Tinrate and Werkr as well — not with jira though, it's Linear. If you do it, then it is good. We have other things like security auditors like Kido we have in Belgium. It monitors and analyzes the risks and code leaks entirely and shows us the solution for them as well and lets the user select any one solution for the leaks' fixes. If you can somehow survive that part and max out this aspect performance, then your product can surely skyrocket. You can even utilize a third-party service for auditing like even Kido.

[00:25:57] **Faizan:** Yeah you are right about it. We can utilize third party auditor too. I guess we are really short on time right now. I want to keep this meeting to thirty minutes really. By the way do you think this product can actually survive the market?

[00:28:27] **Tanguy:** Well, its a big question but i think it has potential but i dont know maybe you have to launch it first for me to answer that.

[00:29:47] **Faizan:** Sure, i will let you know once we launch it. By the way would you be interested to be one of our first users?

[00:29:51] **Tanguy:** Haha, we will see about that. 


[00:30:00] **Faizan:** Alright one final question for you. So, flowra basically lurks in discord reading chat logs and cross-referencing github. On a scale of 1 to Skynet, how terrified do you think your devs will be when they realize an AI is verifying their 'I'm almost done' messages?

[00:30:55] **Tanguy:** Hahahaha, they sure are going to nag about it for a while, but eventually they will get used to it. I mean it's not on them to choose whether the company wants to opt for this method or not. But once you do it, they will just get used to it. Don't worry about it.

[00:31:40] **Faizan:** For real man, they really don't get to choose about it. They just have to get used to it.

[00:32:17] **Faizan:** Alright then, I think we are good to go; I will keep you posted once we launch it. I really appreciate you joining me in this meeting. It really means a lot to me. I think that it's our first time having a meeting in a while.

[00:33:15] **Tanguy:** Yeah, it's been 2 years. Haha. I'm really happy joining you man. Had a great time. Yeah, we should catch up sometime again.

[00:34:51] **Faizan:** Alright man, thanks for your time.

[00:35:24] **Tanguy:** It's fine man, pleasure talking to you. All the best for your product. Really.

[00:35:39] **Faizan:** Thanks for your time. See you.

[00:35:41] **Tanguy:** See ya, goodbye.

[00:35:44] **Faizan:** Goodbye.


