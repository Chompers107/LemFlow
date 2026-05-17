import { useState, useEffect, useMemo, useCallback, useRef, useReducer } from "react";

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{background:#0c0c0f;color:#f0f0f2;font-family:'DM Sans',sans-serif;overflow-x:hidden;font-size:14px}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
input,select{font-family:'DM Sans',sans-serif}
input[type=range]{-webkit-appearance:none;width:100%;height:3px;border-radius:3px;background:#2a2a35;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#facc15;cursor:pointer;box-shadow:0 0 0 3px #facc1520}
input[type=checkbox]{accent-color:#facc15;width:16px;height:16px;cursor:pointer;flex-shrink:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0)}50%{box-shadow:0 0 20px 4px rgba(167,139,250,.18)}}
@keyframes glowY{0%,100%{box-shadow:0 0 0 0 rgba(250,204,21,0)}50%{box-shadow:0 0 14px 3px rgba(250,204,21,.14)}}
@keyframes bpulse{0%,100%{border-color:rgba(74,222,128,.25)}50%{border-color:rgba(74,222,128,.75)}}
@keyframes countUp{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes sweep{0%{opacity:0;transform:translateX(-100%)}30%{opacity:.5}100%{opacity:0;transform:translateX(100%)}}
@keyframes dotBlink{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.fu{animation:fadeUp .2s ease forwards}
.su{animation:slideUp .25s ease forwards}
.glow-smart{animation:glow 2.5s ease-in-out infinite}
.glow-y{animation:glowY 3s ease-in-out infinite}
.bpulse{animation:bpulse 2s ease-in-out infinite}
.shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%);background-size:200% 100%;animation:shimmer 2.4s ease-in-out infinite}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes riseIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes scoreUp{from{color:#facc15;text-shadow:0 0 18px #facc1590}to{color:inherit;text-shadow:none}}
@keyframes scanline{0%{top:-4px}100%{top:100%}}
@keyframes feedScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes claimGlow{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}50%{box-shadow:0 0 16px 4px rgba(74,222,128,.25)}}
.rise{animation:riseIn .3s cubic-bezier(.34,1.2,.64,1) forwards}
.claim-glow{animation:claimGlow 1.5s ease-in-out 2}
`;

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const POOLS = [
  // ── Core ────────────────────────────────────────────────────────────────
  {id:"HXDX", pair:"LEMX/HXDX",  name:"HXDX",            tag:"core", apy:14.2, tvl:4200000,  vol:820000,  il:"Low",      health:94},
  // ── Healthy ecosystem (health 75-90) ────────────────────────────────────
  {id:"LBNK", pair:"LEMX/LBNK",  name:"LemonBank",        tag:"eco",  apy:15.8, tvl:680000,   vol:148000,  il:"Low",      health:88},
  {id:"LPAY", pair:"LEMX/LPAY",  name:"LemPay",           tag:"eco",  apy:16.1, tvl:590000,   vol:132000,  il:"Low",      health:86},
  {id:"HXBT", pair:"LEMX/HXBT",  name:"Hexbit",           tag:"eco",  apy:19.8, tvl:510000,   vol:120000,  il:"Medium",   health:82},
  {id:"LMLN", pair:"LEMX/LMLN",  name:"LemLoans",         tag:"eco",  apy:17.4, tvl:420000,   vol:95000,   il:"Low",      health:80},
  {id:"PUP",  pair:"LEMX/PUP",   name:"Wasatch Pup",      tag:"eco",  apy:22.1, tvl:380000,   vol:94000,   il:"Medium",   health:79},
  {id:"LMED", pair:"LEMX/LMED",  name:"LemCare",          tag:"eco",  apy:21.3, tvl:310000,   vol:72000,   il:"Medium",   health:77},
  {id:"LTVL", pair:"LEMX/LTVL",  name:"LemTravel",        tag:"eco",  apy:19.0, tvl:280000,   vol:64000,   il:"Medium",   health:75},
  // ── Watchlist (health 48-68) ─────────────────────────────────────────────
  {id:"STH",  pair:"LEMX/STH",   name:"Start Health",     tag:"eco",  apy:18.3, tvl:240000,   vol:58000,   il:"Medium",   health:68},
  {id:"MHSA", pair:"LEMX/MHSA",  name:"MotivHSA",         tag:"eco",  apy:16.9, tvl:195000,   vol:44000,   il:"Medium",   health:66},
  {id:"SMART",pair:"LEMX/SMART", name:"DNSmart",           tag:"eco",  apy:20.1, tvl:168000,   vol:40000,   il:"Medium",   health:64},
  {id:"TIXA", pair:"LEMX/TIXA",  name:"Tix Access",       tag:"eco",  apy:24.8, tvl:145000,   vol:38000,   il:"Med-High", health:60},
  {id:"NXYS", pair:"LEMX/NXYS",  name:"NXC Podcast",      tag:"eco",  apy:25.6, tvl:120000,   vol:32000,   il:"Med-High", health:56},
  {id:"LFLX", pair:"LEMX/LFLX",  name:"LemFlix",          tag:"eco",  apy:26.2, tvl:108000,   vol:26000,   il:"Med-High", health:52},
  {id:"RMC",  pair:"LEMX/RMC",   name:"Rubic Management", tag:"eco",  apy:24.5, tvl:88000,    vol:19000,   il:"High",     health:48},
  // ── Risky / Experimental (health < 45) ───────────────────────────────────
  {id:"LLUX", pair:"LEMX/LLUX",  name:"LemLux",           tag:"eco",  apy:27.2, tvl:62000,    vol:14000,   il:"High",     health:40},
  {id:"CTFZ", pair:"LEMX/CTFZ",  name:"Catfiz",           tag:"eco",  apy:29.8, tvl:52000,    vol:12000,   il:"High",     health:36},
  {id:"LSQZ", pair:"LEMX/LSQZ",  name:"LemSqueeze",       tag:"eco",  apy:32.4, tvl:44000,    vol:10000,   il:"High",     health:30},
  {id:"LLOT", pair:"LEMX/LLOT",  name:"LemLotto",         tag:"eco",  apy:36.5, tvl:28000,    vol:6200,    il:"Very High",health:22},
];

const VALIDATORS = [
  // ── Recommended (3) ─────────────────────────────────────────────────────
  {id:7,  name:"CitadelGuard",       apy:11.5, uptime:99.9, commission:3,  deleg:49, score:93, status:"Recommended", offline:false},
  {id:1,  name:"LemonNode Alpha",    apy:12.8, uptime:99.9, commission:5,  deleg:68, score:91, status:"Recommended", offline:false},
  {id:2,  name:"CitraStake Pro",     apy:13.4, uptime:99.7, commission:7,  deleg:72, score:88, status:"Recommended", offline:false},
  // ── Active / Healthy (4) ────────────────────────────────────────────────
  {id:3,  name:"YellowValidator #3", apy:11.9, uptime:99.8, commission:4,  deleg:55, score:86, status:"Active",      offline:false},
  {id:6,  name:"PulpStake",          apy:12.1, uptime:99.6, commission:5,  deleg:58, score:85, status:"Active",      offline:false},
  {id:9,  name:"CoreLemon #9",       apy:12.6, uptime:99.5, commission:6,  deleg:63, score:83, status:"Active",      offline:false},
  {id:10, name:"NexusStake",         apy:13.0, uptime:99.4, commission:7,  deleg:70, score:80, status:"Active",      offline:false},
  // ── Watchlist / Overcrowded (2) ─────────────────────────────────────────
  {id:4,  name:"LemonGate v2",       apy:14.1, uptime:99.2, commission:8,  deleg:82, score:74, status:"Overcrowded", offline:false},
  {id:5,  name:"ZestNode",           apy:14.8, uptime:98.9, commission:9,  deleg:61, score:68, status:"Watchlist",   offline:false},
  // ── Not Recommended (1) ─────────────────────────────────────────────────
  {id:8,  name:"RindValidator",      apy:16.2, uptime:97.8, commission:12, deleg:44, score:48, status:"Uptime Risk", offline:false},
];

const CIT_TIERS = [
  {months:6,  bonus:10,  drip:3,  label:"6 Months"},
  {months:12, bonus:22,  drip:6,  label:"12 Months"},
  {months:24, bonus:50,  drip:12, label:"24 Months"},
  {months:36, bonus:80,  drip:18, label:"36 Months"},
  {months:48, bonus:120, drip:24, label:"48 Months"},
  {months:60, bonus:300, drip:30, label:"60 Months"},
];

const VAL_LOCKS = [
  {days:0,    label:"Unlocked",  boost:0,  penalty:false},
  {days:30,   label:"30 Days",   boost:5,  penalty:true},
  {days:90,   label:"90 Days",   boost:12, penalty:true},
  {days:180,  label:"180 Days",  boost:20, penalty:true},
  {days:365,  label:"1 Year",    boost:35, penalty:true},
  {days:1825, label:"5 Years",   boost:80, penalty:true},
];

// Interpolate boost smoothly between preset lock durations
function interpolateBoost(days) {
  if (days <= 0) return 0;
  const presets = VAL_LOCKS.filter(l => l.days > 0);
  if (days >= presets[presets.length-1].days) return presets[presets.length-1].boost;
  for (let i = 0; i < presets.length-1; i++) {
    const lo = presets[i], hi = presets[i+1];
    if (days >= lo.days && days <= hi.days) {
      const t = (days - lo.days) / (hi.days - lo.days);
      return parseFloat((lo.boost + (hi.boost - lo.boost) * t).toFixed(1));
    }
  }
  return 0;
}
// Build a valLock object from any raw day count
function valLockFromDays(days) {
  const d = Math.round(days);
  const preset = VAL_LOCKS.find(l => l.days === d);
  if (preset) return preset;
  const boost = interpolateBoost(d);
  const penalty = d > 0;
  let label;
  if (d === 0) label = "Unlocked";
  else if (d >= 1825) label = "5 Years";
  else if (d >= 365) { const y = (d/365); label = (Number.isInteger(y)?y:y.toFixed(1))+" yr lock"; }
  else if (d >= 30) label = Math.round(d/30)+" mo lock";
  else label = d+" day lock";
  return { days: d, label, boost, penalty };
}

const STRATEGIES = {
  safe: {
    key:"safe", label:"Safe", icon:"🛡️", rec:false, risk:"Low", rc:"#4ade80",
    split:[5,35,60], citLock:12, valLockDays:0, poolPreset:"single",
    desc:"Protect your LEMX with Citadel priority.", scoreBoost:8,
  },
  balanced: {
    key:"balanced", label:"Balanced", icon:"⚖️", rec:true, risk:"Medium", rc:"#facc15",
    split:[15,35,50], citLock:24, valLockDays:90, poolPreset:"split2",
    desc:"Steady growth across all three systems.", scoreBoost:12,
  },
  growth: {
    key:"growth", label:"Growth", icon:"📈", rec:false, risk:"Medium", rc:"#f97316",
    split:[25,40,35], citLock:36, valLockDays:180, poolPreset:"split3",
    desc:"Higher reward potential with managed risk.", scoreBoost:15,
  },
  max: {
    key:"max", label:"Max Commitment", icon:"💎", rec:false, risk:"High", rc:"#ef4444",
    split:[10,30,60], citLock:48, valLockDays:365, poolPreset:"split2",
    desc:"Long-term ecosystem commitment. Highest lock.", scoreBoost:20,
  },
};

const NET_PRIORITIES = [
  {id:"liquidity",  label:"Liquidity Prioritized",    short:"Liquidity",  icon:"💧", color:"#60a5fa", multiplier:1.5,
   live:"Liquidity is currently underfunded.",
   why:"Ecosystem TVL needs more depth. LP actions earn 1.5x Score this week.",
   sb:[{l:"Liquidity Boost",v:8,c:"#60a5fa"},{l:"Validator Support",v:3,c:"#4ade80"},{l:"Lock Bonus",v:5,c:"#f59e0b"}]},
  {id:"validators", label:"Validator Support Needed", short:"Validators", icon:"🔒", color:"#4ade80", multiplier:1.5,
   live:"Validator decentralization needed.",
   why:"Several validators have low stake. Validator actions earn 1.5x Score.",
   sb:[{l:"Validator Boost",v:9,c:"#4ade80"},{l:"Liquidity Support",v:2,c:"#60a5fa"},{l:"Lock Bonus",v:4,c:"#f59e0b"}]},
  {id:"citadel",    label:"Long-Term Locking Needed", short:"Locking",    icon:"🏰", color:"#f59e0b", multiplier:1.5,
   live:"Citadel participation increasing.",
   why:"Long-term lock participation is low. Citadel locks earn 1.5x Score.",
   sb:[{l:"Lock Boost",v:10,c:"#f59e0b"},{l:"Validator Support",v:3,c:"#4ade80"},{l:"Liquidity Boost",v:3,c:"#60a5fa"}]},
  {id:"balanced",   label:"Balanced Growth",          short:"Balanced",   icon:"⚖️", color:"#a78bfa", multiplier:1.2,
   live:"Balanced ecosystem growth detected.",
   why:"LemonChain is in balanced growth phase. All participation earns 1.2x.",
   sb:[{l:"All Participation",v:6,c:"#a78bfa"},{l:"Validator Bonus",v:4,c:"#4ade80"},{l:"Liquidity Bonus",v:6,c:"#60a5fa"}]},
];

const SCORE_TIERS = [
  {min:0,    max:100,  label:"Contributor",       color:"#9ca3af"},
  {min:100,  max:250,  label:"Builder",            color:"#4ade80"},
  {min:250,  max:500,  label:"Architect",          color:"#facc15"},
  {min:500,  max:1000, label:"Citadel Elite",      color:"#a78bfa"},
  {min:1000, max:2500, label:"Ecosystem Champion", color:"#f59e0b"},
  {min:2500, max:Infinity, label:"Lemon Legend",   color:"#ef4444"},
];

const ACHIEVEMENTS = [
  {id:"early",      icon:"🌱", label:"Early Flow Builder",   desc:"Beta user badge",                               how:"Automatic — beta user",                          color:"#9ca3af"},
  {id:"liq5",       icon:"💧", label:"Liquidity Explorer",   desc:"Supported 5+ HEXDEX pools in a flow",           how:"Select and activate a flow with 5+ pools",       color:"#60a5fa"},
  {id:"liq20",      icon:"🗺️", label:"Liquidity Architect",  desc:"Supported 20+ HEXDEX pools across all flows",   how:"Cumulatively support 20 pools",                  color:"#facc15"},
  {id:"valguard",   icon:"🛡",  label:"Validator Guardian",   desc:"Held a 180+ day validator lock",                how:"Set a validator lock of 180 days or more",       color:"#4ade80"},
  {id:"citloyal",   icon:"🏰", label:"Citadel Loyalist",     desc:"Held a 36+ month Citadel lock",                 how:"Select a 36-month or longer Citadel lock",       color:"#f59e0b"},
  {id:"netboost",   icon:"⚡", label:"Network Supporter",    desc:"Participated during a Network Boost period",    how:"Activate a flow while a Network Boost is active",color:"#a78bfa"},
  {id:"smart",      icon:"🤖", label:"Smart Strategist",     desc:"Applied a Smart Mode recommendation",           how:"Tap Apply Recommendation in Smart Mode",         color:"#a78bfa"},
  {id:"riskaware",  icon:"🔎", label:"Risk Aware",           desc:"Completed all risk confirmations before activating",how:"Check the risk confirmation on the Review step",color:"#60a5fa"},
  {id:"flowmaster",   icon:"🏆", label:"Flow Master",        desc:"Activated 10 flows total",                       how:"Activate 10 flows in demo mode",                 color:"#facc15"},
  {id:"donor1",       icon:"🎁", label:"Ecosystem Donor",    desc:"Made a donation to the ecosystem pool",          how:"Tap Contribute to Ecosystem Pool on the Score tab",            color:"#4ade80"},
  {id:"donor10",      icon:"🌊", label:"Pool Supporter",     desc:"Donated 10+ LEMX to the ecosystem pool",         how:"Donate a total of 10 LEMX or more",              color:"#60a5fa"},
  {id:"donor50",      icon:"👑", label:"Lemon Patron",       desc:"Donated 50+ LEMX to the ecosystem pool",         how:"Donate a total of 50 LEMX or more",              color:"#f59e0b"},
  {id:"donorboost",   icon:"🔥", label:"Season Sponsor",     desc:"Donated during an active Network Boost",         how:"Donate while a Network Boost is active",         color:"#a78bfa"},
];

const LB = [
  {name:"LemonKing.lemx", score:1240, tier:"Citadel Elite",      badge:"🏰 Citadel Loyalist",    focus:"Citadel",    isYou:false},
  {name:"ZestLord",       score:1105, tier:"Citadel Elite",      badge:"💧 Liquidity Specialist", focus:"Liquidity",  isYou:false},
  {name:"CitraStake",     score:980,  tier:"Citadel Elite",      badge:"🛡 Validator Guardian",   focus:"Validators", isYou:false},
  {name:"You",            score:418,  tier:"Architect",          badge:"⚡ Network Supporter",    focus:"Mixed",      isYou:true},
  {name:"LemonMaxi",      score:310,  tier:"Architect",          badge:"💧 Liquidity Specialist", focus:"Liquidity",  isYou:false},
  {name:"RindStaker",     score:198,  tier:"Builder",            badge:"🔒 Validator Guardian",   focus:"Validators", isYou:false},
];
// Donation pool constants
const DONATION_POOL_INITIAL = 22;
const SEASON_END = new Date(Date.now() + 18 * 24 * 3600000); // 18 days from now
const SEASON_NAME = "Season 4";

/* ─── STRATEGY TEMPLATES ─────────────────────────────────────────────────── */
const TEMPLATES = [
  {
    id:"safe_growth", icon:"🌱", label:"Safe Growth", risk:"Low", rc:"#4ade80",
    split:[5,35,60], citLock:12, valLockDays:90,
    poolIds:["HXDX"],                           // single safest pool
    validatorId:7,                              // CitadelGuard — top recommended
    desc:"Lower liquidity exposure with a strong validator and steady Citadel commitment. Good starting point.",
    ecoImpactLabel:"Medium", returnLabel:"Steady",
  },
  {
    id:"liq_booster", icon:"💧", label:"Liquidity Booster", risk:"Medium", rc:"#60a5fa",
    split:[40,35,25], citLock:12, valLockDays:90,
    poolIds:["HXDX","LPAY"],                    // core + stable eco pool
    validatorId:1,                              // LemonNode Alpha
    desc:"Higher HEXDEX allocation across two stable pools. Multi-pool routing. Network Boost friendly.",
    ecoImpactLabel:"High", returnLabel:"Growth",
  },
  {
    id:"val_guardian", icon:"🔒", label:"Validator Guardian", risk:"Medium", rc:"#4ade80",
    split:[10,55,35], citLock:12, valLockDays:365,
    poolIds:["HXDX"],
    validatorId:6,                              // PulpStake — Active, healthy
    desc:"Higher validator allocation with a 1-year lock. Supports decentralization and earns strong lock bonus.",
    ecoImpactLabel:"High", returnLabel:"Steady",
  },
  {
    id:"cit_builder", icon:"🏰", label:"Citadel Builder", risk:"Low", rc:"#f59e0b",
    split:[5,25,70], citLock:36, valLockDays:180,
    poolIds:["HXDX"],
    validatorId:7,                              // CitadelGuard
    desc:"Heavy Citadel allocation with a 3-year lock. Maximum long-term ecosystem support and bonus rewards.",
    ecoImpactLabel:"Critical", returnLabel:"Conservative",
  },
  {
    id:"eco_supporter", icon:"⚖️", label:"Ecosystem Supporter", risk:"Medium", rc:"#a78bfa",
    split:[20,35,45], citLock:24, valLockDays:180,
    poolIds:["HXDX","LBNK"],                   // core + LemonBank (stable eco)
    validatorId:3,                              // YellowValidator #3 — Active
    desc:"Balanced across all systems. Two stable pools, solid validator. Optimized for current Network Boost.",
    ecoImpactLabel:"High", returnLabel:"Growth",
  },
  {
    id:"yield_hunter", icon:"📈", label:"Yield Hunter", risk:"High", rc:"#ef4444",
    split:[45,40,15], citLock:6, valLockDays:30,
    poolIds:["HXDX","PUP","HXBT"],             // 3 pools for higher blended APY
    validatorId:2,                              // CitraStake Pro — higher APY
    desc:"Higher reward potential with more risk. Three pools. Short locks for flexibility. Not for long-term stability.",
    ecoImpactLabel:"Low", returnLabel:"Aggressive",
  },
  {
    id:"conviction", icon:"💎", label:"Long-Term Conviction", risk:"Medium", rc:"#facc15",
    split:[15,25,60], citLock:60, valLockDays:1825,
    poolIds:["HXDX","LBNK"],
    validatorId:7,                              // CitadelGuard — 5-year lock compatible
    desc:"Maximum lock exposure. 5-year validator lock, 5-year Citadel lock. For deeply committed ecosystem participants.",
    ecoImpactLabel:"Critical", returnLabel:"High Yield",
  },
];

/* ─── SEASONAL EVENTS ────────────────────────────────────────────────────── */
const SEASONAL_EVENTS = [
  {id:"liq_surge",  icon:"💧", name:"Liquidity Surge Week",      goal:"Support 3+ HEXDEX pools",         bonus:"1.5x LP score",  mult:1.5, timeLeft:"6d 4h", badgeId:"liq5",      color:"#60a5fa", desc:"LemonChain needs deeper liquidity. Route to 3 or more pools and earn boosted score."},
  {id:"val_defense",icon:"🔒", name:"Validator Defense Event",   goal:"Lock validator stake 90+ days",    bonus:"+15 score pts",  mult:1.3, timeLeft:"11d 2h",badgeId:"valguard",  color:"#4ade80", desc:"Decentralization is weakening. Lock your validator stake for 90+ days."},
  {id:"cit_stable", icon:"🏰", name:"Citadel Stability Event",   goal:"Lock Citadel for 24+ months",     bonus:"+20 score pts",  mult:1.4, timeLeft:"18d 0h",badgeId:"citloyal",  color:"#f59e0b", desc:"Long-term lock participation is low. Commit to a 24+ month Citadel lock."},
  {id:"eco_sprint", icon:"⚡", name:"Ecosystem Support Sprint",  goal:"Activate flow + donate to pool",  bonus:"Ecosystem Donor",mult:1.2, timeLeft:"4d 12h",badgeId:"donor1",    color:"#a78bfa", desc:"Final push before season end. Activate a flow and contribute to the ecosystem pool."},
];

/* ─── ECOSYSTEM HEATMAP METRICS ─────────────────────────────────────────── */
const HEATMAP_METRICS = [
  {id:"liquidity",    label:"Liquidity Health",        icon:"💧", val:58, trend:"down", status:"Watch",         statusColor:"#f97316", boostAction:"Add HEXDEX liquidity",              color:"#60a5fa", why:"Liquidity helps deepen trading markets and reduces slippage for all LemonChain participants."},
  {id:"validators",   label:"Validator Decentralization",icon:"🔒",val:82, trend:"stable",status:"Strong",      statusColor:"#4ade80", boostAction:"Stake to low-crowding validators",   color:"#4ade80", why:"Distributed validator stake secures LemonChain and prevents centralization risk."},
  {id:"citadel",      label:"Citadel Participation",   icon:"🏰", val:61, trend:"up",   status:"Stable",        statusColor:"#facc15", boostAction:"Lock Citadel 24+ months",            color:"#f59e0b", why:"Citadel locks reduce circulating supply and signal long-term confidence in the ecosystem."},
  {id:"flow_growth",  label:"Active Flow Growth",      icon:"🌱", val:74, trend:"up",   status:"Stable",        statusColor:"#facc15", boostAction:"Activate a new flow",                color:"#4ade80", why:"More active flows mean more ecosystem routing, deeper coordination, and stronger network effects."},
  {id:"donation",     label:"Donation Pool Support",   icon:"🎁", val:38, trend:"down", status:"Weak",          statusColor:"#ef4444", boostAction:"Contribute to Ecosystem Pool",       color:"#a78bfa", why:"Optional ecosystem contributions reward top LemonFlow participants and fund seasonal prizes."},
];

/* ─── WHY THIS MATTERS CONTENT ───────────────────────────────────────────── */
const WHY_MATTERS = {
  liquidity:   "Liquidity helps deepen trading markets and reduce slippage. Deeper HEXDEX pools benefit every LemonChain participant.",
  validators:  "Validator staking helps secure and decentralize LemonChain. Distributed stake prevents any single entity from dominating.",
  citadel:     "Citadel locks support long-term ecosystem stability. Long commitments reduce supply pressure and improve network confidence.",
  donation:    "Optional ecosystem contributions reward top LemonFlow participants and fund seasonal prize pools at season end.",
  smart_mode:  "Smart Mode routes your participation toward what LemonChain needs most, maximizing both your returns and ecosystem health.",
  score:       "Lemon Score reflects your total positive contribution to the LemonChain ecosystem — not just your token balance.",
  network_boost:"Network Boost multiplies your score for actions that match LemonChain's current highest priority need.",
};

/* ─── MISSIONS ───────────────────────────────────────────────────────────── */
const MISSIONS = [
  {id:"m_pools3",    icon:"💧", label:"Tri-Pool Support",        desc:"Add liquidity to 3+ pools",              pts:15, check:s=>(s.poolSplit||[]).length>=3,               badge:null,         color:"#60a5fa"},
  {id:"m_vallock",   icon:"🔒", label:"Lock In",                 desc:"Hold a 180+ day validator lock",         pts:20, check:s=>(s.valLock?.days||0)>=180,                  badge:"valguard",   color:"#4ade80"},
  {id:"m_citlock24", icon:"🏰", label:"Citadel Commitment",      desc:"Lock Citadel for 24+ months",            pts:25, check:s=>(s.citLock||0)>=24,                         badge:"citloyal",   color:"#f59e0b"},
  {id:"m_smart",     icon:"🤖", label:"Smart Participation",     desc:"Apply a Smart Mode recommendation",      pts:10, check:s=>s.smartApplied===true,                      badge:"smart",      color:"#a78bfa"},
  {id:"m_donate",    icon:"🎁", label:"Pool Contributor",        desc:"Contribute to the Ecosystem Pool",       pts:10, check:s=>(s.totalDonated||0)>=0.1,                   badge:"donor1",     color:"#4ade80"},
  {id:"m_reflow",    icon:"🔄", label:"Re-Flow Master",          desc:"Use Re-Flow on available rewards",       pts:8,  check:s=>(s.flowHistory||[]).some(h=>h.action.includes("Re-Flow")), badge:null, color:"#60a5fa"},
  {id:"m_lowcrowd",  icon:"🌐", label:"Decentralization Ally",   desc:"Select a validator with <60% crowding",  pts:12, check:s=>s.validator&&(s.validator.deleg||100)<60,   badge:"valguard",   color:"#4ade80"},
  {id:"m_flow10",    icon:"🏆", label:"Flow Legend",             desc:"Activate 10 flows total",                pts:50, check:s=>(s.flowCount||0)>=10,                       badge:"flowmaster", color:"#facc15"},
];

/* ─── REPUTATION TYPES ───────────────────────────────────────────────────── */
const REPUTATION_TYPES = [
  {id:"liq_arch",   label:"Liquidity Architect",   icon:"💧", color:"#60a5fa", desc:"Primary focus on deepening HEXDEX liquidity pools.", check:s=>(s.split||[0])[0]>=20&&(s.activeFlows||[]).length>=1},
  {id:"val_guard",  label:"Validator Guardian",     icon:"🔒", color:"#4ade80", desc:"Committed validator staker with strong lock history.", check:s=>(s.valLock?.days||0)>=180},
  {id:"cit_loyal",  label:"Citadel Loyalist",       icon:"🏰", color:"#f59e0b", desc:"Long-term Citadel locker supporting ecosystem stability.", check:s=>(s.citLock||0)>=24},
  {id:"eco_build",  label:"Ecosystem Builder",      icon:"🌱", color:"#4ade80", desc:"Balanced participation across all three systems.", check:s=>(s.activeFlows||[]).length>=1&&(s.totalDonated||0)>0},
  {id:"net_supp",   label:"Network Supporter",      icon:"⚡", color:"#a78bfa", desc:"Active during Network Boost periods. Earns multiplied score.", check:s=>s.flowActive===true},
  {id:"smart_strat",label:"Smart Strategist",       icon:"🤖", color:"#a78bfa", desc:"Leverages Smart Mode for optimized ecosystem participation.", check:s=>s.smartApplied===true},
];

/* ─── AUTO REFLOW MODES ──────────────────────────────────────────────────── */
const REFLOW_MODES = [
  {id:"off",          label:"Off",                icon:"○",  split:null},
  {id:"balanced",     label:"Balanced",           icon:"⚖️",  split:[20,35,45]},
  {id:"liq_first",    label:"Liquidity First",    icon:"💧",  split:[45,30,25]},
  {id:"val_first",    label:"Validator First",    icon:"🔒",  split:[20,55,25]},
  {id:"cit_max",      label:"Citadel Max",        icon:"🏰",  split:[10,20,70]},
  {id:"match",        label:"Match My Strategy",  icon:"🎯",  split:null}, // uses current split
];

const SMART_SIGNALS = [
  "Liquidity depth below target",
  "Validator decentralization improving",
  "Citadel participation stable",
  "HXDX liquidity healthy",
  "Low-risk pools prioritized",
  "Network routing optimized",
  "Ecosystem stability: Strong",
  "LP rewards tracking upward",
  "Multi-pool routing increases ecosystem depth",
  "Validator lock duration above average",
  "Citadel participation rising this week",
  "Network balance score: 82 / 100",
];

const ECOSYSTEM_FEED = [
  {msg:"Liquidity priority activated · TVL below target",    color:"#60a5fa", icon:"💧"},
  {msg:"Validator decentralization weakening · 3 nodes offline", color:"#ef4444", icon:"🔒"},
  {msg:"Citadel participation rising this week",              color:"#f59e0b", icon:"🏰"},
  {msg:"HXDX TVL increased 4% in last 24h",                  color:"#4ade80", icon:"📈"},
  {msg:"Network Boost active · LP actions earn 1.5x score",  color:"#a78bfa", icon:"⚡"},
  {msg:"Smart Mode recommendation queued by 14 users",        color:"#facc15", icon:"🤖"},
  {msg:"New Citadel locks: +3 this hour",                    color:"#f59e0b", icon:"🏰"},
  {msg:"Ecosystem stability score: 82 / 100",                color:"#4ade80", icon:"🌱"},
  {msg:"LemonFlow routed 1,240 LEMX today",                  color:"#facc15", icon:"🍋"},
  {msg:"Validator commission average: 5.8% — healthy",       color:"#4ade80", icon:"🔒"},
];

/* ─── ECOSYSTEM ALERTS ───────────────────────────────────────────────────── */
const ECOSYSTEM_ALERTS = [
  {
    id:"liq_deficit",
    level:"critical",
    icon:"🚨",
    title:"Liquidity Deficit Active",
    body:"Liquidity depth has fallen below target. LemonChain needs deeper HEXDEX pool support.",
    boostedAction:"Add HEXDEX liquidity · 1.5x score boost active",
    boostColor:"#60a5fa",
    borderColor:"#ef4444",
    bg:"#ef44440d",
    npId:"liquidity",
  },
  {
    id:"val_weak",
    level:"warning",
    icon:"⚠️",
    title:"Validator Decentralization Weakening",
    body:"Validator stake concentration is increasing. LemonChain needs more distributed staking.",
    boostedAction:"Stake to low-crowding validators · bonus score this week",
    boostColor:"#4ade80",
    borderColor:"#f97316",
    bg:"#f973160d",
    npId:"validators",
  },
  {
    id:"cit_low",
    level:"warning",
    icon:"🏰",
    title:"Citadel Participation Low",
    body:"Long-term Citadel lock participation is below target. Stability commitment is needed.",
    boostedAction:"Lock Citadel for 24+ months · 1.5x score on Citadel actions",
    boostColor:"#f59e0b",
    borderColor:"#f59e0b",
    bg:"#f59e0b0d",
    npId:"citadel",
  },
  {
    id:"balanced",
    level:"info",
    icon:"⚖️",
    title:"Balanced Growth Phase",
    body:"LemonChain is in healthy balance. All participation types earn bonus score this week.",
    boostedAction:"All actions earn 1.2x score · great time to activate a flow",
    boostColor:"#a78bfa",
    borderColor:"#a78bfa",
    bg:"#a78bfa0d",
    npId:"balanced",
  },
];

/* ─── UTILS ──────────────────────────────────────────────────────────────── */
const f2 = n => (n == null || isNaN(n)) ? "0.00" : parseFloat(n.toFixed(2)).toString();
const f1 = n => (n == null || isNaN(n)) ? "0.0"  : parseFloat(n.toFixed(1)).toString();
const fK = n => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`;
const ilColor = il => ({Low:"#4ade80",Medium:"#facc15","Med-High":"#f97316",High:"#ef4444","Very High":"#dc2626"}[il]||"#9ca3af");
const healthColor = h => h >= 80 ? "#4ade80" : h >= 60 ? "#facc15" : h >= 40 ? "#f97316" : "#ef4444";
const statusColor = s => ({Recommended:"#4ade80",Active:"#60a5fa",Watchlist:"#facc15",Overcrowded:"#f97316","Uptime Risk":"#ef4444","Not Recommended":"#dc2626"}[s]||"#9ca3af");
const getTier = s => SCORE_TIERS.find(t => s >= t.min && s < t.max) || SCORE_TIERS[SCORE_TIERS.length-1];

function poolRating(p, np) {
  // Prioritise health and low IL — high APY alone doesn't mean a good pool
  const ilPenalty = {Low:0, Medium:8, "Med-High":18, High:32, "Very High":50}[p.il] || 0;
  let base = Math.min(100, Math.round(
    p.health * .50 +          // health is the primary signal
    (p.tvl / 5e6) * 25 +      // deep TVL matters for safety
    (p.vol / 1e6) * 15 +      // volume as activity signal
    (p.apy / 50)  * 10 -      // APY contributes but doesn't dominate
    ilPenalty
  ));
  if (np?.id === "liquidity" && p.health >= 65) base = Math.min(100, base + 6);
  return Math.max(8, base);
}
const ratingLabel = r => r >= 80 ? "Strong" : r >= 60 ? "Watch" : r >= 40 ? "Risky" : "Experimental";
const ratingColor = r => r >= 85 ? "#4ade80" : r >= 70 ? "#facc15" : r >= 50 ? "#f97316" : r >= 35 ? "#ef4444" : "#dc2626";

function valRating(v, np) {
  if (!v) return 50;
  let b = Math.min(100, Math.round(v.score * .5 + (v.uptime - 97) * 10 - v.commission * 2 - (v.deleg > 70 ? 10 : 0)));
  if (v.offline) b = Math.max(0, b - 30);
  if (v.status === "Overcrowded") b = Math.max(0, b - 15);
  if (np?.id === "validators") b = Math.min(100, b + 8);
  return Math.max(5, b);
}
const valRatingLabel = r => r >= 85 ? "Recommended" : r >= 70 ? "Strong" : r >= 55 ? "Active" : r >= 40 ? "Overcrowded" : r >= 25 ? "Uptime Risk" : "Not Recommended";
const valRatingColor = r => r >= 85 ? "#4ade80" : r >= 70 ? "#facc15" : r >= 55 ? "#60a5fa" : r >= 40 ? "#f97316" : r >= 25 ? "#ef4444" : "#dc2626";

const valDesc = v => {
  if (!v) return "";
  if (v.offline) return "Recently offline — avoid for conservative strategies. High uptime supports network reliability.";
  if (v.status === "Overcrowded") return "Very crowded. Lower crowding improves decentralization and individual reward share.";
  if (v.status === "Uptime Risk") return "Uptime below 99%. High uptime improves network stability and reward consistency.";
  if (v.status === "Watchlist") return "Moderate uptime. Monitor before long-term lock. Lower commission may improve delegator returns.";
  if (v.score >= 88) return "Excellent: high uptime, fair commission, healthy decentralization.";
  if (v.score >= 80) return "Healthy: consistent uptime, fair commission. Good for locked strategies.";
  if (v.score >= 70) return "Active: reliable performance. Suitable for most participation strategies.";
  return "Monitor performance. Consider uptime, commission, and crowding before committing a long lock.";
};

// Returns a health label for validator cards
const valHealthLabel = v => {
  if (!v) return {label:"—", color:"#6b7280"};
  if (v.offline || v.uptime < 98) return {label:"Risky",     color:"#ef4444"};
  if (v.score >= 85)               return {label:"Excellent", color:"#4ade80"};
  if (v.score >= 73)               return {label:"Healthy",   color:"#facc15"};
  if (v.score >= 60)               return {label:"Watchlist", color:"#f97316"};
  return                                  {label:"Risky",     color:"#ef4444"};
};

const poolTags = p => {
  const t = [];
  if (p.id === "HXDX") t.push({l:"Ecosystem Core", c:"#facc15"});
  else if (p.health >= 80 && p.il === "Low") t.push({l:"Stable Pool", c:"#4ade80"});
  else if (p.health >= 75) t.push({l:"Healthy Pool", c:"#4ade80"});
  if (p.il === "Very High") t.push({l:"Experimental", c:"#dc2626"});
  else if (p.il === "High") t.push({l:"High Risk", c:"#ef4444"});
  else if (p.apy > 24 && p.health >= 55) t.push({l:"Growth Pool", c:"#f97316"});
  if (t.length === 0) t.push({l:"Ecosystem", c:"#60a5fa"});
  return t.slice(0, 2);
};

const flowConfidence = (v, ps, cit, np) => {
  const vr = valRating(v, np);
  const pr = ps.length ? ps.reduce((s,x) => s + poolRating(x.pool, np), 0) / ps.length : 50;
  const lk = cit >= 24 ? 20 : cit >= 12 ? 10 : 0;
  const tot = (vr + pr) / 2 + lk;
  if (tot >= 75) return {label:"Strong",      color:"#4ade80"};
  if (tot >= 60) return {label:"Stable",      color:"#facc15"};
  if (tot >= 45) return {label:"Moderate",    color:"#f97316"};
  return              {label:"Experimental", color:"#ef4444"};
};

const ecoImpact = (np, split) => {
  if (!np) return {label:"Medium", color:"#facc15"};
  if (np.id === "liquidity" && split[0] >= 15) return {label:"Critical Support", color:"#ef4444"};
  if (np.multiplier === 1.5) return {label:"High", color:"#f97316"};
  return {label:"Medium", color:"#facc15"};
};

const positionHealth = (v, ps, np) => {
  if (!v) return {label:"No position", color:"#6b7280"};
  const vr = valRating(v, np);
  const pr = ps.reduce((s,x) => s + poolRating(x.pool, np), 0) / (ps.length || 1);
  const avg = (vr + pr) / 2;
  if (avg >= 78) return {label:"Excellent", color:"#4ade80"};
  if (avg >= 62) return {label:"Healthy",   color:"#facc15"};
  if (avg >= 45) return {label:"Watchlist", color:"#f97316"};
  return            {label:"Risky",      color:"#ef4444"};
};

const checkAchievement = (id, state) => {
  const {
    flowActive=false, poolSplit=[], valLock=null, citLock=0,
    flowCount=0, smartApplied=false, riskCheckedCount=0,
    totalDonated=0,
  } = state || {};
  if (id === "early")      return true;
  if (id === "liq5")       return flowActive && poolSplit.length >= 1;
  if (id === "liq20")      return false;
  if (id === "valguard")   return (valLock?.days || 0) >= 180;
  if (id === "citloyal")   return (citLock || 0) >= 36;
  if (id === "netboost")   return flowActive;
  if (id === "smart")      return smartApplied === true;
  if (id === "riskaware")  return riskCheckedCount >= 1;
  if (id === "flowmaster") return flowCount >= 10;
  if (id === "donor1")     return totalDonated >= 1;
  if (id === "donor10")    return totalDonated >= 10;
  if (id === "donor50")    return totalDonated >= 50;
  if (id === "donorboost") return totalDonated >= 1; // simplified: any donation qualifies in demo
  return false;
};

// Returns sorted list of currently unlocked achievement ids
const getUnlockedIds = (state) =>
  ACHIEVEMENTS.filter(a => checkAchievement(a.id, state)).map(a => a.id);

/* ─── SCORE CALCULATION ──────────────────────────────────────────────────── */
// Points-per-LEMX base rates
const SCORE_RATES = {
  liquidity: 2.0,   // 2 pts per LEMX to HEXDEX (highest — biggest ecosystem need)
  validator: 1.5,   // 1.5 pts per LEMX staked
  citadel:   1.0,   // 1 pt per LEMX locked
};

// Validator lock multipliers
function valLockMultiplier(days) {
  if (days >= 1825) return 1.80; // 5 years
  if (days >= 1095) return 1.55; // 3 years
  if (days >= 365)  return 1.35; // 1 year
  if (days >= 180)  return 1.20;
  if (days >= 90)   return 1.10;
  if (days >= 30)   return 1.05;
  return 1.0; // unlocked
}

// Citadel lock multipliers
function citLockMultiplier(months) {
  if (months >= 60) return 2.00;
  if (months >= 48) return 1.60;
  if (months >= 36) return 1.40;
  if (months >= 24) return 1.25;
  if (months >= 12) return 1.10;
  if (months >= 6)  return 1.05;
  return 1.0;
}

// Multi-pool liquidity bonus
function multiPoolMultiplier(poolCount) {
  if (poolCount >= 10) return 1.35;
  if (poolCount >= 5)  return 1.20;
  if (poolCount >= 3)  return 1.10;
  if (poolCount >= 2)  return 1.05;
  return 1.0;
}

// Network boost multipliers per action type
function networkBoostMult(npId, type) {
  const boosts = {
    liquidity:  {liquidity:1.5, validator:1.0, citadel:1.0},
    validators: {liquidity:1.0, validator:1.5, citadel:1.0},
    citadel:    {liquidity:1.0, validator:1.2, citadel:1.5},
    balanced:   {liquidity:1.15,validator:1.15,citadel:1.15},
  };
  return (boosts[npId] || boosts.balanced)[type] || 1.0;
}

// Calculate full score breakdown for a flow
function calcFlowScore(amount, split, valLockDays, citLockMonths, poolCount, npId) {
  const [liqPct, valPct, citPct] = split;
  const liqAmt = amount * liqPct / 100;
  const valAmt = amount * valPct / 100;
  const citAmt = amount * citPct / 100;

  const liqBase  = liqAmt * SCORE_RATES.liquidity;
  const valBase  = valAmt * SCORE_RATES.validator;
  const citBase  = citAmt * SCORE_RATES.citadel;

  const liqMult  = multiPoolMultiplier(poolCount) * networkBoostMult(npId, "liquidity");
  const valMult  = valLockMultiplier(valLockDays) * networkBoostMult(npId, "validator");
  const citMult  = citLockMultiplier(citLockMonths) * networkBoostMult(npId, "citadel");

  const liqPts   = parseFloat((liqBase * liqMult).toFixed(1));
  const valPts   = parseFloat((valBase * valMult).toFixed(1));
  const citPts   = parseFloat((citBase * citMult).toFixed(1));
  const total    = Math.round(liqPts + valPts + citPts);

  return {
    liqAmt, valAmt, citAmt,
    liqBase, valBase, citBase,
    liqMult, valMult, citMult,
    liqPts, valPts, citPts,
    poolBonus:   multiPoolMultiplier(poolCount),
    valLockBonus: valLockMultiplier(valLockDays),
    citLockBonus: citLockMultiplier(citLockMonths),
    npLiqBoost:  networkBoostMult(npId, "liquidity"),
    npValBoost:  networkBoostMult(npId, "validator"),
    npCitBoost:  networkBoostMult(npId, "citadel"),
    total,
  };
}

function buildPoolSplit(preset) {
  const eco = POOLS.filter(p => p.tag === "eco").sort((a,b) => b.health - a.health);
  if (preset === "single")  return [{pool: POOLS[0], pct: 100}];
  if (preset === "split2")  return [{pool: POOLS[0], pct: 70}, {pool: eco[0], pct: 30}];
  return [{pool: POOLS[0], pct: 50}, {pool: eco[0], pct: 25}, {pool: eco[1], pct: 25}];
}

function buildStrategyConfig(key) {
  const s = STRATEGIES[key] || STRATEGIES.balanced;
  return {
    split: [...s.split],
    citLock: s.citLock,
    valLock: VAL_LOCKS.find(l => l.days === s.valLockDays) || VAL_LOCKS[0],
    poolSplit: [],        // no preselection — user must choose
    validator: null,      // no preselection — user must choose
    poolPreset: s.poolPreset,
  };
}

function calcSimulation(amount, split, validator, poolSplit, citLock, valLock, days, np) {
  const vb = (valLock?.boost || 0) / 10;
  const hexBlend = poolSplit.length ? poolSplit.reduce((s,x) => s + x.pool.apy * x.pct / 100, 0) : 0;
  const valAPY = (validator?.apy || 0) + vb;
  const ct = CIT_TIERS.find(t => t.months === citLock);
  const citRate = ct ? ct.bonus / (ct.months / 12) : 0;
  const mult = np?.multiplier || 1;
  const y = days / 365;
  const hR = amount * split[0] / 100 * hexBlend / 100 * y * 1.1;
  const vR = amount * split[1] / 100 * valAPY / 100 * y * 1.2;
  const cR = amount * split[2] / 100 * citRate / 100 * y;
  return {
    hR: f2(hR), vR: f2(vR), cR: f2(cR),
    total: f2(hR + vR + cR),
    scoreGain: Math.round((hR + vR + cR) * 0.4 * mult),
  };
}

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────── */
const Card = ({children, sx={}, cls="", ...p}) => (
  <div className={cls} style={{background:"#161620",border:"1px solid #232330",borderRadius:14,padding:"14px 13px",...sx}} {...p}>
    {children}
  </div>
);
const STitle = ({children, sx={}}) => (
  <div style={{fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:".07em",marginBottom:7,...sx}}>
    {children}
  </div>
);
const KVRow = ({label, val, vc, mono}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #1a1a22"}}>
    <span style={{fontSize:12,color:"#6b7280"}}>{label}</span>
    <span style={{fontSize:12,fontWeight:600,color:vc||"#c8c8d0",fontFamily:mono?"'DM Mono',monospace":undefined}}>{val}</span>
  </div>
);
const StatBig = ({label, val, color="#f0f0f2"}) => (
  <div style={{textAlign:"center"}}>
    <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:600,color,lineHeight:1.2}}>{val}</div>
    <div style={{fontSize:9,color:"#5a5a6a",marginTop:3,whiteSpace:"nowrap"}}>{label}</div>
  </div>
);
const StatSm = ({label, val, color="#6b7280"}) => (
  <div style={{textAlign:"center"}}>
    <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,color,lineHeight:1.2}}>{val}</div>
    <div style={{fontSize:9,color:"#4b5563",marginTop:2,whiteSpace:"nowrap"}}>{label}</div>
  </div>
);
const PBtn = ({children, onClick, color="#facc15", tc="#000", disabled, outline, sx={}}) => (
  <button onClick={disabled ? undefined : onClick} style={{
    padding:"12px 0", width:"100%",
    background: disabled ? "#1e1e28" : outline ? "transparent" : color,
    color: disabled ? "#3a3a48" : outline ? color : tc,
    border: outline ? `1px solid ${color}50` : "none",
    borderRadius:10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13,
    transition:"all .2s", opacity: disabled ? .5 : 1, ...sx
  }}>{children}</button>
);
const Bdg = ({children, color="#4ade80"}) => (
  <span style={{display:"inline-block",padding:"2px 8px",background:color+"1c",color,border:`1px solid ${color}28`,borderRadius:99,fontSize:10,fontWeight:600,lineHeight:1.4}}>
    {children}
  </span>
);
const Dot = ({color="#4ade80"}) => (
  <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:color,flexShrink:0,animation:"dotBlink 1.2s ease-in-out infinite"}}/>
);

/* ─── ANIMATED SCORE ─────────────────────────────────────────────────────── */
function AnimScore({value, color, sz=56}) {
  const [disp, setDisp] = useState(value);
  const [glow, setGlow] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    setGlow(true);
    let i = 0, n = 20, s = prev.current, e = value;
    const t = setInterval(() => {
      i++;
      setDisp(Math.round(s + (e - s) * (i / n)));
      if (i >= n) { clearInterval(t); setGlow(false); prev.current = value; }
    }, 18);
    return () => clearInterval(t);
  }, [value]);
  return (
    <div style={{fontFamily:"'DM Mono',monospace",fontSize:sz,fontWeight:600,color,lineHeight:1,
      textShadow:glow?`0 0 22px ${color}70`:"none",animation:glow?"countUp .25s ease forwards":"none"}}>
      {disp}
    </div>
  );
}

/* ─── ANIMATED BAR ───────────────────────────────────────────────────────── */
function AnimBar({pct, color, h=5}) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 80); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{height:h,background:"#1e1e28",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width .7s cubic-bezier(.4,0,.2,1)"}}/>
    </div>
  );
}

/* ─── SPARKLINE ──────────────────────────────────────────────────────────── */
function Spark({data, color, h=28, w=72}) {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-(((v-mn)/rng)*(h-4)+2)}`).join(" ");
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85"/>
    </svg>
  );
}

/* ─── MINI BAR ───────────────────────────────────────────────────────────── */
function MiniBar({data, color, h=36}) {
  const mx = Math.max(...data.map(d => d.v));
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:h}}>
      {data.map((d,i) => (
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:color,height:Math.round((d.v/mx)*(h-12))+"px",transition:"height .5s ease"}}/>
          {d.l && <div style={{fontSize:8,color:"#4b5563"}}>{d.l}</div>}
        </div>
      ))}
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────── */
function Toast({msg, onDone}) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,
      background:"#162016",border:"1px solid #4ade8055",borderRadius:99,
      padding:"10px 20px",color:"#4ade80",fontSize:12,fontWeight:600,whiteSpace:"nowrap",
      animation:"toastIn .22s ease forwards",boxShadow:"0 4px 20px #0009"}}>
      ✓ {msg}
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
function Modal({title, onClose, children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:500,display:"flex",alignItems:"flex-end"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="su" style={{width:"100%",maxWidth:480,margin:"0 auto",background:"#0f0f14",
        borderRadius:"18px 18px 0 0",padding:"16px 13px 32px",maxHeight:"90vh",
        display:"flex",flexDirection:"column",border:"1px solid #232330"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700}}>{title}</div>
          <button onClick={onClose} style={{background:"#1e1e28",border:"1px solid #2a2a38",borderRadius:7,
            padding:"5px 11px",cursor:"pointer",color:"#9ca3af",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
}

/* ─── WARN TAG ───────────────────────────────────────────────────────────── */
function WarnTag({icon, short, detail, color="#f97316"}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{display:"inline-flex",flexDirection:"column",gap:4}}>
      <button onClick={() => setOpen(o => !o)} style={{display:"inline-flex",alignItems:"center",gap:4,
        padding:"3px 8px",background:color+"18",border:`1px solid ${color}28`,borderRadius:99,
        cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color}}>
        {icon} {short} {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{fontSize:11,color,background:color+"0d",border:`1px solid ${color}20`,
          borderRadius:7,padding:"7px 9px",lineHeight:1.55,maxWidth:264}}>
          {detail}
        </div>
      )}
    </div>
  );
}

/* ─── IL EXPLAINER ───────────────────────────────────────────────────────── */
function ILExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginTop:6}}>
      <button onClick={() => setOpen(o => !o)} style={{fontSize:10,color:"#60a5fa",
        background:"#60a5fa12",border:"1px solid #60a5fa25",borderRadius:6,
        padding:"3px 9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
        What is Impermanent Loss? {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{marginTop:6,padding:"10px 12px",background:"#1a1a24",borderRadius:9,
          border:"1px solid #2a2a38",fontSize:11,color:"#9ca3af",lineHeight:1.6}}>
          Impermanent loss means your LP value can change compared with simply holding the tokens if prices move apart. Higher APY does not always mean better risk-adjusted return.
          <div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}>
            {[["Low IL","#4ade80","Low divergence"],["Medium IL","#facc15","Moderate divergence"],["High IL","#ef4444","High divergence risk"]].map(([l,c,d]) => (
              <div key={l} style={{background:c+"12",border:`1px solid ${c}25`,borderRadius:6,padding:"5px 8px"}}>
                <div style={{fontSize:10,fontWeight:700,color:c}}>{l}</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── RISK ACCORDION ─────────────────────────────────────────────────────── */
function RiskAccordion({checked, setChecked}) {
  const [open, setOpen] = useState(null);
  const groups = [
    {id:"liq", label:"Liquidity Risks", icon:"💧", color:"#60a5fa",
     desc:"HEXDEX liquidity carries impermanent loss risk. Your LP value can change if token prices move. Higher APY pools may carry higher volatility."},
    {id:"val", label:"Validator Risks", icon:"🔒", color:"#4ade80",
     desc:"Validator rewards are estimates and may vary. Breaking a validator lock may forfeit 50% of rewards. Unstaking takes 7 days."},
    {id:"cit", label:"Citadel Risks",   icon:"🏰", color:"#f59e0b",
     desc:"Citadel rewards cannot be claimed until after the lock period ends, then drip over half the lock duration."},
  ];
  return (
    <div style={{marginBottom:12}}>
      <STitle>Risk Confirmation</STitle>
      {groups.map(g => (
        <div key={g.id} style={{marginBottom:6,background:"#1a1a24",borderRadius:9,border:`1px solid ${g.color}20`,overflow:"hidden"}}>
          <button onClick={() => setOpen(o => o === g.id ? null : g.id)}
            style={{width:"100%",padding:"9px 12px",background:"transparent",border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
            <span style={{fontSize:13}}>{g.icon}</span>
            <span style={{fontSize:11,fontWeight:600,color:g.color,flex:1}}>{g.label}</span>
            <span style={{fontSize:10,color:"#6b7280"}}>{open === g.id ? "▲" : "▼"}</span>
          </button>
          {open === g.id && (
            <div style={{padding:"0 12px 10px",fontSize:11,color:"#9ca3af",lineHeight:1.5,
              borderTop:"1px solid #232330",paddingTop:8}}>
              {g.desc}
            </div>
          )}
        </div>
      ))}
      <label style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:8,cursor:"pointer",
        padding:"10px 12px",background:"#1a1a24",borderRadius:9,border:"1px solid #232330"}}>
        <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}/>
        <span style={{fontSize:11,color:"#9ca3af",lineHeight:1.5,paddingTop:1}}>
          I understand LemonFlow recommendations are estimates and risks are possible.
        </span>
      </label>
    </div>
  );
}

/* ─── ACTIVATE MODAL ─────────────────────────────────────────────────────── */
function ActivateModal({onDone, amount, split, strategy}) {
  const steps = ["Preparing LemonFlow","Routing HEXDEX liquidity","Delegating validator stake","Creating Citadel lock","Flow activated"];
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const strat = STRATEGIES[strategy] || STRATEGIES.balanced;
  useEffect(() => {
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 600);
      return () => clearTimeout(t);
    } else {
      setDone(true);
      const t = setTimeout(onDone, 1200);
      return () => clearTimeout(t);
    }
  }, [step]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.93)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {done && <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(74,222,128,.05),transparent)",animation:"sweep 1.2s ease forwards",pointerEvents:"none"}}/>}
      <div style={{background:"#0f0f14",border:`1px solid ${done?"#4ade8055":"#232330"}`,borderRadius:18,padding:28,width:"100%",maxWidth:340,position:"relative",overflow:"hidden",transition:"border-color .4s"}}>
        {done && <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(74,222,128,.06),transparent 70%)",pointerEvents:"none"}}/>}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:30,marginBottom:8,filter:done?"drop-shadow(0 0 14px #4ade80)":"none",transition:"filter .4s"}}>🍋</div>
          <div style={{fontSize:15,fontWeight:700,color:done?"#4ade80":"#f0f0f2",transition:"color .3s"}}>
            {done ? "Flow Activated" : "Activating Flow"}
          </div>
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<steps.length-1?"1px solid #1e1e28":"none"}}>
            <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
              background:i<step?"#4ade80":i===step?"#facc15":"#1e1e28",
              border:`2px solid ${i<step?"#4ade80":i===step?"#facc15":"#2a2a38"}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,
              animation:i===step?"pulse 1s infinite":"none",transition:"background .3s"}}>
              {i < step ? "✓" : ""}
            </div>
            <span style={{fontSize:12,color:i<step?"#4ade80":i===step?"#facc15":"#4b5563",fontWeight:i===step?600:400,transition:"color .3s"}}>{s}</span>
          </div>
        ))}
        {done && (
          <div className="fu" style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{padding:10,background:"#4ade8012",border:"1px solid #4ade8028",borderRadius:8,textAlign:"center",fontSize:12,color:"#4ade80",fontWeight:700}}>
              Flow Successfully Activated
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[["HEXDEX",split[0]+"%","#60a5fa"],["Validator",split[1]+"%","#4ade80"],["Citadel",split[2]+"%","#f59e0b"]].map(([l,v,c]) => (
                <div key={l} style={{background:c+"12",border:`1px solid ${c}20`,borderRadius:8,padding:"8px 5px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:c,marginBottom:2}}>{l}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:c,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Contribution Summary */}
            <div style={{background:"#4ade8008",border:"1px solid #4ade8018",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#4ade80",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Your Impact on LemonChain</div>
              {split[0]>0&&<div style={{fontSize:10,color:"#60a5fa",marginBottom:3,display:"flex",gap:6}}><span>💧</span>Supported HEXDEX liquidity — improving swap depth</div>}
              {split[1]>0&&<div style={{fontSize:10,color:"#4ade80",marginBottom:3,display:"flex",gap:6}}><span>🔒</span>Strengthened validator decentralization</div>}
              {split[2]>0&&<div style={{fontSize:10,color:"#f59e0b",marginBottom:3,display:"flex",gap:6}}><span>🏰</span>Increased Citadel participation and long-term stability</div>}
              <div style={{fontSize:10,color:"#a78bfa",marginTop:3,display:"flex",gap:6}}><span>⚡</span>Earned Network Boost multiplier on qualifying actions</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:"#facc1510",borderRadius:8,border:"1px solid #facc151c"}}>
              <span style={{fontSize:11,color:"#9ca3af"}}>Score Impact</span>
              <span style={{fontSize:12,fontWeight:700,color:"#facc15"}}>+{strat.scoreBoost} pts</span>
            </div>
            <div style={{textAlign:"center",fontSize:10,color:"#4b5563"}}>Demo mode — no real tokens moved. LemonFlow never moves funds without your confirmation.</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── POOL PICKER ────────────────────────────────────────────────────────── */
function PoolPicker({selected, onSelect, onClose, np, excludeIds=[]}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("rating");
  const pools = useMemo(() => {
    let p = POOLS.filter(x => !excludeIds.includes(x.id));
    if (search) p = p.filter(x => x.pair.toLowerCase().includes(search.toLowerCase()) || x.name.toLowerCase().includes(search.toLowerCase()));
    if (filter === "core")    p = p.filter(x => x.tag === "core");
    else if (filter === "eco") p = p.filter(x => x.tag === "eco");
    else if (filter === "rating") p = [...p].sort((a,b) => poolRating(b,np) - poolRating(a,np));
    else if (filter === "apy")   p = [...p].sort((a,b) => b.apy - a.apy);
    else                         p = [...p].sort((a,b) => b.vol - a.vol);
    return p;
  }, [search, filter, excludeIds, np]);
  return (
    <Modal title="Choose Pool" onClose={onClose}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
        style={{width:"100%",background:"#1a1a24",border:"1px solid #2a2a38",borderRadius:8,
          padding:"9px 12px",color:"#f0f0f2",fontSize:12,outline:"none",marginBottom:8}}/>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
        {[["rating","Best Rating"],["apy","High APY"],["vol","Volume"],["core","Core"],["eco","Ecosystem"]].map(([fv,fl]) => (
          <button key={fv} onClick={() => setFilter(fv)} style={{padding:"4px 9px",
            background:filter===fv?"#60a5fa":"#1a1a24",color:filter===fv?"#000":"#9ca3af",
            border:`1px solid ${filter===fv?"#60a5fa":"#2a2a38"}`,borderRadius:6,
            cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{fl}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {pools.map(p => {
          const r = poolRating(p, np); const rc = ratingColor(r); const tags = poolTags(p);
          return (
            <div key={p.id} onClick={() => { onSelect(p); onClose(); }}
              style={{background:selected?.id===p.id?"#60a5fa10":"#1a1a24",
                border:`1px solid ${selected?.id===p.id?"#60a5fa45":"#232330"}`,
                borderRadius:10,padding:"11px 12px",cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#60a5fa"}}>{p.pair}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>
                    {tags.map(t => <span key={t.l} style={{fontSize:9,padding:"1px 6px",background:t.c+"18",color:t.c,borderRadius:4,fontWeight:700}}>{t.l}</span>)}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:600,color:"#4ade80"}}>{f1(p.apy)}%</div>
                  <div style={{fontSize:9,padding:"2px 6px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700,marginTop:2,display:"inline-block"}}>{r} {ratingLabel(r)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <StatSm label="TVL" val={fK(p.tvl)} color="#507a9a"/>
                <StatSm label="IL Risk" val={p.il} color={ilColor(p.il)}/>
                <StatSm label="Health" val={p.health} color={healthColor(p.health)}/>
              </div>
              {(p.il === "High" || p.il === "Very High") && (
                <div style={{marginTop:5,fontSize:10,color:"#ef4444"}}>⚠️ High IL risk. Your LP value can change if token prices move.</div>
              )}
            </div>
          );
        })}
      </div>
      <ILExplainer/>
    </Modal>
  );
}

/* ─── VALIDATOR PICKER ───────────────────────────────────────────────────── */
function ValidatorPicker({selected, onSelect, onClose, np}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const vals = useMemo(() => {
    let v = [...VALIDATORS];
    if (search) v = v.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    v.sort((a,b) => sort==="apy" ? b.apy-a.apy : sort==="uptime" ? b.uptime-a.uptime : sort==="commission" ? a.commission-b.commission : valRating(b,np)-valRating(a,np));
    return v;
  }, [search, sort, np]);
  return (
    <Modal title="Choose Validator" onClose={onClose}>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{flex:1,background:"#1a1a24",border:"1px solid #2a2a38",borderRadius:8,padding:"9px 12px",color:"#f0f0f2",fontSize:12,outline:"none"}}/>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{background:"#1a1a24",border:"1px solid #2a2a38",borderRadius:8,padding:"9px 10px",color:"#f0f0f2",fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="rating">Best Rating</option>
          <option value="apy">Highest APY</option>
          <option value="uptime">Best Uptime</option>
          <option value="commission">Low Commission</option>
        </select>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {vals.map(v => {
          const r = valRating(v, np); const rc = valRatingColor(r);
          return (
            <div key={v.id} onClick={() => { onSelect(v); onClose(); }}
              style={{background:selected?.id===v.id?"#4ade8010":"#1a1a24",
                border:`1px solid ${selected?.id===v.id?"#4ade8045":"#232330"}`,
                borderRadius:10,padding:"11px 12px",cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{v.name}</div>
                  <div style={{display:"flex",gap:4}}>
                    <Bdg color={statusColor(v.status)}>{v.status}</Bdg>
                    <div style={{fontSize:9,padding:"2px 7px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700}}>{r} {valRatingLabel(r)}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600,color:"#facc15",lineHeight:1}}>{v.score}</div>
                  <div style={{fontSize:9,color:"#4b5563"}}>LF Score</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,padding:"7px 8px",background:"#141420",borderRadius:7,marginBottom:7}}>
                <StatSm label="APY" val={f1(v.apy)+"%"} color="#4ade80"/>
                <StatSm label="Uptime" val={f1(v.uptime)+"%"} color="#60a5fa"/>
                <StatSm label="Commission" val={v.commission+"%"}/>
                <StatSm label="Crowding" val={v.deleg+"%"} color={v.deleg>75?"#ef4444":"#6b7280"}/>
              </div>
              <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.4}}>{valDesc(v)}</div>
              {v.offline && <div style={{marginTop:4,fontSize:10,color:"#ef4444"}}>⚠️ Recently offline. Not recommended for conservative strategies.</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ─── ADJUST MODAL ───────────────────────────────────────────────────────── */
function AdjustModal({state, dispatch, onClose, np, addToast}) {
  const {split, poolSplit, validator, citLock, valLock, isValidator, poolPreset} = state;
  const [showPP, setShowPP] = useState(null);
  const [showVP, setShowVP] = useState(false);
  const tier = CIT_TIERS.find(t => t.months === citLock);

  function updatePoolPct(idx, val) {
    const n = [...poolSplit];
    n[idx] = {...n[idx], pct: Math.max(1, Math.min(99, val))};
    const tot = n.reduce((a,x) => a + x.pct, 0);
    dispatch({type:"SET", payload:{poolSplit: n.map((x,i) => ({...x, pct: i===n.length-1 ? 100-n.slice(0,-1).reduce((a,y)=>a+y.pct,0) : Math.round(x.pct/tot*100)}))}});
  }
  function removePool(idx) { dispatch({type:"SET", payload:{poolSplit: poolSplit.filter((_,i) => i !== idx)}}); }
  function addPool(pool) {
    const even = Math.floor(100 / (poolSplit.length + 1));
    const n = [...poolSplit.map(p => ({...p, pct:even})), {pool, pct:even}];
    const tot = n.reduce((a,x) => a + x.pct, 0);
    dispatch({type:"SET", payload:{poolSplit: n.map((x,i) => ({...x, pct: i===n.length-1 ? 100-n.slice(0,-1).reduce((a,y)=>a+y.pct,0) : Math.round(x.pct/tot*100)}))}});
  }

  return (
    <Modal title="Adjust Flow" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Allocation */}
        <div>
          <STitle>Allocation Split</STitle>
          {[["💧 HEXDEX",0,"#60a5fa"],["🔒 Validator",1,"#4ade80"],["🏰 Citadel",2,"#f59e0b"]].map(([label,idx,color]) => (
            <div key={idx} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:"#9ca3af"}}>{label}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>
                  <span style={{color}}>{split[idx]}%</span>
                  <span style={{color:"#4b5563",fontSize:11}}> = {f2(state.amount * split[idx] / 100)} LEMX</span>
                </span>
              </div>
              <AnimBar pct={split[idx]} color={color}/>
            </div>
          ))}
        </div>
        {/* Pool split */}
        <div>
          <STitle>Liquidity Split</STitle>
          <div style={{display:"flex",gap:7,marginBottom:10}}>
            {[["single","Single","Simple"],["split2","2 Pools","Balanced"],["split3","3 Pools","Broader"]].map(([k,l,d]) => (
              <button key={k} onClick={() => dispatch({type:"SET", payload:{poolPreset:k, poolSplit:buildPoolSplit(k)}})}
                style={{flex:1,padding:"8px 6px",background:poolPreset===k?"#60a5fa18":"#1e1e28",
                  border:`1px solid ${poolPreset===k?"#60a5fa45":"#2a2a38"}`,borderRadius:9,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:poolPreset===k?"#60a5fa":"#f0f0f2",marginBottom:1}}>{l}</div>
                <div style={{fontSize:9,color:"#6b7280"}}>{d}</div>
              </button>
            ))}
          </div>
          {poolSplit.map((entry, idx) => {
            const r = poolRating(entry.pool, np); const rc = ratingColor(r); const isL2 = entry.pool.id !== "HXDX";
            return (
              <div key={entry.pool.id} style={{background:"#1a1a24",borderRadius:9,padding:"10px 11px",marginBottom:7,border:"1px solid #60a5fa20"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:12,color:"#60a5fa"}}>{entry.pool.pair}</div>
                    <div style={{display:"flex",gap:4,marginTop:2}}>
                      <div style={{fontSize:9,padding:"2px 6px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700}}>{r} {ratingLabel(r)}</div>
                      {isL2 && <span style={{fontSize:9,padding:"2px 5px",background:"#f9730018",color:"#f97316",borderRadius:4,fontWeight:700}}>L2</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={() => setShowPP(idx)} style={{fontSize:9,color:"#60a5fa",background:"#60a5fa12",border:"1px solid #60a5fa28",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Change</button>
                    {poolSplit.length > 1 && <button onClick={() => removePool(idx)} style={{fontSize:9,color:"#ef4444",background:"#ef444412",border:"1px solid #ef444428",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>✕</button>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input type="range" min={1} max={99} value={entry.pct} onChange={e => updatePoolPct(idx, Number(e.target.value))} style={{flex:1}}/>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#facc15",minWidth:58,textAlign:"right"}}>{entry.pct}% = {f2(state.amount*split[0]/100*entry.pct/100)}</span>
                </div>
                {isL2 && <div style={{marginTop:4,fontSize:10,color:"#f97316"}}>⚠️ Moving L2 tokens may carry a 10% movement fee. LEMX unaffected.</div>}
              </div>
            );
          })}
          {poolSplit.length < 5 && (
            <button onClick={() => setShowPP(-1)} style={{width:"100%",padding:"8px",background:"#60a5fa0c",border:"1px dashed #60a5fa35",borderRadius:8,cursor:"pointer",color:"#60a5fa",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>+ Add Pool</button>
          )}
        </div>
        {/* Validator */}
        <div>
          <STitle>Validator</STitle>
          <div style={{background:"#1a1a24",borderRadius:9,padding:"10px 11px",border:"1px solid #4ade8028",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{validator?.name || "—"}</div>
                <Bdg color={statusColor(validator?.status||"")}>{validator?.status||"—"}</Bdg>
              </div>
              <button onClick={() => setShowVP(true)} style={{fontSize:10,color:"#4ade80",background:"#4ade8012",border:"1px solid #4ade8028",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Change</button>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:8}}>
            {[["false","No, I am delegating","#4ade80"],["true","Yes, I run one","#facc15"]].map(([k,l,c]) => (
              <button key={k} onClick={() => dispatch({type:"SET", payload:{isValidator:k==="true", valOwner:k==="true"}})}
                style={{flex:1,padding:"9px",background:String(isValidator)===k?c+"18":"#1e1e28",
                  border:`1px solid ${String(isValidator)===k?c+"45":"#2a2a38"}`,
                  borderRadius:8,cursor:"pointer",color:String(isValidator)===k?c:"#9ca3af",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>{l}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4}}>
            {VAL_LOCKS.map(l => (
              <button key={l.days} onClick={() => dispatch({type:"SET", payload:{valLock:l}})}
                style={{padding:"8px 3px",background:valLock?.days===l.days?"#4ade8018":"#1e1e28",
                  border:`1px solid ${valLock?.days===l.days?"#4ade8055":"#2a2a38"}`,
                  borderRadius:7,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:700,color:valLock?.days===l.days?"#4ade80":"#f0f0f2"}}>{l.label}</div>
                {l.boost > 0 && <div style={{fontSize:8,color:"#4ade80",marginTop:1}}>+{l.boost}%</div>}
              </button>
            ))}
          </div>
          <div style={{marginTop:7,display:"flex",gap:5,flexWrap:"wrap"}}>
            {valLock?.days > 0 && <WarnTag icon="⏳" short="7-day unstake" detail="Validator unstaking takes 7 days before funds return." color="#f97316"/>}
            {valLock?.days > 0 && <WarnTag icon="⚡" short="Early exit penalty" detail="Breaking a validator lock may forfeit 50% of rewards." color="#ef4444"/>}
          </div>
        </div>
        {/* Citadel */}
        <div>
          <STitle>Citadel Lock</STitle>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
            {CIT_TIERS.map(t => (
              <button key={t.months} onClick={() => dispatch({type:"SET", payload:{citLock:t.months}})}
                style={{padding:"9px 6px",background:citLock===t.months?"#f59e0b18":"#1e1e28",
                  border:`1px solid ${citLock===t.months?"#f59e0b55":"#2a2a38"}`,
                  borderRadius:8,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:11,color:citLock===t.months?"#f59e0b":"#f0f0f2"}}>{t.label}</div>
                <div style={{fontSize:10,color:"#4ade80",fontWeight:600,marginTop:1}}>+{t.bonus}%</div>
                <div style={{fontSize:9,color:"#4b5563"}}>Drip {t.drip}mo</div>
              </button>
            ))}
          </div>
          {tier && (
            <div style={{fontSize:11,color:"#f59e0b",background:"#f59e0b0a",borderRadius:7,padding:"8px 10px",border:"1px solid #f59e0b1e"}}>
              {citLock} month lock = {f1(citLock/12)} years locked, then {tier.drip} month drip. Bonus: +{tier.bonus}%.
            </div>
          )}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"12px 0",background:"#facc15",color:"#000",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13}}>Save Adjustments</button>
      </div>
      {showPP !== null && (
        <PoolPicker selected={showPP >= 0 ? poolSplit[showPP]?.pool : null}
          onSelect={p => {
            if (showPP === -1) { addPool(p); }
            else { const n = [...poolSplit]; n[showPP] = {...n[showPP], pool:p}; dispatch({type:"SET", payload:{poolSplit:n}}); }
          }}
          onClose={() => setShowPP(null)} np={np}
          excludeIds={poolSplit.filter((_,i) => i !== showPP).map(x => x.pool.id)}/>
      )}
      {showVP && (
        <ValidatorPicker selected={validator} onSelect={v => dispatch({type:"SET", payload:{validator:v}})} onClose={() => setShowVP(false)} np={np}/>
      )}
    </Modal>
  );
}

/* ─── SIM MODAL ──────────────────────────────────────────────────────────── */
function SimModal({state, np, onClose}) {
  const [period, setPeriod] = useState(365);
  const r = useMemo(() => calcSimulation(state.amount, state.split, state.validator, state.poolSplit, state.citLock, state.valLock, period, np), [state, period, np]);
  return (
    <Modal title="Simulate Flow" onClose={onClose}>
      <div style={{display:"flex",gap:7,marginBottom:14}}>
        {[[30,"30 Days"],[365,"1 Year"],[1825,"5 Years"]].map(([d,l]) => (
          <button key={d} onClick={() => setPeriod(d)} style={{flex:1,padding:"9px 0",
            background:period===d?"#facc15":"#1e1e28",color:period===d?"#000":"#9ca3af",
            border:`1px solid ${period===d?"#facc15":"#2a2a38"}`,borderRadius:9,
            cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12}}>{l}</button>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#0f0f14,#1a1a24)",border:"1px solid #2a2a38",borderRadius:12,padding:"16px 14px",marginBottom:12}}>
        <div style={{textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:3}}>Projected Total Rewards</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:600,color:"#facc15"}}>{r.total} LEMX</div>
          <div style={{fontSize:10,color:"#4b5563",marginTop:2}}>Simulated estimate — not guaranteed</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["HEXDEX",r.hR,"#60a5fa"],["Validator",r.vR,"#4ade80"],["Citadel",r.cR,"#f59e0b"]].map(([l,v,c]) => (
            <div key={l} style={{background:c+"10",border:`1px solid ${c}1e`,borderRadius:8,padding:"9px 7px",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:c,fontWeight:600}}>{v}</div>
              <div style={{fontSize:9,color:"#4b5563",marginTop:2}}>{l} LEMX</div>
            </div>
          ))}
        </div>
      </div>
      {[["Est. Score Growth","+"+r.scoreGain+" pts","#facc15"],["Ecosystem Impact",np?.multiplier===1.5?"High":"Medium","#a78bfa"],["Lock Benefit",state.citLock>=24?"Significant":"Moderate","#4ade80"]].map(([l,v,c]) => <KVRow key={l} label={l} val={v} vc={c}/>)}
      <div style={{marginTop:10,padding:"8px 10px",background:"#1a1a24",borderRadius:8,border:"1px solid #2a2a38",fontSize:10,color:"#4b5563",lineHeight:1.6}}>
        All figures are simulated estimates. Future returns are not guaranteed.
      </div>
    </Modal>
  );
}

/* ─── SHARE MODAL ────────────────────────────────────────────────────────── */
function ShareModal({state, np, onClose, addToast}) {
  const tier = getTier(state.lemonScore);
  const nb = np ? np.sb.reduce((s,x) => s + x.v, 0) : 0;
  const final = state.lemonScore + Math.round(nb * 0.3);
  return (
    <Modal title="Share Your Score" onClose={onClose}>
      <div style={{background:"linear-gradient(135deg,#0f0f14,#1a1a24)",border:`1px solid ${tier.color}40`,borderRadius:14,padding:24,textAlign:"center",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${tier.color},transparent)`}}/>
        <div style={{fontSize:28,marginBottom:8}}>🍋</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:48,fontWeight:700,color:tier.color,lineHeight:1}}>{final}</div>
        <div style={{fontSize:14,fontWeight:700,color:tier.color,marginTop:4,marginBottom:2}}>{tier.label}</div>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:12}}>LemonFlow Score</div>
        <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
          <Bdg color={tier.color}>{tier.label} Tier</Bdg>
          {np && <Bdg color={np.color}>{np.short} Boosted</Bdg>}
          <Bdg color="#60a5fa">{state.poolSplit?.length||1} Pool{(state.poolSplit?.length||1)>1?"s":""} Supported</Bdg>
        </div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:4}}>{state.flowActive ? "Active Flow — Supporting LemonChain" : "Network Supporter"}</div>
        <div style={{fontSize:10,color:"#4b5563"}}>lemonflow.xyz · One action. Full LemonChain impact.</div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${tier.color}60,transparent)`}}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <PBtn children="Copy Link" onClick={() => addToast("Share link copied")} color="#facc15" sx={{flex:1}}/>
        <PBtn children="Share Score" onClick={() => { addToast("Shared on LemonChain demo"); onClose(); }} color={tier.color} tc="#000" outline sx={{flex:1}}/>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FLOW TAB
══════════════════════════════════════════════════════════════════════════ */
/* ── CUSTOM SPLIT STEP ──────────────────────────────────────────────────── */
/* ── FLOW RISK ANALYZER ──────────────────────────────────────────────────── */
function FlowRiskAnalyzer({split, np}) {
  const [liq, val, cit] = split;

  // Risk score 0–100
  const riskScore = useMemo(() => {
    const ilRisk   = liq * 1.2;          // liquidity adds IL risk most
    const valRisk  = val * 0.5;          // moderate
    const citBonus = Math.min(cit * 0.3, 20); // citadel reduces risk slightly
    return Math.min(100, Math.max(0, Math.round(ilRisk + valRisk - citBonus)));
  }, [liq, val, cit]);

  // Return score 0–100
  const returnScore = useMemo(() => {
    const hexReturn = liq * 1.1;
    const valReturn = val * 0.6;
    const citReturn = cit * 0.4;
    return Math.min(100, Math.max(0, Math.round(hexReturn + valReturn + citReturn)));
  }, [liq, val, cit]);

  // Estimated APY range
  const estAPYLow  = Math.round((liq * 0.12 + val * 0.09 + cit * 0.04) * 0.8);
  const estAPYHigh = Math.round((liq * 0.35 + val * 0.15 + cit * 0.20) * 1.1);

  // IL exposure
  const ilExposure = liq >= 40 ? "High" : liq >= 20 ? "Medium" : liq >= 8 ? "Low" : "Minimal";
  const ilColor    = liq >= 40 ? "#ef4444" : liq >= 20 ? "#f97316" : "#4ade80";

  // Lock commitment
  const lockLevel  = cit >= 50 ? "High" : cit >= 30 ? "Medium" : "Low";
  const lockColor  = cit >= 50 ? "#f59e0b" : cit >= 30 ? "#facc15" : "#9ca3af";

  // Stability score (inverse of risk)
  const stability  = Math.max(0, 100 - riskScore + Math.round(cit * 0.2));
  const stabilityScore = Math.min(100, stability);

  // Ecosystem impact
  const ecoScore = Math.round(val * 0.5 + cit * 0.3 + liq * 0.2);
  const ecoLabel = ecoScore >= 65 ? "Critical Support" : ecoScore >= 45 ? "High" : ecoScore >= 30 ? "Medium" : "Low";
  const ecoCol   = ecoScore >= 65 ? "#ef4444" : ecoScore >= 45 ? "#f97316" : ecoScore >= 30 ? "#facc15" : "#9ca3af";

  // Risk label
  const RISK_LEVELS = [
    {max:15,  label:"Very Low",   color:"#4ade80"},
    {max:30,  label:"Low",        color:"#86efac"},
    {max:50,  label:"Medium",     color:"#facc15"},
    {max:65,  label:"Elevated",   color:"#f97316"},
    {max:80,  label:"High",       color:"#ef4444"},
    {max:101, label:"Extreme",    color:"#dc2626"},
  ];
  const RETURN_LEVELS = [
    {max:20,  label:"Conservative",color:"#60a5fa"},
    {max:40,  label:"Steady",      color:"#38bdf8"},
    {max:60,  label:"Growth",      color:"#4ade80"},
    {max:80,  label:"Aggressive",  color:"#facc15"},
    {max:101, label:"High Yield",  color:"#f59e0b"},
  ];

  const riskLevel   = RISK_LEVELS.find(l => riskScore <= l.max)   || RISK_LEVELS[RISK_LEVELS.length-1];
  const returnLevel = RETURN_LEVELS.find(l => returnScore <= l.max) || RETURN_LEVELS[RETURN_LEVELS.length-1];

  // Network preference marker position (0–100) — shifts based on np
  const npMarker = np?.id === "liquidity" ? 62 : np?.id === "validators" ? 45 : np?.id === "citadel" ? 30 : 50;

  // Glow intensity for high-risk
  const glowStyle = riskScore >= 65 ? {boxShadow:`0 0 16px 2px ${riskLevel.color}22`} : {};

  return (
    <div style={{background:"#111118",border:`1px solid ${riskLevel.color}30`,borderRadius:12,padding:"13px 14px",marginTop:4,...glowStyle,transition:"box-shadow .4s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"#f0f0f2"}}>Flow Risk Analysis</div>
        <div style={{display:"flex",gap:6}}>
          <span style={{fontSize:10,padding:"2px 8px",background:riskLevel.color+"20",color:riskLevel.color,borderRadius:99,fontWeight:700,border:`1px solid ${riskLevel.color}30`}}>{riskLevel.label} Risk</span>
          <span style={{fontSize:10,padding:"2px 8px",background:returnLevel.color+"20",color:returnLevel.color,borderRadius:99,fontWeight:700,border:`1px solid ${returnLevel.color}30`}}>{returnLevel.label}</span>
        </div>
      </div>

      {/* Risk meter */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>Risk Level</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:riskLevel.color}}>{riskLevel.label}</span>
        </div>
        {/* Gradient track */}
        <div style={{position:"relative",height:8,borderRadius:4,background:"linear-gradient(90deg,#4ade80 0%,#86efac 15%,#facc15 40%,#f97316 60%,#ef4444 80%,#dc2626 100%)",marginBottom:4}}>
          {/* Filled overlay from right = shows "remaining safety" */}
          <div style={{position:"absolute",top:0,right:0,height:"100%",borderRadius:"0 4px 4px 0",background:"rgba(0,0,0,.55)",width:`${100-riskScore}%`,transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/>
          {/* Thumb */}
          <div style={{position:"absolute",top:"50%",left:`${riskScore}%`,transform:"translate(-50%,-50%)",width:14,height:14,borderRadius:"50%",background:riskLevel.color,border:"2px solid #0c0c0f",boxShadow:`0 0 6px ${riskLevel.color}80`,transition:"left .5s cubic-bezier(.4,0,.2,1)",zIndex:2}}/>
          {/* Network preference marker */}
          {np && (
            <div style={{position:"absolute",top:-6,left:`${npMarker}%`,transform:"translateX(-50%)",zIndex:3,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <div style={{fontSize:7,color:np.color,fontWeight:700,whiteSpace:"nowrap",background:"#0c0c0f",padding:"0 3px",borderRadius:2}}>↓ {np.short}</div>
              <div style={{width:1,height:14,background:np.color+"80"}}/>
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {["Very Low","Low","Medium","Elevated","High","Extreme"].map((l,i)=>(
            <span key={l} style={{fontSize:7,color:"#3a3a48",flex:1,textAlign:"center"}}>{i===0||i===5?l:""}</span>
          ))}
        </div>
      </div>

      {/* Expected return meter */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>Expected Return</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:returnLevel.color}}>{returnLevel.label}</span>
        </div>
        <div style={{position:"relative",height:8,borderRadius:4,background:"linear-gradient(90deg,#60a5fa 0%,#38bdf8 25%,#4ade80 50%,#facc15 75%,#f59e0b 100%)",marginBottom:4}}>
          <div style={{position:"absolute",top:0,right:0,height:"100%",borderRadius:"0 4px 4px 0",background:"rgba(0,0,0,.55)",width:`${100-returnScore}%`,transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/>
          <div style={{position:"absolute",top:"50%",left:`${returnScore}%`,transform:"translate(-50%,-50%)",width:14,height:14,borderRadius:"50%",background:returnLevel.color,border:"2px solid #0c0c0f",boxShadow:`0 0 6px ${returnLevel.color}80`,transition:"left .5s cubic-bezier(.4,0,.2,1)",zIndex:2}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:7,color:"#3a3a48"}}>Conservative</span>
          <span style={{fontSize:7,color:"#3a3a48"}}>High Yield</span>
        </div>
      </div>

      {/* Detail grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
        {[
          ["Est. APY Range", `${estAPYLow}–${estAPYHigh}%`, "#facc15"],
          ["IL Exposure",    ilExposure,                    ilColor],
          ["Lock Commitment",lockLevel,                     lockColor],
          ["Stability",      stabilityScore+"/100",         "#60a5fa"],
          ["Eco Impact",     ecoLabel,                      ecoCol],
          ["Network Fit",    np ? "Aligned" : "Neutral",    np ? np.color : "#9ca3af"],
        ].map(([label,val,color])=>(
          <div key={label} style={{background:"#1a1a24",borderRadius:7,padding:"7px 9px",border:`1px solid ${color}18`}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,color,marginBottom:2}}>{val}</div>
            <div style={{fontSize:9,color:"#6b7280"}}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{fontSize:10,color:"#4b5563",lineHeight:1.5,fontStyle:"italic"}}>
        Expected returns are estimates based on current ecosystem conditions and historical averages.
      </div>
    </div>
  );
}

function CustomSplitStep({split, dispatch, amount, np}) {
  const total = split[0] + split[1] + split[2];
  const over  = total > 100;
  const under = total < 100;
  const ok    = total === 100;
  const statusColor = ok ? "#4ade80" : "#ef4444";

  function setSplit(idx, val) {
    const n = [...split];
    n[idx] = Math.max(0, Math.min(100, val));
    dispatch({type:"SET", payload:{split:n, strategy:"custom"}});
  }

  return (
    <Card sx={{border:"1px solid #a78bfa30",background:"#a78bfa06"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"#a78bfa"}}>✏️ Custom Split</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:statusColor}}>
          {total}% {over?"(over)":under?"(under)":"✓"}
        </div>
      </div>
      {[["💧 HEXDEX Liquidity",0,"#60a5fa"],["🔒 Validator Staking",1,"#4ade80"],["🏰 Citadel Lock",2,"#f59e0b"]].map(([label,idx,color])=>(
        <div key={idx} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,color:"#9ca3af"}}>{label}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color}}>{split[idx]}%</span>
              <span style={{fontSize:11,color:"#4b5563"}}>{f2(amount*split[idx]/100)} LEMX</span>
            </div>
          </div>
          <input type="range" min={0} max={100} value={split[idx]}
            onChange={e=>setSplit(idx,Number(e.target.value))}/>
          <AnimBar pct={split[idx]} color={color} h={3}/>
        </div>
      ))}
      {!ok && (
        <div style={{padding:"7px 10px",background:"#ef444412",border:"1px solid #ef444428",borderRadius:7,fontSize:11,color:"#ef4444",marginBottom:8}}>
          {over ? `Total is ${total}% — reduce by ${total-100}%` : `Total is ${total}% — add ${100-total}% more`}
        </div>
      )}
      {split[0] >= 30 && <div style={{fontSize:10,color:"#f97316",marginBottom:4}}>⚠️ Higher HEXDEX allocation increases liquidity support and possible IL risk.</div>}
      {split[2] >= 50 && <div style={{fontSize:10,color:"#f59e0b",marginBottom:4}}>⚠️ Higher Citadel allocation increases lock commitment and long-duration rewards.</div>}
      {split[1] >= 45 && <div style={{fontSize:10,color:"#4ade80",marginBottom:4}}>⚠️ Higher Validator allocation improves network support. Unstaking may take 7 days.</div>}
      {ok && (
        <div style={{fontSize:10,color:"#6b7280",marginBottom:8,lineHeight:1.5}}>
          Higher HEXDEX allocation increases liquidity support and possible IL risk. Higher Citadel allocation increases lock commitment. Validator allocation improves network support.
        </div>
      )}
      {ok && <FlowRiskAnalyzer split={split} np={np}/>}
    </Card>
  );
}

/* ── POOL SELECTION STEP ─────────────────────────────────────────────────── */
function PoolSelectionStep({poolSplit, dispatch, np, amount, split}) {
  const [filter, setFilter] = useState("rating");
  const [showSplitFor, setShowSplitFor] = useState(false);
  const selectedIds = poolSplit.map(x => x.pool.id);

  const sorted = useMemo(() => {
    let p = [...POOLS];
    if (filter==="core")   p = p.filter(x=>x.tag==="core");
    else if (filter==="eco") p = p.filter(x=>x.tag==="eco");
    else if (filter==="apy") p = [...p].sort((a,b)=>b.apy-a.apy);
    else if (filter==="rating") p = [...p].sort((a,b)=>poolRating(b,np)-poolRating(a,np));
    else p = [...p].sort((a,b)=>b.vol-a.vol);
    return p;
  }, [filter, np]);

  function togglePool(pool) {
    if (selectedIds.includes(pool.id)) {
      // deselect
      const next = poolSplit.filter(x => x.pool.id !== pool.id);
      if (!next.length) return; // keep at least one selected
      const even = Math.floor(100/next.length);
      const rebalanced = next.map((x,i) => ({...x, pct: i===next.length-1 ? 100-even*(next.length-1) : even}));
      dispatch({type:"SET", payload:{poolSplit:rebalanced}});
    } else {
      // select
      const next = [...poolSplit, {pool, pct:0}];
      const even = Math.floor(100/next.length);
      const rebalanced = next.map((x,i) => ({...x, pct: i===next.length-1 ? 100-even*(next.length-1) : even}));
      dispatch({type:"SET", payload:{poolSplit:rebalanced}});
    }
  }

  function updatePoolPct(idx, val) {
    const n = [...poolSplit];
    n[idx] = {...n[idx], pct: Math.max(1, Math.min(99, val))};
    const tot = n.reduce((a,x)=>a+x.pct,0);
    dispatch({type:"SET", payload:{poolSplit: n.map((x,i)=>({...x,pct:i===n.length-1?100-n.slice(0,-1).reduce((a,y)=>a+y.pct,0):Math.round(x.pct/tot*100)}))}});
  }

  const topRec = POOLS.slice().sort((a,b)=>poolRating(b,np)-poolRating(a,np))[0];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {/* Selected pools summary */}
      {poolSplit.length > 0 && (
        <Card sx={{border:"1px solid #60a5fa30",background:"#60a5fa06"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{poolSplit.length} Pool{poolSplit.length>1?"s":""} Selected</div>
            {poolSplit.length > 1 && (
              <button onClick={()=>setShowSplitFor(s=>!s)} style={{fontSize:10,color:"#60a5fa",background:"#60a5fa12",border:"1px solid #60a5fa28",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                {showSplitFor?"Hide Split":"Edit Split"}
              </button>
            )}
          </div>
          {poolSplit.map((e,idx) => (
            <div key={e.pool.id} style={{marginBottom:showSplitFor&&poolSplit.length>1?10:4}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:"#60a5fa",fontWeight:600}}>{e.pool.pair}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#c8c8d0"}}>{e.pct}% = {f2(amount*split[0]/100*e.pct/100)} LEMX</span>
              </div>
              {showSplitFor && poolSplit.length > 1 && (
                <div style={{marginTop:4}}><input type="range" min={1} max={99} value={e.pct} onChange={ev=>updatePoolPct(idx,Number(ev.target.value))}/></div>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* Quick actions */}
      <div style={{display:"flex",gap:7}}>
        <button onClick={()=>{dispatch({type:"SET",payload:{poolSplit:[{pool:topRec,pct:100}]}});}} style={{flex:1,padding:"9px 0",background:"#4ade8012",border:"1px solid #4ade8028",borderRadius:9,cursor:"pointer",color:"#4ade80",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>⭐ Use Top Recommendation</button>
        <button onClick={()=>setFilter("rating")} style={{flex:1,padding:"9px 0",background:"#60a5fa0c",border:"1px solid #60a5fa25",borderRadius:9,cursor:"pointer",color:"#60a5fa",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>Customize Selection</button>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {[["rating","Best Rating"],["apy","High APY"],["vol","Volume"],["core","Core"],["eco","Ecosystem"]].map(([fv,fl])=>(
          <button key={fv} onClick={()=>setFilter(fv)} style={{padding:"4px 9px",background:filter===fv?"#60a5fa":"#1a1a24",color:filter===fv?"#000":"#9ca3af",border:`1px solid ${filter===fv?"#60a5fa":"#2a2a38"}`,borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{fl}</button>
        ))}
      </div>

      {/* Pool list */}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {sorted.map(p => {
          const r = poolRating(p, np);
          const rc = ratingColor(r);
          const tags = poolTags(p);
          const selected = selectedIds.includes(p.id);
          return (
            <div key={p.id} onClick={()=>togglePool(p)}
              style={{background:selected?"#60a5fa10":"#161620",border:`1px solid ${selected?"#60a5fa50":"#232330"}`,borderRadius:11,padding:"11px 12px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
              {selected && <div style={{position:"absolute",top:8,right:8,width:18,height:18,borderRadius:"50%",background:"#60a5fa",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",fontWeight:700}}>✓</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,paddingRight:selected?24:0}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#60a5fa"}}>{p.pair}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>
                    {tags.map(t=><span key={t.l} style={{fontSize:9,padding:"1px 6px",background:t.c+"18",color:t.c,borderRadius:4,fontWeight:700}}>{t.l}</span>)}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:600,color:"#4ade80"}}>{f1(p.apy)}%</div>
                  <div style={{fontSize:9,padding:"2px 6px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700,marginTop:2,display:"inline-block"}}>{r} {ratingLabel(r)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginBottom:4}}>
                <StatSm label="TVL" val={fK(p.tvl)} color="#507a9a"/>
                <StatSm label="IL Risk" val={p.il} color={ilColor(p.il)}/>
                <StatSm label="Health" val={p.health} color={healthColor(p.health)}/>
              </div>
              {p.id===topRec?.id && <div style={{fontSize:9,color:"#4ade80",fontWeight:600}}>⭐ Top recommendation for current conditions</div>}
              {r >= 80 && <div style={{marginTop:3,fontSize:10,color:"#4ade80"}}>Stable pool with healthy liquidity depth.</div>}
              {r >= 60 && r < 80 && <div style={{marginTop:3,fontSize:10,color:"#facc15"}}>Moderate pool — watch TVL and IL risk before committing.</div>}
              {r >= 40 && r < 60 && <div style={{marginTop:3,fontSize:10,color:"#f97316"}}>Higher APY but lower liquidity depth and higher IL risk.</div>}
              {r < 40 && <div style={{marginTop:3,fontSize:10,color:"#ef4444"}}>Very low TVL. Experimental — use carefully.</div>}
              {(p.il==="High"||p.il==="Very High")&&<div style={{marginTop:4,fontSize:10,color:"#ef4444"}}>⚠️ High IL risk — your LP value can change if prices move apart.</div>}
            </div>
          );
        })}
      </div>
      <ILExplainer/>
    </div>
  );
}

/* ── VALIDATOR SELECTION STEP ────────────────────────────────────────────── */
function ValidatorSelectionStep({validator, dispatch, np}) {
  const [sort, setSort] = useState("rating");
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    let v = [...VALIDATORS];
    if (search) v = v.filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
    v.sort((a,b)=>sort==="apy"?b.apy-a.apy:sort==="uptime"?b.uptime-a.uptime:sort==="commission"?a.commission-b.commission:valRating(b,np)-valRating(a,np));
    return v;
  }, [sort, search, np]);

  const topRec = VALIDATORS.slice().sort((a,b)=>valRating(b,np)-valRating(a,np))[0];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {validator ? (
        <Card sx={{border:"1px solid #4ade8030",background:"#4ade8006"}}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:3}}>Selected Validator</div>
          <div style={{fontSize:13,fontWeight:700,color:"#4ade80"}}>{validator.name}</div>
          <div style={{display:"flex",gap:6,marginTop:5}}>
            <StatSm label="APY" val={f1(validator.apy)+"%"} color="#4ade80"/>
            <StatSm label="Uptime" val={f1(validator.uptime)+"%"} color="#60a5fa"/>
            <StatSm label="Commission" val={validator.commission+"%"}/>
            <StatSm label="LF Score" val={validator.score} color="#facc15"/>
          </div>
        </Card>
      ) : (
        <div style={{padding:"10px 12px",background:"#1a1a24",border:"1px dashed #2a2a38",borderRadius:9,fontSize:11,color:"#6b7280",textAlign:"center"}}>
          No validator selected — tap a card below to choose one.
        </div>
      )}

      {/* Quick actions */}
      <div style={{display:"flex",gap:7}}>
        <button onClick={()=>dispatch({type:"SET",payload:{validator:topRec}})} style={{flex:1,padding:"9px 0",background:"#4ade8012",border:"1px solid #4ade8028",borderRadius:9,cursor:"pointer",color:"#4ade80",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>⭐ Use Top Recommendation</button>
        <button onClick={()=>setSort("rating")} style={{flex:1,padding:"9px 0",background:"#60a5fa0c",border:"1px solid #60a5fa25",borderRadius:9,cursor:"pointer",color:"#60a5fa",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>Customize Selection</button>
      </div>

      {/* Search + sort */}
      <div style={{display:"flex",gap:7}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search validators…" style={{flex:1,background:"#161620",border:"1px solid #232330",borderRadius:8,padding:"9px 12px",color:"#f0f0f2",fontSize:12,outline:"none"}}/>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:"#161620",border:"1px solid #232330",borderRadius:8,padding:"9px 10px",color:"#f0f0f2",fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="rating">Best Rating</option>
          <option value="apy">Highest APY</option>
          <option value="uptime">Best Uptime</option>
          <option value="commission">Low Commission</option>
        </select>
      </div>

      {/* Validator cards */}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {sorted.map(v => {
          const r = valRating(v, np);
          const rc = valRatingColor(r);
          const selected = validator?.id === v.id;
          return (
            <div key={v.id} onClick={()=>dispatch({type:"SET",payload:{validator:v}})}
              style={{background:selected?"#4ade8010":"#161620",border:`1px solid ${selected?"#4ade8050":"#232330"}`,borderRadius:11,padding:"11px 12px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
              {selected && <div style={{position:"absolute",top:8,right:8,width:18,height:18,borderRadius:"50%",background:"#4ade80",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",fontWeight:700}}>✓</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7,paddingRight:selected?24:0}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{v.name}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <Bdg color={statusColor(v.status)}>{v.status}</Bdg>
                    <div style={{fontSize:9,padding:"2px 7px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700}}>{r} {valRatingLabel(r)}</div>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:600,color:"#facc15",lineHeight:1}}>{v.score}</div>
                  <div style={{fontSize:9,color:"#4b5563"}}>LF Score</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,padding:"7px 8px",background:"#141420",borderRadius:7,marginBottom:7}}>
                <StatSm label="APY" val={f1(v.apy)+"%"} color="#4ade80"/>
                <StatSm label="Uptime" val={f1(v.uptime)+"%"} color={v.uptime>=99?"#4ade80":v.uptime>=98?"#facc15":"#ef4444"}/>
                <StatSm label="Commission" val={v.commission+"%"}/>
                <StatSm label="Crowding" val={v.deleg+"%"} color={v.deleg>75?"#ef4444":v.deleg>60?"#f97316":"#6b7280"}/>
              </div>
              <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.4}}>{valDesc(v)}</div>
              {v.id===topRec?.id && <div style={{marginTop:4,fontSize:9,color:"#4ade80",fontWeight:600}}>⭐ Top recommendation for current conditions</div>}
              {v.deleg > 70 && !v.offline && <div style={{marginTop:3,fontSize:10,color:"#f97316"}}>⚠️ Very crowded. Rewards may dilute with more delegators.</div>}
              {v.uptime < 99 && !v.offline && <div style={{marginTop:3,fontSize:10,color:"#facc15"}}>⚠️ Uptime below 99%. Not recommended for conservative plans.</div>}
              {v.offline && <div style={{marginTop:4,fontSize:10,color:"#ef4444"}}>⚠️ Recently offline. Not recommended for conservative strategies.</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── LOCK SELECTION STEP ─────────────────────────────────────────────────── */
function LockSelectionStep({valLock, citLock, dispatch}) {
  const citTier = CIT_TIERS.find(t => t.months === citLock);
  // Local slider state kept in sync with valLock.days
  const [sliderDays, setSliderDays] = useState(valLock?.days ?? 0);

  // Keep slider in sync if a preset button is tapped externally
  useEffect(() => { setSliderDays(valLock?.days ?? 0); }, [valLock?.days]);

  function applyDays(d) {
    const lock = valLockFromDays(d);
    setSliderDays(d);
    dispatch({type:"SET", payload:{valLock: lock}});
  }

  // Friendly display for current slider value
  const displayDays = Math.round(sliderDays);
  const displayMonths = (displayDays / 30.44).toFixed(1);
  const displayYears  = (displayDays / 365).toFixed(2);
  const currentBoost  = interpolateBoost(displayDays);

  // Boost color
  const boostColor = currentBoost >= 50 ? "#f59e0b" : currentBoost >= 20 ? "#4ade80" : currentBoost > 0 ? "#60a5fa" : "#6b7280";

  // Position on gradient for visual feedback (0–100%)
  const sliderPct = (displayDays / 1825) * 100;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <Card>
        <STitle>Validator Lock Duration</STitle>

        {/* Preset buttons */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
          {VAL_LOCKS.map(l => (
            <button key={l.days} onClick={() => applyDays(l.days)}
              style={{padding:"9px 6px",background:valLock?.days===l.days?"#4ade8018":"#1e1e28",
                border:`1px solid ${valLock?.days===l.days?"#4ade8055":"#2a2a38"}`,
                borderRadius:8,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontSize:11,fontWeight:700,color:valLock?.days===l.days?"#4ade80":"#f0f0f2"}}>{l.label}</div>
              {l.boost > 0
                ? <div style={{fontSize:9,color:"#4ade80",marginTop:1}}>+{l.boost}% boost</div>
                : <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>No boost</div>}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{borderTop:"1px solid #1e1e28",marginBottom:12}}/>

        {/* Custom slider */}
        <div style={{marginBottom:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:600,color:"#9ca3af"}}>Custom validator lock</span>
            <div style={{textAlign:"right"}}>
              {currentBoost > 0
                ? <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:boostColor}}>+{currentBoost.toFixed(1)}% boost</span>
                : <span style={{fontSize:11,color:"#6b7280"}}>No boost</span>}
            </div>
          </div>

          {/* Gradient track behind the range input */}
          <div style={{position:"relative",marginBottom:6}}>
            <div style={{position:"absolute",top:"50%",left:0,right:0,height:4,borderRadius:2,
              background:"linear-gradient(90deg,#6b7280 0%,#60a5fa 20%,#4ade80 45%,#facc15 70%,#f59e0b 100%)",
              transform:"translateY(-50%)",pointerEvents:"none",zIndex:0}}/>
            <input type="range" min={0} max={1825} step={1} value={displayDays}
              onChange={e => applyDays(Number(e.target.value))}
              style={{position:"relative",zIndex:1,background:"transparent"}}/>
          </div>

          {/* Live value display */}
          <div style={{background:"#1a1a24",borderRadius:8,padding:"9px 12px",border:`1px solid ${boostColor}28`,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:boostColor}}>
                Locking for {displayDays} day{displayDays !== 1 ? "s" : ""}
              </div>
              {displayDays > 0 && (
                <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>
                  ≈ {displayMonths} months / {displayYears} years
                </div>
              )}
              {displayDays === 0 && <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>No lock — withdraw any time</div>}
            </div>
            {currentBoost > 0 && (
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:9,color:"#6b7280",marginBottom:1}}>Reward Boost</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:boostColor}}>+{currentBoost.toFixed(1)}%</div>
              </div>
            )}
          </div>

          {/* Scale labels */}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            {["Unlocked","30d","90d","180d","1yr","5yr"].map((l,i) => (
              <span key={l} style={{fontSize:8,color:"#3a3a48"}}>{l}</span>
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.6,marginBottom:8}}>
          Validator locks increase reward potential, but unstaking is not instant.
          After unstaking, funds take <span style={{color:"#f97316",fontWeight:600}}>7 days</span> to return to your wallet.
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {displayDays > 0 && <WarnTag icon="⏳" short="7-day unstake" detail="After unstaking, funds take 7 days to return to your wallet." color="#f97316"/>}
          {displayDays > 0 && <WarnTag icon="⚡" short="Lock penalty" detail="Breaking a validator lock may forfeit 50% of rewards earned from that validator position." color="#ef4444"/>}
        </div>
      </Card>

      <Card>
        <STitle>Citadel Lock Duration</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
          {CIT_TIERS.map(t => (
            <button key={t.months} onClick={() => dispatch({type:"SET", payload:{citLock:t.months}})}
              style={{padding:"9px 6px",background:citLock===t.months?"#f59e0b18":"#1e1e28",
                border:`1px solid ${citLock===t.months?"#f59e0b55":"#2a2a38"}`,
                borderRadius:8,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontWeight:700,fontSize:11,color:citLock===t.months?"#f59e0b":"#f0f0f2"}}>{t.label}</div>
              <div style={{fontSize:10,color:"#4ade80",fontWeight:600,marginTop:1}}>+{t.bonus}%</div>
              <div style={{fontSize:9,color:"#4b5563"}}>Drip {t.drip}mo</div>
            </button>
          ))}
        </div>
        {citTier && (
          <div style={{fontSize:11,color:"#f59e0b",background:"#f59e0b0a",borderRadius:7,padding:"8px 10px",border:"1px solid #f59e0b1e",marginBottom:8}}>
            {citLock} month lock = {f1(citLock/12)} years locked, then {citTier.drip} month drip. Bonus: +{citTier.bonus}%.
          </div>
        )}
        <WarnTag icon="🏰" short="Citadel info" detail="Citadel rewards are locked until the selected lock period ends. Bonus tokens drip back over half the original lock duration." color="#f59e0b"/>
      </Card>
    </div>
  );
}

/* ── FLOW TAB ────────────────────────────────────────────────────────────── */
function FlowTab({state, dispatch, onActivate, np, addToast}) {
  const {amount, strategy, mode, poolSplit, validator, citLock, valLock, riskChecked, flowActive, split} = state;
  const [flowStep, setFlowStep] = useState(1);
  const [showSim, setShowSim] = useState(false);
  const [useCustom, setUseCustom] = useState(strategy === "custom");
  const showOnboarding = !state.onboardingDone && !flowActive && flowStep === 1;

  // Bulletproof scroll-to-top on every step/mode change.
  // Uses requestAnimationFrame so it fires AFTER React renders the new step,
  // and hits all scroll targets (window, documentElement, body) for cross-browser coverage.
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    // First attempt immediately
    scrollToTop();
    // Second attempt after paint (catches Safari deferral)
    const id = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(id);
  }, [flowStep, mode, useCustom]);

  const strat = STRATEGIES[strategy] || STRATEGIES.balanced;
  const tier  = CIT_TIERS.find(t => t.months === citLock);

  const blendedAPY = useMemo(() => {
    const h = poolSplit.length ? poolSplit.reduce((s,x)=>s+x.pool.apy*x.pct/100,0) : 0;
    const v = (validator?.apy||0) + (state.valOwner?1.5:0) + (valLock?.boost||0)/10;
    const c = tier ? tier.bonus/(tier.months/12) : 0;
    return (h*split[0]+v*split[1]+c*split[2])/100;
  }, [poolSplit,validator,split,tier,valLock,state.valOwner]);

  const scoreBD = useMemo(() => calcFlowScore(
    amount, split,
    valLock?.days || 0,
    citLock || 0,
    poolSplit.length,
    np?.id || "balanced"
  ), [amount, split, valLock, citLock, poolSplit.length, np]);
  const scoreBoost = scoreBD.total > 0 ? scoreBD.total : (strat?.scoreBoost||0);
  const conf   = flowConfidence(validator, poolSplit, citLock, np);
  const impact = ecoImpact(np, split);
  const splitTotal = split[0]+split[1]+split[2];
  const canProceedSplit = splitTotal === 100;
  const canProceedPools = poolSplit.length > 0;
  const canProceedVal   = validator != null;

  // Step labels
  const STEPS = [
    {n:1, label:"Amount"},
    {n:2, label:"Strategy"},
    {n:3, label:"Pools"},
    {n:4, label:"Validator"},
    {n:5, label:"Locks"},
    {n:6, label:"Review"},
  ];

  const whyHelps = [];
  if ((split[0]||0)>=15) whyHelps.push("Supports underfunded liquidity pools");
  if ((split[1]||0)>=30) whyHelps.push("Strengthens validator decentralization");
  if ((split[2]||0)>=50) whyHelps.push("Improves long-term ecosystem stability");
  if (citLock>=36) whyHelps.push("Supports Citadel lock participation");
  if (poolSplit.length>1) whyHelps.push("Multi-pool routing reduces concentration risk");
  if (!whyHelps.length) whyHelps.push("Routes LEMX across core LemonChain systems");

  const whySel = [];
  if (np) whySel.push(np.short+" is currently prioritized by the network");
  if (validator?.score>=88) whySel.push("Selected validator has high uptime and LF score");
  if (poolSplit.length>1) whySel.push("Multi-pool routing reduces single-pool concentration");
  if (citLock>=24) whySel.push("Citadel rewards are stable at this lock duration");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>
      {/* Guided onboarding for first-time users */}
      {showOnboarding && (
        <GuidedOnboarding
          onSkip={()=>dispatch({type:"SET",payload:{onboardingDone:true}})}
          onStart={()=>dispatch({type:"SET",payload:{onboardingDone:true}})}
        />
      )}

      {/* Hero */}
      <div style={{padding:"10px 13px",background:"#facc1508",border:"1px solid #facc1515",borderRadius:10,fontSize:11,color:"#9ca3af",lineHeight:1.6,textAlign:"center"}}>
        <span style={{color:"#facc15",fontWeight:600}}>LemonFlow</span> dynamically routes participation toward what LemonChain needs most — helping improve liquidity, decentralization, and long-term ecosystem stability.<br/><span style={{color:"#9ca3af",display:"block",marginTop:4,fontStyle:"italic"}}>LemonFlow rewards ecosystem-positive participation, not just highest APY.</span>
      </div>

      {/* Mode toggle */}
      <div style={{display:"flex",background:"#161620",borderRadius:9,padding:3,gap:2,border:"1px solid #232330"}}>
        {["simple","advanced"].map(m=>(
          <button key={m} onClick={()=>dispatch({type:"SET",payload:{mode:m}})}
            style={{flex:1,padding:"7px 0",background:mode===m?"#facc15":"transparent",color:mode===m?"#000":"#6b7280",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,textTransform:"capitalize",transition:"all .2s"}}>{m} Mode</button>
        ))}
      </div>

      {/* Step progress bar */}
      <div style={{display:"flex",alignItems:"center",gap:0,overflowX:"auto",scrollbarWidth:"none"}}>
        {STEPS.map((s,i)=>(
          <div key={s.n} style={{display:"flex",alignItems:"center",flex:"none"}}>
            <button onClick={()=>setFlowStep(s.n)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"0 4px"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:flowStep===s.n?"#facc15":flowStep>s.n?"#4ade80":"#1e1e28",border:`2px solid ${flowStep===s.n?"#facc15":flowStep>s.n?"#4ade80":"#2a2a38"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:flowStep===s.n?"#000":flowStep>s.n?"#000":"#4b5563",transition:"all .2s"}}>
                {flowStep>s.n?"✓":s.n}
              </div>
              <div style={{fontSize:8,color:flowStep===s.n?"#facc15":flowStep>s.n?"#4ade80":"#4b5563",fontWeight:flowStep===s.n?700:400,whiteSpace:"nowrap"}}>{s.label}</div>
            </button>
            {i<STEPS.length-1&&<div style={{width:16,height:2,background:flowStep>s.n?"#4ade8040":"#1e1e28",flexShrink:0,marginBottom:14}}/>}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Amount ── */}
      {flowStep===1&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Choose Amount</div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,color:"#6b7280"}}>Balance: 500.00 LEMX</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontWeight:600,fontSize:16,color:"#facc15"}}>{f2(amount)}<span style={{fontSize:11,color:"#6b7280",marginLeft:4}}>LEMX</span></span>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[10,25,50,100].map(p=>(
                <button key={p} onClick={()=>dispatch({type:"SET",payload:{amount:p}})}
                  style={{flex:1,padding:"9px 0",background:amount===p?"#facc15":"#1e1e28",color:amount===p?"#000":"#9ca3af",border:`1px solid ${amount===p?"#facc15":"#2a2a38"}`,borderRadius:8,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontWeight:600,fontSize:12,transition:"all .15s"}}>{p}</button>
              ))}
            </div>
            <input type="range" min={1} max={500} value={amount} onChange={e=>dispatch({type:"SET",payload:{amount:Number(e.target.value)}})}/>
            {mode==="advanced"&&<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
              <StatSm label="HEXDEX" val={f2(amount*split[0]/100)+" LEMX"} color="#60a5fa"/>
              <StatSm label="Validator" val={f2(amount*split[1]/100)+" LEMX"} color="#4ade80"/>
              <StatSm label="Citadel" val={f2(amount*split[2]/100)+" LEMX"} color="#f59e0b"/>
            </div>}
          </Card>
          <PBtn children="Next: Strategy →" onClick={()=>setFlowStep(2)} color="#facc15" sx={{marginTop:10}}/>
        </div>
      )}

      {/* ── STEP 2: Strategy or Custom Split ── */}
      {flowStep===2&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Choose Strategy</div>
          {/* Toggle preset vs custom */}
          <div style={{display:"flex",background:"#161620",borderRadius:9,padding:3,gap:2,border:"1px solid #232330",marginBottom:10}}>
            <button onClick={()=>{setUseCustom(false);dispatch({type:"SET",payload:{strategy:"balanced",...buildStrategyConfig("balanced")}});}} style={{flex:1,padding:"7px 0",background:!useCustom?"#facc15":"transparent",color:!useCustom?"#000":"#6b7280",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,transition:"all .2s"}}>Preset Strategies</button>
            <button onClick={()=>{setUseCustom(true);dispatch({type:"SET",payload:{strategy:"custom"}});}} style={{flex:1,padding:"7px 0",background:useCustom?"#a78bfa":"transparent",color:useCustom?"#fff":"#6b7280",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,transition:"all .2s"}}>✏️ Custom Split</button>
          </div>

          {!useCustom?(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {Object.values(STRATEGIES).map(s=>(
                <button key={s.key} onClick={()=>dispatch({type:"SET",payload:{strategy:s.key,...buildStrategyConfig(s.key)}})}
                  style={{background:strategy===s.key?s.rc+"18":"#161620",border:`1px solid ${strategy===s.key?s.rc+"60":"#232330"}`,borderRadius:12,padding:"13px 10px",cursor:"pointer",textAlign:"left",transition:"all .2s",position:"relative"}}>
                  {s.rec&&<div style={{position:"absolute",top:7,right:8,fontSize:9,padding:"2px 6px",background:"#facc15",color:"#000",borderRadius:99,fontWeight:700}}>Recommended</div>}
                  <div style={{fontSize:18,marginBottom:5}}>{s.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:strategy===s.key?s.rc:"#f0f0f2",marginBottom:3}}>{s.label}</div>
                  <div style={{fontSize:10,color:"#6b7280",lineHeight:1.4,marginBottom:5}}>{s.desc}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
                    {["Liq","Val","Cit"].map((l,i)=><span key={l} style={{fontSize:9,color:s.rc,fontWeight:600}}>{s.split[i]}% {l}</span>)}
                  </div>
                  <span style={{fontSize:9,padding:"2px 6px",background:s.rc+"20",color:s.rc,borderRadius:4,fontWeight:700,textTransform:"uppercase"}}>{s.risk} risk</span>
                </button>
              ))}
            </div>
          ):(
            <CustomSplitStep split={split} dispatch={dispatch} amount={amount} np={np}/>
          )}

          <div style={{display:"flex",gap:7,marginTop:10}}>
            <button onClick={()=>setFlowStep(1)} style={{flex:1,padding:"11px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:10,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12}}>← Back</button>
            <PBtn children={canProceedSplit?"Next: Pools →":"Fix total (must be 100%)"} onClick={()=>{if(canProceedSplit)setFlowStep(3);}} disabled={!canProceedSplit} color="#facc15" sx={{flex:2}}/>
          </div>
        </div>
      )}

      {/* ── STEP 3: Pool Selection ── */}
      {flowStep===3&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Select Liquidity Pool{poolSplit.length>1?"s":""}</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Tap to select. Multiple pools split your liquidity allocation.</div>
          <PoolSelectionStep poolSplit={poolSplit} dispatch={dispatch} np={np} amount={amount} split={split}/>
          <div style={{display:"flex",gap:7,marginTop:10}}>
            <button onClick={()=>setFlowStep(2)} style={{flex:1,padding:"11px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:10,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12}}>← Back</button>
            <PBtn children={canProceedPools?"Next: Validator →":"Select at least one pool"} onClick={()=>{if(canProceedPools)setFlowStep(4);}} disabled={!canProceedPools} color="#facc15" sx={{flex:2}}/>
          </div>
        </div>
      )}

      {/* ── STEP 4: Validator Selection ── */}
      {flowStep===4&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Select Validator</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Tap a validator to select. You must confirm this choice before proceeding.</div>
          <ValidatorSelectionStep validator={validator} dispatch={dispatch} np={np}/>
          <div style={{display:"flex",gap:7,marginTop:10}}>
            <button onClick={()=>setFlowStep(3)} style={{flex:1,padding:"11px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:10,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12}}>← Back</button>
            <PBtn children={canProceedVal?"Next: Locks →":"Select a validator first"} onClick={()=>{if(canProceedVal)setFlowStep(5);}} disabled={!canProceedVal} color="#facc15" sx={{flex:2}}/>
          </div>
        </div>
      )}

      {/* ── STEP 5: Lock durations ── */}
      {flowStep===5&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Set Lock Durations</div>
          <LockSelectionStep valLock={valLock} citLock={citLock} dispatch={dispatch}/>
          <CitadelVisualizer citLock={citLock}/>
          <div style={{display:"flex",gap:7,marginTop:10}}>
            <button onClick={()=>setFlowStep(4)} style={{flex:1,padding:"11px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:10,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12}}>← Back</button>
            <PBtn children="Review Flow →" onClick={()=>setFlowStep(6)} color="#facc15" sx={{flex:2}}/>
          </div>
        </div>
      )}

      {/* ── STEP 6: Review + Activate ── */}
      {flowStep===6&&(
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Review + Activate</div>
          <Card sx={{border:"1px solid #facc1530",background:"#facc1506"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>Your Flow</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600,color:"#facc15",lineHeight:1}}>{f2(amount)} LEMX</div>
              </div>
              {np&&<div className="glow-y" style={{fontSize:9,padding:"4px 8px",background:np.color+"1e",color:np.color,borderRadius:99,border:`1px solid ${np.color}28`,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><Dot color={np.color}/>Network Boost</div>}
            </div>

            <div style={{fontSize:11,fontWeight:600,color:"#6b7280",marginBottom:6}}>Routes to:</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:14}}>💧</span><div><div style={{fontSize:12,fontWeight:600}}>HEXDEX Liquidity</div><div style={{fontSize:11,color:"#60a5fa"}}>{poolSplit.length} pool{poolSplit.length>1?"s":""} — {poolSplit.map(p=>`${p.pool.pair} (${p.pct}%)`).join(", ")}</div></div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:14}}>🔒</span><div><div style={{fontSize:12,fontWeight:600}}>Validator</div><div style={{fontSize:11,color:"#4ade80"}}>{validator?.name||"—"}{valLock?.days>0&&<span style={{color:"#f59e0b"}}> · {valLock.days >= 1825 ? "5 year lock" : valLock.days >= 365 ? f1(valLock.days/365)+" yr lock" : valLock.days >= 30 ? Math.round(valLock.days/30)+" mo lock" : valLock.days+" day lock"}</span>}</div></div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:14}}>🏰</span><div><div style={{fontSize:12,fontWeight:600}}>Citadel</div><div style={{fontSize:11,color:"#f59e0b"}}>{tier?.label||"—"} · +{tier?.bonus||0}% bonus</div></div></div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,padding:"10px 8px",background:"#1a1a24",borderRadius:9,border:"1px solid #232330",marginBottom:12}}>
              <StatBig label="Est. Return" val={"~"+f1(blendedAPY)+"%"} color="#4ade80"/>
              <StatBig label="Risk" val={strat?.risk||"Custom"} color={strat?.rc||"#a78bfa"}/>
              <StatBig label="Score Boost" val={"+"+scoreBoost} color={np?.color||"#facc15"}/>
              <StatBig label="Eco Impact" val={impact.label} color={impact.color}/>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{flex:1,background:conf.color+"10",border:`1px solid ${conf.color}20`,borderRadius:8,padding:"7px 10px"}}>
                <div style={{fontSize:9,color:"#6b7280",marginBottom:2}}>Flow Confidence</div>
                <div style={{fontSize:13,fontWeight:700,color:conf.color}}>{conf.label}</div>
              </div>
              {np&&<div style={{flex:1,background:np.color+"10",border:`1px solid ${np.color}20`,borderRadius:8,padding:"7px 10px"}}>
                <div style={{fontSize:9,color:"#6b7280",marginBottom:2}}>This flow supports</div>
                <div style={{fontSize:11,fontWeight:600,color:np.color}}>{np.live}</div>
              </div>}
            </div>

            {mode==="advanced"&&<div style={{marginBottom:12,background:"#1a1a24",padding:"8px 10px",borderRadius:8,border:"1px solid #2a2a38",display:"flex",gap:10,flexWrap:"wrap"}}>
              <StatSm label="HEXDEX" val={f2(amount*split[0]/100)+" LEMX"} color="#60a5fa"/>
              <StatSm label="Validator" val={f2(amount*split[1]/100)+" LEMX"} color="#4ade80"/>
              <StatSm label="Citadel" val={f2(amount*split[2]/100)+" LEMX"} color="#f59e0b"/>
              {tier&&<StatSm label="Citadel Bonus" val={"+"+f2(amount*split[2]/100*tier.bonus/100)+" LEMX"} color="#4ade80"/>}
            </div>}

            <div style={{marginBottom:10,background:"#4ade8008",border:"1px solid #4ade8018",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:10,fontWeight:600,color:"#4ade80",marginBottom:5}}>Why this flow helps LemonChain</div>
              {whyHelps.map((w,i)=><div key={i} style={{fontSize:11,color:"#9ca3af",display:"flex",gap:6,marginBottom:3}}><span style={{color:"#4ade80",fontSize:9,marginTop:1}}>◆</span>{w}</div>)}
            </div>

            {whySel.length>0&&<div style={{marginBottom:10,background:"#a78bfa08",border:"1px solid #a78bfa18",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:10,fontWeight:600,color:"#a78bfa",marginBottom:5}}>Why LemonFlow selected this setup</div>
              {whySel.map((w,i)=><div key={i} style={{fontSize:11,color:"#9ca3af",display:"flex",gap:6,marginBottom:3}}><span style={{color:"#a78bfa",fontSize:9,marginTop:1}}>◆</span>{w}</div>)}
            </div>}

            {/* Score breakdown */}
            <div style={{marginBottom:10,background:"#facc1508",border:"1px solid #facc1518",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:10,fontWeight:600,color:"#facc15",marginBottom:7}}>Score Breakdown — {scoreBoost} pts for this flow</div>
              {[
                [`💧 Liquidity`,`${f2(scoreBD.liqAmt)} LEMX × ${SCORE_RATES.liquidity}pts`,`× ${scoreBD.poolBonus.toFixed(2)} pool bonus × ${scoreBD.npLiqBoost.toFixed(2)} boost`,`${scoreBD.liqPts} pts`,"#60a5fa"],
                [` 🔒 Validator`,`${f2(scoreBD.valAmt)} LEMX × ${SCORE_RATES.validator}pts`,`× ${scoreBD.valLockBonus.toFixed(2)} lock bonus × ${scoreBD.npValBoost.toFixed(2)} boost`,`${scoreBD.valPts} pts`,"#4ade80"],
                [`🏰 Citadel`,`${f2(scoreBD.citAmt)} LEMX × ${SCORE_RATES.citadel}pt`,`× ${scoreBD.citLockBonus.toFixed(2)} lock bonus × ${scoreBD.npCitBoost.toFixed(2)} boost`,`${scoreBD.citPts} pts`,"#f59e0b"],
              ].map(([label,base,mults,pts,color])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"4px 0",borderBottom:"1px solid #1a1a22"}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:600,color}}>{label}</div>
                    <div style={{fontSize:9,color:"#6b7280"}}>{base} {mults}</div>
                  </div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color,flexShrink:0,paddingLeft:8}}>{pts}</div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:"1px solid #2a2a38"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#f0f0f2"}}>Total</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:"#facc15"}}>{scoreBoost} pts</span>
              </div>
              <div style={{fontSize:9,color:"#4b5563",marginTop:5,lineHeight:1.5}}>Points are based on how much LEMX you route and what LemonChain currently needs most.</div>
            </div>

            <RiskAccordion checked={riskChecked} setChecked={v=>dispatch({type:"SET",payload:{riskChecked:v}})}/>
            <div style={{fontSize:10,color:"#4b5563",marginBottom:12,textAlign:"center",lineHeight:1.6}}>
              Recommendations are estimates, not guarantees. LemonFlow never moves funds without your confirmation. Locked positions cannot be claimed early.
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <PBtn children={flowActive?"Re-Activate Flow":"Activate Flow"} onClick={onActivate} disabled={!riskChecked||!canProceedVal||!canProceedPools} color="#facc15" sx={{flex:2,fontSize:14,padding:"14px 0",borderRadius:11}}/>
              <button onClick={()=>setFlowStep(1)} style={{flex:1,padding:"14px 0",background:"transparent",border:"1px solid #facc1530",borderRadius:11,cursor:"pointer",color:"#facc15",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12}}>Edit</button>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setShowSim(true)} style={{flex:1,padding:"10px 0",background:"transparent",border:"1px solid #a78bfa30",borderRadius:9,cursor:"pointer",color:"#a78bfa",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>Simulate Returns</button>
              <button onClick={()=>{const cfg=buildStrategyConfig("balanced");dispatch({type:"SET",payload:{amount:50,strategy:"balanced",...cfg,riskChecked:false}});setFlowStep(1);addToast("Smart Start applied");}} style={{flex:1,padding:"10px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:9,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>Smart Start</button>
            </div>
          </Card>
        </div>
      )}

      {showSim && <SimModal state={state} np={np} onClose={()=>setShowSim(false)}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HEXDEX TAB
══════════════════════════════════════════════════════════════════════════ */
function HexdexTab({state, dispatch, addToast, np}) {
  const [filter, setFilter] = useState("rating");
  const [showManage, setShowManage] = useState(false);
  const sparkData = useMemo(() => POOLS.slice(0,6).map(p => ({pair:p.pair, data:Array.from({length:8},(_,i) => p.health+Math.sin(i*.8)*6+(Math.random()-.5)*3)})), []);

  const pools = useMemo(() => {
    let p = [...POOLS];
    if (filter === "core")   p = p.filter(x => x.tag === "core");
    else if (filter === "eco") p = p.filter(x => x.tag === "eco");
    else if (filter === "rating") p = [...p].sort((a,b) => poolRating(b,np) - poolRating(a,np));
    else if (filter === "apy")   p = [...p].sort((a,b) => b.apy - a.apy);
    else                         p = [...p].sort((a,b) => b.vol - a.vol);
    return p;
  }, [filter, np]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>
      <Card sx={{border:"1px solid #60a5fa25",background:"#60a5fa06"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#60a5fa",marginBottom:4}}>Powered by HEXDEX</div>
        <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>LemonFlow routes your liquidity allocation into selected HEXDEX pools while helping you understand APY, volume, TVL, reward potential, and impermanent loss risk before committing.</div>
        <div style={{fontSize:10,color:"#facc1580",marginTop:6,fontStyle:"italic"}}>LemonFlow rewards ecosystem-positive participation, not just highest APY.</div>
        <WhyMatters id="liquidity" color="#60a5fa"/>
      </Card>

      {state.flowActive && state.poolSplit.length > 0 && (
        <Card sx={{border:"1px solid #60a5fa28"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>Active LP Positions</div>
            <button onClick={() => setShowManage(true)} style={{fontSize:10,color:"#f97316",background:"#f9730012",border:"1px solid #f9730028",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Manage</button>
          </div>
          {state.poolSplit.map(e => {
            const r = poolRating(e.pool, np); const rc = ratingColor(r); const tags = poolTags(e.pool);
            return (
              <div key={e.pool.id} style={{padding:"8px 0",borderBottom:"1px solid #1a1a22"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#60a5fa"}}>{e.pool.pair}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
                      {tags.map(t => <span key={t.l} style={{fontSize:9,padding:"1px 5px",background:t.c+"18",color:t.c,borderRadius:4,fontWeight:700}}>{t.l}</span>)}
                      <div style={{fontSize:9,padding:"2px 6px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700,display:"inline-block"}}>{r} {ratingLabel(r)}</div>
                    </div>
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#c8c8d0"}}>{e.pct}% = {f2(state.amount*state.split[0]/100*e.pct/100)} LEMX</span>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {state.mode === "advanced" && (
        <Card>
          <STitle>LP Health Trend (7d simulated)</STitle>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:6}}>
            {sparkData.map(d => (
              <div key={d.pair} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:10,color:"#60a5fa",width:90,flexShrink:0}}>{d.pair}</div>
                <Spark data={d.data} color="#60a5fa" h={22} w={72}/>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#4ade80",marginLeft:"auto"}}>{f1(d.data[d.data.length-1])}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <STitle sx={{marginBottom:0}}>Pool Analytics</STitle>
          {np?.id === "liquidity" && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,padding:"2px 8px",background:"#60a5fa1c",color:"#60a5fa",borderRadius:99,fontWeight:700}}><Dot color="#60a5fa"/>Boost Active</div>}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          {[["rating","Best Rating"],["apy","High APY"],["vol","Volume"],["core","Core"],["eco","Ecosystem"]].map(([f,l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{padding:"5px 9px",background:filter===f?"#60a5fa":"#1a1a24",color:filter===f?"#000":"#9ca3af",border:`1px solid ${filter===f?"#60a5fa":"#2a2a38"}`,borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
          ))}
        </div>
        {pools.map(p => {
          const r = poolRating(p, np); const rc = ratingColor(r); const tags = poolTags(p);
          return (
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1a1a22"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:"#60a5fa"}}>{p.pair}</div>
                <div style={{display:"flex",gap:3,marginTop:2,flexWrap:"wrap"}}>{tags.map(t => <span key={t.l} style={{fontSize:8,padding:"1px 5px",background:t.c+"15",color:t.c,borderRadius:3,fontWeight:700}}>{t.l}</span>)}</div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <StatBig label="APY" val={f1(p.apy)+"%"} color="#4ade80"/>
                <StatSm label="TVL" val={fK(p.tvl)} color="#507a9a"/>
                <div style={{fontSize:9,padding:"2px 7px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700,whiteSpace:"nowrap"}}>{r} {ratingLabel(r)}</div>
              </div>
            </div>
          );
        })}
      </Card>
      <ILExplainer/>

      {showManage && (
        <Modal title="Manage LP" onClose={() => setShowManage(false)}>
          <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6,marginBottom:12}}>
            Your active liquidity positions. Removing liquidity may realize impermanent loss.
          </div>
          {state.poolSplit.map(e => (
            <div key={e.pool.id} style={{background:"#1a1a24",borderRadius:9,padding:11,border:"1px solid #60a5fa25",marginBottom:8}}>
              <KVRow label="Pool" val={e.pool.pair} vc="#60a5fa"/>
              <KVRow label="Allocation" val={e.pct+"%"} vc="#facc15"/>
              <KVRow label="Value" val={f2(state.amount*state.split[0]/100*e.pct/100)+" LEMX"} mono/>
              {e.pool.id !== "HXDX" && <div style={{marginTop:6,fontSize:10,color:"#f97316"}}>⚠️ Moving L2 tokens may carry a 10% movement fee. LEMX unaffected.</div>}
            </div>
          ))}
          <WarnTag icon="⚠️" short="IL Risk" detail="Your LP value can change if token prices move." color="#f97316"/>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VALIDATORS TAB
══════════════════════════════════════════════════════════════════════════ */
function ValidatorsTab({state, dispatch, addToast, np}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [valMode, setValMode] = useState("delegator");
  const [showManage, setShowManage] = useState(false);
  const [lockDays, setLockDays] = useState(state.valLock?.days || 0);

  const vals = useMemo(() => {
    let v = [...VALIDATORS];
    if (search) v = v.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    v.sort((a,b) => sort==="apy" ? b.apy-a.apy : sort==="uptime" ? b.uptime-a.uptime : sort==="commission" ? a.commission-b.commission : valRating(b,np)-valRating(a,np));
    return v;
  }, [search, sort, np]);

  const lockBoostIdx = VAL_LOCKS.findIndex(l => l.days >= lockDays);
  const selectedLock = VAL_LOCKS[lockBoostIdx >= 0 ? lockBoostIdx : 0];
  const uptimeTrend = useMemo(() => Array.from({length:7}, (_,i) => ({l:["M","T","W","T","F","S","S"][i], v:98+Math.random()*2})), []);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
        {[["10","Validators"],["12.9%","Avg APY"],["~$21.5M","Staked"],["3","Recommended"]].map(([v,l]) => (
          <Card key={l} sx={{padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:500,color:"#facc15"}}>{v}</div>
            <div style={{fontSize:9,color:"#6b7280",marginTop:2}}>{l}</div>
          </Card>
        ))}
      </div>
      <WhyMatters id="validators" color="#4ade80"/>

      {/* Mode toggle */}
      <div style={{display:"flex",background:"#161620",borderRadius:9,padding:3,gap:2,border:"1px solid #232330"}}>
        {[["delegator","Delegator View"],["owner","Validator Owner View"]].map(([m,l]) => (
          <button key={m} onClick={() => setValMode(m)} style={{flex:1,padding:"7px 0",background:valMode===m?"#facc15":"transparent",color:valMode===m?"#000":"#6b7280",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,transition:"all .2s"}}>{l}</button>
        ))}
      </div>

      {valMode === "owner" && (
        <Card sx={{background:"#facc1508",border:"1px solid #facc1520"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#facc15",marginBottom:4}}>Validator Owner Mode</div>
          <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5}}>Route stake toward your own validator to support network stability and strengthen your validator profile. Staking to your own validator supports self-strength and decentralization.</div>
        </Card>
      )}

      {state.flowActive && state.validator && (
        <Card sx={{border:"1px solid #4ade8028"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:700,color:"#4ade80"}}>Active: {state.validator.name}</div>
            <button onClick={() => setShowManage(true)} style={{fontSize:10,color:"#f97316",background:"#f9730012",border:"1px solid #f9730028",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Manage</button>
          </div>
          <div style={{display:"flex",gap:12}}>
            <StatSm label="Staked" val={f2(state.amount*state.split[1]/100)+" LEMX"} color="#4ade80"/>
            {state.valLock?.days > 0 && <StatSm label="Lock" val={state.valLock.label} color="#f59e0b"/>}
            {state.isValidator && <StatSm label="Mode" val="Owner" color="#facc15"/>}
          </div>
        </Card>
      )}

      {/* Lock duration selector */}
      <Card>
        <STitle>Validator Lock Duration</STitle>
        <div style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:"#9ca3af"}}>Lock period</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#4ade80"}}>{selectedLock.label} {selectedLock.boost > 0 ? `(+${selectedLock.boost}% boost)` : "(no boost)"}</span>
          </div>
          <input type="range" min={0} max={1825} value={lockDays} onChange={e => {
            const d = Number(e.target.value);
            setLockDays(d);
            const lock = [...VAL_LOCKS].reverse().find(l => l.days <= d) || VAL_LOCKS[0];
            dispatch({type:"SET", payload:{valLock:lock}});
          }}/>
          <div style={{fontSize:10,color:"#6b7280",marginTop:5}}>Unlocked stake earns less. Longer locks may earn higher rewards.</div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
          {valMode === "owner" || <WarnTag icon="⏳" short="7-day unstake" detail="Unstaking takes 7 days before LEMX returns to your wallet." color="#f97316"/>}
          {selectedLock.days > 0 && <WarnTag icon="⚡" short="Lock penalty" detail="Breaking a validator lock forfeits 50% of rewards earned from that validator." color="#ef4444"/>}
          <WarnTag icon="📊" short="Rewards vary" detail="Validator rewards are estimates and can change based on network conditions." color="#9ca3af"/>
        </div>
      </Card>

      {state.mode === "advanced" && (
        <Card>
          <STitle>Network Uptime Trend (7d)</STitle>
          <div style={{marginTop:6}}><MiniBar data={uptimeTrend} color="#4ade80" h={36}/></div>
        </Card>
      )}

      <div style={{display:"flex",gap:7}}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search validators…" style={{flex:1,background:"#161620",border:"1px solid #232330",borderRadius:8,padding:"9px 12px",color:"#f0f0f2",fontSize:12,outline:"none"}}/>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{background:"#161620",border:"1px solid #232330",borderRadius:8,padding:"9px 10px",color:"#f0f0f2",fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="rating">Best Rating</option>
          <option value="apy">Highest APY</option>
          <option value="uptime">Best Uptime</option>
          <option value="commission">Low Commission</option>
        </select>
      </div>

      {vals.map(v => {
        const r = valRating(v, np); const rc = valRatingColor(r);
        const hl = valHealthLabel(v);
        return (
          <Card key={v.id} sx={{cursor:"pointer",background:state.validator?.id===v.id?"#4ade8008":"#161620",border:`1px solid ${state.validator?.id===v.id?"#4ade8045":"#232330"}`,transition:"all .15s"}}
            onClick={() => dispatch({type:"SET", payload:{validator:v}})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{v.name}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  <Bdg color={statusColor(v.status)}>{v.status}</Bdg>
                  <div style={{fontSize:9,padding:"2px 7px",background:rc+"18",color:rc,borderRadius:99,fontWeight:700}}>{r} {valRatingLabel(r)}</div>
                  <div style={{fontSize:9,padding:"2px 7px",background:hl.color+"18",color:hl.color,borderRadius:99,fontWeight:700}}>● {hl.label}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600,color:"#facc15",lineHeight:1}}>{v.score}</div>
                <div style={{fontSize:9,color:"#4b5563"}}>LF Score</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,padding:"7px 8px",background:"#141420",borderRadius:7,marginBottom:7}}>
              <StatSm label="APY" val={f1(v.apy)+"%"} color="#4ade80"/>
              <StatSm label="Uptime" val={f1(v.uptime)+"%"} color={v.uptime>=99.5?"#4ade80":v.uptime>=99?"#facc15":"#ef4444"}/>
              <StatSm label="Commission" val={v.commission+"%"} color={v.commission<=5?"#4ade80":v.commission<=8?"#facc15":"#f97316"}/>
              <StatSm label="Crowding" val={v.deleg+"%"} color={v.deleg>75?"#ef4444":v.deleg>60?"#f97316":"#6b7280"}/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
              {v.deleg > 70 && <span style={{fontSize:9,color:"#f97316",background:"#f9730010",border:"1px solid #f9730025",borderRadius:5,padding:"2px 6px"}}>⚠ Lower crowding improves decentralization</span>}
              {v.uptime >= 99.5 && <span style={{fontSize:9,color:"#4ade80",background:"#4ade8010",border:"1px solid #4ade8025",borderRadius:5,padding:"2px 6px"}}>✓ High uptime improves network stability</span>}
              {v.commission <= 5 && <span style={{fontSize:9,color:"#60a5fa",background:"#60a5fa10",border:"1px solid #60a5fa25",borderRadius:5,padding:"2px 6px"}}>✓ Lower commission may improve delegator rewards</span>}
              {v.uptime < 99 && !v.offline && <span style={{fontSize:9,color:"#ef4444",background:"#ef444410",border:"1px solid #ef444425",borderRadius:5,padding:"2px 6px"}}>⚠ Uptime below 99% — monitor before locking</span>}
            </div>
            <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.4}}>{valDesc(v)}</div>
            {v.offline && <div style={{marginTop:4,fontSize:10,color:"#ef4444"}}>⚠️ Recently offline. Not recommended for conservative strategies.</div>}
            {state.validator?.id === v.id && <div style={{marginTop:6,fontSize:10,color:"#4ade80",fontWeight:600,textAlign:"center"}}>✓ Selected for Flow</div>}
          </Card>
        );
      })}

      {showManage && (
        <Modal title="Manage Validator Position" onClose={() => setShowManage(false)}>
          <div style={{background:"#1a1a24",borderRadius:9,padding:11,border:"1px solid #4ade8025",marginBottom:10}}>
            <KVRow label="Staked" val={f2(state.amount*state.split[1]/100)+" LEMX"} mono/>
            <KVRow label="Validator" val={state.validator?.name||"—"}/>
            {state.valLock?.days > 0 && <KVRow label="Lock" val={state.valLock.label} vc="#f59e0b"/>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[["Extend Lock","Extend your lock for higher rewards.","#4ade80"],["Change Validator","Move stake to a different validator.","#60a5fa"],["Unstake","Begin the 7-day unstaking process.","#ef4444"]].map(([l,d,c]) => (
              <button key={l} onClick={() => { addToast(l + " — demo mode"); setShowManage(false); }} style={{width:"100%",padding:"11px",background:c+"12",border:`1px solid ${c}25`,borderRadius:9,cursor:"pointer",color:c,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,textAlign:"left"}}>
                <div>{l}</div><div style={{fontSize:10,color:"#6b7280",marginTop:2,fontWeight:400}}>{d}</div>
              </button>
            ))}
          </div>
          <div style={{marginTop:8,display:"flex",gap:5,flexWrap:"wrap"}}>
            <WarnTag icon="⏳" short="7-day unstake" detail="Unstaking takes 7 days before LEMX returns." color="#f97316"/>
            {state.valLock?.days > 0 && <WarnTag icon="⚡" short="Lock penalty" detail="Breaking a lock forfeits 50% of validator rewards." color="#ef4444"/>}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REWARDS TAB
══════════════════════════════════════════════════════════════════════════ */
/* ── FLOW REWARD CARD ────────────────────────────────────────────────────── */
function FlowRewardCard({flow, dispatch, addToast, isFirst}) {
  const [open, setOpen] = useState(isFirst); // first card starts expanded
  const [claimed, setClaimed] = useState({val:false, hex:false});

  const valClaimable = claimed.val ? 0 : flow.valEarned;
  const hexClaimable = claimed.hex ? 0 : flow.hexEarned;
  const totalClaimable = parseFloat(f2(valClaimable + hexClaimable));

  const poolLabel = flow.poolSplit.length
    ? flow.poolSplit.map(p => `${p.pair} (${p.pct}%)`).join(", ")
    : "No pool";

  return (
    <Card sx={{border:"1px solid #facc1520",background:"#facc1504"}}>
      {/* Header — always visible */}
      <button onClick={() => setOpen(o => !o)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#facc15"}}>Flow #{flow.flowNumber}</div>
            <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{flow.date} · {flow.strategy} · {f2(flow.amount)} LEMX</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:"#4ade80"}}>{f2(totalClaimable)}</div>
              <div style={{fontSize:9,color:"#6b7280"}}>Claimable</div>
            </div>
            <span style={{fontSize:12,color:"#6b7280"}}>{open ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="fu" style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
          {/* Allocation overview */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[["💧 HEXDEX",f2(flow.hexAmount)+"L","#60a5fa"],[" 🔒 Validator",f2(flow.valAmount)+"L","#4ade80"],["🏰 Citadel",f2(flow.citAmount)+"L","#f59e0b"]].map(([l,v,c])=>(
              <div key={l} style={{background:c+"10",borderRadius:8,padding:"8px 6px",textAlign:"center",border:`1px solid ${c}18`}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,color:c}}>{v}</div>
                <div style={{fontSize:8,color:"#6b7280",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Validator rewards */}
          <div style={{background:"#161620",borderRadius:10,padding:"11px 12px",border:"1px solid #4ade8028"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#4ade80",marginBottom:8}}>🔒 Validator Rewards</div>
            <KVRow label="Validator" val={flow.validator?.name || "—"}/>
            <KVRow label="Staked" val={f2(flow.valAmount)+" LEMX"} mono/>
            <KVRow label="Lock" val={flow.valLockDays > 0 ? `${flow.valLockLabel} (+${flow.valLockBoost}% boost)` : "Unlocked"} vc={flow.valLockDays>0?"#f59e0b":"#6b7280"}/>
            <KVRow label="Est. APY" val={flow.validator ? f2(flow.validator.apy)+"%" : "—"} vc="#4ade80"/>
            <KVRow label="Earned (demo)" val={f2(flow.valEarned)+" LEMX"} vc="#4ade80" mono/>
            <KVRow label="Claimable" val={f2(valClaimable)+" LEMX"} vc={valClaimable>0?"#4ade80":"#6b7280"} mono/>
            {flow.valLockDays > 0 && (
              <div style={{marginTop:5,fontSize:9,color:"#f97316"}}>⏳ Unstaking takes 7 days to return to wallet.</div>
            )}
            <div style={{marginTop:8}}>
              <PBtn
                children={claimed.val ? "✓ Claimed" : `Claim ${f2(valClaimable)} LEMX`}
                onClick={() => {
                  if (claimed.val || valClaimable === 0) return;
                  setClaimed(c => ({...c, val:true}));
                  dispatch({type:"ADD_SCORE",amount:2,label:"Validator rewards claimed",why:`Claimed ${f2(valClaimable)} LEMX`,color:"#4ade80"});
                  addToast(`Claimed ${f2(valClaimable)} LEMX validator rewards`);
                }}
                disabled={claimed.val || valClaimable === 0}
                color="#4ade80" sx={{padding:"9px 0",fontSize:12}}
              />
            </div>
          </div>

          {/* HEXDEX rewards */}
          <div style={{background:"#161620",borderRadius:10,padding:"11px 12px",border:"1px solid #60a5fa28"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#60a5fa",marginBottom:8}}>💧 HEXDEX Rewards</div>
            <KVRow label="Pools" val={poolLabel} vc="#60a5fa"/>
            <KVRow label="LP Value" val={f2(flow.hexAmount)+" LEMX"} mono/>
            <KVRow label="Trading Fees (demo)" val={f2(flow.hexFeesEarned)+" LEMX"} vc="#60a5fa" mono/>
            <KVRow label="LP Staking (demo)" val={f2(flow.hexStakeEarned)+" LEMX"} vc="#60a5fa" mono/>
            <KVRow label="Total" val={f2(flow.hexEarned)+" LEMX"} vc="#facc15" mono/>
            <KVRow label="Claimable" val={f2(hexClaimable)+" LEMX"} vc={hexClaimable>0?"#4ade80":"#6b7280"} mono/>
            <div style={{marginTop:5,fontSize:9,color:"#f97316"}}>⚠️ LP value can change if token prices move.</div>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              {[
                ["Claim","#60a5fa",()=>{setClaimed(c=>({...c,hex:true}));dispatch({type:"ADD_SCORE",amount:2,label:"HEXDEX rewards claimed",why:`Claimed ${f2(hexClaimable)} LEMX`,color:"#60a5fa"});addToast(`Claimed ${f2(hexClaimable)} LEMX HEXDEX rewards`);}],
                ["Compound","#4ade80",()=>{setClaimed(c=>({...c,hex:true}));dispatch({type:"ADD_SCORE",amount:2,label:"Rewards compounded",why:"Compounded back into flow",color:"#4ade80"});addToast("Rewards compounded into flow");}],
                ["Re-Flow","#a78bfa",()=>{setClaimed(c=>({...c,hex:true}));dispatch({type:"ADD_SCORE",amount:2,label:"Re-Flow applied",why:"Smart Mode re-flow triggered",color:"#a78bfa"});addToast("Re-flowing via Smart Mode");}],
              ].map(([l,c,fn]) => (
                <button key={l} disabled={claimed.hex || hexClaimable===0} onClick={()=>{if(claimed.hex||hexClaimable===0)return;fn();}}
                  style={{flex:1,padding:"8px 0",background:(!claimed.hex&&hexClaimable>0)?c+"1a":"#1e1e28",border:`1px solid ${(!claimed.hex&&hexClaimable>0)?c+"35":"#2a2a38"}`,borderRadius:7,color:(!claimed.hex&&hexClaimable>0)?c:"#4b5563",cursor:(!claimed.hex&&hexClaimable>0)?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Citadel rewards */}
          <div style={{background:"#161620",borderRadius:10,padding:"11px 12px",border:"1px solid #f59e0b28"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:8}}>🏰 Citadel Rewards</div>
            <KVRow label="Locked" val={f2(flow.citAmount)+" LEMX"} mono/>
            <KVRow label="Lock Duration" val={flow.citLockLabel}/>
            {flow.citBonus > 0 && <KVRow label="Bonus Amount" val={"+"+f2(flow.citBonus)+" LEMX"} vc="#f59e0b" mono/>}
            {flow.lockEndStr && <KVRow label="Lock End" val={flow.lockEndStr} vc="#9ca3af"/>}
            {flow.dripStartStr && <KVRow label="Drip Start" val={flow.dripStartStr} vc="#9ca3af"/>}
            {flow.dripEndStr && <KVRow label="Drip End" val={flow.dripEndStr} vc="#9ca3af"/>}
            <KVRow label="Claimable Now" val="0.00 LEMX" vc="#6b7280" mono/>
            <KVRow label="Status" val={flow.citLockMonths > 0 ? "Locked 🔒" : "No lock"} vc={flow.citLockMonths>0?"#f59e0b":"#6b7280"}/>
            {flow.citLockMonths > 0 && (
              <div style={{marginTop:8,fontSize:10,color:"#f59e0b",lineHeight:1.5,background:"#f59e0b0a",padding:"7px 9px",borderRadius:7,border:"1px solid #f59e0b1e"}}>
                Locked until {flow.lockEndStr}, then {flow.citLockMonths/2} month drip ending {flow.dripEndStr}.<br/>
                Bonus tokens cannot be claimed early. Locked positions cannot be moved without ending the lock.
              </div>
            )}
            <button disabled style={{width:"100%",marginTop:8,padding:"8px 0",background:"#1a1a24",border:"1px solid #2a2a38",borderRadius:7,color:"#4b5563",cursor:"not-allowed",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>
              {flow.citLockMonths > 0 ? "Dripping begins after lock ends" : "No Citadel lock selected"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ── REWARDS TAB ─────────────────────────────────────────────────────────── */
function RewardsTab({state, dispatch, addToast}) {
  const activeFlows = state.activeFlows || [];
  const hasFlows = activeFlows.length > 0;

  // Aggregate claimable across all flows (using seeded demo values — not re-calculated live)
  const totalClaimable = parseFloat(f2(
    activeFlows.reduce((sum, fl) => sum + fl.valEarned + fl.hexEarned, 0)
  ));
  const totalEst = parseFloat(f2(
    activeFlows.reduce((sum, fl) => sum + fl.valEarned + fl.hexEarned + fl.citBonus, 0)
  ));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>
      <div style={{textAlign:"center",padding:"4px 0 6px"}}>
        <div style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:".05em"}}>Validator · HEXDEX · Citadel — all in one place.</div>
      </div>

      {/* Demo label */}
      <div style={{padding:"6px 12px",background:"#facc1508",border:"1px solid #facc1518",borderRadius:8,fontSize:10,color:"#facc15",textAlign:"center"}}>
        Demo rewards shown for preview. No real tokens moved.
      </div>

      {!hasFlows ? (
        <Card sx={{textAlign:"center",padding:"32px 20px",border:"1px dashed #2a2a38"}}>
          <div style={{fontSize:28,marginBottom:10}}>🍋</div>
          <div style={{fontSize:13,fontWeight:600,color:"#f0f0f2",marginBottom:6}}>No active flows yet</div>
          <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>
            Activate a flow to begin earning ecosystem rewards.<br/>
            Your validator, HEXDEX, and Citadel rewards will appear here.
          </div>
        </Card>
      ) : (
        <>
          {/* Total summary banner */}
          <Card sx={{border:"1px solid #facc1530",background:"#facc1506"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:"#facc15",lineHeight:1}}>{activeFlows.length}</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:2}}>Active Flows</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:"#facc15",lineHeight:1}}>{f2(totalEst)}</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:2}}>Total Est. Rewards</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:"#4ade80",lineHeight:1}}>{f2(totalClaimable)}</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:2}}>Claimable Now</div>
              </div>
            </div>
            <PBtn
              children={totalClaimable > 0 ? `Claim All — ${f2(totalClaimable)} LEMX` : "No Claimable Rewards Yet"}
              onClick={() => {
                if (totalClaimable === 0) return;
                dispatch({type:"ADD_SCORE",amount:5,label:"All rewards claimed",why:`Claimed ${f2(totalClaimable)} LEMX total`,color:"#facc15"});
                addToast(`Claimed ${f2(totalClaimable)} LEMX across all flows`);
              }}
              disabled={totalClaimable === 0}
              color="#4ade80" sx={{fontSize:13}}
            />
            <div style={{marginTop:6,fontSize:10,color:"#4b5563",textAlign:"center"}}>Claim All excludes locked Citadel rewards.</div>
          </Card>

          {/* Individual flow cards */}
          {activeFlows.map((fl, i) => (
            <FlowRewardCard key={fl.id} flow={fl} dispatch={dispatch} addToast={addToast} isFirst={i===0}/>
          ))}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCORE TAB
══════════════════════════════════════════════════════════════════════════ */
/* ── BADGE SHARE CARD ────────────────────────────────────────────────────── */
function BadgeShareCard({badge, state, np, onClose, addToast}) {
  const tier = getTier(state.lemonScore);
  const nb = np ? np.sb.reduce((s,x) => s+x.v, 0) : 0;
  const finalScore = state.lemonScore + Math.round(nb*0.3);
  const total = ACHIEVEMENTS.length;
  const unlocked = (state.unlockedBadges || []).length;
  const shareText = `I just unlocked the ${badge.label} badge on LemonFlow 🍋⚡\nProgress: ${unlocked}/${total} badges unlocked.`;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="su" style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:10}}>
        {/* Share card */}
        <div style={{background:"linear-gradient(145deg,#0f0f14,#1a1a24)",border:`2px solid ${badge.color}50`,borderRadius:20,padding:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
          {/* Top shimmer */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${badge.color},transparent)`}}/>
          {/* LemonFlow header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
            <div style={{width:28,height:28,background:"#facc1520",borderRadius:8,border:"1px solid #facc1530",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🍋</div>
            <div style={{fontSize:14,fontWeight:700,color:"#facc15",letterSpacing:"-0.02em"}}>LemonFlow</div>
          </div>
          {/* Badge */}
          <div style={{fontSize:52,marginBottom:8,filter:`drop-shadow(0 0 18px ${badge.color}90)`}}>{badge.icon}</div>
          <div style={{fontSize:12,color:badge.color,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:4}}>Badge Unlocked</div>
          <div style={{fontSize:18,fontWeight:700,color:"#f0f0f2",marginBottom:8}}>{badge.label}</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:16,lineHeight:1.5}}>{badge.desc}</div>
          {/* Score */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:16}}>
            <div style={{background:"#1a1a24",borderRadius:8,padding:"8px 14px",border:`1px solid ${tier.color}30`}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:700,color:tier.color}}>{finalScore}</div>
              <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{tier.label}</div>
            </div>
            <div style={{background:"#1a1a24",borderRadius:8,padding:"8px 14px",border:`1px solid ${badge.color}30`}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:700,color:badge.color}}>{unlocked}/{total}</div>
              <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>Badges</div>
            </div>
          </div>
          <div style={{fontSize:10,color:"#4b5563",fontStyle:"italic"}}>Simple on the surface. Powerful underneath.</div>
          {/* Bottom shimmer */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${badge.color}60,transparent)`}}/>
        </div>
        {/* Action buttons */}
        <div style={{display:"flex",gap:8}}>
          <PBtn children="Copy Share Text" onClick={() => { addToast("Share text copied"); }} color="#facc15" sx={{flex:1,fontSize:12}}/>
          <PBtn children="Close" onClick={onClose} outline color="#6b7280" tc="#6b7280" sx={{flex:1,fontSize:12}}/>
        </div>
        <div style={{fontSize:10,color:"#4b5563",textAlign:"center",padding:"0 12px"}}>{shareText}</div>
      </div>
    </div>
  );
}

/* ── BADGE CELEBRATION MODAL ─────────────────────────────────────────────── */
function BadgeCelebration({badge, state, np, onClose, onViewAll, addToast}) {
  const [phase, setPhase] = useState(0); // 0=in, 1=showing, 2=out
  const [showShare, setShowShare] = useState(false);
  const total = ACHIEVEMENTS.length;
  const unlocked = (state.unlockedBadges || []).length;

  // Entry animation sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    return () => clearTimeout(t1);
  }, []);

  const scale = phase === 0 ? 0.6 : phase === 1 ? 1 : 0.8;
  const opacity = phase === 0 ? 0 : 1;

  if (showShare) return <BadgeShareCard badge={badge} state={state} np={np} onClose={() => setShowShare(false)} addToast={addToast}/>;

  return (
    <div style={{position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"rgba(0,0,0,.92)"}}>
      {/* Particle rings */}
      {[...Array(3)].map((_,i) => (
        <div key={i} style={{position:"absolute",width:200+i*80,height:200+i*80,borderRadius:"50%",border:`1px solid ${badge.color}${20-i*5}`,animation:`glow ${2+i*.5}s ease-in-out infinite`,pointerEvents:"none"}}/>
      ))}

      <div style={{
        width:"100%", maxWidth:340, textAlign:"center",
        transform:`scale(${scale})`, opacity,
        transition:"transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s ease",
      }}>
        {/* Glow backdrop */}
        <div style={{position:"absolute",inset:0,borderRadius:24,background:`radial-gradient(circle at 50% 40%, ${badge.color}12 0%, transparent 70%)`,pointerEvents:"none"}}/>

        <div style={{background:"linear-gradient(145deg,#111118,#1e1e2a)",border:`2px solid ${badge.color}50`,borderRadius:24,padding:"32px 24px 24px",position:"relative",overflow:"hidden"}}>
          {/* Top gradient line */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent 0%,${badge.color} 50%,transparent 100%)`}}/>

          {/* Badge label */}
          <div style={{fontSize:10,fontWeight:700,color:badge.color,letterSpacing:".12em",textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:badge.color,animation:"dotBlink 1s ease-in-out infinite"}}/>
            Badge Unlocked
            <div style={{width:6,height:6,borderRadius:"50%",background:badge.color,animation:"dotBlink 1s ease-in-out infinite"}}/>
          </div>

          {/* Icon with glow */}
          <div style={{fontSize:64,lineHeight:1,marginBottom:16,filter:`drop-shadow(0 0 24px ${badge.color})`}}>
            {badge.icon}
          </div>

          {/* Badge name */}
          <div style={{fontSize:22,fontWeight:700,color:"#f0f0f2",marginBottom:8}}>{badge.label}</div>

          {/* Reason */}
          <div style={{fontSize:13,color:"#9ca3af",lineHeight:1.6,marginBottom:20,padding:"0 8px"}}>{badge.desc}</div>

          {/* Progress */}
          <div style={{background:"#1a1a24",borderRadius:10,padding:"10px 14px",border:`1px solid ${badge.color}20`,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:11,color:"#6b7280"}}>Badge Progress</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:badge.color}}>{unlocked} / {total}</span>
            </div>
            <div style={{height:5,background:"#2a2a38",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(unlocked/total)*100}%`,background:`linear-gradient(90deg,${badge.color}99,${badge.color})`,borderRadius:3,transition:"width .7s cubic-bezier(.4,0,.2,1)"}}/>
            </div>
            <div style={{fontSize:10,color:"#4b5563",marginTop:5}}>
              {total - unlocked} badge{total-unlocked !== 1 ? "s" : ""} remaining
            </div>
          </div>

          {/* Bottom gradient line */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${badge.color}60,transparent)`}}/>
        </div>

        {/* Action buttons */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <PBtn children="Share Badge" onClick={() => setShowShare(true)} color={badge.color} tc="#000" sx={{flex:1,fontSize:12}}/>
          <PBtn children="View Badges" onClick={onViewAll} color="#1e1e28" tc="#9ca3af" outline sx={{flex:1,fontSize:12}}/>
        </div>
        <button onClick={onClose} style={{width:"100%",marginTop:8,padding:"11px 0",background:"transparent",border:"none",cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12}}>
          Continue →
        </button>
      </div>
    </div>
  );
}

/* ── DONATION MODAL ─────────────────────────────────────────────────────── */
function DonationModal({state, dispatch, onClose, np, addToast}) {
  const WALLET_BALANCE = 500 - (state.amount || 0); // demo wallet minus current flow amount
  const MIN_DONATION   = 0.1;
  const SEASON_CAP     = 25;
  const alreadyEarned  = state.donationPointsThisSeason || 0;
  const capRemaining   = Math.max(0, SEASON_CAP - alreadyEarned);

  // Step: "input" | "review" | "confirmed"
  const [step, setStep] = useState("input");
  const [rawInput, setRawInput] = useState("");
  const [preset, setPreset] = useState(null); // active preset key or null for custom
  const [demoId] = useState("DEMO-" + Math.floor(Math.random() * 900000 + 100000));

  // Derive effective amount
  const effectiveAmt = useMemo(() => {
    if (preset === "max") return parseFloat(f2(Math.min(WALLET_BALANCE, 500)));
    if (preset !== null) return preset;
    const v = parseFloat(rawInput);
    return isNaN(v) ? 0 : v;
  }, [preset, rawInput, WALLET_BALANCE]);

  // Validation
  const validation = useMemo(() => {
    if (preset === null && rawInput === "") return {ok:false, msg:"Enter a valid donation amount."};
    if (effectiveAmt <= 0)                   return {ok:false, msg:"Enter a valid donation amount."};
    if (effectiveAmt < MIN_DONATION)         return {ok:false, msg:"Minimum donation is 0.1 LEMX."};
    if (effectiveAmt > WALLET_BALANCE)       return {ok:false, msg:`Amount exceeds wallet balance (${f2(WALLET_BALANCE)} LEMX).`};
    return {ok:true, msg:null};
  }, [effectiveAmt, rawInput, preset, WALLET_BALANCE]);

  // Points preview (capped at season cap)
  const rawPts = Math.max(0, Math.round(effectiveAmt * 1)); // 1 pt per LEMX
  const pts     = Math.min(rawPts, capRemaining);
  const newPool = parseFloat(f2((state.donationPool || 22) + effectiveAmt));

  function handlePreset(p) {
    setPreset(p);
    if (p !== "max") setRawInput(String(p));
    else setRawInput(f2(Math.min(WALLET_BALANCE, 500)));
  }

  function handleCustomChange(val) {
    setPreset(null);
    setRawInput(val);
  }

  function handleConfirm() {
    dispatch({type:"DONATE", amount:effectiveAmt});
    setStep("confirmed");
    addToast("Contributed " + f2(effectiveAmt) + " LEMX to ecosystem pool");
  }

  /* ── CONFIRMED RECEIPT ── */
  if (step === "confirmed") return (
    <Modal title="Contribution Received" onClose={onClose}>
      <div style={{textAlign:"center",padding:"16px 0 8px"}}>
        <div style={{fontSize:42,marginBottom:10,filter:"drop-shadow(0 0 12px #4ade8060)"}}>🍋</div>
        <div style={{fontSize:15,fontWeight:700,color:"#4ade80",marginBottom:4}}>Thank you for contributing!</div>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:16,lineHeight:1.5}}>Your contribution strengthens the LemonChain ecosystem.</div>
      </div>
      <div style={{background:"#1a1a24",borderRadius:10,padding:"12px 13px",border:"1px solid #232330",marginBottom:10}}>
        {[
          ["Amount Contributed", f2(effectiveAmt)+" LEMX",    "#facc15"],
          ["New Pool Total",     f2(newPool)+" LEMX",          "#4ade80"],
          ["Score Points Earned", pts > 0 ? "+"+pts+" pts"
             : "Cap reached (25/season)",                       "#a78bfa"],
          ["Demo ID",            demoId,                        "#6b7280"],
        ].map(([l,v,c]) => <KVRow key={l} label={l} val={v} vc={c}/>)}
      </div>
      {pts === 0 && (
        <div style={{fontSize:10,color:"#f59e0b",background:"#f59e0b0a",border:"1px solid #f59e0b1e",borderRadius:7,padding:"7px 10px",marginBottom:10}}>
          Donation point cap reached (25/season). Contributions still grow the pool and support the ecosystem.
        </div>
      )}
      <div style={{fontSize:10,color:"#4b5563",background:"#1a1a24",borderRadius:8,padding:"8px 10px",border:"1px solid #2a2a38",lineHeight:1.6,marginBottom:12}}>
        Donation pool is a demo simulation unless connected to an official contract. No real tokens moved.
        Top contributors split the pool at season end.
      </div>
      <PBtn children="Continue" onClick={onClose} color="#facc15" sx={{fontSize:13}}/>
    </Modal>
  );

  /* ── REVIEW STEP ── */
  if (step === "review") return (
    <Modal title="Review Contribution" onClose={()=>setStep("input")}>
      <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5,marginBottom:12}}>
        Please review your contribution before confirming.
      </div>
      <div style={{background:"#1a1a24",borderRadius:10,padding:"12px 13px",border:"1px solid #4ade8030",marginBottom:12}}>
        {[
          ["Contributing",          f2(effectiveAmt)+" LEMX",  "#facc15"],
          ["Updated Pool Estimate", f2(newPool)+" LEMX",         "#4ade80"],
          ["Score Points",          pts > 0 ? "+"+pts+" pts"
             : "Cap reached (25/season)",                         "#a78bfa"],
          ["Your Balance After",    f2(WALLET_BALANCE - effectiveAmt)+" LEMX", "#9ca3af"],
        ].map(([l,v,c]) => <KVRow key={l} label={l} val={v} vc={c}/>)}
      </div>
      {alreadyEarned > 0 && (
        <div style={{fontSize:10,color:"#9ca3af",marginBottom:8}}>
          You have earned {alreadyEarned}/{SEASON_CAP} donation points this season.
          {capRemaining > 0 ? ` ${capRemaining} pts remaining.` : " Donation point cap reached."}
        </div>
      )}
      <div style={{fontSize:10,color:"#4b5563",textAlign:"center",marginBottom:12}}>
        Demo mode — no real tokens moved.
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setStep("input")} style={{flex:1,padding:"11px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:10,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12}}>← Edit</button>
        <PBtn children="Confirm Contribution" onClick={handleConfirm} color="#4ade80" sx={{flex:2,fontSize:13}}/>
      </div>
    </Modal>
  );

  /* ── INPUT STEP ── */
  return (
    <Modal title="Contribute to Ecosystem Pool" onClose={onClose}>
      {/* Context */}
      <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.6,marginBottom:12}}>
        Contribute LEMX to the Ecosystem Donation Pool. Top 3 contributors split the pool at season end.
        Contributions also increase your Lemon Score.
      </div>

      {/* Wallet balance */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"#1a1a24",borderRadius:8,border:"1px solid #232330",marginBottom:10}}>
        <span style={{fontSize:11,color:"#6b7280"}}>Available balance</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:"#facc15"}}>{f2(WALLET_BALANCE)} LEMX</span>
      </div>

      {/* Preset buttons */}
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[0.1, 1, 5, 10].map(p => (
          <button key={p} onClick={()=>handlePreset(p)}
            style={{flex:1,padding:"9px 0",
              background:preset===p?"#facc15":"#1e1e28",
              color:preset===p?"#000":"#9ca3af",
              border:`1px solid ${preset===p?"#facc15":"#2a2a38"}`,
              borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,transition:"all .15s"}}>
            {p} L
          </button>
        ))}
        <button onClick={()=>handlePreset("max")}
          style={{flex:1,padding:"9px 0",
            background:preset==="max"?"#4ade80":"#1e1e28",
            color:preset==="max"?"#000":"#9ca3af",
            border:`1px solid ${preset==="max"?"#4ade80":"#2a2a38"}`,
            borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12,transition:"all .15s"}}>
          Max
        </button>
      </div>

      {/* Custom input */}
      <div style={{marginBottom:4}}>
        <input
          type="number"
          min={MIN_DONATION}
          max={WALLET_BALANCE}
          step={0.1}
          value={rawInput}
          onChange={e=>handleCustomChange(e.target.value)}
          placeholder={`Custom amount (min ${MIN_DONATION} LEMX)`}
          style={{width:"100%",background:"#1a1a24",border:`1px solid ${!validation.ok&&rawInput?"#ef444440":"#2a2a38"}`,borderRadius:8,padding:"10px 12px",color:"#f0f0f2",fontSize:13,outline:"none",fontFamily:"'DM Mono',monospace"}}
        />
      </div>

      {/* Validation message */}
      <div style={{height:18,marginBottom:6}}>
        {!validation.ok && (preset !== null || rawInput !== "") && (
          <div style={{fontSize:10,color:"#ef4444"}} className="fu">{validation.msg}</div>
        )}
        {validation.ok && pts === 0 && (
          <div style={{fontSize:10,color:"#f59e0b"}} className="fu">Donation point cap reached this season (25/season).</div>
        )}
      </div>

      {/* Live preview card */}
      {validation.ok && (
        <div className="fu" style={{background:"#1a1a24",borderRadius:9,padding:"10px 12px",border:"1px solid #4ade8025",marginBottom:10}}>
          {[
            ["Contributing",    f2(effectiveAmt)+" LEMX", "#facc15"],
            ["Pool becomes",    f2(newPool)+" LEMX",       "#4ade80"],
            ["Points earned",   pts>0?("+"+pts+" pts"):"Cap reached","#a78bfa"],
            ["Balance after",   f2(WALLET_BALANCE-effectiveAmt)+" LEMX","#9ca3af"],
          ].map(([l,v,c]) => <KVRow key={l} label={l} val={v} vc={c}/>)}
        </div>
      )}

      {/* Donation points info */}
      <div style={{fontSize:10,color:"#6b7280",marginBottom:10,lineHeight:1.5}}>
        1 LEMX = 1 score point · Capped at 25 pts/season.
        {alreadyEarned > 0 && ` You have earned ${alreadyEarned} donation pts this season.`}
      </div>

      <PBtn
        children="Review Contribution →"
        onClick={()=>setStep("review")}
        disabled={!validation.ok}
        color="#4ade80"
        sx={{fontSize:13,marginBottom:6}}
      />
      <div style={{fontSize:10,color:"#4b5563",textAlign:"center"}}>
        Demo simulation — no real tokens moved.
      </div>
    </Modal>
  );
}

/* ── SCORE TAB ───────────────────────────────────────────────────────────── */
function ScoreTab({state, dispatch, np, addToast}) {
  const {lemonScore, poolSplit, flowActive, mode} = state;
  const tier = getTier(lemonScore);
  const nb = np ? np.sb.reduce((s,x) => s + x.v, 0) : 0;
  const finalScore = lemonScore + Math.round(nb * 0.3);
  const nextTier = SCORE_TIERS.find(t => lemonScore < t.max && t.max !== Infinity);
  const ptsToNext = nextTier && nextTier.min > lemonScore ? nextTier.min - lemonScore
                  : nextTier ? nextTier.max - lemonScore : null;
  const nextTierLabel = nextTier?.label || null;
  const [showShare, setShowShare] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [celebBadgeManual, setCelebBadgeManual] = useState(null); // manual "View Badge" replay
  const [lbTab, setLbTab] = useState("season");
  const flowHistory = state.flowHistory || [];
  const donationPool = state.donationPool || 22;
  const totalDonated = state.totalDonated || 0;
  const weeklyScore = state.weeklyScore || 72;
  const allTimeScore = state.allTimeScore || lemonScore;

  // Count real achievements
  const totalBadges = ACHIEVEMENTS.length;
  const earnedCount = ACHIEVEMENTS.filter(a => checkAchievement(a.id, state)).length;

  // Season countdown
  const msLeft = Math.max(0, SEASON_END - Date.now());
  const daysLeft = Math.floor(msLeft / 86400000);
  const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);

  // Projected pool rewards for top 3
  const projectedPayouts = [
    {rank:1, name:"LemonKing.lemx",  score:LB[0].score, pct:50, payout:f2(donationPool*0.5)},
    {rank:2, name:"ZestLord",        score:LB[1].score, pct:30, payout:f2(donationPool*0.3)},
    {rank:3, name:"CitraStake",      score:LB[2].score, pct:20, payout:f2(donationPool*0.2)},
  ];

  // Dynamic leaderboard — inject user's live score
  const liveLB = LB.map(u => u.isYou ? {...u, score:finalScore, tier:getTier(finalScore).label} : u)
    .sort((a,b) => b.score - a.score)
    .map((u,i) => ({...u, rank:i+1}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>

      {/* ── USER SCORE CARD ── */}
      <Card sx={{border:`1px solid ${tier.color}40`,background:tier.color+"06",textAlign:"center",padding:"24px 13px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${tier.color}55,transparent)`}} className="shimmer"/>
        <AnimScore value={finalScore} color={tier.color} sz={60}/>
        <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>Lemon Score</div>
        {nb > 0 && <div style={{fontSize:10,color:np?.color,marginTop:2}}>Base: {lemonScore} + Network Boost: +{Math.round(nb*0.3)}</div>}
        <div style={{fontSize:16,fontWeight:700,color:tier.color,marginTop:6}}>{tier.label}</div>
        <div style={{marginTop:10,marginBottom:4}}><AnimBar pct={Math.min(100, ptsToNext ? (1 - ptsToNext/(nextTier?.max - nextTier?.min||1))*100 : 100)} color={tier.color} h={5}/></div>
        {ptsToNext && <div style={{fontSize:11,color:"#9ca3af",marginBottom:4}}>{ptsToNext} points to <span style={{color:nextTierLabel?getTier(nextTier?.min||999).color:"#9ca3af",fontWeight:700}}>{nextTierLabel}</span></div>}

        {/* Score breakdown pills */}
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
          <div style={{fontSize:9,padding:"3px 8px",background:"#4ade8018",color:"#4ade80",borderRadius:99,border:"1px solid #4ade8028"}}>+{weeklyScore} this week</div>
          {nb > 0 && <div style={{fontSize:9,padding:"3px 8px",background:np?.color+"18",color:np?.color,borderRadius:99,border:`1px solid ${np?.color}28`}}>+{Math.round(nb*0.3)} network boost</div>}
          <div style={{fontSize:9,padding:"3px 8px",background:"#facc1518",color:"#facc15",borderRadius:99,border:"1px solid #facc1528"}}>{allTimeScore} all-time</div>
        </div>

        <PBtn children="Share My Score" onClick={()=>setShowShare(true)} color={tier.color} tc="#000" sx={{maxWidth:200,margin:"0 auto"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${tier.color}40,transparent)`}}/>
      </Card>

      {/* ── NETWORK BOOST ── */}
      {np && (
        <Card sx={{border:`1px solid ${np.color}28`,background:np.color+"06"}} cls="glow-smart">
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <span style={{fontSize:16}}>{np.icon}</span>
            <div style={{fontSize:12,fontWeight:700,color:np.color}}>{np.label}</div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,fontSize:9,padding:"2px 8px",background:np.color+"1e",color:np.color,borderRadius:99,fontWeight:700}}><Dot color={np.color}/>Active</div>
          </div>
          <div style={{fontSize:11,color:"#9ca3af",marginBottom:6,lineHeight:1.5}}>{np.why}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{np.sb.map(b=><div key={b.l} style={{fontSize:11,color:b.c,fontWeight:600}}>+{b.v} {b.l}</div>)}</div>
          <div style={{marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:np.color}}>Multiplier: {np.multiplier}x</div>
          <WhyMatters id="network_boost" color={np.color}/>
        </Card>
      )}

      {/* ── BADGES ── */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700}}>Badges</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:"#facc15"}}>{earnedCount} / {totalBadges}</div>
        </div>
        <div style={{height:5,background:"#1e1e28",borderRadius:3,overflow:"hidden",marginBottom:4}}>
          <div style={{height:"100%",width:`${Math.round(earnedCount/totalBadges*100)}%`,background:"linear-gradient(90deg,#facc1580,#facc15)",borderRadius:3,transition:"width .7s ease"}}/>
        </div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:12}}>{totalBadges-earnedCount} badges remaining</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = checkAchievement(a.id, state);
            return (
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 11px",
                background:unlocked?a.color+"12":"#1a1a24",border:`1px solid ${unlocked?a.color+"40":"#2a2a38"}`,
                borderRadius:9,opacity:unlocked?1:.6,transition:"all .3s",
                boxShadow:unlocked?`0 0 8px ${a.color}18`:"none"}}>
                <span style={{fontSize:20,filter:unlocked?`drop-shadow(0 0 6px ${a.color}80)`:"grayscale(1)"}}>{a.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:unlocked?700:500,color:unlocked?a.color:"#9ca3af"}}>{a.label}</div>
                  <div style={{fontSize:10,color:"#6b7280",marginTop:1,lineHeight:1.4}}>{unlocked ? a.desc : a.how}</div>
                </div>
                {unlocked
                  ? (
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <Bdg color={a.color}>✓ Unlocked</Bdg>
                      <button onClick={()=>setCelebBadgeManual(a)} style={{fontSize:8,color:a.color,background:a.color+"10",border:`1px solid ${a.color}25`,borderRadius:5,padding:"2px 6px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>View Badge</button>
                    </div>
                  )
                  : <span style={{fontSize:9,color:"#4b5563",padding:"2px 7px",background:"#2a2a38",borderRadius:99}}>Locked</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── TIERS ── */}
      <Card>
        <STitle>Score Tiers</STitle>
        {SCORE_TIERS.filter(t=>t.max!==Infinity).concat(SCORE_TIERS.filter(t=>t.max===Infinity)).map(t => {
          const active = lemonScore >= t.min && (t.max === Infinity ? true : lemonScore < t.max);
          return (
            <div key={t.label} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",background:active?t.color+"12":"#1a1a24",border:`1px solid ${active?t.color+"45":"#2a2a38"}`,borderRadius:8,marginBottom:5,transition:"all .3s"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:t.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <span style={{fontSize:11,fontWeight:700,color:t.color}}>{t.label} </span>
                <span style={{fontSize:10,color:"#6b7280"}}>({t.min}–{t.max===Infinity?"∞":t.max} pts)</span>
              </div>
              {active && <Bdg color={t.color}>Current</Bdg>}
            </div>
          );
        })}
      </Card>

      {/* ── ECOSYSTEM DONATION POOL ── */}
      <Card sx={{border:"1px solid #4ade8030",background:"#4ade8005"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>🌱 Ecosystem Donation Pool</div>
            <div style={{fontSize:10,color:"#6b7280"}}>{SEASON_NAME} · {daysLeft}d {hoursLeft}h remaining</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:700,color:"#4ade80"}}>{f2(donationPool)}</div>
            <div style={{fontSize:9,color:"#6b7280"}}>LEMX in pool</div>
          </div>
        </div>
        {totalDonated > 0 && (
          <div style={{padding:"6px 10px",background:"#4ade8010",border:"1px solid #4ade8025",borderRadius:7,marginBottom:8,fontSize:10,color:"#4ade80"}}>
            You have donated {f2(totalDonated)} LEMX this season.
          </div>
        )}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Season end split · Top 3</div>
          {projectedPayouts.map(p => (
            <div key={p.rank} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",background:"#1a1a24",borderRadius:8,marginBottom:5,border:"1px solid #232330"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#6b7280",width:20,textAlign:"center"}}>#{p.rank}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:"#f0f0f2"}}>{p.name}</div>
                <div style={{fontSize:9,color:"#6b7280"}}>{p.score.toLocaleString()} pts · {p.pct}% of pool</div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:"#4ade80"}}>{p.payout} L</div>
            </div>
          ))}
        </div>
        <PBtn children="Contribute to Ecosystem Pool" onClick={()=>setShowDonate(true)} color="#4ade80" sx={{fontSize:13,marginBottom:6}}/>
        <div style={{fontSize:10,color:"#4b5563",textAlign:"center",lineHeight:1.5}}>
          Top 3 split the pool at season end. Donations earn score points. Demo simulation — no real tokens moved.
        </div>
        <WhyMatters id="donation" color="#4ade80"/>
      </Card>

      {/* ── LEADERBOARD ── */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <STitle sx={{marginBottom:0}}>Top Contributors</STitle>
          {np && <div style={{fontSize:9,color:np.color,fontWeight:600}}>{np.short} boosted</div>}
        </div>
        {/* Season tabs */}
        <div style={{display:"flex",background:"#1a1a24",borderRadius:8,padding:3,gap:2,marginBottom:10}}>
          {[["season","Season"],["weekly","Weekly"],["alltime","All-Time"]].map(([k,l])=>(
            <button key={k} onClick={()=>setLbTab(k)} style={{flex:1,padding:"6px 0",background:lbTab===k?"#facc15":"transparent",color:lbTab===k?"#000":"#6b7280",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:10,transition:"all .2s"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:10,color:"#4b5563",marginBottom:8}}>
          Scores adjust based on what LemonChain needs most. Top 3 split the Ecosystem Donation Pool at season end.
        </div>
        {liveLB.map(u => (
          <div key={u.rank} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:u.isYou?tier.color+"12":"transparent",border:`1px solid ${u.isYou?tier.color+"35":"transparent"}`,borderRadius:8,marginBottom:4}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:u.rank<=3?"#facc15":"#6b7280",width:22,textAlign:"center",fontWeight:u.rank<=3?700:400}}>#{u.rank}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:u.isYou?700:400,color:u.isYou?tier.color:"#f0f0f2"}}>{u.name}</div>
              <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{u.badge} · {u.tier}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,color:u.isYou?tier.color:"#f0f0f2"}}>{u.score.toLocaleString()}</div>
              {u.rank <= 3 && (
                <div style={{fontSize:8,color:"#4ade80",marginTop:1}}>≈{f2(donationPool*[0.5,0.3,0.2][u.rank-1])} L</div>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* ── FLOW HISTORY ── */}
      <Card>
        <STitle>Activity History</STitle>
        {flowHistory.length === 0 ? (
          <div style={{fontSize:11,color:"#6b7280",padding:"8px 0"}}>No activity yet. Activate a flow to start.</div>
        ) : flowHistory.map((h,i) => (
          <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<flowHistory.length-1?"1px solid #1a1a22":"none"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:h.color,flexShrink:0,marginTop:4}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:h.color}}>{h.action}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{h.date}{h.why ? " · "+h.why : ""}</div>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:"#4ade80",flexShrink:0}}>{h.score}</div>
          </div>
        ))}
      </Card>

      {showShare && <ShareModal state={state} np={np} onClose={()=>setShowShare(false)} addToast={addToast}/>}
      {showDonate && <DonationModal state={state} dispatch={dispatch} onClose={()=>setShowDonate(false)} np={np} addToast={addToast}/>}
      {celebBadgeManual && (
        <BadgeCelebration badge={celebBadgeManual} state={state} np={np}
          onClose={()=>setCelebBadgeManual(null)}
          onViewAll={()=>setCelebBadgeManual(null)}
          addToast={addToast}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SMART MODE TAB
══════════════════════════════════════════════════════════════════════════ */
/* ── ECOSYSTEM FEED ──────────────────────────────────────────────────────── */
function EcosystemFeed() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % ECOSYSTEM_FEED.length), 4000);
    return () => clearInterval(t);
  }, []);
  const item = ECOSYSTEM_FEED[idx];
  return (
    <div style={{background:"#0f0f14",border:"1px solid #1e1e28",borderRadius:9,padding:"7px 12px",display:"flex",alignItems:"center",gap:8,overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent)"}} className="shimmer"/>
      <Dot color={item.color}/>
      <div style={{fontSize:10,color:"#9ca3af",flex:1,fontFamily:"'DM Mono',monospace",letterSpacing:".02em"}} key={idx} className="fu">
        {item.icon} {item.msg}
      </div>
      <div style={{fontSize:8,color:"#3a3a48",flexShrink:0,fontFamily:"'DM Mono',monospace"}}>LIVE</div>
    </div>
  );
}

function SmartModeTab({state, dispatch, addToast, np}) {
  const [smartOn, setSmartOn] = useState(true);
  const [mode, setMode] = useState("balanced");
  const [win, setWin] = useState("30d");
  const [applied, setApplied] = useState(false);
  const [sigIdx, setSigIdx] = useState(0);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    if (!smartOn) return;
    const t = setInterval(() => setSigIdx(i => (i+1) % SMART_SIGNALS.length), 3200);
    return () => clearInterval(t);
  }, [smartOn]);

  useEffect(() => {
    if (!smartOn) { setAnalyzing(false); return; }
    setAnalyzing(true);
    const t = setTimeout(() => setAnalyzing(false), 1800);
    return () => clearTimeout(t);
  }, [smartOn]);

  const recSplit = useMemo(() => {
    const base = [...(STRATEGIES[mode==="conservative"?"safe":mode==="growth"?"growth":"balanced"].split)];
    if (np?.id === "liquidity")  return [Math.min(35, base[0]+7), base[1], Math.max(10, base[2]-7)];
    if (np?.id === "validators") return [base[0], Math.min(50, base[1]+7), Math.max(10, base[2]-7)];
    if (np?.id === "citadel")    return [base[0], base[1]-5, Math.min(75, base[2]+5)];
    return base;
  }, [mode, np]);

  const why = np?.id === "liquidity"
    ? recSplit[0] > state.split[0]
      ? `LemonChain needs more liquidity. Smart Mode recommends increasing liquidity from ${state.split[0]}% to ${recSplit[0]}%, using lower-risk pools.`
      : recSplit[0] < state.split[0]
      ? `LemonChain liquidity is being rebalanced. Smart Mode recommends slightly reducing liquidity exposure from ${state.split[0]}% to ${recSplit[0]}% while still prioritizing safer pools.`
      : `Liquidity allocation looks good. Smart Mode recommends maintaining your current ${state.split[0]}% liquidity allocation.`
    : np?.id === "validators"
    ? recSplit[1] > state.split[1]
      ? `Validator stake is low. Smart Mode recommends increasing validator allocation from ${state.split[1]}% to ${recSplit[1]}%.`
      : `Validator allocation looks healthy. Smart Mode recommends maintaining your ${state.split[1]}% validator allocation.`
    : np?.id === "citadel"
    ? recSplit[2] > state.split[2]
      ? `Long-term locks are low. Smart Mode recommends increasing Citadel allocation from ${state.split[2]}% to ${recSplit[2]}%.`
      : `Citadel participation is stable. Smart Mode recommends maintaining your ${state.split[2]}% Citadel allocation.`
    : "LemonChain is in balanced growth. All participation earns bonus score this week.";

  const ecoHealth = [
    {label:"Liquidity Health",           val:74, color:"#60a5fa", status:"Stable",  why:"Liquidity depth determines how efficiently LEMX can be swapped and routed. Low liquidity causes slippage and increases costs for all participants."},
    {label:"Validator Decentralization", val:82, color:"#4ade80", status:"Strong",  why:"A decentralized validator set improves LemonChain's censorship resistance and security. Spreading stake prevents any single validator from dominating."},
    {label:"Citadel Participation",      val:61, color:"#f59e0b", status:"Stable",  why:"Long-term Citadel locks reduce circulating supply and signal confidence in the ecosystem. Higher participation strengthens long-term network stability."},
    {label:"Overall Stability",          val:77, color:"#a78bfa", status:"Growing", why:"A composite score of liquidity, validator, and Citadel health. Higher stability attracts more participants and reduces ecosystem volatility."},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>
      {/* Smart Mode card */}
      <Card sx={{border:`1px solid ${smartOn?"#a78bfa45":"#2a2a38"}`,background:smartOn?"#a78bfa06":"#161620",transition:"all .3s"}} cls={smartOn?"glow-smart":""}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:13,fontWeight:700,color:smartOn?"#a78bfa":"#6b7280",transition:"color .3s"}}>Smart Mode</div>
            {smartOn && <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:"#a78bfa",fontWeight:700,letterSpacing:".06em"}}><Dot color="#a78bfa"/>LIVE</div>}
          </div>
          <div style={{display:"flex",background:"#1e1e28",borderRadius:8,padding:3,gap:2}}>
            {[true,false].map(v => (
              <button key={String(v)} onClick={() => setSmartOn(v)} style={{padding:"6px 14px",background:smartOn===v?"#a78bfa":"transparent",color:smartOn===v?"#fff":"#6b7280",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,transition:"all .2s"}}>{v?"ON":"OFF"}</button>
            ))}
          </div>
        </div>
        <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6,marginBottom:smartOn?10:0}}>
          Smart Mode recommends changes based on pool safety, validator health, and current LemonChain needs. It never moves funds without your confirmation.
        </div>
        <WhyMatters id="smart_mode" color="#a78bfa"/>
        {smartOn && (
          <div style={{fontSize:11,color:"#a78bfa",fontWeight:500,display:"flex",alignItems:"center",gap:5,minHeight:18}}>
            {analyzing ? (
              <><div style={{width:10,height:10,border:"2px solid #a78bfa",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Analyzing ecosystem conditions...</>
            ) : (
              <><Dot color="#a78bfa"/>{SMART_SIGNALS[sigIdx]}</>
            )}
          </div>
        )}
      </Card>

      {/* Live Ecosystem Feed */}
      <div>
        <div style={{fontSize:10,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Live Ecosystem</div>
        <EcosystemFeed/>
      </div>

      {/* Ecosystem Health */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <STitle sx={{marginBottom:0}}>Ecosystem Health</STitle>
          {np && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:np.color,fontWeight:700}}><Dot color={np.color}/>{np.short} Priority</div>}
        </div>
        {ecoHealth.map(m => {
          const [whyOpen, setWhyOpen] = useState(false);
          return (
            <div key={m.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <button onClick={()=>setWhyOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:0}}>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{m.label}</span>
                  <span style={{fontSize:9,color:"#4b5563"}}>{whyOpen?"▲":"▼"}</span>
                </button>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:9,padding:"1px 6px",background:m.color+"1e",color:m.color,borderRadius:4,fontWeight:700}}>{m.status}</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:m.color,fontWeight:500}}>{m.val}</span>
                </div>
              </div>
              <AnimBar pct={m.val} color={m.color} h={4}/>
              {whyOpen && (
                <div className="fu" style={{marginTop:6,padding:"7px 10px",background:m.color+"08",border:`1px solid ${m.color}18`,borderRadius:7,fontSize:10,color:"#9ca3af",lineHeight:1.55}}>{m.why}</div>
              )}
            </div>
          );
        })}
        <div style={{fontSize:10,color:"#6b7280",marginTop:4}}>LemonFlow rewards ecosystem-positive participation, not just highest APY.</div>
      </Card>

      {smartOn && np && (
        <Card sx={{border:`1px solid ${np.color}28`,background:np.color+"06"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{fontSize:15}}>{np.icon}</span><div style={{fontSize:12,fontWeight:700,color:np.color}}>Network Boost: {np.label}</div></div>
          <div style={{fontSize:11,color:"#9ca3af",marginBottom:5}}>{np.why}</div>
          <div style={{fontSize:11,color:np.color,fontWeight:600}}>Score multiplier: {np.multiplier}x for {np.id==="balanced"?"all actions":np.short.toLowerCase()+" actions"}</div>
        </Card>
      )}

      {smartOn && (
        <>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Mode</div>
              <div style={{display:"flex",background:"#161620",borderRadius:8,padding:3,gap:2,border:"1px solid #232330"}}>
                {["conservative","balanced","growth"].map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{flex:1,padding:"7px 0",background:mode===m?"#facc15":"transparent",color:mode===m?"#000":"#6b7280",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:10,textTransform:"capitalize",transition:"all .2s"}}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Window</div>
              <select value={win} onChange={e => setWin(e.target.value)} style={{width:"100%",background:"#161620",border:"1px solid #232330",borderRadius:8,padding:"9px 10px",color:"#f0f0f2",fontSize:11,outline:"none",cursor:"pointer"}}>
                {["7d","30d","90d","6m","12m"].map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <Card>
            <STitle>Current Allocation</STitle>
            <div style={{display:"flex",gap:14}}>
              <StatBig label="HEXDEX" val={state.split[0]+"%"} color="#60a5fa"/>
              <StatBig label="Validators" val={state.split[1]+"%"} color="#4ade80"/>
              <StatBig label="Citadel" val={state.split[2]+"%"} color="#f59e0b"/>
            </div>
          </Card>

          <Card sx={{border:"1px solid #4ade8030",background:"#4ade8005"}} cls={!applied?"bpulse":""}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <STitle sx={{marginBottom:0}}>Recommendation</STitle>
              <div style={{display:"flex",gap:5}}>
                <Bdg color="#4ade80">Confidence: High</Bdg>
                <Bdg color="#60a5fa">Risk: Reduced</Bdg>
              </div>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:8}}>
              <StatBig label="HEXDEX" val={recSplit[0]+"%"} color="#60a5fa"/>
              <StatBig label="Validators" val={recSplit[1]+"%"} color="#4ade80"/>
              <StatBig label="Citadel" val={recSplit[2]+"%"} color="#f59e0b"/>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              <div style={{fontSize:11,color:"#4ade80",fontWeight:600}}>+5 Est. Score Improvement</div>
              <div style={{fontSize:11,color:"#a78bfa",fontWeight:600}}>Positive Ecosystem Impact</div>
            </div>
            <div style={{background:"#1a1a24",borderRadius:8,padding:9,border:"1px solid #2a2a38",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:"#f0f0f2",marginBottom:3}}>Why this changed:</div>
              <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5}}>{why}</div>
            </div>
            <div style={{fontSize:10,padding:"7px 10px",background:"#f59e0b0a",border:"1px solid #f59e0b1e",borderRadius:7,color:"#f59e0b",marginBottom:8}}>⚠️ Smart Mode only applies to future deposits and unlocked rewards. It never rebalances locked Citadel positions.</div>
            <div style={{display:"flex",gap:7}}>
              <PBtn children={applied?"Queued for Review":"Apply Recommendation"} onClick={() => {
                setApplied(true);
                dispatch({type:"MARK_SMART_APPLIED"});
                addToast("Smart Mode recommendation queued");
              }} color={applied?"#4ade80":"#facc15"} sx={{flex:2}}/>
              <button onClick={() => setApplied(false)} style={{flex:1,padding:"11px 0",background:"transparent",border:"1px solid #2a2a38",borderRadius:10,cursor:"pointer",color:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>Dismiss</button>
            </div>
          </Card>

          {state.mode === "advanced" && (
            <Card>
              <STitle>Allocation Trend (Simulated)</STitle>
              <div style={{display:"flex",gap:12,marginTop:8}}>
                {[["HEXDEX",[12,14,15,13,16,17,15],"#60a5fa"],["Validator",[34,35,34,36,35,35,35],"#4ade80"],["Citadel",[54,51,51,51,49,48,50],"#f59e0b"]].map(([label,data,color]) => (
                  <div key={label} style={{flex:1,textAlign:"center"}}>
                    <Spark data={data} color={color} h={28} w={60}/>
                    <div style={{fontSize:9,color:"#6b7280",marginTop:3}}>{label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATE MANAGEMENT
══════════════════════════════════════════════════════════════════════════ */
function appReducer(state, action) {
  switch (action.type) {
    case "SET": return {...state, ...action.payload};
    case "ACTIVATE_FLOW": {
      const strat = STRATEGIES[state.strategy] || STRATEGIES.balanced;
      const today = new Date();
      const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
      const fmtLong = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      const newFlowCount = (state.flowCount || 0) + 1;

      // Build a rich, self-contained flow snapshot with realistic demo seed values
      const valLock = state.valLock || VAL_LOCKS[0];
      const citTier = CIT_TIERS.find(t => t.months === state.citLock) || null;
      const split = state.split || [15,35,50];
      const amount = state.amount || 50;
      const validator = state.validator || null;
      const poolSplit = state.poolSplit || [];
      const vb = (state.valOwner ? 15 : 0) + (valLock.boost || 0);
      const hexBlend = poolSplit.length ? poolSplit.reduce((s,x) => s + x.pool.apy * x.pct / 100, 0) : 0;
      const valAPY = (validator?.apy || 0) + vb / 10;
      // Seed demo rewards at ~1 day worth of accrual so the UI looks alive immediately
      const seedDays = 1;
      const valEarned  = parseFloat(f2(amount * split[1]/100 * valAPY / 100 / 365 * seedDays * 1.3));
      const hexFeesEarned  = parseFloat(f2(amount * split[0]/100 * hexBlend / 100 / 365 * seedDays * 0.7));
      const hexStakeEarned = parseFloat(f2(amount * split[0]/100 * 0.05 / 365 * seedDays));
      const citBonus = citTier ? parseFloat(f2(amount * split[2]/100 * citTier.bonus / 100)) : 0;
      const lockEnd  = citTier ? new Date(today.getTime() + citTier.months * 30.44 * 24 * 3600000) : null;
      const dripEnd  = lockEnd && citTier ? new Date(lockEnd.getTime() + citTier.drip * 30.44 * 24 * 3600000) : null;

      const newFlow = {
        id: `flow-${Date.now()}`,
        flowNumber: newFlowCount,
        date: fmt(today),
        dateCreated: today.toISOString(),
        amount,
        strategy: strat.label,
        strategyKey: state.strategy,
        split: [...split],
        poolSplit: poolSplit.map(e => ({pair: e.pool.pair, id: e.pool.id, pct: e.pct, apy: e.pool.apy})),
        validator: validator ? {id: validator.id, name: validator.name, apy: validator.apy, uptime: validator.uptime, commission: validator.commission} : null,
        valLockDays: valLock.days,
        valLockLabel: valLock.label,
        valLockBoost: valLock.boost,
        citLockMonths: state.citLock || 0,
        citLockLabel: citTier?.label || "None",
        // Amounts
        valAmount:  parseFloat(f2(amount * split[1] / 100)),
        hexAmount:  parseFloat(f2(amount * split[0] / 100)),
        citAmount:  parseFloat(f2(amount * split[2] / 100)),
        citBonus,
        // Seeded demo earnings
        valEarned,
        hexFeesEarned,
        hexStakeEarned,
        hexEarned: parseFloat(f2(hexFeesEarned + hexStakeEarned)),
        // Citadel dates
        lockEndStr: lockEnd ? fmtLong(lockEnd) : null,
        dripStartStr: lockEnd ? fmtLong(lockEnd) : null,
        dripEndStr: dripEnd ? fmtLong(dripEnd) : null,
        // Meta
        estimatedAPY: parseFloat(f2((hexBlend * split[0] + valAPY * split[1] + (citTier ? citTier.bonus/(citTier.months/12) : 0) * split[2]) / 100)),
        riskLevel: strat.risk,
        scoreBoost: strat.scoreBoost,
        status: "active",
      };

      return {
        ...state,
        flowActive: true,
        flowCount: newFlowCount,
        riskCheckedCount: (state.riskCheckedCount || 0) + (state.riskChecked ? 1 : 0),
        // Use points-per-LEMX formula instead of static scoreBoost
        lemonScore: state.lemonScore + (() => {
          const sc = calcFlowScore(
            amount,
            split,
            valLock.days || 0,
            state.citLock || 0,
            poolSplit.length,
            state._lastNpId || "balanced"
          );
          return sc.total > 0 ? sc.total : strat.scoreBoost;
        })(),
        badgeTriggerCount: (state.badgeTriggerCount || 0) + 1,
        activeFlows: [newFlow, ...(state.activeFlows || [])].slice(0, 10),
        flowHistory: [
          {date:fmt(today), action:"Flow activated", why:strat.label+" strategy selected", score:"+"+strat.scoreBoost, color:"#facc15"},
          ...(state.flowHistory || []),
        ].slice(0, 10),
      };
    }
    case "ADD_SCORE": {
      const fmt2 = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
      const addAmt = action.amount || 2;
      return {
        ...state,
        lemonScore:   state.lemonScore + addAmt,
        badgeTriggerCount: (state.badgeTriggerCount || 0) + 1,
        allTimeScore: (state.allTimeScore || state.lemonScore) + addAmt,
        weeklyScore:  (state.weeklyScore || 0) + addAmt,
        flowHistory: [
          {date:fmt2(new Date()), action:action.label||"Score earned", why:action.why||"", score:"+"+addAmt, color:action.color||"#4ade80"},
          ...(state.flowHistory||[]),
        ].slice(0,20),
      };
    }
    case "DONATE": {
      const fmt2 = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
      const amt = action.amount || 0;
      const DONATION_CAP = 25;
      const alreadyEarned = state.donationPointsThisSeason || 0;
      const rawPts = Math.floor(amt * 1); // 1 point per whole LEMX donated (floor so 0.1 LEMX = 0 pts but still grows pool)
      const pts = Math.min(rawPts, DONATION_CAP - alreadyEarned); // cap at 25 total
      const newTotal = (state.totalDonated || 0) + amt;
      return {
        ...state,
        badgeTriggerCount: (state.badgeTriggerCount || 0) + 1,
        donationPool: (state.donationPool || 22) + amt,
        donationPointsThisSeason: Math.min(25, (state.donationPointsThisSeason || 0) + pts),
        totalDonated: newTotal,
        lemonScore:   state.lemonScore + pts,
        allTimeScore: (state.allTimeScore || state.lemonScore) + pts,
        weeklyScore:  (state.weeklyScore || 0) + pts,
        flowHistory: [
          {date:fmt2(new Date()), action:"Contributed "+f2(amt)+" LEMX to pool", why:"Ecosystem Pool · Season 4 · 1pt/LEMX, cap 25/season", score:pts>0?"+"+pts+" pts":"pool only (cap reached)", color:"#4ade80"},
          ...(state.flowHistory||[]),
        ].slice(0,20),
      };
    }
    case "MARK_SMART_APPLIED": {
      return {...state, smartApplied: true, badgeTriggerCount: (state.badgeTriggerCount||0)+1};
    }
    case "UNLOCK_BADGE": {
      const prev = state.unlockedBadges || [];
      if (prev.includes(action.id)) return state;
      return {...state, unlockedBadges: [...prev, action.id]};
    }
    default: return state;
  }
}


/* ══════════════════════════════════════════════════════════════════════════
   FLOW FORECAST
══════════════════════════════════════════════════════════════════════════ */
function FlowForecast({state, np}) {
  const [period, setPeriod] = useState(365);
  const {amount, split, valLock, citLock, poolSplit, validator} = state;
  const citTier = CIT_TIERS.find(t => t.months === citLock);
  const hexBlend = poolSplit.length ? poolSplit.reduce((s,x) => s + x.pool.apy * x.pct / 100, 0) : 14;
  const vb = (valLock?.boost || 0) / 10;
  const valAPY = (validator?.apy || 12) + vb;
  const citRate = citTier ? citTier.bonus / (citTier.months / 12) : 0;
  const y = period / 365;
  const mult = np?.multiplier || 1;
  const hR = parseFloat(f2(amount * split[0]/100 * hexBlend/100 * y * 1.1));
  const vR = parseFloat(f2(amount * split[1]/100 * valAPY/100 * y * 1.2));
  const cR = parseFloat(f2(amount * split[2]/100 * citRate/100 * y));
  const total = parseFloat(f2(hR + vR + cR));
  const sc = calcFlowScore(amount, split, valLock?.days||0, citLock||0, poolSplit.length, np?.id||"balanced");
  const scoreGrowth = Math.round(sc.total * (period / 30) * 0.15 * mult);
  const lockEnd = citTier ? new Date(Date.now() + citTier.months * 30.44 * 24 * 3600000) : null;
  const dripEnd = lockEnd && citTier ? new Date(lockEnd.getTime() + citTier.drip * 30.44 * 24 * 3600000) : null;
  const fmt = d => d.toLocaleDateString("en-US",{month:"short",year:"numeric"});
  const periods = [[30,"30d"],[90,"90d"],[365,"1yr"],[1825,"5yr"]];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:6}}>
        {periods.map(([d,l]) => (
          <button key={d} onClick={()=>setPeriod(d)} style={{flex:1,padding:"8px 0",background:period===d?"#facc15":"#1e1e28",color:period===d?"#000":"#9ca3af",border:`1px solid ${period===d?"#facc15":"#2a2a38"}`,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12}}>{l}</button>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#0f0f14,#1a1a24)",border:"1px solid #2a2a38",borderRadius:12,padding:"14px 13px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#facc1555,transparent)"}} className="shimmer"/>
        <div style={{textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>Projected Rewards</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:700,color:"#facc15"}}>{total} LEMX</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
          {[["HEXDEX",hR,"#60a5fa"],["Validator",vR,"#4ade80"],["Citadel",cR,"#f59e0b"]].map(([l,v,c])=>(
            <div key={l} style={{background:c+"10",border:`1px solid ${c}1e`,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#4b5563",marginTop:2}}>{l} LEMX</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          <div style={{background:"#a78bfa10",border:"1px solid #a78bfa20",borderRadius:8,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:"#6b7280"}}>Est. Score Growth</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:"#a78bfa",marginTop:2}}>+{scoreGrowth}</div>
          </div>
          <div style={{background:"#4ade8010",border:"1px solid #4ade8020",borderRadius:8,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:"#6b7280"}}>Network Boost</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:"#4ade80",marginTop:2}}>{mult}x</div>
          </div>
        </div>
      </div>
      {citTier && lockEnd && (
        <div style={{background:"#f59e0b08",border:"1px solid #f59e0b25",borderRadius:9,padding:"9px 11px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#f59e0b",marginBottom:5}}>🏰 Citadel Timeline</div>
          {[["Lock Period",`${citLock} months (${f1(citLock/12)} yr)`,"#9ca3af"],["Lock End",fmt(lockEnd),"#f59e0b"],["Drip Start",fmt(lockEnd),"#f59e0b"],["Drip End",dripEnd?fmt(dripEnd):"—","#4ade80"],["Bonus","+"+f2(amount*split[2]/100*citTier.bonus/100)+" LEMX","#f59e0b"]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:10,color:"#6b7280"}}>{l}</span><span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:c}}>{v}</span></div>
          ))}
        </div>
      )}
      <div style={{fontSize:10,color:"#4b5563",textAlign:"center",lineHeight:1.5}}>
        Forecasts are estimates for demo purposes and are not guaranteed. Actual returns depend on network conditions.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STRATEGY TEMPLATES
══════════════════════════════════════════════════════════════════════════ */
function StrategyTemplates({state, dispatch, addToast, onGoToFlow}) {
  const [expanded, setExpanded] = useState(null);
  const [appliedId, setAppliedId] = useState(null);

  function applyTemplate(t) {
    // Build exact poolSplit from template's poolIds
    const templatePools = t.poolIds
      .map(id => POOLS.find(p => p.id === id))
      .filter(Boolean);
    const even = Math.floor(100 / templatePools.length);
    const poolSplit = templatePools.map((pool, i) => ({
      pool,
      pct: i === templatePools.length - 1
        ? 100 - even * (templatePools.length - 1)
        : even,
    }));

    // Find exact validator by id
    const validator = VALIDATORS.find(v => v.id === t.validatorId) || VALIDATORS[0];

    // Build exact valLock
    const valLock = valLockFromDays(t.valLockDays);

    // Dispatch full state update — everything the flow wizard sets
    dispatch({type:"SET", payload:{
      strategy:    t.id,
      split:       [...t.split],
      citLock:     t.citLock,
      valLock,
      poolSplit,
      validator,
      poolPreset:  templatePools.length === 1 ? "single" : templatePools.length === 2 ? "split2" : "split3",
      riskChecked: false,       // user must re-confirm risk for new config
    }});

    setAppliedId(t.id);
    addToast(`${t.label} applied — review before activating`);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {TEMPLATES.map(t => {
        const isApplied = appliedId === t.id;
        const isExpanded = expanded === t.id;
        const pools = t.poolIds.map(id => POOLS.find(p => p.id === id)).filter(Boolean);
        const validator = VALIDATORS.find(v => v.id === t.validatorId);
        const citTier = CIT_TIERS.find(x => x.months === t.citLock);
        const valLockLabel = valLockFromDays(t.valLockDays).label;

        return (
          <div key={t.id} style={{
            background: isApplied ? t.rc+"0c" : "#161620",
            border: `1px solid ${isApplied ? t.rc+"60" : isExpanded ? t.rc+"50" : "#232330"}`,
            borderRadius:11, overflow:"hidden", transition:"all .2s",
          }}>
            {/* Header row */}
            <button onClick={()=>setExpanded(e=>e===t.id?null:t.id)}
              style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"11px 12px",textAlign:"left",display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <div style={{fontSize:12,fontWeight:700,color: isApplied ? t.rc : "#f0f0f2"}}>{t.label}</div>
                  {isApplied && <span style={{fontSize:9,padding:"1px 6px",background:t.rc+"25",color:t.rc,borderRadius:99,fontWeight:700}}>✓ Applied</span>}
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,padding:"1px 6px",background:t.rc+"18",color:t.rc,borderRadius:99,fontWeight:700}}>{t.risk} Risk</span>
                  <span style={{fontSize:9,padding:"1px 6px",background:"#4ade8018",color:"#4ade80",borderRadius:99,fontWeight:700}}>{t.returnLabel}</span>
                  <span style={{fontSize:9,padding:"1px 6px",background:"#a78bfa18",color:"#a78bfa",borderRadius:99,fontWeight:700}}>{t.ecoImpactLabel} Impact</span>
                </div>
              </div>
              <span style={{fontSize:11,color:"#4b5563"}}>{isExpanded?"▲":"▼"}</span>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="fu" style={{padding:"0 12px 12px",borderTop:"1px solid #1e1e28"}}>
                <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5,marginTop:9,marginBottom:10}}>{t.desc}</div>

                {/* Split bars */}
                <div style={{display:"flex",gap:7,marginBottom:10}}>
                  {[["💧",t.split[0]+"%","#60a5fa","HEXDEX"],["🔒",t.split[1]+"%","#4ade80","Validator"],["🏰",t.split[2]+"%","#f59e0b","Citadel"]].map(([icon,v,c,l])=>(
                    <div key={l} style={{flex:1,background:c+"10",borderRadius:8,padding:"8px 5px",textAlign:"center",border:`1px solid ${c}18`}}>
                      <div style={{fontSize:9,marginBottom:2}}>{icon}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:c}}>{v}</div>
                      <div style={{fontSize:8,color:"#6b7280",marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Config details */}
                <div style={{background:"#1a1a24",borderRadius:8,padding:"9px 11px",marginBottom:10,border:"1px solid #232330"}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Configuration</div>
                  {[
                    ["Pools",        pools.map(p=>p.pair).join(", "),                "#60a5fa"],
                    ["Validator",    validator?.name || "—",                          "#4ade80"],
                    ["Val Lock",     valLockLabel+(t.valLockDays>0?` (+${valLockFromDays(t.valLockDays).boost}% boost)`:" · no boost"), "#f59e0b"],
                    ["Citadel Lock", citTier?.label || t.citLock+"mo",               "#f59e0b"],
                    ["Cit Bonus",    citTier?`+${citTier.bonus}%`:"—",              "#4ade80"],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #232330"}}>
                      <span style={{fontSize:10,color:"#6b7280"}}>{l}</span>
                      <span style={{fontSize:10,fontWeight:600,color:c}}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Applied summary — shown after applying */}
                {isApplied && (
                  <div className="fu" style={{background:t.rc+"0a",border:`1px solid ${t.rc}25`,borderRadius:8,padding:"9px 11px",marginBottom:10}}>
                    <div style={{fontSize:10,fontWeight:700,color:t.rc,marginBottom:5}}>✓ Applied to Your Flow</div>
                    <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.6}}>
                      · {t.split[0]}% HEXDEX → {pools.map(p=>p.pair).join(", ")}<br/>
                      · {t.split[1]}% Validator → {validator?.name} · {valLockLabel}<br/>
                      · {t.split[2]}% Citadel → {citTier?.label} lock · +{citTier?.bonus}% bonus
                    </div>
                    <button onClick={()=>{ if(onGoToFlow) onGoToFlow(); }} style={{marginTop:8,padding:"7px 12px",background:t.rc+"18",border:`1px solid ${t.rc}35`,borderRadius:7,cursor:"pointer",color:t.rc,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:10}}>
                      Go to Flow Review →
                    </button>
                  </div>
                )}

                <PBtn
                  children={isApplied ? "Re-Apply Template" : "Apply Template"}
                  onClick={()=>applyTemplate(t)}
                  color={t.rc} tc="#000" sx={{fontSize:12}}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MISSIONS
══════════════════════════════════════════════════════════════════════════ */
function MissionsPanel({state, dispatch, addToast}) {
  function claimMission(m) {
    dispatch({type:"ADD_SCORE", amount:m.pts, label:"Mission complete: "+m.label, why:m.desc, color:m.color});
    addToast("Mission complete! +"+m.pts+" pts");
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {MISSIONS.map(m => {
        const done = m.check(state);
        const claimed = (state.flowHistory||[]).some(h=>h.action.includes("Mission complete: "+m.label));
        return (
          <div key={m.id} style={{background:"#161620",border:`1px solid ${done?"#4ade8030":"#232330"}`,borderRadius:10,padding:"10px 12px",transition:"border-color .3s"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:18,filter:done?"none":"grayscale(1) opacity(.4)"}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:done?"#f0f0f2":"#9ca3af"}}>{m.label}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{m.desc}</div>
                <div style={{fontSize:9,color:m.color,marginTop:2}}>Reward: +{m.pts} pts{m.badge?" · Badge: "+ACHIEVEMENTS.find(a=>a.id===m.badge)?.label:""}  </div>
              </div>
              {done && !claimed
                ? <button onClick={()=>claimMission(m)} style={{padding:"6px 10px",background:"#4ade8018",border:"1px solid #4ade8035",borderRadius:7,cursor:"pointer",color:"#4ade80",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:10}} className="claim-glow">Claim</button>
                : done && claimed
                ? <span style={{fontSize:9,color:"#4ade80",padding:"3px 8px",background:"#4ade8012",borderRadius:99}}>✓ Done</span>
                : <span style={{fontSize:9,color:"#4b5563",padding:"3px 8px",background:"#1a1a24",borderRadius:99}}>In Progress</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SEASONAL EVENTS
══════════════════════════════════════════════════════════════════════════ */
function SeasonalEventsPanel({state, dispatch, addToast, np}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {SEASONAL_EVENTS.map(e => {
        const active = true; // all active in demo
        return (
          <div key={e.id} style={{background:"#161620",border:`1px solid ${e.color}30`,borderRadius:11,padding:"11px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:16}}>{e.icon}</span>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:e.color}}>{e.name}</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>⏱ {e.timeLeft} remaining</div>
                </div>
              </div>
              <div style={{fontSize:9,padding:"3px 8px",background:e.color+"1e",color:e.color,borderRadius:99,fontWeight:700}}>{e.bonus}</div>
            </div>
            <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.5,marginBottom:6}}>{e.desc}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{flex:1,height:4,background:"#1e1e28",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:"35%",background:e.color,borderRadius:2}}/>
              </div>
              <span style={{fontSize:9,color:e.color,fontWeight:600}}>{e.goal}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REPUTATION + PORTFOLIO
══════════════════════════════════════════════════════════════════════════ */
function ReputationCard({state}) {
  const identity = REPUTATION_TYPES.find(r => r.check(state)) || REPUTATION_TYPES[4];
  const tier = getTier(state.lemonScore);
  const traits = REPUTATION_TYPES.filter(r => r.check(state));
  return (
    <div style={{background:"linear-gradient(145deg,#0f0f14,#1a1a24)",border:`2px solid ${identity.color}35`,borderRadius:14,padding:"16px 14px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${identity.color},transparent)`}} className="shimmer"/>
      <div style={{fontSize:10,color:"#6b7280",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Your LemonFlow Identity</div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontSize:32,filter:`drop-shadow(0 0 12px ${identity.color}90)`}}>{identity.icon}</span>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:identity.color}}>{identity.label}</div>
          <div style={{fontSize:10,color:"#6b7280",marginTop:2,lineHeight:1.4}}>{identity.desc}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {traits.slice(0,4).map(t => <Bdg key={t.id} color={t.color}>{t.icon} {t.label}</Bdg>)}
        {traits.length === 0 && <span style={{fontSize:10,color:"#4b5563"}}>Activate a flow to build your identity.</span>}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${identity.color}50,transparent)`}}/>
    </div>
  );
}

function PortfolioCard({state, np}) {
  const {amount, split, poolSplit, validator, citLock, activeFlows, lemonScore} = state;
  const citTier = CIT_TIERS.find(t => t.months === citLock);
  const hexAmt   = parseFloat(f2(amount * split[0] / 100));
  const valAmt   = parseFloat(f2(amount * split[1] / 100));
  const citAmt   = parseFloat(f2(amount * split[2] / 100));
  const citBonus = citTier ? parseFloat(f2(citAmt * citTier.bonus / 100)) : 0;
  const claimable = parseFloat(f2(activeFlows.reduce((s,fl) => s + fl.valEarned + fl.hexEarned, 0)));
  const totalVal  = parseFloat(f2(amount + claimable));
  return (
    <div style={{background:"#161620",border:"1px solid #232330",borderRadius:12,padding:"13px 14px"}}>
      <div style={{fontSize:11,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Portfolio Overview</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[
          ["HEXDEX LP",       hexAmt+" LEMX",   "#60a5fa"],
          ["Validator Stake", valAmt+" LEMX",   "#4ade80"],
          ["Citadel Locked",  citAmt+" LEMX",   "#f59e0b"],
          ["Citadel Bonus",   "+"+f2(citBonus)+" LEMX","#f59e0b"],
          ["Claimable",       f2(claimable)+" LEMX","#4ade80"],
          ["Active Flows",    activeFlows.length,"#facc15"],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:"#1a1a24",borderRadius:8,padding:"8px 9px",border:`1px solid ${c}15`}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:c}}>{v}</div>
            <div style={{fontSize:9,color:"#6b7280",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"#facc1508",borderRadius:8,border:"1px solid #facc1518"}}>
        <span style={{fontSize:11,fontWeight:600,color:"#9ca3af"}}>Total Portfolio Value</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:"#facc15"}}>{f2(totalVal)} LEMX</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AUTO-REFLOW MODAL
══════════════════════════════════════════════════════════════════════════ */
function AutoReFlowModal({state, dispatch, onClose, addToast}) {
  const [mode, setMode] = useState("balanced");
  const [confirmed, setConfirmed] = useState(false);
  const activeFlows = state.activeFlows || [];
  const claimable   = parseFloat(f2(activeFlows.reduce((s,fl) => s + fl.valEarned + fl.hexEarned, 0)));
  const rm = REFLOW_MODES.find(r => r.id === mode) || REFLOW_MODES[1];
  const targetSplit = rm.id === "match" ? state.split : rm.split || state.split;
  const np_id = state._lastNpId || "balanced";
  const sc = calcFlowScore(claimable, targetSplit, state.valLock?.days||0, state.citLock||0, (state.poolSplit||[]).length, np_id);

  if (confirmed) return (
    <Modal title="Re-Flow Applied" onClose={onClose}>
      <div style={{textAlign:"center",padding:"12px 0"}}>
        <div style={{fontSize:32,marginBottom:8}}>🔄</div>
        <div style={{fontSize:14,fontWeight:700,color:"#4ade80",marginBottom:4}}>Re-Flow Queued</div>
        <div style={{fontSize:11,color:"#6b7280"}}>Your rewards will be re-routed on next accrual cycle.</div>
      </div>
      {[["Rewards Re-Flowed",f2(claimable)+" LEMX","#facc15"],["Destination Mode",rm.label,"#a78bfa"],["Score Impact","+"+sc.total+" pts","#4ade80"]].map(([l,v,c])=><KVRow key={l} label={l} val={v} vc={c}/>)}
      <PBtn children="Done" onClick={onClose} color="#facc15" sx={{marginTop:12}}/>
    </Modal>
  );

  return (
    <Modal title="Auto Re-Flow" onClose={onClose}>
      <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5,marginBottom:12}}>
        Re-Flow routes your unlocked rewards back into LemonChain participation. LemonFlow never moves funds automatically without your confirmation.
      </div>
      <div style={{padding:"8px 10px",background:"#1a1a24",borderRadius:8,border:"1px solid #232330",marginBottom:12,display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:11,color:"#6b7280"}}>Available to Re-Flow</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:claimable>0?"#4ade80":"#4b5563"}}>{f2(claimable)} LEMX</span>
      </div>
      {claimable === 0 && <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>No claimable rewards yet. Activate a flow and let rewards accrue.</div>}
      <STitle>Re-Flow Mode</STitle>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        {REFLOW_MODES.filter(r=>r.id!=="off").map(r => (
          <button key={r.id} onClick={()=>setMode(r.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:mode===r.id?"#a78bfa10":"#1a1a24",border:`1px solid ${mode===r.id?"#a78bfa40":"#2a2a38"}`,borderRadius:9,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
            <span style={{fontSize:14}}>{r.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:mode===r.id?"#a78bfa":"#f0f0f2"}}>{r.label}</div>
              {r.split && <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{r.split[0]}% Liq · {r.split[1]}% Val · {r.split[2]}% Cit</div>}
              {r.id==="match" && <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>Uses your current split</div>}
            </div>
            {mode===r.id && <div style={{width:8,height:8,borderRadius:"50%",background:"#a78bfa"}}/>}
          </button>
        ))}
      </div>
      {claimable > 0 && (
        <div style={{background:"#1a1a24",borderRadius:8,padding:"9px 11px",border:"1px solid #232330",marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:600,color:"#a78bfa",marginBottom:5}}>Why Re-Flow?</div>
          <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.5}}>
            {mode==="liq_first" ? "Liquidity is currently underfunded. Re-routing rewards to HEXDEX helps deepen ecosystem liquidity." :
             mode==="val_first" ? "Validator stake is needed. Re-routing helps improve decentralization." :
             mode==="cit_max"   ? "Long-term commitment. Re-routing to Citadel builds deeper lock participation." :
             mode==="match"     ? "Your rewards follow your existing strategy split." :
             "Balanced re-routing supports all three ecosystem systems equally."}
          </div>
        </div>
      )}
      <PBtn children={claimable>0?"Confirm Re-Flow →":"No Rewards Available"} onClick={()=>{if(claimable<=0)return;dispatch({type:"ADD_SCORE",amount:sc.total>0?sc.total:3,label:"Re-Flow applied: "+rm.label,why:f2(claimable)+" LEMX re-routed",color:"#a78bfa"});setConfirmed(true);addToast("Re-Flow applied via "+rm.label);}} disabled={claimable<=0} color="#a78bfa" tc="#fff" sx={{fontSize:13}}/>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   GUIDED FIRST FLOW
══════════════════════════════════════════════════════════════════════════ */
function GuidedOnboarding({onSkip, onStart}) {
  const [step, setStep] = useState(0);
  const steps = [
    {icon:"💧", title:"Liquidity helps trading depth", body:"Adding LEMX to HEXDEX pools makes it easier for everyone to trade on LemonChain. Deeper pools mean lower slippage and healthier markets."},
    {icon:"🔒", title:"Validators secure the network", body:"Staking to validators helps confirm transactions and keep LemonChain running. Longer locks earn higher rewards and improve network stability."},
    {icon:"🏰", title:"Citadel supports long-term stability", body:"Citadel locks reduce circulating supply and signal long-term confidence. The longer you lock, the higher your bonus — up to 3x on 5-year locks."},
  ];
  const s = steps[step];
  return (
    <div style={{background:"#0f0f14",border:"1px solid #232330",borderRadius:16,padding:"24px 20px",textAlign:"center",position:"relative"}}>
      <div style={{position:"absolute",top:10,right:12}}>
        <button onClick={onSkip} style={{fontSize:10,color:"#4b5563",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Skip tour</button>
      </div>
      <div style={{fontSize:48,marginBottom:12,filter:`drop-shadow(0 0 14px #facc1540)`}}>{s.icon}</div>
      <div style={{fontSize:14,fontWeight:700,color:"#f0f0f2",marginBottom:8}}>{s.title}</div>
      <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.7,marginBottom:16,padding:"0 8px"}}>{s.body}</div>
      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
        {steps.map((_,i)=><div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?"#facc15":"#2a2a38",transition:"width .3s ease"}}/>)}
      </div>
      {step < steps.length - 1
        ? <PBtn children="Next →" onClick={()=>setStep(s=>s+1)} color="#facc15" sx={{maxWidth:200,margin:"0 auto"}}/>
        : <PBtn children="Create My First Flow →" onClick={onStart} color="#facc15" sx={{maxWidth:240,margin:"0 auto"}}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CITADEL VISUALIZER
══════════════════════════════════════════════════════════════════════════ */
function CitadelVisualizer({citLock}) {
  const tier = CIT_TIERS.find(t => t.months === citLock);
  const strength = citLock >= 60 ? 100 : citLock >= 48 ? 85 : citLock >= 36 ? 70 : citLock >= 24 ? 55 : citLock >= 12 ? 38 : citLock >= 6 ? 22 : 0;
  const color = strength >= 80 ? "#f59e0b" : strength >= 55 ? "#facc15" : strength >= 30 ? "#4ade80" : "#9ca3af";
  const lockEnd = tier ? new Date(Date.now() + tier.months * 30.44 * 24 * 3600000) : null;
  const dripEnd = lockEnd && tier ? new Date(lockEnd.getTime() + tier.drip * 30.44 * 24 * 3600000) : null;
  const fmt = d => d.toLocaleDateString("en-US",{month:"short",year:"numeric"});
  return (
    <div style={{background:"#111118",border:`1px solid ${color}35`,borderRadius:11,padding:"12px 13px",transition:"border-color .4s",boxShadow:strength>60?`0 0 20px ${color}18`:"none"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{fontSize:28,filter:strength>50?`drop-shadow(0 0 8px ${color}80)`:"none",transition:"filter .4s"}}>🏰</div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color}}>Citadel Strength</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:700,color,lineHeight:1}}>{strength}/100</div>
        </div>
        {tier && <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:9,color:"#6b7280"}}>Lock Bonus</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:"#4ade80"}}>+{tier.bonus}%</div></div>}
      </div>
      <div style={{height:7,background:"#1e1e28",borderRadius:4,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",width:`${strength}%`,background:`linear-gradient(90deg,${color}80,${color})`,borderRadius:4,transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      {tier ? (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[["Lock Duration",tier.label],["Drip Duration",tier.drip+"mo"],lockEnd&&["Lock End",fmt(lockEnd)],dripEnd&&["Drip End",fmt(dripEnd)]].filter(Boolean).map(([l,v])=>(
            <div key={l} style={{background:"#1a1a24",borderRadius:6,padding:"5px 8px"}}>
              <div style={{fontSize:9,color:"#6b7280"}}>{l}</div>
              <div style={{fontSize:10,fontWeight:600,color:color,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
      ) : <div style={{fontSize:10,color:"#4b5563"}}>Select a Citadel lock duration to see your fortress strength.</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   NETWORK STATUS CARD
══════════════════════════════════════════════════════════════════════════ */
function NetworkStatusCard({np}) {
  if (!np) return null;
  const metrics = [
    {label:"Liquidity Needed",  val:np.id==="liquidity"?"High":"Medium",  color:np.id==="liquidity"?"#ef4444":"#facc15"},
    {label:"Validator Health",  val:np.id==="validators"?"Weak":"Strong", color:np.id==="validators"?"#ef4444":"#4ade80"},
    {label:"Citadel Locks",     val:np.id==="citadel"?"Low":"Medium",     color:np.id==="citadel"?"#ef4444":"#facc15"},
    {label:"Ecosystem Stability",val:"Stable",                            color:"#4ade80"},
  ];
  return (
    <div style={{background:"#0f0f14",border:`1px solid ${np.color}30`,borderRadius:11,padding:"11px 13px"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
        <span style={{fontSize:14}}>{np.icon}</span>
        <div style={{fontSize:11,fontWeight:700,color:np.color}}>{np.label}</div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,fontSize:9,padding:"2px 8px",background:np.color+"1e",color:np.color,borderRadius:99,fontWeight:700}}><Dot color={np.color}/>Live</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        {metrics.map(m=>(
          <div key={m.label} style={{background:"#1a1a24",borderRadius:7,padding:"6px 9px",border:`1px solid ${m.color}15`}}>
            <div style={{fontSize:9,color:"#6b7280"}}>{m.label}</div>
            <div style={{fontSize:11,fontWeight:700,color:m.color,marginTop:2}}>{m.val}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.5}}>{np.why}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EXPLORE TAB  (Forecast · Templates · Missions · Events · Portfolio · Reputation)
══════════════════════════════════════════════════════════════════════════ */
function ExploreTab({state, dispatch, addToast, np, onReFlow, onGoToFlow}) {
  const [section, setSection] = useState("forecast");
  const sections = [
    {id:"forecast",   label:"Forecast",   icon:"📈"},
    {id:"heatmap",    label:"Heatmap",    icon:"🌡"},
    {id:"templates",  label:"Templates",  icon:"🎯"},
    {id:"missions",   label:"Missions",   icon:"🏅"},
    {id:"events",     label:"Events",     icon:"⚡"},
    {id:"portfolio",  label:"Portfolio",  icon:"💼"},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,padding:"12px 12px 24px"}}>
      {/* Network Status */}
      <NetworkStatusCard np={np}/>

      {/* Section nav */}
      <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)} style={{flex:"none",padding:"7px 12px",background:section===s.id?"#facc15":"#161620",color:section===s.id?"#000":"#9ca3af",border:`1px solid ${section===s.id?"#facc15":"#232330"}`,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,display:"flex",alignItems:"center",gap:5,transition:"all .15s"}}>
            <span style={{fontSize:11}}>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {section==="forecast" && (
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Flow Forecast</div>
          <FlowForecast state={state} np={np}/>
        </div>
      )}

      {section==="heatmap" && (
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Ecosystem Heatmap</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Live health signals across LemonChain systems. Boosted actions shown per metric.</div>
          <EcosystemHeatmap np={np}/>
        </div>
      )}

      {section==="templates" && (
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Strategy Templates</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Tap a template to preview it. You can customize everything after applying.</div>
          <StrategyTemplates state={state} dispatch={dispatch} addToast={addToast} onGoToFlow={onGoToFlow}/>
        </div>
      )}

      {section==="missions" && (
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Ecosystem Missions</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Complete missions to earn bonus score. Missions update as you participate.</div>
          <MissionsPanel state={state} dispatch={dispatch} addToast={addToast}/>
        </div>
      )}

      {section==="events" && (
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Seasonal Events</div>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Active LemonChain events with time-limited score boosts and badge rewards.</div>
          <SeasonalEventsPanel state={state} dispatch={dispatch} addToast={addToast} np={np}/>
        </div>
      )}

      {section==="portfolio" && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:700}}>Portfolio Overview</div>
          <ReputationCard state={state}/>
          <PortfolioCard state={state} np={np}/>
          <div style={{padding:"9px 12px",background:"#a78bfa08",border:"1px solid #a78bfa20",borderRadius:9}}>
            <div style={{fontSize:11,fontWeight:600,color:"#a78bfa",marginBottom:4}}>Auto Re-Flow</div>
            <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.5,marginBottom:8}}>Automatically suggest how to redistribute unlocked rewards. LemonFlow always asks before moving anything.</div>
            <button onClick={onReFlow} style={{padding:"8px 14px",background:"#a78bfa18",border:"1px solid #a78bfa35",borderRadius:8,cursor:"pointer",color:"#a78bfa",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11}}>Open Re-Flow →</button>
          </div>
          <CitadelVisualizer citLock={state.citLock}/>
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════
   WHY THIS MATTERS EXPLAINER
══════════════════════════════════════════════════════════════════════════ */
function WhyMatters({id, color="#9ca3af"}) {
  const [open, setOpen] = useState(false);
  const text = WHY_MATTERS[id];
  if (!text) return null;
  return (
    <div style={{marginTop:5}}>
      <button onClick={()=>setOpen(o=>!o)} style={{fontSize:10,color,background:color+"10",border:`1px solid ${color}25`,borderRadius:6,padding:"3px 9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>
        {open?"▲":"▼"} Why this matters
      </button>
      {open && (
        <div className="fu" style={{marginTop:5,padding:"8px 11px",background:color+"08",border:`1px solid ${color}18`,borderRadius:8,fontSize:10,color:"#9ca3af",lineHeight:1.6}}>
          {text}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ECOSYSTEM ALERT BANNER
══════════════════════════════════════════════════════════════════════════ */
function EcosystemAlertBanner({np, dismissedId, onDismiss}) {
  const alert = ECOSYSTEM_ALERTS.find(a => a.npId === np?.id) || null;
  if (!alert || alert.id === dismissedId) return null;

  return (
    <div style={{
      background: alert.bg,
      border: `1px solid ${alert.borderColor}40`,
      borderLeft: `3px solid ${alert.borderColor}`,
      padding: "9px 13px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Scanline shimmer */}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${alert.borderColor}06,transparent)`,pointerEvents:"none"}} className="shimmer"/>

      <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
        <span style={{fontSize:15,flexShrink:0,marginTop:1}}>{alert.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontWeight:700,color:alert.borderColor}}>{alert.title}</span>
            <span style={{fontSize:8,padding:"1px 6px",background:alert.level==="critical"?"#ef444420":"#f9730018",color:alert.level==="critical"?"#ef4444":"#f97316",borderRadius:99,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{alert.level}</span>
          </div>
          <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.5,marginBottom:5}}>{alert.body}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <Dot color={alert.boostColor}/>
            <span style={{fontSize:10,fontWeight:600,color:alert.boostColor}}>{alert.boostedAction}</span>
          </div>
        </div>
        <button onClick={onDismiss} style={{flexShrink:0,background:"none",border:"none",cursor:"pointer",color:"#4b5563",fontSize:13,lineHeight:1,padding:"0 2px"}}>✕</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ECOSYSTEM HEATMAP
══════════════════════════════════════════════════════════════════════════ */
function EcosystemHeatmap({np}) {
  const trendIcon = t => t==="up"?"↑":t==="down"?"↓":"→";
  const trendColor = t => t==="up"?"#4ade80":t==="down"?"#ef4444":"#facc15";

  // Overlay current np urgency onto the matching metric
  const metrics = HEATMAP_METRICS.map(m => ({
    ...m,
    val:   m.id === np?.id ? Math.max(10, m.val - 18) : m.val,
    trend: m.id === np?.id ? "down" : m.trend,
    status:m.id === np?.id ? (m.val < 60 ? "Critical Need" : "Watch") : m.status,
    statusColor: m.id === np?.id ? "#ef4444" : m.statusColor,
  }));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {metrics.map(m => (
        <div key={m.id} style={{background:"#161620",border:`1px solid ${m.color}22`,borderRadius:10,padding:"10px 12px",transition:"border-color .3s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <span style={{fontSize:11,fontWeight:600,color:"#f0f0f2"}}>{m.label}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:700,color:trendColor(m.trend)}}>{trendIcon(m.trend)}</span>
              <span style={{fontSize:10,padding:"2px 7px",background:m.statusColor+"18",color:m.statusColor,borderRadius:99,fontWeight:700}}>{m.status}</span>
            </div>
          </div>
          {/* Bar */}
          <div style={{height:5,background:"#1e1e28",borderRadius:3,overflow:"hidden",marginBottom:7}}>
            <div style={{height:"100%",width:`${m.val}%`,background:m.color,borderRadius:3,transition:"width .7s ease",boxShadow:m.val<50?`0 0 8px ${m.color}60`:"none"}}/>
          </div>
          {/* Boosted action */}
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <Dot color={m.color}/>
            <span style={{fontSize:9,color:"#6b7280"}}>Boosted: </span>
            <span style={{fontSize:9,fontWeight:600,color:m.color}}>{m.boostAction}</span>
          </div>
          {/* Why this matters inline */}
          <WhyMatters id={m.id === "flow_growth" ? "score" : m.id === "donation" ? "donation" : m.id} color={m.color}/>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ENHANCED REPUTATION CARD (replaces old ReputationCard)
══════════════════════════════════════════════════════════════════════════ */
function ReputationCard({state}) {
  const identity  = REPUTATION_TYPES.find(r => r.check(state)) || REPUTATION_TYPES[4];
  const traits    = REPUTATION_TYPES.filter(r => r.check(state));
  const {split, activeFlows, lemonScore, flowHistory, strategy} = state;
  const citTier   = CIT_TIERS.find(t => t.months === state.citLock);
  const stratDef  = Object.values(STRATEGIES).find(s => s.key === strategy);
  const favStrat  = stratDef?.label || TEMPLATES.find(t => t.id === strategy)?.label || "Balanced";

  // Contribution breakdown — percentages weighted by what user has actually set
  const liqPct  = split[0] || 0;
  const valPct  = split[1] || 0;
  const citPct  = split[2] || 0;
  const donated = state.totalDonated || 0;
  const flowCt  = activeFlows?.length || 0;

  return (
    <div style={{background:"linear-gradient(145deg,#0f0f14,#1a1a24)",border:`2px solid ${identity.color}35`,borderRadius:14,padding:"16px 14px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${identity.color},transparent)`}} className="shimmer"/>

      <div style={{fontSize:10,color:"#6b7280",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Your LemonFlow Identity</div>

      {/* Primary identity */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:32,filter:`drop-shadow(0 0 12px ${identity.color}90)`}}>{identity.icon}</span>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:identity.color}}>{identity.label}</div>
          <div style={{fontSize:10,color:"#6b7280",marginTop:2,lineHeight:1.4}}>{identity.desc}</div>
        </div>
      </div>

      {/* Contribution breakdown */}
      <div style={{background:"#1a1a24",borderRadius:9,padding:"9px 11px",marginBottom:10,border:"1px solid #232330"}}>
        <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Contribution Breakdown</div>
        {[
          ["💧 Liquidity Routing",  liqPct+"%",   "#60a5fa"],
          ["🔒 Validator Stake",    valPct+"%",   "#4ade80"],
          ["🏰 Citadel Commitment", citPct+"%",   "#f59e0b"],
          ["🎁 Ecosystem Donated",  f2(donated)+" LEMX","#a78bfa"],
          ["⚡ Active Flows",       flowCt+" flow"+(flowCt!==1?"s":""),"#facc15"],
        ].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #1e1e28"}}>
            <span style={{fontSize:10,color:"#6b7280"}}>{l}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:600,color:c}}>{v}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",marginTop:3}}>
          <span style={{fontSize:10,color:"#6b7280"}}>🎯 Favorite Strategy</span>
          <span style={{fontSize:10,fontWeight:600,color:identity.color}}>{favStrat}</span>
        </div>
      </div>

      {/* Earned trait badges */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {traits.slice(0,4).map(t => <Bdg key={t.id} color={t.color}>{t.icon} {t.label}</Bdg>)}
        {traits.length === 0 && <span style={{fontSize:10,color:"#4b5563"}}>Activate a flow to build your identity.</span>}
      </div>

      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${identity.color}50,transparent)`}}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════════════════ */
export default function LemonFlow() {
  const initCfg = buildStrategyConfig("balanced");
  const initialState = {
    amount: 50,
    strategy: "balanced",
    ...initCfg,
    riskChecked: false,
    mode: "simple",
    flowActive: false,
    lemonScore: 418,  // Architect tier in new unlimited scale
    isValidator: false,
    valOwner: false,
    poolPreset: "split2",
    flowHistory: [],
    activeFlows: [],          // snapshot of each activated flow
    donationPool: 22,         // current demo pool total (realistic range: 15-30 LEMX)
    totalDonated: 0,          // user's total donations this session
    weeklyScore: 72,          // points gained this week
    allTimeScore: 418,        // all-time total (starts equal to lemonScore)
    // Badge tracking
    unlockedBadges: ["early"],
    badgeTriggerCount: 0, // increments only on badge-earning actions
    flowCount: 0,
    smartApplied: false,
    riskCheckedCount: 0,
    donationPointsThisSeason: 0,
    autoReFlow: "off",
    onboardingDone: false, // first-flow guided tour
    alertDismissed: null,  // id of dismissed ecosystem alert
  };

  const [appState, appDispatch] = useReducer(appReducer, initialState);

  const [tab, setTab] = useState("flow");
  const [toast, setToast] = useState(null);
  const [showActivate, setShowActivate] = useState(false);
  const [showReFlow, setShowReFlow] = useState(false);
  const [npIdx, setNpIdx] = useState(0);
  const [celebrationBadge, setCelebrationBadge] = useState(null); // badge object to celebrate

  const np = NET_PRIORITIES[npIdx];

  // Keep _lastNpId in state so reducer can apply correct boost when activating flows
  useEffect(() => {
    appDispatch({type:"SET", payload:{_lastNpId: NET_PRIORITIES[npIdx]?.id || "balanced"}});
  }, [npIdx]);


  // Detect newly unlocked badges after every state change
  // Badge detection: only fires on intentional actions, never on page load or tab switch.
  // badgeTriggerCount increments in the reducer ONLY after real badge-earning actions.
  // shownBadgeIds is a local set — once shown, never auto-shown again this session.
  const shownBadgeIds = useRef(new Set(["early"])); // early is always auto-unlocked, never show popup
  useEffect(() => {
    if (!appState.badgeTriggerCount) return; // skip on initial render (count = 0 or undefined)
    const stateUnlocked = new Set(appState.unlockedBadges || ["early"]);
    const nowEarned = getUnlockedIds(appState);
    // Find badges that are newly earned AND not yet shown as popup this session
    const toShow = nowEarned.filter(id => !shownBadgeIds.current.has(id));
    if (toShow.length > 0) {
      const id = toShow[0];
      const badge = ACHIEVEMENTS.find(a => a.id === id);
      if (badge) {
        shownBadgeIds.current.add(id);
        // Persist to state so it won't re-trigger across sessions
        toShow.forEach(bid => appDispatch({type:"UNLOCK_BADGE", id:bid}));
        setCelebrationBadge(badge);
      }
    }
  // Only re-run when a real badge-earning action fired
  }, [appState.badgeTriggerCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bulletproof scroll-to-top on tab change
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollToTop();
    const id = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(id);
  }, [tab]);

  const addToast = useCallback(msg => setToast(msg), []);
  const tier = getTier(appState.lemonScore);
  const nb = np ? np.sb.reduce((s,x) => s + x.v, 0) : 0;
  const finalScore = appState.lemonScore + Math.round(nb * 0.3);

  function handleActivate() {
    if (!appState.riskChecked) return;
    setShowActivate(true);
  }

  function onActivateDone() {
    setShowActivate(false);
    appDispatch({type:"ACTIVATE_FLOW"});
    addToast("Flow activated. No real tokens moved in demo mode.");
  }

  const TABS = [
    {id:"flow",       label:"Flow",       icon:"⚡"},
    {id:"hexdex",     label:"HEXDEX",     icon:"💧"},
    {id:"validators", label:"Validators", icon:"🔒"},
    {id:"rewards",    label:"Rewards",    icon:"🎁"},
    {id:"explore",    label:"Explore",    icon:"🗺️"},
    {id:"smart",      label:"Smart Mode", icon:"🤖"},
    {id:"score",      label:"Score",      icon:"🏆"},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"#0c0c0f",paddingBottom:"calc(80px + env(safe-area-inset-bottom, 0px))",maxWidth:480,margin:"0 auto"}}>
        {/* HEADER */}
        <div style={{background:"rgba(12,12,15,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1e1e28",position:"sticky",top:0,zIndex:50,padding:"11px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,background:"#facc1520",borderRadius:9,border:"1px solid #facc1530",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🍋</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"#facc15",letterSpacing:"-0.02em",lineHeight:1}}>LemonFlow</div>
                <div style={{fontSize:9,color:"#6b7280",letterSpacing:".08em",textTransform:"uppercase",marginTop:1}}>Simple on the surface. Powerful underneath.</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div onClick={() => setTab("score")} style={{cursor:"pointer",background:"#1a1a24",border:`1px solid ${tier.color}35`,borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:tier.color}}/>
                <span style={{fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace",color:tier.color}}>{finalScore}</span>
                <span style={{fontSize:9,color:"#6b7280"}}>{tier.label}</span>
              </div>
              <div style={{background:"#4ade8020",border:"1px solid #4ade8040",borderRadius:6,padding:"4px 8px",display:"flex",alignItems:"center",gap:4}}>
                <Dot color="#4ade80"/>
                <span style={{fontSize:9,fontWeight:700,color:"#4ade80",letterSpacing:".1em"}}>LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* ECOSYSTEM ALERT BANNER */}
        <EcosystemAlertBanner np={np} dismissedId={appState.alertDismissed} onDismiss={()=>appDispatch({type:"SET",payload:{alertDismissed:ECOSYSTEM_ALERTS.find(a=>a.npId===np?.id)?.id||null}})}/>

        {/* NETWORK BOOST BANNER */}
        {np && (
          <div onClick={() => setNpIdx(i => (i+1) % NET_PRIORITIES.length)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:np.color+"10",borderBottom:`1px solid ${np.color}25`,cursor:"pointer"}}>
            <span style={{fontSize:13}}>{np.icon}</span>
            <div style={{flex:1}}>
              <span style={{fontSize:11,fontWeight:600,color:np.color}}>{np.live} </span>
              <span style={{fontSize:10,color:"#6b7280"}}>LP actions earn a {np.multiplier}x score boost this week. (Demo signal)</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,padding:"2px 8px",background:np.color+"1e",color:np.color,borderRadius:99,fontWeight:700}}><Dot color={np.color}/>Network Boost</div>
          </div>
        )}

        {/* TABS */}
        <div style={{display:"flex",borderBottom:"1px solid #1e1e28",background:"rgba(12,12,15,.97)",position:"sticky",top:54,zIndex:40,overflowX:"auto",scrollbarWidth:"none"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{flex:"none",padding:"11px 13px",background:"none",border:"none",cursor:"pointer",
                color:tab===t.id?"#facc15":"#6b7280",borderBottom:tab===t.id?"2px solid #facc15":"2px solid transparent",
                fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,whiteSpace:"nowrap",
                transition:"color .15s",display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:11}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="fu" key={tab} style={{scrollMarginTop:100}}>
          {tab === "flow"       && <FlowTab       state={appState} dispatch={appDispatch} onActivate={handleActivate} np={np} addToast={addToast}/>}
          {tab === "hexdex"     && <HexdexTab     state={appState} dispatch={appDispatch} addToast={addToast} np={np}/>}
          {tab === "validators" && <ValidatorsTab state={appState} dispatch={appDispatch} addToast={addToast} np={np}/>}
          {tab === "rewards"    && <RewardsTab    state={appState} dispatch={appDispatch} addToast={addToast} onReFlow={()=>setShowReFlow(true)}/>}
          {tab === "explore"    && <ExploreTab    state={appState} dispatch={appDispatch} addToast={addToast} np={np} onReFlow={()=>setShowReFlow(true)} onGoToFlow={()=>setTab("flow")}/>}
          {tab === "smart"      && <SmartModeTab  state={appState} dispatch={appDispatch} addToast={addToast} np={np}/>}
          {tab === "score"      && <ScoreTab      state={appState} dispatch={appDispatch} np={np} addToast={addToast}/>}
        </div>
      </div>

      {/* ACTIVATE MODAL */}
      {showActivate && <ActivateModal onDone={onActivateDone} amount={appState.amount} split={appState.split} strategy={appState.strategy}/>}

      {showReFlow && <AutoReFlowModal state={appState} dispatch={appDispatch} onClose={()=>setShowReFlow(false)} addToast={addToast}/>}

      {celebrationBadge && (
        <BadgeCelebration
          badge={celebrationBadge}
          state={appState}
          np={np}
          onClose={() => setCelebrationBadge(null)}
          onViewAll={() => { setCelebrationBadge(null); setTab("score"); }}
          addToast={addToast}
        />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)}/>}
    </>
  );
}
