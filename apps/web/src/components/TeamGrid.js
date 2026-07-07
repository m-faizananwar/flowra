"use client";

const members = [
  { name: "Muhammad Waleed", role: "Product Owner", roleClass: "role-owner" },
  { name: "Furqan Basra", role: "Scrum Master", roleClass: "role-scrum" },
  { name: "Muhammad Anas", role: "QA Tester", roleClass: "role-qa" },
  { name: "Muhammad Faizan Anwar", role: "Developer", roleClass: "role-dev" },
  { name: "Zarsham Waleed", role: "Developer", roleClass: "role-dev" },
  { name: "Haleema Imran", role: "Developer", roleClass: "role-dev" },
];

export default function TeamGrid() {
  return (
    <div className="team-grid">
      {members.map((m, i) => (
        <div className="team-member" key={i}>
          <h4>{m.name}</h4>
          <p className={`role ${m.roleClass}`}>{m.role}</p>
        </div>
      ))}
    </div>
  );
}
