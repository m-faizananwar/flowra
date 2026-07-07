"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Micah style guarantees a sophisticated, premium SaaS look.
// We strictly use validated enums for hair to prevent baldness and API failures.
// facialHairProbability=0 ensures no beards or mustaches.
const teamData = [
  { 
    name: "Muhammad Waleed", 
    role: "Product Owner", 
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Waleed&hair=dannyPhantom&facialHairProbability=0&baseColor=fadbaf&earringsProbability=0"
  }, 
  { 
    name: "Furqan Basra", 
    role: "Scrum Master", 
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Furqan&hair=fonze&facialHairProbability=0&baseColor=fadbaf&earringsProbability=0"
  },
  { 
    name: "Muhammad Anas", 
    role: "QA Tester", 
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Anas&hair=fonze&facialHairProbability=0&baseColor=fadbaf&earringsProbability=0"
  },
  { 
    name: "Faizan Anwar", 
    role: "Developer", 
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Faizan123&hair=dannyPhantom&facialHairProbability=0&baseColor=fadbaf&earringsProbability=0"
  },
  { 
    name: "Zarsham Waleed", 
    role: "Developer", 
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Zarsham456&hair=fonze&facialHairProbability=0&baseColor=fadbaf&earringsProbability=0"
  },
  { 
    name: "Haleema Imran", 
    role: "Developer", 
    // "full" in Micah represents long, feminine hair.
    avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Haleema&hair=full&facialHairProbability=0&baseColor=fadbaf"
  },
];

const TeamGallery = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="wrapper">
      {/* 1. Center Card */}
      <div className="label-box">
        <AnimatePresence mode="wait">
          {!hovered ? (
            <motion.h1
              key="title"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: "center" }}
            >
              FLOWRA<br /><span style={{ fontSize: "0.5em", opacity: 0.4, letterSpacing: 4, fontWeight: 500, color: "#000" }}>TEAM</span>
            </motion.h1>
          ) : (
            <motion.div
              key="info"
              className="center-info"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              <motion.h2
                initial={{ opacity: 0, scale: 0, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: -50 }}
                transition={{ duration: 0.2, ease: "easeInOut", delay: 0.05 }}
                style={{ margin: 0, fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", fontWeight: 700, color: "#fff" }}
              >
                {hovered.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, scale: 0, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: 50 }}
                transition={{ duration: 0.2, ease: "easeInOut", delay: 0.05 }}
                style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
              >
                {hovered.role}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2-7. Team Member Avatars */}
      {teamData.map((member, i) => (
        <a 
          key={i} 
          className="team-avatar-link" 
          onMouseEnter={() => setHovered(member)}
          onMouseLeave={() => setHovered(null)}
          href="#"
        >
          <img 
            src={member.avatar} 
            alt={member.name} 
          />
        </a>
      ))}
    </div>
  );
};

export default TeamGallery;
