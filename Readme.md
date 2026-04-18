# Flowra: Agentic Agile Orchestration & Performance Verification

**Team Members (Group 3 - Section C):**
1. Muhammad Faizan Anwar (Lead Developer / Architect)
2. Muhammad Waleed (Product Manager / Owner)
3. Zarsham Waleed
4. Haleema Imran
5. Muhammad Anas
6. Furqan Basra

## 🚀 Overview
**Flowra** is an intelligent orchestration platform designed to eliminate the friction of manual Agile management. By integrating directly with developer communication channels and version control systems, Flowra automatically tracks progress, verifies task completion, and synchronizes project state with Jira in real-time.

Instead of manual "Kanban shuffling," Flowra uses agentic AI to listen to team signatures—commits, PRs, and chat logs—to ensure that the state of your Jira board perfectly reflects the reality of your development cycle.

---

## 🏗 Technical Architecture

The Flowra ecosystem is composed of three primary components, each residing in its own repository for modularity and scalability:

1.  **Flowra Web App (Frontend):** The user dashboard where project managers and developers approve AI-suggested card movements and view performance analytics.
2.  **Flowra Engine (Backend):** The core logic engine (deployed on an Oracle VPS) that handles data processing, Jira API synchronization, and middleware services.
3.  **OpenClaw (Orchestration Layer):** A specialized agentic orchestration layer that "listens" to signals across platforms. It uses a dedicated configuration repository to manage skills and social channel middleware.

### Security & Integration
*   **GitHub Integration:** Secure access is managed using **GitHub Certificates**, providing a safer and more robust organization-wide setup compared to traditional local cloning.
*   **Jira Synchronization:** Utilizes **Jira REST APIs** for direct, programmatic board updates, avoiding the fragility of browser-based automation.
*   **Deployment:** The backend engine is hosted on a high-availability **Oracle VPS**, ensuring consistent signal monitoring.

---

## 🛠 Core Features

### 1. Intelligent Jira Automation
*   **Automatic Card Movement:** Flowra moves Jira cards based on verified task completion.
*   **Sprint Completion Tracking:** Real-time monitoring of sprint velocity and bottleneck detection.
*   **Approval-First Sync:** Changes identified by Flowra are presented on a clean dashboard; once approved, they are pushed to Jira instantly.

### 2. Multi-Platform "Signal" Listening
Flowra connects to your team's existing workspace to fetch real-time updates:
*   **Discord & Telegram Bots:** Monitoring daily standup chats and task mentions.
*   **Slack Integration:** Deep integration with Slack threads to identify "Done" signals.
*   **Chat History Verification:** Uses historical context to verify if a task mentioned as "done" aligns with previous discussions.

### 3. Source-of-Truth Verification (The "Proof of Work")
Flowra doesn't just take a user's word for it. It verifies progress through:
*   **GitHub Integration:** Reviewing commits, branch activity, and codebase changes.
*   **PR & Code Review Analysis:** Tracking the lifecycle of a Pull Request to determine if a Jira sub-task is truly complete.
*   **Technical Audit:** Verifying that the code pushed actually meets the requirements defined in the Jira ticket.

### 4. Holistic Performance Analytics
Flowra evaluates team performance using objective metrics across all roles:
*   **For Developers:** PR frequency, code review participation, commit quality, and "Definition of Done" adherence.
*   **For Managers & Marketing:** Custom performance metrics based on communication frequency, document updates, and campaign milestones tracked via chat and specialized tools.
*   **Leaderboards & Insights:** Data-driven evaluations of each member's contribution to the sprint.

---

## 🔄 The Flowra Workflow

1.  **Connect:** Link Jira, GitHub, and your communication platform (Discord/Slack/Telegram) to Flowra.
2.  **Listen:** Flowra runs in the background, analyzing chats and repository activity.
3.  **Verify:** When a dev says "Done with the API," Flowra checks GitHub for corresponding commits and PRs.
4.  **Notify:** Flowra suggests a card move (e.g., *In Progress* → *In Review*).
5.  **Approve:** The Project Manager or Lead approves the change on the **Flowra Dashboard**.
6.  **Sync:** Jira is updated automatically, keeping the board 100% accurate.

---

## 📈 Project Roadmap & Sprint Progress

### Sprint 1: Foundation & Connectivity (April 2026)
**Status: ✅ Completed**
*   **Repository Initialization:** Setup of `flowra`, `flowra-engine`, and `openclaw` repositories with full authentication.
*   **Infrastructure Deployment:** Oracle VPS configured and engine instance successfully deployed.
*   **Channel Integration:** Established connectivity between the Flowra website and the engine with **Discord, Slack, Telegram, and GitHub**.
*   **Dynamic Configuration:** Implemented the ability for users to configure communication channels and GitHub certificates directly through the Flowra web interface.

### Sprint 2: Signal Processing & AI Verification (In Progress)
*   Implementation of advanced NLP for "Signal" extraction from chat logs.
*   Verification logic for cross-referencing commits with Jira task descriptions.

---

## 📊 Performance Metrics for Every Role

| Role | Metric Tracked | Verification Source |
| :--- | :--- | :--- |
| **Developer** | PRs, Commits, Reviews | GitHub / GitLab |
| **Project Manager** | Sprint Velocity, Blockers Cleared | Jira / Slack |
| **Marketing** | Campaign Updates, Copy Drafts | Telegram / Google Drive |
| **QA** | Bug Reports, Regression Tests | Jira / Codebase |

---

## 🎯 Vision
Flowra aims to turn the "Work about Work" (updating tickets, checking status) into a background process, allowing teams to focus on building while the AI handles the overhead of Agile synchronization.
