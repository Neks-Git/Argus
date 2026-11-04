module.exports = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Argus</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{
  --gap: 14px; --r: 22px; --blur: 10px;
  --tile: rgba(8, 8, 12, 0.7); --tile-hi: rgba(255, 255, 255, 0.06);
  --line: rgba(255, 255, 255, 0.09); --line-2: rgba(255, 255, 255, 0.16);
  --surface: rgba(255, 255, 255, 0.06); --surface-hi: rgba(255, 255, 255, 0.11);
  --txt: rgba(255, 255, 255, 0.94); --txt-2: rgba(255, 255, 255, 0.8);
  --mut: rgba(255, 255, 255, 0.58);
}
*{ box-sizing: border-box; margin: 0; padding: 0; }
[hidden]{ display: none !important; }
html, body{
  height: 100%; background: transparent; color: var(--txt);
  font: 13px -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; overflow: hidden; user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
button{ font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
input{ font: inherit; color: inherit; }
input::placeholder{ color: var(--mut); }
.mut{ color: var(--mut); }

.shell{ height: 100%; display: grid; grid-template-columns: 64px minmax(0, 1fr) 340px; gap: var(--gap); padding: var(--gap); }
.side{ min-height:0; display:flex; flex-direction:column; gap:var(--gap); overflow-y:auto; overflow-x:hidden; scrollbar-width:none; }
.side::-webkit-scrollbar{ display:none; }
.side > .tile{ flex:none; }
@media (max-width: 1100px){ .shell{ grid-template-columns: 64px minmax(0, 1fr) 280px; } }

.tile{ position: relative; min-height: 0; background: linear-gradient(180deg, var(--tile-hi) 0%, rgba(255,255,255,0) 32%), var(--tile); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; contain: layout paint; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 12px 30px rgba(0, 0, 0, 0.22); }
.side .tile, .dock{ backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur)); }
body.no-blur .side .tile, body.no-blur .dock{ backdrop-filter: none; -webkit-backdrop-filter: none; }

.dock{ display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 0; }
.logo{ color: var(--txt-2); font-size: 14px; font-weight: 600; letter-spacing: -2px; margin-bottom: 10px; -webkit-app-region: drag; text-align: center; }
.logo img{ width: 30px; height: 30px; object-fit: contain; display: block; margin: 0 auto; pointer-events: none; -webkit-user-drag: none; }
.logo .lfall{ display: none; }
.logo.no-img .lfall{ display: inline; }
.dock-btn{ width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; color: var(--mut); border: 1px solid transparent; transition: background .2s ease, color .2s ease, border-color .2s ease; }
.dock-btn svg{ width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.dock-btn:hover{ color: var(--txt); background: var(--surface); }
.dock-btn.active{ color: var(--txt); background: var(--surface-hi); border-color: var(--line-2); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); }
.spacer{ flex: 1; }
.clock{ color: var(--mut); font-size: 11px; font-variant-numeric: tabular-nums; }
.mini{ width: 30px; height: 26px; border-radius: 8px; color: var(--mut); transition: background .15s ease, color .15s ease; }
.mini:hover{ background: var(--surface-hi); color: var(--txt); }
.mini.danger:hover{ background: rgba(255, 92, 92, 0.28); color: #fff; }
.mini.on{ color: var(--txt); background: var(--surface-hi); }

.main{ display: flex; flex-direction: column; }
.panel{ display: none; flex: 1; min-height: 0; flex-direction: column; }
.panel.active{ display: flex; }

.toolbar{ display: flex; gap: 6px; align-items: center; padding: 10px; flex: none; border-bottom: 1px solid var(--line); position: relative; z-index: 3; }
.toolbar button{ width: 32px; height: 30px; border-radius: 9px; color: var(--mut); font-size: 16px; transition: background .15s ease, color .15s ease; }
.toolbar button:hover{ background: var(--surface-hi); color: var(--txt); }
.toolbar input{ flex: 1; height: 30px; padding: 0 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; outline: none; user-select: text; transition: border-color .2s ease, background .2s ease; }
.toolbar input:focus{ border-color: var(--line-2); background: var(--surface-hi); }
.toolbar .seg{ width: auto; padding: 0 16px; font-size: 12px; border-radius: 9px; }
.toolbar .seg.on{ color: var(--txt); background: var(--surface-hi); border: 1px solid var(--line); }

.wv-host{ flex: 1; position: relative; min-height: 0; margin: 1px; border-radius: 0 0 calc(var(--r) - 1px) calc(var(--r) - 1px); overflow: hidden; }
.wv-host webview{ position: absolute; inset: 0; width: 100%; height: 100%; }
.wv-host webview.off{ visibility: hidden; pointer-events: none; }

.tabs{ display:flex; align-items:center; gap:6px; padding:8px 10px 0; flex:none; position:relative; z-index:3; }
.tabs-list{ display:flex; gap:4px; min-width:0; flex:1; overflow-x:auto; scrollbar-width:none; }
.tabs-list::-webkit-scrollbar{ display:none; }
.tab{ display:flex; align-items:center; gap:8px; flex:0 1 180px; min-width:90px; height:30px; padding:0 6px 0 10px; border-radius:10px; font-size:12px; color:var(--mut); border:1px solid transparent; cursor:pointer; transition:background .15s ease, color .15s ease; }
.tab:hover{ background:var(--surface); color:var(--txt-2); }
.tab.on{ background:var(--surface-hi); border-color:var(--line); color:var(--txt); }
.tab img, .tab .dot{ width:14px; height:14px; flex:none; border-radius:4px; }
.tab .dot{ border-radius:50%; background:var(--line-2); transform:scale(.5); }
.tab span{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tab .x{ width:18px; height:18px; flex:none; border-radius:6px; font-size:13px; line-height:1; color:var(--mut); opacity:0; transition:opacity .15s ease, background .15s ease; }
.tab:hover .x, .tab.on .x{ opacity:1; }
.tab .x:hover{ background:rgba(255,92,92,.28); color:#fff; }
#tab-new{ width:28px; height:28px; flex:none; border-radius:9px; font-size:16px; color:var(--mut); }
#tab-new:hover{ background:var(--surface-hi); color:var(--txt); }

.sp-tile{ padding: 18px; min-height: 200px; display: flex; }
.sp-bg{ position: absolute; inset: -30px; background-size: cover; background-position: center; filter: blur(20px); opacity: .1; z-index: 0; pointer-events: none; }
.sp-now{ position: relative; width: 100%; display: flex; flex-direction: column; gap: 14px; z-index: 3; }
.sp-top{ display: flex; gap: 14px; align-items: center; min-width: 0; }
.sp-top img{ width: 60px; height: 60px; flex: none; border-radius: 12px; object-fit: cover; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); }
.sp-text{ min-width: 0; }
.sp-title{ font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.sp-artist{ font-size: 12px; color: var(--mut); margin-top: 4px; }
.sp-title, .sp-artist{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-ctl{ display: flex; justify-content: center; align-items: center; gap: 12px; }
.ctl{ width: 36px; height: 36px; border-radius: 50%; font-size: 15px; color: var(--txt-2); transition: background .15s ease, color .15s ease; }
.ctl:hover{ background: var(--surface-hi); color: var(--txt); }
.ctl.big{ width: 48px; height: 48px; font-size: 18px; color: #0a0a0a; background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 4px 20px rgba(255, 255, 255, 0.14); }
.ctl.big:hover{ background: #fff; }
.sp-prog{ display: flex; align-items: center; gap: 10px; font-size: 11px; font-variant-numeric: tabular-nums; }
.sp-bar{ flex: 1; height: 5px; position: relative; background: rgba(255, 255, 255, 0.1); border-radius: 99px; cursor: pointer; transition: background .15s ease; contain: strict; }
.sp-bar:hover{ background: rgba(255, 255, 255, 0.16); }
.sp-fill{ position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); border-radius: 99px; clip-path: inset(0 100% 0 0); transition: clip-path 1s linear; will-change: clip-path; }
.sp-msg{ position: relative; z-index: 3; margin: auto; text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.pill{ padding: 10px 22px; border-radius: 99px; border: 1px solid var(--line-2); color: var(--txt); background: var(--surface); font-size: 12px; font-weight: 500; transition: background .2s ease, border-color .2s ease; }
.pill:hover:not(:disabled){ background: var(--surface-hi); border-color: rgba(255, 255, 255, 0.28); }
.pill:disabled{ opacity: .35; cursor: default; }

.games{ flex: 1; overflow-y: auto; padding: 16px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); align-content: start; position: relative; z-index: 3; grid-auto-rows: max-content; }
.game{ display: flex; flex-direction: column; text-align: left; border-radius: 14px; overflow: hidden; background: var(--surface); border: 1px solid var(--line); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
.game > *{ flex: none; }
.game:hover{ transform: translateY(-2px); border-color: var(--line-2); background: var(--surface-hi); }
.game img{ width: 100%; height: auto; aspect-ratio: 460 / 215; object-fit: cover; display: block; background: var(--surface); }
.game .gn{ padding: 9px 12px 2px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.game .gm{ padding: 0 12px 10px; font-size: 10px; }
.game:not(.inst) img{ opacity: .5; }
.game.inst .gm{ color: var(--txt-2); }
.msg{ color: var(--mut); padding: 24px; grid-column: 1 / -1; }

.st-ctl{ flex:1; min-width:0; display:flex; align-items:center; gap:6px; margin-left:8px; }
.st-ctl input{ min-width:80px; }
.toolbar .flt{ width:auto; padding:0 12px; font-size:12px; border-radius:9px; }
.toolbar .flt.on{ color:var(--txt); background:var(--surface-hi); border:1px solid var(--line); }
.st-count{ font-size:11px; white-space:nowrap; padding:0 6px; }

.rs{ flex:1; min-height:0; display:grid; gap:10px; padding:12px; position:relative; z-index:3;
  grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);
  grid-template-rows:minmax(0,1fr) auto auto minmax(90px,.8fr);
  grid-template-areas:"cpu cpu" "mem proc" "disk proc" "net proc"; }
.rs-box{ min-height:0; min-width:0; overflow:hidden; display:flex; flex-direction:column; gap:8px; padding:10px 12px; background:var(--surface); border:1px solid var(--line); border-radius:14px; font-variant-numeric:tabular-nums; }
.rs-cpu{ grid-area:cpu; } .rs-mem{ grid-area:mem; } .rs-disk{ grid-area:disk; } .rs-net{ grid-area:net; } .rs-proc{ grid-area:proc; }
.rs-t{ display:flex; justify-content:space-between; gap:12px; font-size:11px; color:var(--mut); letter-spacing:.06em; white-space:nowrap; }
.rs-t b{ color:var(--txt); font-weight:600; }
.rs-cpu-body{ flex:1; min-height:0; display:flex; gap:14px; }
.rs-graph{ flex:1; min-width:0; min-height:50px; position:relative; }
.rs-graph canvas{ position:absolute; inset:0; width:100%; height:100%; }
.rs-cores{ width:300px; flex:none; display:grid; grid-template-columns:1fr 1fr; gap:3px 14px; align-content:center; }
.rs-row{ display:grid; grid-template-columns:44px minmax(0,1fr) auto; gap:8px; align-items:center; font-size:11px; padding:2px 0; }
.rs-cores .rs-row{ grid-template-columns:22px minmax(0,1fr) 32px; padding:0; }
.rs-row .l{ color:var(--mut); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rs-row .v{ text-align:right; color:var(--txt-2); }
.rs-bar{ height:6px; border-radius:99px; background:rgba(255,255,255,.08); overflow:hidden; }
.rs-bar i{ display:block; height:100%; border-radius:99px; background:rgba(255,255,255,.75); transform-origin:left; }
.rs-bar.hot i{ background:#fff; box-shadow:0 0 8px rgba(255,255,255,.5); }
.rs-ph, .rs-pr{ display:grid; grid-template-columns:54px minmax(0,1fr) 70px 60px 52px 84px; gap:8px; font-size:11px; padding:2px 0; }
.rs-ph{ color:var(--mut); border-bottom:1px solid var(--line); padding-bottom:6px; }
.rs-ph span:nth-child(n+3), .rs-pr span:nth-child(n+3){ text-align:right; }
.rs-pr span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rs-pr{ align-items:center; border-radius:6px; }
.rs-pr:hover{ background:var(--surface); }
.rs-plist{ flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; }
.rs-k{ display:flex; gap:2px; justify-content:flex-end; opacity:0; transition:opacity .15s ease; }
.rs-pr:hover .rs-k, .rs-k:has(.arm){ opacity:1; }
.rs-k button{ padding:1px 7px; border-radius:6px; font-size:10px; color:var(--mut); }
.rs-k button:hover{ background:var(--surface-hi); color:var(--txt); }
.rs-k button.arm{ background:rgba(255,92,92,.4); color:#fff; }

.hm{ flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); gap:18px; padding:18px; position:relative; z-index:3; }
.hm-main{ display:flex; flex-direction:column; justify-content:center; gap:28px; min-width:0; padding:0 14px; }
.hm-time{ font-size:96px; font-weight:200; letter-spacing:-0.04em; line-height:1; font-variant-numeric:tabular-nums; }
.hm-date{ font-size:14px; margin-top:12px; letter-spacing:.04em; }
.hm-greet{ font-size:15px; color:var(--txt-2); margin-top:4px; }
.hm-search{ height:44px; padding:0 20px; border-radius:99px; font-size:14px; outline:none; user-select:text; background:var(--surface); border:1px solid var(--line); transition:border-color .2s ease, background .2s ease; }
.hm-search:focus{ border-color:var(--line-2); background:var(--surface-hi); }
.hm-tiles{ display:grid; grid-template-columns:repeat(auto-fit,minmax(96px,1fr)); gap:10px; max-height:40vh; overflow-y:auto; }
.hm-tile{ display:flex; flex-direction:column; align-items:center; gap:10px; padding:18px 8px; border-radius:16px; font-size:12px; color:var(--txt-2); background:var(--surface); border:1px solid var(--line); transition:transform .2s ease, background .2s ease, border-color .2s ease, color .2s ease; }
.hm-tile svg{ width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.hm-tile img{ width:24px; height:24px; object-fit:contain; }
.hm-tile span{ max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hm-tile:hover{ transform:translateY(-2px); background:var(--surface-hi); border-color:var(--line-2); color:var(--txt); }
.hm-tile.add{ border-style:dashed; color:var(--mut); justify-content:center; }
.hm-side{ display:flex; flex-direction:column; gap:12px; min-width:0; min-height:0; }
.hm-card{ display:flex; flex-direction:column; gap:12px; min-width:0; min-height:0; padding:14px 16px; background:var(--surface); border:1px solid var(--line); border-radius:16px; }
.hm-card.grow{ flex:1; }
.hm-t{ font-size:11px; color:var(--mut); letter-spacing:.06em; }
.hm-np{ display:flex; align-items:center; gap:12px; min-width:0; }
.hm-np img{ width:48px; height:48px; flex:none; border-radius:10px; object-fit:cover; border:1px solid var(--line); }
.hm-npt{ flex:1; min-width:0; }
.hm-title, .hm-artist{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hm-title{ font-size:13px; font-weight:600; }
.hm-artist{ font-size:11px; margin-top:3px; }
.hm-ctl{ display:flex; flex:none; }
.hm-ctl button{ width:30px; height:30px; border-radius:50%; font-size:13px; color:var(--txt-2); transition:background .15s ease, color .15s ease; }
.hm-ctl button:hover{ background:var(--surface-hi); color:var(--txt); }
.hm-row{ display:grid; grid-template-columns:36px minmax(0,1fr) 38px; gap:10px; align-items:center; font-size:11px; }
.hm-row span:last-child{ text-align:right; color:var(--txt-2); font-variant-numeric:tabular-nums; }
.hm-bar{ height:6px; border-radius:99px; background:rgba(255,255,255,.08); overflow:hidden; }
.hm-bar i{ display:block; height:100%; border-radius:99px; background:rgba(255,255,255,.75); transform-origin:left; }
.hm-bar.hot i{ background:#fff; box-shadow:0 0 8px rgba(255,255,255,.5); }
.hm-games{ flex:1; min-height:0; display:grid; grid-template-columns:repeat(3,1fr); gap:8px; align-content:start; overflow:hidden; }
.hm-game{ border-radius:10px; overflow:hidden; border:1px solid var(--line); transition:transform .2s ease, border-color .2s ease; }
.hm-game:hover{ transform:translateY(-2px); border-color:var(--line-2); }
.hm-game img{ width:100%; aspect-ratio:460 / 215; object-fit:cover; display:block; }
@media (max-width: 1100px){ .hm-time{ font-size:72px; } }

.spt{ flex:1; min-height:0; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; }
.spt-bg{ position:absolute; inset:0; z-index:0; opacity:.8;
  --c1:#3a3a4a; --c2:#2a2a36; --c3:#44444f; --c4:#2e2e3a;
  background:
    radial-gradient(60% 70% at 12% 18%, var(--c1), transparent 70%),
    radial-gradient(55% 65% at 88% 28%, var(--c2), transparent 70%),
    radial-gradient(60% 60% at 75% 92%, var(--c3), transparent 70%),
    radial-gradient(55% 60% at 18% 88%, var(--c4), transparent 70%); }
.spt-bg::after{ content:''; position:absolute; inset:0; background:rgba(0,0,0,.28); }
.spt-vis{ order:2; position:relative; z-index:1; flex:none; width:100%; height:22%; min-height:90px; max-height:170px; pointer-events:none; }
.spt-body{ order:1; flex:1; min-height:0; justify-content:center; padding-bottom:0; position:relative; z-index:3; display:flex; flex-direction:column; align-items:center; gap:10px; width:min(86%, 380px); }
.spt-art{ width:clamp(120px, 30vh, 300px); aspect-ratio:1; object-fit:cover; border-radius:14px; background:var(--surface); border:1px solid var(--line-2); box-shadow:0 20px 60px rgba(0,0,0,.5); }
.spt-msg{ order:1; flex:1; position:relative; z-index:3; display:flex; align-items:center; }
.spt-prog{ width:100%; display:flex; align-items:center; gap:10px; margin-top:10px; font-size:11px; font-variant-numeric:tabular-nums; }
.spt-bar{ flex:1; height:5px; position:relative; border-radius:99px; background:rgba(255,255,255,.14); cursor:pointer; contain:strict; }
.spt-bar:hover{ background:rgba(255,255,255,.22); }
.spt-fill{ position:absolute; inset:0; border-radius:99px; background:rgba(255,255,255,.92); clip-path:inset(0 100% 0 0); transition:clip-path 1s linear; will-change:clip-path; }
.spt-title{ font-size:20px; font-weight:600; letter-spacing:-0.01em; max-width:100%; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:4px; }
.spt-artist{ font-size:13px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.spt-ctl{ display:flex; align-items:center; gap:14px; margin-top:6px; }
.spt-ctl button{ width:40px; height:40px; border-radius:50%; font-size:16px; color:var(--txt-2); transition:background .15s ease, color .15s ease; }
.spt-ctl button:hover{ background:var(--surface-hi); color:var(--txt); }
.spt-ctl button.big{ width:54px; height:54px; font-size:20px; color:#0a0a0a; background:rgba(255,255,255,.92); }
.spt-ctl button.big:hover{ background:#fff; color:#0a0a0a; }

#spt-pltoggle{ position:absolute; z-index:5; top:14px; right:14px; width:32px; height:30px; border-radius:9px; color:var(--mut); background:rgba(8,8,12,.5); border:1px solid var(--line); }
#spt-pltoggle:hover{ color:var(--txt); background:var(--surface-hi); }
.spt.pl-hidden .spt-pl{ display:none; }
@media (max-width: 1100px){ #spt-pltoggle{ display:none; } }

.spt-pl{ position:absolute; z-index:4; left:14px; top:14px; bottom:14px; width:240px; display:flex; flex-direction:column; gap:8px; padding:12px 8px 8px; border-radius:16px; background:rgba(8,8,12,.6); border:1px solid var(--line); }
.spt-plh{ display:flex; justify-content:space-between; align-items:center; padding:0 6px; font-size:11px; color:var(--mut); letter-spacing:.06em; }
.spt-plh button{ width:24px; height:24px; border-radius:7px; color:var(--mut); }
.spt-plh button:hover{ background:var(--surface-hi); color:var(--txt); }
.spt-pll{ flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:2px; }
.pl{ display:flex; align-items:center; gap:10px; width:100%; padding:6px; border-radius:10px; text-align:left; border:1px solid transparent; transition:background .15s ease, border-color .15s ease; }
.pl:hover{ background:var(--surface-hi); }
.pl.on{ background:var(--surface-hi); border-color:var(--line-2); }
.pl img, .pl .ph{ width:36px; height:36px; flex:none; border-radius:7px; object-fit:cover; background:var(--surface); }
.pl .pn{ flex:1; min-width:0; }
.pl b{ display:block; font-size:12px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pl small{ font-size:10px; color:var(--mut); }
@media (max-width: 1100px){ .spt-pl{ display:none; } }

.vi{ width:16px; height:16px; flex:none; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.vol{ display:flex; align-items:center; gap:10px; color:var(--mut); }
.spt-body .vol{ width:70%; margin-top:6px; }
.vol input, input.rng{ -webkit-appearance:none; appearance:none; flex:1; height:5px; border-radius:99px; outline:none; cursor:pointer; background:linear-gradient(90deg, rgba(255,255,255,.9) var(--v,50%), rgba(255,255,255,.14) var(--v,50%)); }
input.rng{ width:100%; flex:none; }
.vol input::-webkit-slider-thumb, input.rng::-webkit-slider-thumb{ -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#fff; box-shadow:0 0 8px rgba(255,255,255,.5); }

.ck-time{ font-size:40px; font-weight:200; letter-spacing:-0.03em; line-height:1; font-variant-numeric:tabular-nums; }
.ck-side{ display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
.ck-sec{ font-size:16px; color:var(--txt-2); font-variant-numeric:tabular-nums; }
.ck-date{ font-size:11px; }

.wx-tile{ display:flex; flex-direction:column; gap:12px; padding:16px 18px; position:relative; z-index:3; }
.wx-top{ display:flex; align-items:center; gap:14px; }
.wx-ico svg{ width:40px; height:40px; fill:none; stroke:var(--txt); stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round; filter:drop-shadow(0 0 8px rgba(255,255,255,.25)); }
.wx-temp{ font-size:32px; font-weight:200; letter-spacing:-0.03em; line-height:1; }
.wx-desc{ font-size:12px; margin-top:4px; }
.wx-meta{ margin-left:auto; text-align:right; font-size:11px; line-height:1.6; }
.wx-days{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.wx-day{ display:flex; flex-direction:column; align-items:center; gap:5px; padding:8px 4px; border-radius:12px; font-size:11px; background:var(--surface); border:1px solid var(--line); }
.wx-day svg{ width:20px; height:20px; fill:none; stroke:var(--txt-2); stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.wx-place{ font-size:11px; letter-spacing:.06em; }

.set{ flex:1; min-height:0; overflow-y:auto; padding:20px; display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:14px; align-content:start; position:relative; z-index:3; max-width:600px; }
.set-card{ display:flex; flex-direction:column; gap:12px; padding:18px; background:var(--surface); border:1px solid var(--line); border-radius:16px; }
.set-t{ font-size:11px; color:var(--mut); letter-spacing:.06em; }
.set-l{ display:flex; justify-content:space-between; font-size:12px; color:var(--txt-2); }
.set-note{ font-size:11px; min-height:14px; }
.set-line{ display:flex; align-items:center; gap:10px; }
.set-line input[type=text]{ flex:1; height:34px; padding:0 14px; border-radius:10px; outline:none; user-select:text; background:var(--surface); border:1px solid var(--line); transition:border-color .2s ease, background .2s ease; }
.set-line input[type=text]:focus{ border-color:var(--line-2); background:var(--surface-hi); }
.set-seg{ display:flex; gap:6px; }
.set-seg button{ padding:7px 16px; border-radius:9px; font-size:12px; color:var(--mut); border:1px solid transparent; transition:background .15s ease, color .15s ease; }
.set-seg button:hover{ background:var(--surface-hi); color:var(--txt); }
.set-seg button.on{ color:var(--txt); background:var(--surface-hi); border-color:var(--line-2); }
.set-copy{ grid-column:1 / -1; padding:10px 6px 0; font-size:11px; color:var(--mut); line-height:1.7; text-align:center; letter-spacing:.02em; }
.set-copy a{ color:var(--mut); text-decoration:none; border-bottom:1px dashed var(--line-2); }
.set-copy a:hover{ color:var(--txt-2); }

.toolbar .fseg{ width:auto; padding:0 14px; font-size:12px; border-radius:9px; }
.toolbar .fseg.on{ color:var(--txt); background:var(--surface-hi); border:1px solid var(--line); }
.toolbar .fseg.arm{ color:#fff; background:rgba(255,92,92,.4); border:1px solid transparent; }
.fm-body{ flex:1; min-height:0; position:relative; z-index:3; display:flex; flex-direction:column; }
.fm-start{ flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; align-content:start; }
.fm-h{ font-size:11px; color:var(--mut); letter-spacing:.06em; }
.fm-drives, .fm-places{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; }
.fm-drive, .fm-place{ display:flex; flex-direction:column; gap:8px; padding:14px 16px; text-align:left; border-radius:14px; background:var(--surface); border:1px solid var(--line); transition:transform .2s ease, background .2s ease, border-color .2s ease; }
.fm-place{ padding:10px 14px; font-size:12px; }
.fm-drive:hover, .fm-place:hover{ transform:translateY(-2px); background:var(--surface-hi); border-color:var(--line-2); }
.fm-drive b{ font-size:14px; }
.fm-drive span{ font-size:11px; }
.fm-bar{ height:6px; border-radius:99px; background:rgba(255,255,255,.08); overflow:hidden; }
.fm-bar i{ display:block; height:100%; border-radius:99px; background:rgba(255,255,255,.75); transform-origin:left; }
.fm-prog{ margin:auto; display:flex; flex-direction:column; align-items:center; gap:12px; max-width:80%; text-align:center; }
#fm-pt{ font-size:22px; font-weight:200; font-variant-numeric:tabular-nums; }
#fm-pc{ font-size:11px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.fm-view{ flex:1; min-height:0; display:flex; flex-direction:column; }
.fm-sum{ display:flex; gap:12px; flex-wrap:wrap; align-items:baseline; padding:12px 18px; font-size:12px; color:var(--txt-2); border-bottom:1px solid var(--line); }
.fm-sum b{ font-size:15px; color:var(--txt); }
.fm-head, .fm-r{ display:grid; grid-template-columns:minmax(0,1fr) 150px 80px 70px 118px; gap:12px; align-items:center; padding:0 18px; }
.fm-head{ padding-top:8px; padding-bottom:8px; font-size:11px; color:var(--mut); letter-spacing:.06em; }
.fm-head span:nth-child(3), .fm-head span:nth-child(4), .fm-r > .v{ text-align:right; }
.fm-list{ flex:1; min-height:0; overflow-y:auto; padding-bottom:8px; }
.fm-r{ height:28px; font-size:12px; border-radius:8px; margin:0 8px; padding:0 10px; font-variant-numeric:tabular-nums; }
.fm-r.dir{ cursor:pointer; }
.fm-r:hover{ background:var(--surface); }
.fm-r.sel{ background:var(--surface); }
.fm-r.dim{ color:var(--mut); }
.fm-n{ display:flex; align-items:center; min-width:0; padding-left:calc(var(--d, 0) * 18px); }
.fm-n .car{ width:16px; flex:none; font-size:10px; font-weight:400; color:var(--mut); }
.fm-n span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.fm-n small{ margin-left:10px; flex:none; max-width:45%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--mut); font-size:10px; }
.fm-pct{ display:flex; align-items:center; gap:8px; }
.fm-pct .fm-bar{ flex:1; }
.fm-pct em{ width:34px; font-style:normal; text-align:right; font-size:11px; color:var(--txt-2); }
.fm-a{ display:flex; gap:2px; justify-content:flex-end; opacity:0; transition:opacity .15s ease; }
.fm-r:hover .fm-a, .fm-r:has(.arm) .fm-a{ opacity:1; }
.fm-a button{ padding:2px 7px; border-radius:6px; font-size:10px; color:var(--mut); }
.fm-a button:hover{ background:var(--surface-hi); color:var(--txt); }
.fm-a button.arm{ background:rgba(255,92,92,.4); color:#fff; }

.ctx{ position:fixed; z-index:9999; min-width:210px; padding:6px; border-radius:12px; background:rgba(14,14,20,.94); border:1px solid var(--line-2); box-shadow:0 16px 40px rgba(0,0,0,.5); }
.ctx button{ display:flex; justify-content:space-between; width:100%; padding:7px 12px; border-radius:8px; font-size:12px; text-align:left; color:var(--txt-2); }
.ctx button:hover{ background:var(--surface-hi); color:var(--txt); }
.ctx button.dng:hover, .ctx button.arm{ background:rgba(255,92,92,.4); color:#fff; }
.ctx hr{ border:0; border-top:1px solid var(--line); margin:5px 4px; }
.props{ left:50%; top:50%; transform:translate(-50%,-50%); width:380px; max-width:90vw; padding:16px 18px; z-index:9998; }
.pr-t{ font-size:11px; color:var(--mut); letter-spacing:.06em; margin-bottom:10px; }
.pr-r{ display:grid; grid-template-columns:70px minmax(0,1fr); gap:10px; font-size:12px; padding:3px 0; }
.pr-r span:last-child{ word-break:break-all; user-select:text; }

/* -------- notifications tile -------- */
.cb-h{ display:flex; justify-content:space-between; align-items:center; }
.nt-tile{ display:flex; align-items:center; gap:12px; padding:12px 16px; transition:border-color .2s ease; cursor:pointer; }
.nt-ico svg{ width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; color:var(--mut); }
.nt-txt{ flex:1; min-width:0; }
.nt-t, .nt-b{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nt-t{ font-size:12px; font-weight:600; }
.nt-b{ font-size:11px; margin-top:2px; }
.nt-tile.live{ border-color:var(--line-2); background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.04)), var(--tile); animation:ntin .25s ease; }
.nt-tile.live .nt-ico svg{ color:var(--txt); }
@keyframes ntin{ from{ transform:translateY(-8px); opacity:0; } }

/* -------- sky tile (daylight + clock + aurora) -------- */
.sky-tile{ display:flex; flex-direction:column; gap:8px; padding:16px 18px; }
.sky-bg{ position:absolute; inset:0; opacity:.5; z-index:0; pointer-events:none; }
.sky-tile > *:not(.sky-bg):not(.sky-aur){ position:relative; z-index:3; }
.sky-top{ display:flex; justify-content:space-between; align-items:center; }
.sky-tile .ck-time{ font-size:54px; }
.sky-arc{ width:100%; height:auto; overflow:visible; }
#sky-sun{ filter:drop-shadow(0 0 8px rgba(255,220,130,.8)); }
.sky-row{ display:flex; justify-content:space-between; align-items:baseline; font-size:11px; }
.sky-row b{ font-weight:600; }
.sky-au{ display:flex; align-items:center; gap:10px; font-size:11px; }
.sky-kp{ padding:3px 10px; border-radius:99px; border:1px solid var(--line-2); background:rgba(0,0,0,.25); font-variant-numeric:tabular-nums; }
.sky-kp.go{ color:#8dffc4; border-color:rgba(120,255,190,.5); background:rgba(40,160,110,.3); }
.sky-aur{ position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden; mix-blend-mode:screen; }
.sky-aur i{ position:absolute; width:70%; height:90%; border-radius:50%; filter:blur(24px); opacity:.55; }
.sky-aur i:nth-child(1){ left:-10%; top:-30%; background:radial-gradient(closest-side, rgba(60,255,160,.9), transparent); animation:aur1 9s ease-in-out infinite alternate; }
.sky-aur i:nth-child(2){ right:-15%; top:-20%; background:radial-gradient(closest-side, rgba(150,90,255,.8), transparent); animation:aur2 12s ease-in-out infinite alternate; }
@keyframes aur1{ to{ transform:translate(30%,12%) scale(1.15); } }
@keyframes aur2{ to{ transform:translate(-25%,18%) scale(.9); } }

/* -------- calendar / downloads / clipboard sidebar tiles -------- */
.cal-tile, .dl-tile, .cbt-tile{ display:flex; flex-direction:column; gap:10px; padding:14px 16px; }
.cal-g{ display:grid; grid-template-columns:repeat(7,1fr); gap:2px; text-align:center; font-size:11px; font-variant-numeric:tabular-nums; }
.cal-h{ color:var(--mut); font-size:10px; }
.cal-d{ position:relative; padding:4px 0; border-radius:8px; color:var(--txt-2); }
.cal-d.today{ background:var(--surface-hi); border:1px solid var(--line-2); color:var(--txt); }
.cal-d.has::after{ content:''; position:absolute; left:50%; bottom:1px; width:3px; height:3px; margin-left:-1.5px; border-radius:50%; background:#7ee0a8; }
.cal-ev{ display:grid; grid-template-columns:62px minmax(0,1fr); gap:8px; font-size:12px; }
.cal-ev span:first-child{ color:var(--mut); font-size:11px; }
.cal-ev span:last-child{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dl-i{ display:flex; flex-direction:column; gap:6px; font-size:12px; }
.dl-n{ display:flex; justify-content:space-between; gap:10px; }
.dl-n span:first-child{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dl-m{ font-size:10px; }
.cbt-i{ display:flex; align-items:center; gap:8px; width:100%; padding:6px 10px; border-radius:9px; font-size:12px; text-align:left; background:var(--surface); border:1px solid transparent; transition:background .15s ease, border-color .15s ease; }
.cbt-i:hover{ background:var(--surface-hi); border-color:var(--line-2); }
.cbt-i span{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cbt-i img{ height:22px; width:auto; border-radius:4px; flex:none; }

/* -------- clipboard panel -------- */
.cb-list{ flex:1; min-height:0; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:6px; position:relative; z-index:3; }
.cb-i{ display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:12px; cursor:pointer; background:var(--surface); border:1px solid var(--line); transition:background .15s ease, border-color .15s ease; }
.cb-i:hover{ background:var(--surface-hi); border-color:var(--line-2); }
.cb-i.pin{ border-color:rgba(255,205,90,.45); }
.cb-main{ flex:1; min-width:0; }
.cb-tx{ font-size:12px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; white-space:pre-wrap; word-break:break-word; }
.cb-main img{ max-width:180px; max-height:100px; border-radius:8px; display:block; }
.cb-m{ font-size:10px; margin-top:4px; }
.cb-k{ display:flex; gap:2px; flex:none; opacity:0; transition:opacity .15s ease; }
.cb-i:hover .cb-k{ opacity:1; }
.cb-k button{ padding:2px 8px; border-radius:6px; font-size:10px; color:var(--mut); }
.cb-k button:hover{ background:var(--surface-hi); color:var(--txt); }
.cb-k button.arm{ background:rgba(255,92,92,.4); color:#fff; }

::-webkit-scrollbar{ width: 8px; }
::-webkit-scrollbar-thumb{ background: rgba(255, 255, 255, 0.12); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover{ background: rgba(255, 255, 255, 0.2); }
</style>
</head>
<body>
  <div class="shell">
    <nav class="tile dock">
      <div class="logo">
        <img src="argus-logo.png" alt="" onerror="this.parentElement.classList.add('no-img');this.remove()">
        <span class="lfall">◢◤</span>
      </div>
      <button class="dock-btn active" data-panel="home" title="Home"><svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg></button>
      <button class="dock-btn" data-panel="browser" title="Browser"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg></button>
      <button class="dock-btn" data-panel="discord" title="Discord"><svg viewBox="0 0 24 24"><path d="M4 6.5C4 5.1 5.1 4 6.5 4h11C18.9 4 20 5.1 20 6.5v8c0 1.4-1.1 2.5-2.5 2.5H11l-4 3.5V17h-.5C5.1 17 4 15.9 4 14.5z"/><circle cx="9" cy="10.5" r="1"/><circle cx="15" cy="10.5" r="1"/></svg></button>
      <button class="dock-btn" data-panel="steam" title="Steam"><svg viewBox="0 0 24 24"><path d="M7 8h10c2.8 0 4 2.4 4 5.5S20 18 18.5 18c-1.2 0-1.8-.8-2.5-2h-8c-.7 1.2-1.3 2-2.5 2C4 18 3 16.6 3 13.5S4.2 8 7 8z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".6"/><circle cx="17.5" cy="13.5" r=".6"/></svg></button>
      <button class="dock-btn" data-panel="files" title="Files"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></button>
      <button class="dock-btn" data-panel="spotify" title="Spotify"><svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/></svg></button>
      <button class="dock-btn" data-panel="stats" title="Resources"><svg viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10"/></svg></button>
      <button class="dock-btn" data-panel="clipboard" title="Clipboard"><svg viewBox="0 0 24 24"><rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 15h4"/></svg></button>
      <div class="spacer"></div>
      <button class="dock-btn" data-panel="settings" title="Settings"><svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg></button>
      <div id="clock" class="clock">--:--</div>
      <button id="fill" class="mini" title="Fill screen (Ctrl+Alt+F)">⤢</button>
      <button id="pin" class="mini" title="Always on top">▲</button>
      <button id="close" class="mini danger" title="Close">×</button>
    </nav>

    <main class="tile main">
      <section class="panel active" id="p-home">
        <div class="hm">
          <div class="hm-main">
            <div>
              <div class="hm-time" id="hm-time">--:--</div>
              <div class="hm-date mut" id="hm-date"></div>
              <div class="hm-greet" id="hm-greet"></div>
            </div>
            <input id="hm-search" class="hm-search" type="text" spellcheck="false" placeholder="search or type a url">
            <div class="hm-tiles" id="hm-tiles"></div>
          </div>
          <div class="hm-side">
            <div class="hm-card">
              <div class="hm-t">now playing</div>
              <div class="hm-np">
                <img id="hm-art" alt="" hidden>
                <div class="hm-npt"><div class="hm-title" id="hm-title">nothing playing</div><div class="hm-artist mut" id="hm-artist"></div></div>
                <div class="hm-ctl"><button data-sp="sp-prev">⏮</button><button data-sp="sp-play" id="hm-play">⏵</button><button data-sp="sp-next">⏭</button></div>
              </div>
            </div>
            <div class="hm-card">
              <div class="hm-t">system</div>
              <div id="hm-stats" style="display:flex;flex-direction:column;gap:8px"></div>
            </div>
            <div class="hm-card grow">
              <div class="hm-t">recent games</div>
              <div class="hm-games" id="hm-games"></div>
            </div>
          </div>
        </div>
      </section>
      <section class="panel" id="p-browser">
        <div class="tabs"><div class="tabs-list" id="tabs-list"></div><button id="tab-new" title="New tab">+</button></div>
        <div class="toolbar">
          <button id="b-back" title="Back">‹</button>
          <button id="b-fwd" title="Forward">›</button>
          <button id="b-reload" title="Reload">⟳</button>
          <input id="url" type="text" spellcheck="false" placeholder="search or type a url">
        </div>
        <div class="wv-host" id="h-browser"></div>
      </section>
      <section class="panel" id="p-discord"><div class="wv-host" id="h-discord"></div></section>
      <section class="panel" id="p-steam">
        <div class="toolbar">
          <button class="seg on" data-tab="library">library</button>
          <button class="seg" data-tab="store">store</button>
          <div class="st-ctl" id="st-ctl">
            <input id="st-q" type="text" spellcheck="false" placeholder="search games">
            <button class="flt on" data-f="all">all</button>
            <button class="flt" data-f="installed">installed</button>
            <button class="flt" id="st-sort">recent</button>
            <span class="mut st-count" id="st-count"></span>
            <button id="st-refresh" title="Refresh">⟳</button>
          </div>
        </div>
        <div class="games" id="games"></div>
        <div class="wv-host" id="h-store" hidden></div>
      </section>
      <section class="panel" id="p-files">
        <div class="toolbar">
          <button id="fm-home" title="Drives">⌂</button>
          <input id="fm-path" type="text" spellcheck="false" placeholder="folder path to scan">
          <button id="fm-scan" class="fseg">scan</button>
          <button class="fseg on" data-fv="tree">tree</button>
          <button class="fseg" data-fv="top">largest files</button>
        </div>
        <div class="fm-body">
          <div class="fm-start" id="fm-start"></div>
          <div class="fm-prog" id="fm-prog" hidden>
            <div id="fm-pt">scanning...</div>
            <div class="mut" id="fm-pc"></div>
            <button id="fm-cancel" class="pill">cancel</button>
          </div>
          <div class="fm-view" id="fm-view" hidden>
            <div class="fm-sum" id="fm-sum"></div>
            <div class="fm-head"><span>name</span><span>% of parent</span><span>size</span><span>files</span><span></span></div>
            <div class="fm-list" id="fm-list"></div>
          </div>
        </div>
      </section>
      <section class="panel" id="p-spotify">
        <div class="spt">
          <div class="spt-bg" id="spt-bg"></div>
          <button id="spt-pltoggle" title="Toggle playlists">☰</button>
          <aside class="spt-pl">
            <div class="spt-plh"><span id="spt-plt">playlists</span><button id="spt-plr" title="Refresh">⟳</button></div>
            <div class="spt-pll" id="spt-pll"></div>
          </aside>
          <p class="spt-msg mut" id="spt-msg" hidden></p>
          <div class="spt-body" id="spt-body" hidden>
            <img id="spt-art" class="spt-art" alt="">
            <div class="spt-prog"><span id="spt-t0" class="mut">0:00</span><div class="spt-bar" id="spt-bar"><div class="spt-fill" id="spt-fill"></div></div><span id="spt-t1" class="mut">0:00</span></div>
            <div class="spt-title" id="spt-title">—</div>
            <div class="spt-artist mut" id="spt-artist"></div>
            <div class="spt-ctl">
              <button data-sp="sp-prev">⏮</button>
              <button data-sp="sp-play" id="spt-play" class="big">⏵</button>
              <button data-sp="sp-next">⏭</button>
            </div>
            <div class="vol"><svg class="vi" viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg><input type="range" min="0" max="100" value="50"></div>
          </div>
          <canvas id="cv-vis" class="spt-vis"></canvas>
        </div>
      </section>
      <section class="panel" id="p-stats">
        <div class="rs">
          <div class="rs-box rs-cpu">
            <div class="rs-t" id="rs-cpu-t"></div>
            <div class="rs-cpu-body">
              <div class="rs-graph"><canvas id="cv-cpu"></canvas></div>
              <div class="rs-cores" id="rs-cores"></div>
            </div>
          </div>
          <div class="rs-box rs-mem"><div class="rs-t" id="rs-mem-t"></div><div id="rs-mem-b"></div></div>
          <div class="rs-box rs-disk"><div class="rs-t"><span>disks</span></div><div id="rs-disk-b"></div></div>
          <div class="rs-box rs-net"><div class="rs-t" id="rs-net-t"></div><div class="rs-graph"><canvas id="cv-net"></canvas></div></div>
          <div class="rs-box rs-proc">
            <div class="rs-t"><span>processes</span><span id="rs-note"></span></div>
            <div class="rs-ph"><span>pid</span><span>program</span><span>user</span><span>mem</span><span>cpu%</span><span></span></div>
            <div class="rs-plist" id="rs-plist"></div>
          </div>
        </div>
      </section>
      <section class="panel" id="p-clipboard">
        <div class="toolbar">
          <input id="cb-q" type="text" spellcheck="false" placeholder="search clipboard history">
          <button class="fseg on" data-cf="all">all</button>
          <button class="fseg" data-cf="text">text</button>
          <button class="fseg" data-cf="img">images</button>
          <button class="fseg" data-cf="pin">pinned</button>
          <button class="fseg" id="cb-pause">pause</button>
          <button class="fseg" id="cb-clear">clear</button>
        </div>
        <div class="cb-list" id="cb-list"></div>
      </section>
      <section class="panel" id="p-settings">
        <div class="set">
          <div class="set-card">
            <div class="set-t">profile</div>
            <div class="set-l">username</div>
            <div class="set-line"><input id="set-name" type="text" spellcheck="false" placeholder="your name" maxlength="40"><button id="set-name-save" class="pill">save</button></div>
          </div>
          <div class="set-card">
            <div class="set-t">appearance</div>
            <div class="set-l"><span>background opacity</span><span id="set-tint-v" class="mut">70%</span></div>
            <input id="set-tint" class="rng" type="range" min="20" max="100" value="70">
            <div class="set-l"><span>glass blur</span><span id="set-blur-v" class="mut">10px</span></div>
            <input id="set-blur" class="rng" type="range" min="0" max="30" value="10">
            <div class="set-note mut">higher opacity helps tiles stay readable on light wallpapers. blur affects the side tiles and dock only (the main panel keeps its webview crisp).</div>
          </div>
          <div class="set-card">
            <div class="set-t">search</div>
            <div class="set-l">search engine</div>
            <div class="set-seg" id="set-eng" style="flex-wrap:wrap"></div>
            <div class="set-line" id="set-eng-custom" hidden><input id="set-eng-url" type="text" spellcheck="false" placeholder="https://example.com/search?q=%s"><button id="set-eng-save" class="pill">save</button></div>
            <div class="set-note mut" id="set-eng-note"></div>
          </div>
          <div class="set-card">
            <div class="set-t">weather</div>
            <div class="set-l">location</div>
            <div class="set-line"><input id="set-loc" type="text" spellcheck="false" placeholder="city, e.g. helsinki"><button id="set-loc-save" class="pill">save</button></div>
            <div class="set-note mut" id="set-loc-note"></div>
            <div class="set-l">units</div>
            <div class="set-seg"><button data-u="c">°c</button><button data-u="f">°f</button></div>
          </div>
          <div class="set-card">
            <div class="set-t">calendar</div>
            <div class="set-l">secret ICS address</div>
            <div class="set-line"><input id="set-cal" type="text" spellcheck="false" placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"><button id="set-cal-save" class="pill">save</button></div>
            <div class="set-note mut" id="set-cal-note">google calendar, then settings, then your calendar, then "secret address in iCal format"</div>
          </div>
          <div class="set-copy">
            copyright neks 2026<br>
            <a href="#" data-url="https://creativecommons.org/licenses/by-nc-sa/4.0/" title="creative commons attribution-noncommercial-sharealike 4.0 international">cc by-nc-sa 4.0</a>
          </div>
        </div>
      </section>
    </main>

    <aside class="side">
      <section class="tile nt-tile" id="nt">
        <div class="nt-ico"><svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/></svg></div>
        <div class="nt-txt"><div class="nt-t" id="nt-t">all quiet</div><div class="nt-b mut" id="nt-b">notifications will appear here</div></div>
      </section>
      <section class="tile sky-tile" id="sky">
        <div class="sky-bg" id="sky-bg"></div>
        <div class="sky-aur" id="sky-aur" hidden><i></i><i></i></div>
        <div class="sky-top">
          <div class="ck-time" id="ck-time">--:--</div>
          <div class="ck-side"><div class="ck-sec" id="ck-sec">--</div><div class="ck-date mut" id="ck-date"></div></div>
        </div>
        <svg class="sky-arc" viewBox="0 0 300 70">
          <path d="M14 60 Q150 -30 286 60" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-dasharray="3 4"/>
          <path d="M0 60H300" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
          <circle id="sky-sun" cx="14" cy="60" r="6" fill="#ffd36b"/>
        </svg>
        <div class="sky-row">
          <div><span class="mut">sunrise</span> <b id="sky-rise">--</b></div>
          <div class="mut" id="sky-len"></div>
          <div><span class="mut">sunset</span> <b id="sky-set">--</b></div>
        </div>
        <div class="sky-au"><span class="sky-kp" id="sky-kp">kp --</span><span class="mut" id="sky-au-t">aurora</span></div>
      </section>

      <section class="tile sp-tile">
        <div class="sp-bg" id="sp-bg"></div>
        <div class="sp-msg" id="sp-login" hidden>
          <p id="sp-msg">not connected</p>
          <button id="sp-connect" class="pill">connect spotify</button>
        </div>
        <div class="sp-msg" id="sp-idle" hidden><p>nothing playing</p><p class="mut">start playback in spotify</p></div>
        <div class="sp-now" id="sp-now" hidden>
          <div class="sp-top"><img id="sp-art" alt=""><div class="sp-text"><div class="sp-title" id="sp-title">—</div><div class="sp-artist" id="sp-artist">—</div></div></div>
          <div class="sp-ctl"><button id="sp-prev" class="ctl">⏮</button><button id="sp-play" class="ctl big">⏵</button><button id="sp-next" class="ctl">⏭</button></div>
          <div class="sp-prog"><span id="sp-t0" class="mut">0:00</span><div class="sp-bar" id="sp-bar"><div class="sp-fill" id="sp-fill"></div></div><span id="sp-t1" class="mut">0:00</span></div>
          <div class="vol"><svg class="vi" viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg><input type="range" min="0" max="100" value="50"></div>
        </div>
      </section>

      <section class="tile wx-tile">
        <div class="wx-top">
          <div class="wx-ico" id="wx-ico"></div>
          <div><div class="wx-temp" id="wx-temp">--</div><div class="wx-desc mut" id="wx-desc">loading...</div></div>
          <div class="wx-meta mut" id="wx-meta"></div>
        </div>
        <div class="wx-days" id="wx-days"></div>
        <div class="wx-place mut" id="wx-place"></div>
      </section>

      <section class="tile cal-tile">
        <div class="cb-h"><span class="hm-t" id="cal-m">calendar</span><button class="mini" id="cal-r" title="Refresh">⟳</button></div>
        <div class="cal-g" id="cal-g"></div>
        <div id="cal-ag" style="display:flex;flex-direction:column;gap:6px"></div>
      </section>
      <section class="tile dl-tile">
        <div class="cb-h"><span class="hm-t">downloads</span><span class="mut" id="dl-sum" style="font-size:11px"></span></div>
        <div id="dl-list" style="display:flex;flex-direction:column;gap:12px"></div>
      </section>
      <section class="tile cbt-tile">
        <div class="cb-h"><span class="hm-t">clipboard</span><button class="mini" id="cbt-open" title="Open history">⤢</button></div>
        <div id="cbt-list" style="display:flex;flex-direction:column;gap:4px"></div>
      </section>
    </aside>
  </div>

  <div class="ctx" id="ctx" hidden></div>
  <div class="ctx props" id="props" hidden></div>

<script>
const api = window.hud;
const cfg = api.config();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* pre-settings paint: use config.json's glassBlur if present, and a sane
   default tint, until settings finish loading. Once SET loads, applyGlass()
   will overwrite both from settings. */
{
  const b = cfg.glassBlur;
  if (b === false || b === 0) document.body.classList.add('no-blur');
  else if (typeof b === 'number' && b > 0) document.documentElement.style.setProperty('--blur', b + 'px');
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0';

let interactive = false;
document.addEventListener('mousemove', (e) => {
  const over = !!e.target.closest('.tile, .ctx, .props');
  if (over !== interactive) { interactive = over; api.setInteractive(over); }
});

const WEB = {
  browser: { url: 'https://duckduckgo.com', partition: 'persist:browser', ua: FIREFOX_UA },
  discord: { url: 'https://discord.com/app', partition: 'persist:discord' },
  store:   { url: 'https://store.steampowered.com', partition: 'persist:steam' },
};
const wvs = {};
const wvURLs = { discord: WEB.discord.url, store: WEB.store.url };
const keepAlive = cfg.keepWebviewsAlive === true;
const ALWAYS_ALIVE = ['discord'];

function makeWebview(c, src) {
  const wv = document.createElement('webview');
  wv.setAttribute('partition', c.partition);
  wv.setAttribute('useragent', c.ua || UA);
  wv.setAttribute('allowpopups', '');
  wv.setAttribute('src', src);
  return wv;
}
function destroyWebview(name) {
  const wv = wvs[name];
  if (!wv) return;
  try { const u = wv.getURL(); if (u && u !== 'about:blank') wvURLs[name] = u; } catch {}
  try { wv.remove(); } catch {}
  delete wvs[name];
}
function ensureWebview(name) {
  if (wvs[name]) return wvs[name];
  const wv = makeWebview(WEB[name], wvURLs[name] || WEB[name].url);
  $('#h-' + name).appendChild(wv);
  wvs[name] = wv;
  return wv;
}

const TABS = { list: [], active: null, seq: 0 };
const tabById = (id) => TABS.list.find(t => t.id === id);
const activeTab = () => tabById(TABS.active);
const curWv = () => { const t = activeTab(); return t && t.wv; };
const hostOf = (u) => { try { return new URL(u).hostname.replace('www.', ''); } catch { return u; } };

function tabSave() {
  try { localStorage.setItem('hud.tabs', JSON.stringify({ urls: TABS.list.map(t => t.url), active: TABS.list.findIndex(t => t.id === TABS.active) })); } catch {}
}
function tabAdd(url, activate) {
  const t = { id: ++TABS.seq, url: url || WEB.browser.url, title: '', icon: '', wv: null };
  TABS.list.push(t);
  if (activate !== false) TABS.active = t.id;
  return t;
}
function tabUrl(t, u) {
  t.url = u;
  if (t.id === TABS.active) $('#url').value = u;
  tabSave();
}
function tabAttach(t) {
  if (t.wv) return t.wv;
  const wv = makeWebview(WEB.browser, t.url);
  wv.classList.add('off');
  wv.addEventListener('did-navigate', e => tabUrl(t, e.url));
  wv.addEventListener('did-navigate-in-page', e => { if (e.isMainFrame) tabUrl(t, e.url); });
  wv.addEventListener('page-title-updated', e => { t.title = e.title; tabRender(); });
  wv.addEventListener('page-favicon-updated', e => { t.icon = (e.favicons && e.favicons[0]) || ''; tabRender(); });
  $('#h-browser').appendChild(wv);
  t.wv = wv;
  return wv;
}
function tabRender() {
  $('#tabs-list').innerHTML = TABS.list.map(t =>
    '<div class="tab' + (t.id === TABS.active ? ' on' : '') + '" data-id="' + t.id + '">' +
    (t.icon ? '<img src="' + esc(t.icon) + '" alt="">' : '<i class="dot"></i>') +
    '<span>' + esc(t.title || hostOf(t.url)) + '</span><button class="x" data-x="' + t.id + '">×</button></div>').join('');
}
function tabSelect(id) {
  const t = tabById(id);
  if (!t) return;
  TABS.active = id;
  tabAttach(t);
  TABS.list.forEach(x => { if (x.wv) x.wv.classList.toggle('off', x.id !== id); });
  $('#url').value = t.url;
  tabRender(); tabSave();
}
function tabClose(id) {
  const i = TABS.list.findIndex(t => t.id === id);
  if (i < 0) return;
  const t = TABS.list[i];
  if (t.wv) { try { t.wv.remove(); } catch {} }
  TABS.list.splice(i, 1);
  if (!TABS.list.length) { tabSelect(tabAdd(WEB.browser.url).id); return; }
  if (TABS.active === id) tabSelect(TABS.list[Math.min(i, TABS.list.length - 1)].id);
  else { tabRender(); tabSave(); }
}
function tabSuspend() {
  TABS.list.forEach(t => {
    if (!t.wv) return;
    try { const u = t.wv.getURL(); if (u && u !== 'about:blank') t.url = u; } catch {}
    try { t.wv.remove(); } catch {}
    t.wv = null;
  });
}
function tabResume() {
  if (!TABS.list.length) tabAdd(WEB.browser.url);
  if (!activeTab()) TABS.active = TABS.list[0].id;
  tabSelect(TABS.active);
}
(function () {
  let s = null;
  try { s = JSON.parse(localStorage.getItem('hud.tabs')); } catch {}
  const urls = s && Array.isArray(s.urls) && s.urls.length ? s.urls.slice(0, 20) : [WEB.browser.url];
  urls.forEach(u => tabAdd(u, false));
  TABS.active = TABS.list[Math.min(Math.max((s && s.active) || 0, 0), TABS.list.length - 1)].id;
  tabRender();
})();

$('#tabs-list').addEventListener('click', (e) => {
  const x = e.target.closest('[data-x]');
  if (x) { tabClose(Number(x.dataset.x)); return; }
  const t = e.target.closest('.tab');
  if (t) tabSelect(Number(t.dataset.id));
});
$('#tabs-list').addEventListener('auxclick', (e) => {
  if (e.button !== 1) return;
  const t = e.target.closest('.tab');
  if (t) tabClose(Number(t.dataset.id));
});
$('#tab-new').onclick = () => { tabSelect(tabAdd(WEB.browser.url).id); $('#url').focus(); $('#url').select(); };
api.onOpenTab((url) => {
  const t = tabAdd(url, false);
  if ($('#p-browser').classList.contains('active')) tabSelect(t.id); else tabRender();
});

function show(name) {
  const needed = [];
  if (name === 'discord') needed.push('discord');
  else if (name === 'steam' && steamTab === 'store') needed.push('store');

  if (!keepAlive) {
    for (const k of Object.keys(wvs)) if (!needed.includes(k) && !ALWAYS_ALIVE.includes(k)) destroyWebview(k);
    if (name !== 'browser') tabSuspend();
  }

  $$('.dock-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'p-' + name));
  rsSet(name === 'stats');
  spTabSet(name === 'spotify');
  if (name === 'files' && !FM.root && !FM.busy) fmStart();
  if (name === 'clipboard') clipLoad();

  if (name === 'browser') tabResume();
  if (needed.length) ensureWebview(needed[0]);
  if (name === 'steam') loadSteam();
}
$$('.dock-btn').forEach(b => b.addEventListener('click', () => show(b.dataset.panel)));

$('#b-back').onclick = () => { const w = curWv(); try { if (w && w.canGoBack()) w.goBack(); } catch {} };
$('#b-fwd').onclick = () => { const w = curWv(); try { if (w && w.canGoForward()) w.goForward(); } catch {} };
$('#b-reload').onclick = () => { const w = curWv(); try { if (w) w.reload(); } catch {} };

function toUrl(v) {
  const low = v.toLowerCase();
  if (low.startsWith('http://') || low.startsWith('https://')) return v;
  const host = v.split('/')[0].split('?')[0].split('#')[0];
  const tld = host.split('.').pop();
  if (!v.includes(' ') && host.includes('.') && tld.length >= 2 && /^[a-z]+$/i.test(tld)) return 'https://' + v;
  return searchUrl(v);
}
$('#url').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim();
  if (!v) return;
  if (!activeTab()) tabResume();
  const t = activeTab(), u = toUrl(v);
  t.url = u;
  const w = tabAttach(t);
  try { const p = w.loadURL(u); if (p && p.catch) p.catch(() => {}); } catch { w.src = u; }
});

const ENGINES = {
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s', home: 'https://duckduckgo.com' },
  google:     { name: 'Google',     url: 'https://www.google.com/search?q=%s', home: 'https://www.google.com' },
  bing:       { name: 'Bing',       url: 'https://www.bing.com/search?q=%s', home: 'https://www.bing.com' },
  brave:      { name: 'Brave',      url: 'https://search.brave.com/search?q=%s', home: 'https://search.brave.com' },
  startpage:  { name: 'Startpage',  url: 'https://www.startpage.com/do/search?q=%s', home: 'https://www.startpage.com' },
  ecosia:     { name: 'Ecosia',     url: 'https://www.ecosia.org/search?q=%s', home: 'https://www.ecosia.org' },
  custom:     { name: 'Custom',     url: '', home: '' },
};
const goodTpl = (v) => /^https?:[/][/].+%s/i.test(v || '');
function searchUrl(q) {
  const k = SET && SET.searchEngine;
  let tpl = (ENGINES[k] || ENGINES.duckduckgo).url;
  if (k === 'custom') tpl = goodTpl(SET.customSearchUrl) ? SET.customSearchUrl : ENGINES.duckduckgo.url;
  return tpl.replace('%s', encodeURIComponent(q));
}
function engineHome() {
  const k = SET && SET.searchEngine;
  if (k === 'custom' && goodTpl(SET.customSearchUrl)) { try { return new URL(SET.customSearchUrl.replace('%s', 'x')).origin; } catch {} }
  return (ENGINES[k] && ENGINES[k].home) || ENGINES.duckduckgo.home;
}

$('#close').onclick = () => api.win('close');
$('#pin').onclick = async () => { const on = await api.win('pin'); $('#pin').classList.toggle('on', on); };
$('#fill').onclick = async () => { const on = await api.win('fill'); $('#fill').classList.toggle('on', on); };
api.onFillState((on) => $('#fill').classList.toggle('on', !!on));
function tick() {
  const d = new Date();
  $('#clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
tick(); setInterval(tick, 10000);

let sp = null, spTimer = null, spStamp = 0, seeking = false;
const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

async function pollSpotify() {
  clearTimeout(spTimer);
  if (document.hidden) { spTimer = setTimeout(pollSpotify, 8000); return; }
  sp = await api.spotifyState();
  spStamp = Date.now();
  renderSpotify();
  spTimer = setTimeout(pollSpotify, sp && sp.connected ? 3000 : 10000);
}

function renderSpotify() {
  const s = sp;
  syncVol(s);
  spTabRender();
  homeSpotify(s);
  $('#sp-login').hidden = !(s && !s.connected);
  $('#sp-now').hidden   = !(s && s.connected && !s.idle);
  $('#sp-idle').hidden  = !(s && s.connected && s.idle);
  if (!s) return;
  if (!s.connected) {
    $('#sp-msg').textContent = s.needsConfig ? 'add spotifyClientId to config.json' : 'not connected';
    $('#sp-connect').disabled = !!s.needsConfig;
    return;
  }
  if (s.idle) { $('#sp-bg').style.backgroundImage = 'none'; return; }
  $('#sp-title').textContent = s.title;
  $('#sp-artist').textContent = s.artist;
  $('#sp-t1').textContent = fmt(s.duration);
  $('#sp-play').textContent = s.playing ? '⏸' : '⏵';
  if (s.art && $('#sp-art').getAttribute('src') !== s.art) {
    $('#sp-art').src = s.art;
    $('#sp-bg').style.backgroundImage = 'url("' + s.art + '")';
  }
  paintProgress();
}

function paintProgress() {
  if (!sp || !sp.connected || sp.idle || seeking) return;
  const p = Math.min(sp.duration, sp.progress + (sp.playing ? Date.now() - spStamp : 0));
  const ratio = sp.duration ? p / sp.duration : 0;
  $('#sp-fill').style.clipPath = 'inset(0 ' + ((1 - ratio) * 100).toFixed(2) + '% 0 0)';
  $('#sp-t0').textContent = fmt(p);
  spTabProgress();
}
setInterval(() => { if (!document.hidden) paintProgress(); }, 1000);

const refreshSoon = () => { clearTimeout(spTimer); spTimer = setTimeout(pollSpotify, 350); };

$('#sp-connect').onclick = async () => {
  $('#sp-msg').textContent = 'finish login in your browser...';
  const ok = await api.spotifyLogin();
  if (!ok) $('#sp-msg').textContent = 'login failed, try again';
  pollSpotify();
};
$('#sp-play').onclick = async () => {
  if (!sp) return;
  const act = sp.playing ? 'pause' : 'play';
  sp.playing = !sp.playing; spStamp = Date.now(); renderSpotify();
  await api.spotifyControl(act); refreshSoon();
};
$('#sp-next').onclick = async () => { await api.spotifyControl('next'); refreshSoon(); };
$('#sp-prev').onclick = async () => { await api.spotifyControl('prev'); refreshSoon(); };
$('#sp-bar').addEventListener('click', async (e) => {
  if (!sp || !sp.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  seeking = true;
  const fill = $('#sp-fill');
  fill.style.transition = 'none';
  fill.style.clipPath = 'inset(0 ' + ((1 - ratio) * 100).toFixed(2) + '% 0 0)';
  await api.spotifyControl('seek', ratio * sp.duration);
  seeking = false;
  requestAnimationFrame(() => { fill.style.transition = ''; });
  refreshSoon();
});

let statsTimer = null;
async function pollStats() {
  clearTimeout(statsTimer);
  if (document.hidden) { statsTimer = setTimeout(pollStats, 5000); return; }
  try {
    const s = await api.stats();
    homeStats(s);
  } catch {}
  statsTimer = setTimeout(pollStats, 2500);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { pollStats(); pollSpotify(); }
  if (VIS.on && !VIS.raf) VIS.raf = requestAnimationFrame(visFrame);
});

let steamTab = 'library', steamData = null, steamAt = 0, steamBusy = false;
let steamQ = '', steamFilter = 'all', steamSort = 'recent';
const SORT_LBL = { recent: 'recent', playtime: 'most played', name: 'a–z' };
const SORT_NEXT = { recent: 'playtime', playtime: 'name', name: 'recent' };
const hrs = (m) => m >= 600 ? Math.round(m / 60) + ' h' : m >= 60 ? (m / 60).toFixed(1) + ' h' : m > 0 ? m + ' min' : '';

function setSteamTab(t) {
  steamTab = t;
  $$('.seg').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $('#games').hidden = t !== 'library';
  $('#st-ctl').hidden = t !== 'library';
  $('#h-store').hidden = t !== 'store';
  if (t === 'store') ensureWebview('store');
  else if (!keepAlive) destroyWebview('store');
}
$$('.seg').forEach(b => b.addEventListener('click', () => setSteamTab(b.dataset.tab)));

function renderSteam() {
  const box = $('#games');
  if (!steamData) return;
  if (steamData.error) { box.innerHTML = '<p class="msg">' + esc(steamData.error) + '</p>'; $('#st-count').textContent = ''; return; }
  const q = steamQ.trim().toLowerCase();
  const list = steamData.games.filter(g => (steamFilter === 'all' || g.installed) && (!q || g.name.toLowerCase().includes(q)));
  list.sort(steamSort === 'name' ? (a, b) => a.name.localeCompare(b.name)
    : steamSort === 'playtime' ? (a, b) => b.playtime - a.playtime || a.name.localeCompare(b.name)
    : (a, b) => b.lastPlayed - a.lastPlayed || b.playtime - a.playtime || a.name.localeCompare(b.name));
  $('#st-count').textContent = list.length + ' games';
  $('#st-sort').textContent = SORT_LBL[steamSort];
  let h = steamData.note ? '<p class="msg">' + esc(steamData.note) + '</p>' : '';
  h += list.map(g => {
    const t = hrs(g.playtime);
    return '<button class="game' + (g.installed ? ' inst' : '') + '" data-id="' + g.appid + '" data-inst="' + (g.installed ? 1 : 0) + '" title="' + esc(g.name) + '">' +
      '<img loading="lazy" src="https://cdn.cloudflare.steamstatic.com/steam/apps/' + g.appid + '/header.jpg" alt="">' +
      '<span class="gn">' + esc(g.name) + '</span>' +
      '<span class="gm mut">' + (g.installed ? '● installed' : 'not installed') + (t ? ' · ' + t : '') + '</span></button>';
  }).join('');
  if (!list.length) h += '<p class="msg">no games match</p>';
  box.innerHTML = h;
}

async function loadSteam(force) {
  if (steamBusy) return;
  if (!force && steamData && !steamData.error && Date.now() - steamAt < 60000) return;
  steamBusy = true;
  if (!steamData) $('#games').innerHTML = '<p class="msg">loading...</p>';
  try { steamData = await api.steamGames(!!force); steamAt = Date.now(); }
  catch { steamData = { error: 'could not load steam library' }; }
  steamBusy = false;
  renderSteam();
}

let steamQTimer = null;
$('#st-q').addEventListener('input', (e) => { clearTimeout(steamQTimer); steamQTimer = setTimeout(() => { steamQ = e.target.value; renderSteam(); }, 120); });
$$('.flt[data-f]').forEach(b => b.addEventListener('click', () => {
  steamFilter = b.dataset.f;
  $$('.flt[data-f]').forEach(x => x.classList.toggle('on', x === b));
  renderSteam();
}));
$('#st-sort').onclick = () => { steamSort = SORT_NEXT[steamSort]; renderSteam(); };
$('#st-refresh').onclick = () => loadSteam(true);

$('#games').addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden'; }, true);
$('#games').addEventListener('click', (e) => {
  const b = e.target.closest('.game');
  if (b) api.steamLaunch(b.dataset.id, b.dataset.inst === '1');
});
$('#games').addEventListener('contextmenu', (e) => {
  const b = e.target.closest('.game');
  if (b) { e.preventDefault(); api.steamOpen(b.dataset.id); }
});

const RS = { cpu: [], rx: [], tx: [], n: 400, active: false, t: null, pt: null, armed: null };
const fb = (n) => { const u = ['B','K','M','G','T']; let i = 0; while (n >= 1024 && i < 4) { n /= 1024; i++; } return (n >= 100 || i === 0 ? Math.round(n) : n.toFixed(1)) + u[i]; };
const rsBar = (p) => '<div class="rs-bar' + (p >= 85 ? ' hot' : '') + '"><i style="transform:scaleX(' + (Math.min(100, Math.max(0, p)) / 100) + ')"></i></div>';
const rsRow = (l, p, v) => '<div class="rs-row"><span class="l">' + l + '</span>' + rsBar(p) + '<span class="v">' + v + '</span></div>';

function drawMirror(cv, up, down, max, pw) {
  const d = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const g = cv.getContext('2d'); g.clearRect(0, 0, w, h);
  const mid = h / 2, step = 3 * d, n = Math.floor(w / step), room = mid - 2 * d;
  g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(0, mid, w, Math.max(1, d));
  for (let i = 0; i < n; i++) {
    const idx = up.length - n + i;
    if (idx < 0) continue;
    const hu = Math.max(d, Math.pow(up[idx] / max, pw || 1) * room);
    const hd = Math.max(d, Math.pow((down ? down[idx] : up[idx]) / max, pw || 1) * room);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(i * step, mid - hu, 2 * d, hu);
    g.fillStyle = down ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.35)'; g.fillRect(i * step, mid, 2 * d, hd);
  }
}

function rsRender(s) {
  [[RS.cpu, s.cpu], [RS.rx, s.net.rx], [RS.tx, s.net.tx]].forEach(function(pair) { var a = pair[0], v = pair[1]; a.push(v); while (a.length > RS.n) a.shift(); });
  $('#rs-cpu-t').innerHTML = '<span><b>cpu ' + s.cpu + '%</b></span><span>' + esc(s.name || '') +
    (s.ghz ? ' · ' + s.ghz.toFixed(1) + ' ghz' : '') + (s.temp != null ? ' · ' + s.temp + '°c' : '') +
    '</span><span>up ' + Math.floor(s.uptime / 3600) + 'h ' + Math.floor((s.uptime % 3600) / 60) + 'm</span>';
  $('#rs-cores').innerHTML = s.cores.map(function(p, i) { return rsRow('c' + i, p, p + '%'); }).join('');

  const m = s.mem, pc = (x) => Math.round(x / m.total * 100);
  let h = rsRow('used', pc(m.used), fb(m.used)) + rsRow('avail', pc(m.avail), fb(m.avail)) +
          rsRow('cache', pc(m.cache), fb(m.cache)) + rsRow('free', pc(m.free), fb(m.free));
  if (m.swapTotal) h += rsRow('swap', Math.round(m.swapUsed / m.swapTotal * 100), fb(m.swapUsed) + ' / ' + fb(m.swapTotal));
  if (s.gpu != null) h += rsRow('gpu', s.gpu, s.gpu + '%');
  if (s.vram != null) h += rsRow('vram', s.vram, s.vram + '%');
  $('#rs-mem-t').innerHTML = '<span>memory</span><span>' + fb(m.total) + '</span>';
  $('#rs-mem-b').innerHTML = h;
  $('#rs-disk-b').innerHTML = s.disks.map(function(d) { return rsRow(esc(d.name), d.pct, fb(d.used) + ' / ' + fb(d.size)); }).join('');
  $('#rs-net-t').innerHTML = '<span>network</span><span>↓ ' + fb(s.net.rx) + '/s &nbsp; ↑ ' + fb(s.net.tx) + '/s</span><span>total ↓ ' + fb(s.net.rxT) + ' ↑ ' + fb(s.net.txT) + '</span>';

  drawMirror($('#cv-cpu'), RS.cpu, null, 100);
  drawMirror($('#cv-net'), RS.rx, RS.tx, Math.max.apply(null, [10240].concat(RS.rx, RS.tx)), 0.5);
}

function rsNote(t) {
  const n = $('#rs-note');
  if (!n) return;
  n.textContent = t;
  setTimeout(() => { if (n.textContent === t) n.textContent = ''; }, 3500);
}
function rsProcs(list, force) {
  if (!force && $('#rs-plist').matches(':hover')) return;
  const k = (p, mode) => { const on = RS.armed === p.pid + ':' + mode;
    return '<button data-k="' + mode + '" class="' + (on ? 'arm' : '') + '">' + (on ? 'sure?' : mode) + '</button>'; };
  $('#rs-plist').innerHTML = list.map(function(p) {
    return '<div class="rs-pr" data-pid="' + p.pid + '" data-name="' + esc(p.name) + '"><span class="mut">' + p.pid + '</span><span>' + esc(p.name) +
    '</span><span class="mut">' + esc(p.user || '') + '</span><span>' + fb(p.mem) + '</span><span>' + p.cpu.toFixed(1) +
    '</span><div class="rs-k">' + k(p, 'end') + k(p, 'tree') + '</div></div>';
  }).join('');
}

$('#rs-plist').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  const row = b.closest('.rs-pr'), pid = Number(row.dataset.pid), key = pid + ':' + b.dataset.k;
  if (RS.armed !== key) {
    RS.armed = key; b.textContent = 'sure?'; b.classList.add('arm');
    setTimeout(() => { if (RS.armed === key) { RS.armed = null; b.textContent = b.dataset.k; b.classList.remove('arm'); } }, 3000);
    return;
  }
  RS.armed = null;
  const r = await api.procKill(pid, row.dataset.name, b.dataset.k === 'tree');
  rsNote(r && r.ok ? 'ended ' + row.dataset.name : (r && r.error) || 'failed');
  try { rsProcs(await api.statsProcs(), true); } catch {}
});

async function rsPoll() {
  clearTimeout(RS.t);
  if (!RS.active) return;
  if (document.hidden) { RS.t = setTimeout(rsPoll, 4000); return; }
  try { const s = await api.statsFull(); if (s && !s.error && RS.active) rsRender(s); } catch {}
  RS.t = setTimeout(rsPoll, 2000);
}
async function rsProcPoll() {
  clearTimeout(RS.pt);
  if (!RS.active) return;
  if (document.hidden) { RS.pt = setTimeout(rsProcPoll, 6000); return; }
  try { const l = await api.statsProcs(); if (l && RS.active) rsProcs(l); } catch {}
  RS.pt = setTimeout(rsProcPoll, 5000);
}
function rsSet(on) {
  RS.active = on;
  if (on) { rsPoll(); rsProcPoll(); } else { clearTimeout(RS.t); clearTimeout(RS.pt); }
}

let HOME_NAME = '';
const pad2 = (n) => String(n).padStart(2, '0');

function homeTick() {
  const d = new Date(), h = d.getHours();
  $('#hm-time').textContent = pad2(h) + ':' + pad2(d.getMinutes());
  $('#hm-date').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase();
  $('#hm-greet').textContent = (h < 5 ? 'late night' : h < 12 ? 'good morning' : h < 18 ? 'good afternoon' : 'good evening') + (HOME_NAME ? ', ' + HOME_NAME : '');
}
homeTick(); setInterval(homeTick, 10000);

const BUILTIN = $$('.dock-btn').filter(b => b.dataset.panel !== 'home' && b.dataset.panel !== 'settings').map(b => ({
  go: b.dataset.panel, svg: b.querySelector('svg').outerHTML, label: (b.title || b.dataset.panel).toLowerCase() }));
let CUSTOM = [];
const GENERIC = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12h6"/></svg>';
function tilesRender() {
  $('#hm-tiles').innerHTML =
    BUILTIN.map(t => '<button class="hm-tile" data-go="' + t.go + '">' + t.svg + '<span>' + esc(t.label) + '</span></button>').join('') +
    CUSTOM.map((a, i) => '<button class="hm-tile" data-app="' + i + '" title="' + esc(a.path) + '">' +
      (a.icon ? '<img src="' + a.icon + '" alt="">' : GENERIC) + '<span>' + esc(a.name) + '</span></button>').join('') +
    '<button class="hm-tile add" title="add a program"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>';
}
tilesRender();
api.appsList().then(l => { CUSTOM = l; tilesRender(); });
$('#hm-tiles').addEventListener('click', async (e) => {
  if (e.target.closest('.add')) { CUSTOM = await api.appsAdd(); tilesRender(); return; }
  const a = e.target.closest('[data-app]');
  if (a) { api.appsLaunch(CUSTOM[a.dataset.app].path); return; }
  const t = e.target.closest('[data-go]');
  if (t) show(t.dataset.go);
});
$('#hm-tiles').addEventListener('contextmenu', (e) => {
  const a = e.target.closest('[data-app]');
  if (!a) return;
  e.preventDefault();
  const item = CUSTOM[a.dataset.app];
  ctxShow(e.clientX, e.clientY, [
    { label: 'Open', run: () => api.appsLaunch(item.path) },
    { label: 'Remove from home', danger: true, run: async () => { CUSTOM = await api.appsRemove(item.path); tilesRender(); } },
  ]);
});

$('#hm-search').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim();
  if (!v) return;
  e.target.value = '';
  tabAdd(toUrl(v), true);
  show('browser');
});

function homeSpotify(s) {
  const art = $('#hm-art');
  if (!s || !s.connected) { $('#hm-title').textContent = s && s.needsConfig ? 'add spotifyClientId' : 'spotify not connected'; $('#hm-artist').textContent = ''; art.hidden = true; return; }
  if (s.idle) { $('#hm-title').textContent = 'nothing playing'; $('#hm-artist').textContent = ''; art.hidden = true; return; }
  $('#hm-title').textContent = s.title;
  $('#hm-artist').textContent = s.artist;
  $('#hm-play').textContent = s.playing ? '⏸' : '⏵';
  if (s.art) { if (art.getAttribute('src') !== s.art) art.src = s.art; art.hidden = false; }
}
$('.hm-ctl').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) $('#' + b.dataset.sp).click();
});

function homeStats(s) {
  if (!$('#p-home').classList.contains('active')) return;
  $('#hm-stats').innerHTML = [['cpu', s.cpu], ['ram', s.ram], ['gpu', s.gpu], ['vram', s.vram]].map(([l, v]) =>
    '<div class="hm-row"><span class="mut">' + l + '</span><div class="hm-bar' + (v >= 85 ? ' hot' : '') +
    '"><i style="transform:scaleX(' + ((v || 0) / 100) + ')"></i></div><span>' + (v == null ? 'n/a' : v + '%') + '</span></div>').join('');
}

async function homeGames() {
  const box = $('#hm-games');
  const r = await api.steamGames();
  if (r.error) { box.innerHTML = '<p class="mut">' + esc(r.error) + '</p>'; box.style.display = 'block'; return; }
  box.innerHTML = r.games.slice(0, 6).map(g =>
    '<button class="hm-game" data-id="' + g.appid + '" title="' + esc(g.name) + '">' +
    '<img loading="lazy" src="https://cdn.cloudflare.steamstatic.com/steam/apps/' + g.appid + '/header.jpg" alt=""></button>').join('');
}
$('#hm-games').addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden'; }, true);
$('#hm-games').addEventListener('click', (e) => {
  const b = e.target.closest('.hm-game');
  if (b) api.steamLaunch(b.dataset.id);
});
homeGames();

const VIS = { an: null, buf: null, tried: false, sm: new Float32Array(64), raf: 0, on: false };

async function visInit() {
  if (VIS.tried || !(navigator.userActivation && navigator.userActivation.isActive)) return;
  VIS.tried = true;
  try {
    const st = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    st.getVideoTracks().forEach(t => t.stop());
    if (!st.getAudioTracks().length) return;
    const ac = new AudioContext();
    const an = ac.createAnalyser();
    an.fftSize = 512; an.smoothingTimeConstant = 0.75;
    ac.createMediaStreamSource(new MediaStream(st.getAudioTracks())).connect(an);
    VIS.an = an; VIS.buf = new Uint8Array(an.frequencyBinCount);
  } catch {}
}

function visFrame() {
  VIS.raf = 0;
  if (!VIS.on || document.hidden) return;
  const cv = $('#cv-vis'), d = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const g = cv.getContext('2d'); g.clearRect(0, 0, w, h);

  const N = 48, vals = new Array(N).fill(0);
  if (VIS.an) {
    VIS.an.getByteFrequencyData(VIS.buf);
    const maxBin = Math.floor(VIS.buf.length * 0.6);
    for (let i = 0; i < N; i++) {
      const a = Math.floor(Math.pow(i / N, 1.6) * maxBin);
      const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / N, 1.6) * maxBin));
      let sum = 0; for (let k = a; k < b; k++) sum += VIS.buf[k];
      vals[i] = sum / (b - a) / 255;
    }
  } else if (sp && sp.playing) {
    const t = performance.now() / 1000;
    for (let i = 0; i < N; i++) vals[i] = (0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.7)) * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 0.31)) * (1 - (i / N) * 0.6) * 0.8;
  }

  const mid = h / 2, bw = w / (N * 2), gap = Math.max(1, bw * 0.28);
  for (let i = 0; i < N; i++) {
    VIS.sm[i] = Math.max(vals[i], VIS.sm[i] * 0.86);
    const hh = Math.max(d, Math.pow(VIS.sm[i], 1.15) * mid * 0.95);
    g.fillStyle = 'rgba(255,255,255,' + (0.85 - (i / N) * 0.4).toFixed(2) + ')';
    g.fillRect(w / 2 + i * bw + gap / 2, mid - hh, bw - gap, hh * 2);
    g.fillRect(w / 2 - (i + 1) * bw + gap / 2, mid - hh, bw - gap, hh * 2);
  }
  VIS.raf = requestAnimationFrame(visFrame);
}

function spTabSet(on) {
  VIS.on = on;
  if (!on) return;
  visInit();
  loadPlaylists();
  spTabRender();
  if (!VIS.raf) VIS.raf = requestAnimationFrame(visFrame);
}

function spColors(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      if ($('#spt-art').getAttribute('src') !== url) return;
      const c = document.createElement('canvas'); c.width = c.height = 8;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, 8, 8);
      const px = g.getImageData(0, 0, 8, 8).data;
      const quad = (x0, y0) => {
        let r = 0, gr = 0, b = 0;
        for (let y = y0; y < y0 + 4; y++) for (let x = x0; x < x0 + 4; x++) { const i = (y * 8 + x) * 4; r += px[i]; gr += px[i + 1]; b += px[i + 2]; }
        return 'rgb(' + Math.round(r / 16) + ',' + Math.round(gr / 16) + ',' + Math.round(b / 16) + ')';
      };
      const bg = $('#spt-bg').style;
      bg.setProperty('--c1', quad(0, 0)); bg.setProperty('--c2', quad(4, 0));
      bg.setProperty('--c3', quad(4, 4)); bg.setProperty('--c4', quad(0, 4));
    } catch {}
  };
  img.src = url;
}

function spTabRender() {
  const ctx = (sp && sp.context) || null;
  if (PL.data && PL.ctx !== ctx) { PL.ctx = ctx; paintPlaylists(); }

  const s = sp, ok = !!(s && s.connected && !s.idle);
  $('#spt-body').hidden = !ok;
  $('#spt-msg').hidden = ok;
  if (!ok) {
    $('#spt-msg').textContent = !s ? '...' : !s.connected ? (s.needsConfig ? 'add spotifyClientId to config.json' : 'connect spotify from the side panel') : 'nothing playing';
    return;
  }
  $('#spt-title').textContent = s.title;
  $('#spt-artist').textContent = s.artist;
  $('#spt-t1').textContent = fmt(s.duration);
  $('#spt-play').textContent = s.playing ? '⏸' : '⏵';
  if (s.art && $('#spt-art').getAttribute('src') !== s.art) { $('#spt-art').src = s.art; spColors(s.art); }
  spTabProgress();
}

function spTabProgress() {
  if (!sp || !sp.connected || sp.idle || seeking || !$('#p-spotify').classList.contains('active')) return;
  const p = Math.min(sp.duration, sp.progress + (sp.playing ? Date.now() - spStamp : 0));
  const ratio = sp.duration ? p / sp.duration : 0;
  $('#spt-fill').style.clipPath = 'inset(0 ' + ((1 - ratio) * 100).toFixed(2) + '% 0 0)';
  $('#spt-t0').textContent = fmt(p);
}

$('.spt-ctl').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) $('#' + b.dataset.sp).click();
});
$('#spt-bar').addEventListener('click', async (e) => {
  if (!sp || !sp.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  seeking = true;
  const f = $('#spt-fill');
  f.style.transition = 'none';
  f.style.clipPath = 'inset(0 ' + ((1 - ratio) * 100).toFixed(2) + '% 0 0)';
  await api.spotifyControl('seek', ratio * sp.duration);
  seeking = false;
  requestAnimationFrame(() => { f.style.transition = ''; });
  refreshSoon();
});

const sptEl = $('.spt');
try { if (localStorage.getItem('hud.plHidden') === '1') sptEl.classList.add('pl-hidden'); } catch {}
$('#spt-pltoggle').onclick = () => {
  const h = sptEl.classList.toggle('pl-hidden');
  try { localStorage.setItem('hud.plHidden', h ? '1' : '0'); } catch {}
};

const PL = { data: null, at: 0, busy: false, ctx: null };

function paintPlaylists() {
  const box = $('#spt-pll');
  if (!PL.data || !PL.data.length) { box.innerHTML = '<p class="mut" style="padding:8px">no playlists</p>'; return; }
  const cur = sp && sp.context;
  box.innerHTML = PL.data.map(p =>
    '<button class="pl' + (p.uri === cur ? ' on' : '') + '" data-uri="' + esc(p.uri) + '">' +
    (p.img ? '<img loading="lazy" src="' + esc(p.img) + '" alt="">' : '<div class="ph"></div>') +
    '<div class="pn"><b>' + esc(p.name || 'untitled') + '</b>' + (p.count != null ? '<small>' + p.count + ' tracks</small>' : '') + '</div></button>').join('');
}

async function loadPlaylists(force) {
  if (PL.busy) return;
  if (!force && PL.data && Date.now() - PL.at < 300000) { paintPlaylists(); return; }
  PL.busy = true;
  const box = $('#spt-pll');
  if (!PL.data) box.innerHTML = '<p class="mut" style="padding:8px">loading...</p>';
  let r;
  try { r = await api.spotifyPlaylists(!!force); } catch { r = { error: 'could not load playlists' }; }
  PL.busy = false;
  if (r.error) {
    box.innerHTML = '<p class="mut" style="padding:8px">' + esc(r.error) + '</p>' +
      (r.reconnect ? '<button class="pill" id="pl-reconnect" style="margin:6px 8px">reconnect</button>' : '');
    return;
  }
  PL.data = r.playlists; PL.at = Date.now();
  paintPlaylists();
}

$('#spt-pll').addEventListener('click', async (e) => {
  if (e.target.id === 'pl-reconnect') { await api.spotifyLogin(); PL.data = null; loadPlaylists(true); return; }
  const b = e.target.closest('.pl');
  if (!b) return;
  const r = await api.spotifyPlay(b.dataset.uri);
  if (r && r.error) {
    const t = $('#spt-plt');
    t.textContent = r.error;
    setTimeout(() => { t.textContent = 'playlists'; }, 3500);
  } else refreshSoon();
});
$('#spt-plr').onclick = () => loadPlaylists(true);

let volHoldUntil = 0, volTimer = null;
const paintVol = (i) => i.style.setProperty('--v', i.value + '%');
const paintRng = (i) => {
  const min = Number(i.min) || 0, max = Number(i.max) || 100;
  i.style.setProperty('--v', (((i.value - min) / (max - min)) * 100).toFixed(2) + '%');
};
function syncVol(s) {
  const has = !!(s && s.connected && !s.idle && s.volume != null);
  $$('.vol').forEach(w => { w.hidden = !has; });
  if (!has || Date.now() < volHoldUntil) return;
  $$('.vol input').forEach(i => { i.value = s.volume; paintVol(i); });
}
$$('.vol input').forEach(inp => inp.addEventListener('input', (e) => {
  const v = Number(e.target.value);
  volHoldUntil = Date.now() + 2500;
  $$('.vol input').forEach(i => { i.value = v; paintVol(i); });
  clearTimeout(volTimer);
  volTimer = setTimeout(() => api.spotifyControl('volume', v), 120);
}));

const p2 = (n) => String(n).padStart(2, '0');
function ckTick() {
  const d = new Date();
  $('#ck-time').textContent = p2(d.getHours()) + ':' + p2(d.getMinutes());
  $('#ck-sec').textContent = p2(d.getSeconds());
  $('#ck-date').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }).toLowerCase();
}
ckTick(); setInterval(() => { if (!document.hidden) ckTick(); }, 1000);

const WX = {
  sun:   '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:  '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z"/>',
  part:  '<circle cx="8" cy="8" r="2.6"/><path d="M8 2v1.2M2 8h1.2M3.8 3.8l.9.9M12.2 3.8l-.9.9"/><path d="M9 20h8a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 14a3 3 0 0 0 1 6z"/>',
  rain:  '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7z"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>',
  snow:  '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7z"/><path d="M8 19h.01M12 19h.01M16 19h.01M10 21.5h.01M14 21.5h.01"/>',
  storm: '<path d="M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7z"/><path d="M12 15l-2 3h3l-2 3"/>',
  fog:   '<path d="M4 9h16M6 13h12M4 17h16"/>',
};
const WX_TXT = { sun: 'clear', moon: 'clear', part: 'partly cloudy', cloud: 'overcast', fog: 'fog', storm: 'thunderstorm', snow: 'snow', rain: 'rain' };
const wxSvg = (k) => '<svg viewBox="0 0 24 24">' + WX[k] + '</svg>';
function wxKind(c, day) {
  if (c === 0) return day ? 'sun' : 'moon';
  if (c <= 2) return 'part';
  if (c === 3) return 'cloud';
  if (c === 45 || c === 48) return 'fog';
  if (c >= 95) return 'storm';
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow';
  return 'rain';
}

let ntTimer = null;
function ntIdle() { $('#nt').classList.remove('live'); $('#nt-t').textContent = 'all quiet'; $('#nt-b').textContent = 'notifications will appear here'; }
function hudNotify(app, title, body, ms) {
  const el = $('#nt');
  el.classList.remove('live'); void el.offsetWidth; el.classList.add('live');
  $('#nt-t').textContent = title;
  $('#nt-b').textContent = (app || '') + (app && body ? ' · ' : '') + (body || '');
  clearTimeout(ntTimer);
  ntTimer = setTimeout(ntIdle, ms || 6000);
}
$('#nt').onclick = ntIdle;
window.hudNotify = hudNotify;

const SKY = { sun: null, au: null };
const hmOf = (ms) => { const d = new Date(ms); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
const SKY_COL = { night: ['#0a0f2e', '#3b1f78'], dawn: ['#ff9a62', '#7d5cff'], day: ['#3d9bff', '#9fdcff'], dusk: ['#ff5f6d', '#5b2f9e'] };

function skyPhase(now) {
  const s = SKY.sun;
  if (!s) { const h = new Date().getHours(); return h >= 8 && h < 16 ? 'day' : h >= 22 || h < 5 ? 'night' : 'dusk'; }
  const W = 40 * 60000;
  if (now < s.rise - W) return 'night';
  if (now < s.rise + W) return 'dawn';
  if (now < s.set - W) return 'day';
  if (now < s.set + W) return 'dusk';
  return 'night';
}
function skyRender() {
  const now = Date.now(), ph = skyPhase(now), c = SKY_COL[ph], s = SKY.sun;
  $('#sky-bg').style.background = 'linear-gradient(150deg,' + c[0] + ',' + c[1] + ')';
  const sun = $('#sky-sun');
  const t = s ? Math.min(1, Math.max(0, (now - s.rise) / (s.set - s.rise))) : 0;
  const u = 1 - t;
  sun.setAttribute('cx', (14 * u * u + 300 * u * t + 286 * t * t).toFixed(1));
  sun.setAttribute('cy', (60 * u * u - 60 * u * t + 60 * t * t).toFixed(1));
  sun.setAttribute('fill', ph === 'night' ? '#dfe6ff' : '#ffd36b');
  if (s) {
    $('#sky-rise').textContent = hmOf(s.rise);
    $('#sky-set').textContent = hmOf(s.set);
    const ad = Math.abs(Math.round(s.delta));
    $('#sky-len').textContent = Math.floor(s.len / 3600) + 'h ' + Math.round(s.len % 3600 / 60) + 'm · ' +
      (s.delta >= 0 ? '+' : '-') + Math.floor(ad / 60) + 'm ' + (ad % 60) + 's/day';
  } else {
    $('#sky-rise').textContent = '--'; $('#sky-set').textContent = '--'; $('#sky-len').textContent = '';
  }
  const a = SKY.au;
  if (a && a.kp != null) {
    const dark = ph !== 'day';
    const go = a.kp >= a.need;
    $('#sky-kp').textContent = 'kp ' + a.kp.toFixed(1);
    $('#sky-kp').classList.toggle('go', go);
    $('#sky-au-t').textContent = (go ? (a.kp >= a.need + 1 ? 'aurora likely' : 'aurora possible') : a.kp >= a.need - 1 ? 'aurora unlikely, close' : 'no aurora at your latitude') + (go && !dark ? ' after dark' : '');
    $('#sky-aur').hidden = !(go && dark);
  } else {
    $('#sky-kp').textContent = 'kp --'; $('#sky-kp').classList.remove('go');
    $('#sky-au-t').textContent = 'aurora data unavailable'; $('#sky-aur').hidden = true;
  }
}
async function loadAurora() {
  try { SKY.au = await api.auroraGet(); } catch { SKY.au = null; }
  if (SKY.au && SKY.au.error) SKY.au = null;
  skyRender();
}
setInterval(skyRender, 20000);

async function loadWeather() {
  let w;
  try { w = await api.weather(); } catch { w = { error: 'weather unavailable' }; }
  if (w.error) {
    $('#wx-ico').innerHTML = ''; $('#wx-temp').textContent = '--'; $('#wx-desc').textContent = w.error;
    $('#wx-meta').textContent = ''; $('#wx-days').innerHTML = ''; $('#wx-place').textContent = '';
    SKY.sun = null; skyRender();
    return w;
  }
  const k = wxKind(w.code, w.isDay);
  SKY.sun = w.sun;
  skyRender(); loadAurora();
  $('#wx-ico').innerHTML = wxSvg(k);
  $('#wx-temp').textContent = Math.round(w.temp) + '°';
  $('#wx-desc').textContent = WX_TXT[k];
  $('#wx-meta').innerHTML = 'feels ' + Math.round(w.feels) + '°<br>' + Math.round(w.wind) + (w.units === 'f' ? ' mph' : ' km/h') + ' · ' + w.hum + '%';
  $('#wx-days').innerHTML = w.days.slice(1, 4).map(d => {
    const name = new Date(d.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toLowerCase();
    return '<div class="wx-day"><span class="mut">' + name + '</span>' + wxSvg(wxKind(d.code, true)) +
      '<span><b>' + Math.round(d.hi) + '°</b> <span class="mut">' + Math.round(d.lo) + '°</span></span></div>';
  }).join('');
  $('#wx-place').textContent = w.place.toLowerCase();
  return w;
}
setInterval(() => { if (!document.hidden) loadWeather(); }, 15 * 60 * 1000);

const CAL = { events: [], err: '', url: true };
async function loadCalendar(force) {
  let r;
  try { r = await api.calEvents(!!force); } catch { r = { error: 'calendar unavailable' }; }
  CAL.url = !r.needsUrl; CAL.err = r.error || ''; CAL.events = r.events || [];
  calRender();
}
function calRender() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  $('#cal-m').textContent = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toLowerCase();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
  const has = new Set(CAL.events.map(e => new Date(e.start).toDateString()));
  let g = ['m', 't', 'w', 't', 'f', 's', 's'].map(x => '<span class="cal-h">' + x + '</span>').join('');
  for (let i = 0; i < lead; i++) g += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    g += '<span class="cal-d' + (d === now.getDate() ? ' today' : '') + (has.has(new Date(y, m, d).toDateString()) ? ' has' : '') + '">' + d + '</span>';
  }
  $('#cal-g').innerHTML = g;

  const ag = $('#cal-ag');
  if (!CAL.url) { ag.innerHTML = '<button class="pill" id="cal-link">link google calendar</button>'; return; }
  if (CAL.err) { ag.innerHTML = '<p class="mut" style="font-size:11px">' + esc(CAL.err) + '</p>'; return; }
  const sod = new Date(); sod.setHours(0, 0, 0, 0);
  const up = CAL.events.filter(e => e.end > Date.now() || (e.allDay && e.end > sod.getTime())).slice(0, 4);
  ag.innerHTML = up.map(e => {
    const dd = Math.round((new Date(e.start).setHours(0, 0, 0, 0) - sod.getTime()) / 864e5);
    const day = dd <= 0 ? 'today' : dd === 1 ? 'tomorrow' : new Date(e.start).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }).toLowerCase();
    return '<div class="cal-ev"><span>' + day + '</span><span>' + (e.allDay ? '' : hmOf(e.start) + ' ') + esc(e.title) + '</span></div>';
  }).join('') || '<p class="mut" style="font-size:11px">nothing coming up</p>';
}
$('#cal-ag').addEventListener('click', (e) => { if (e.target.id === 'cal-link') show('settings'); });
$('#cal-r').onclick = () => loadCalendar(true);
$('#set-cal-save').onclick = async () => {
  if (!SET) return;
  SET = await api.settingsSet({ calendarUrl: $('#set-cal').value.trim() });
  $('#set-cal-note').textContent = 'loading...';
  await loadCalendar(true);
  $('#set-cal-note').textContent = CAL.err || (CAL.url ? 'linked, ' + CAL.events.length + ' events in the next 45 days' : 'paste the ICS address first');
};
setInterval(() => { if (!document.hidden) loadCalendar(); }, 10 * 60 * 1000);

const DL = { ids: new Set(), names: {}, t: null };
function dlRender(l) {
  const cur = new Set(l.map(x => x.appid));
  l.forEach(x => { DL.names[x.appid] = x.name; });
  for (const id of DL.ids) if (!cur.has(id)) hudNotify('steam', 'download finished', DL.names[id]);
  DL.ids = cur;
  $('#dl-sum').textContent = l.length ? l.length + ' active' : '';
  $('#dl-list').innerHTML = l.length ? l.map(x => {
    const p = Math.min(100, x.done / x.total * 100);
    const left = x.speed > 0 ? Math.round((x.total - x.done) / x.speed) : 0;
    const eta = x.stalled ? 'paused or queued' : left ? (left >= 3600 ? Math.floor(left / 3600) + 'h ' + Math.floor(left % 3600 / 60) + 'm' : Math.ceil(left / 60) + ' min') + ' left' : '';
    return '<div class="dl-i"><div class="dl-n"><span>' + esc(x.name) + '</span><span class="mut">' + p.toFixed(0) + '%</span></div>' +
      '<div class="hm-bar"><i style="transform:scaleX(' + (p / 100).toFixed(4) + ')"></i></div>' +
      '<div class="mut dl-m">' + fb(x.done) + ' / ' + fb(x.total) + (x.speed ? ' · ' + fb(x.speed) + '/s' : '') + (eta ? ' · ' + eta : '') + '</div></div>';
  }).join('') : '<p class="mut" style="font-size:11px">no active downloads</p>';
}
async function dlPoll() {
  clearTimeout(DL.t);
  if (!document.hidden) { try { dlRender(await api.steamDownloads()); } catch {} }
  DL.t = setTimeout(dlPoll, 3000);
}

const CB = { list: [], q: '', f: 'all', paused: false, armed: false };
const ago = (t) => { const s = Math.floor((Date.now() - t) / 1000); return s < 60 ? 'now' : s < 3600 ? Math.floor(s / 60) + 'm' : s < 86400 ? Math.floor(s / 3600) + 'h' : Math.floor(s / 86400) + 'd'; };
async function clipLoad() {
  try { const r = await api.clipList(); CB.list = r.items; CB.paused = r.paused; } catch {}
  clipRender();
}
function clipRender() {
  $('#cbt-list').innerHTML = CB.list.slice(0, 4).map(c => '<button class="cbt-i" data-id="' + c.id + '">' +
    (c.type === 'img' ? '<img src="' + c.thumb + '" alt=""><span class="mut">image ' + c.w + 'x' + c.h + '</span>' : '<span>' + esc(c.text) + '</span>') +
    '</button>').join('') || '<p class="mut" style="font-size:11px">nothing copied yet</p>';
  $('#cb-pause').textContent = CB.paused ? 'resume' : 'pause';
  $('#cb-pause').classList.toggle('on', CB.paused);
  if (!$('#p-clipboard').classList.contains('active')) return;
  const q = CB.q.trim().toLowerCase();
  const items = CB.list.filter(c =>
    (CB.f === 'all' || (CB.f === 'pin' ? c.pin : c.type === CB.f)) && (!q || (c.type === 'text' && c.text.toLowerCase().includes(q))));
  items.sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
  $('#cb-list').innerHTML = items.map(c => '<div class="cb-i' + (c.pin ? ' pin' : '') + '" data-id="' + c.id + '"><div class="cb-main">' +
    (c.type === 'img' ? '<img src="' + c.thumb + '" alt="">' : '<div class="cb-tx">' + esc(c.text) + '</div>') +
    '<div class="cb-m mut">' + ago(c.t) + ' · ' + (c.type === 'img' ? c.w + 'x' + c.h : fnum(c.len) + ' chars') + (c.pin ? ' · pinned' : '') + '</div></div>' +
    '<div class="cb-k"><button data-a="pin">' + (c.pin ? 'unpin' : 'pin') + '</button><button data-a="del">delete</button></div></div>').join('') ||
    '<p class="msg">' + (CB.list.length ? 'no matches' : 'nothing copied yet') + '</p>';
}
async function clipClick(e) {
  const row = e.target.closest('[data-id]');
  if (!row) return;
  const id = Number(row.dataset.id), a = e.target.closest('[data-a]');
  if (!a) { if (await api.clipCopy(id)) hudNotify('clipboard', 'copied', 'press ctrl+v where you want it', 2500); return; }
  if (a.dataset.a === 'pin') await api.clipPin(id); else await api.clipDel(id);
  clipLoad();
}
$('#cb-list').addEventListener('click', clipClick);
$('#cbt-list').addEventListener('click', clipClick);
$('#cbt-open').onclick = () => show('clipboard');
let cbQT = null;
$('#cb-q').addEventListener('input', (e) => { clearTimeout(cbQT); cbQT = setTimeout(() => { CB.q = e.target.value; clipRender(); }, 120); });
$$('[data-cf]').forEach(b => b.addEventListener('click', () => {
  CB.f = b.dataset.cf;
  $$('[data-cf]').forEach(x => x.classList.toggle('on', x === b));
  clipRender();
}));
$('#cb-pause').onclick = async () => { CB.paused = await api.clipPause(!CB.paused); clipRender(); };
$('#cb-clear').onclick = async (e) => {
  const b = e.currentTarget;
  if (!CB.armed) { CB.armed = true; b.textContent = 'sure?'; b.classList.add('arm'); setTimeout(() => { CB.armed = false; b.textContent = 'clear'; b.classList.remove('arm'); }, 3000); return; }
  CB.armed = false; b.textContent = 'clear'; b.classList.remove('arm');
  await api.clipClear(); clipLoad();
};
api.onClip(() => clipLoad());
api.onNav((n) => show(n));

let SET = null;
let glassSaveT = null;

function applyGlass() {
  if (!SET) return;
  const blur = Number(SET.glassBlur);
  const tint = Number(SET.glassTint);
  if (!Number.isFinite(blur)) return;
  if (blur <= 0) document.body.classList.add('no-blur');
  else { document.body.classList.remove('no-blur'); document.documentElement.style.setProperty('--blur', blur + 'px'); }
  if (Number.isFinite(tint)) {
    document.documentElement.style.setProperty('--tile', 'rgba(8, 8, 12, ' + (tint / 100).toFixed(2) + ')');
  }
}
function saveGlassSoon() {
  clearTimeout(glassSaveT);
  glassSaveT = setTimeout(async () => {
    if (!SET) return;
    SET = await api.settingsSet({ glassBlur: Number(SET.glassBlur), glassTint: Number(SET.glassTint) });
  }, 200);
}
const setTint = $('#set-tint'), setBlur = $('#set-blur');
const tintV = $('#set-tint-v'), blurV = $('#set-blur-v');
if (setTint) setTint.addEventListener('input', (e) => {
  if (!SET) return;
  SET.glassTint = Number(e.target.value);
  tintV.textContent = SET.glassTint + '%';
  paintRng(e.target);
  applyGlass(); saveGlassSoon();
});
if (setBlur) setBlur.addEventListener('input', (e) => {
  if (!SET) return;
  SET.glassBlur = Number(e.target.value);
  blurV.textContent = SET.glassBlur + 'px';
  paintRng(e.target);
  applyGlass(); saveGlassSoon();
});

$$('.set-copy a').forEach(a => a.addEventListener('click', (e) => {
  e.preventDefault();
  if (a.dataset.url) api.openExternal(a.dataset.url);
}));

function applyIdentity() {
  HOME_NAME = ((SET && SET.username) || '').trim();
  const old = WEB.browser.url, home = engineHome();
  WEB.browser.url = home;
  TABS.list.forEach(t => { if (!t.wv && t.url === old) t.url = home; });
  homeTick();
}
function syncSettingsUi() {
  if (!SET) return;
  $('#set-loc').value = SET.location;
  $('#set-name').value = SET.username;
  $('#set-cal').value = SET.calendarUrl || '';
  $$('[data-u]').forEach(b => b.classList.toggle('on', b.dataset.u === SET.units));
  $('#set-eng').innerHTML = Object.keys(ENGINES).map(k =>
    '<button data-eng="' + k + '" class="' + (SET.searchEngine === k ? 'on' : '') + '">' + esc(ENGINES[k].name) + '</button>').join('');
  $('#set-eng-custom').hidden = SET.searchEngine !== 'custom';
  $('#set-eng-url').value = SET.customSearchUrl || '';
  if (setTint) { setTint.value = Number(SET.glassTint) || 70; paintRng(setTint); tintV.textContent = setTint.value + '%'; }
  if (setBlur) { setBlur.value = Number(SET.glassBlur) || 10; paintRng(setBlur); blurV.textContent = setBlur.value + 'px'; }
  applyIdentity();
  applyGlass();
}

async function saveLocation() {
  if (!SET) return;
  SET = await api.settingsSet({ location: $('#set-loc').value.trim() });
  $('#set-loc-note').textContent = 'looking up...';
  const w = await loadWeather();
  $('#set-loc-note').textContent = w.error ? w.error : 'showing ' + w.place;
}
$('#set-loc-save').onclick = saveLocation;
$('#set-loc').addEventListener('keydown', e => { if (e.key === 'Enter') saveLocation(); });

async function saveName() {
  if (!SET) return;
  SET = await api.settingsSet({ username: $('#set-name').value.trim() });
  applyIdentity();
}
$('#set-name-save').onclick = saveName;
$('#set-name').addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
$('#set-eng').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-eng]');
  if (!b || !SET) return;
  SET = await api.settingsSet({ searchEngine: b.dataset.eng });
  syncSettingsUi();
});
$('#set-eng-save').onclick = async () => {
  const v = $('#set-eng-url').value.trim();
  if (!goodTpl(v)) { $('#set-eng-note').textContent = 'needs http(s):// and %s where the query goes'; return; }
  SET = await api.settingsSet({ customSearchUrl: v });
  $('#set-eng-note').textContent = 'saved';
  applyIdentity();
};

$$('[data-u]').forEach(b => b.addEventListener('click', async () => {
  if (!SET) return;
  SET = await api.settingsSet({ units: b.dataset.u });
  syncSettingsUi(); loadWeather();
}));

const FM = { root: null, kids: new Map(), open: new Set(), rows: [], view: 'tree', busy: false, top: [], armed: null };
const BS = String.fromCharCode(92);
const fsz = (n) => { const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (n >= 1024 && i < 4) { n /= 1024; i++; } return (i === 0 ? n : n >= 100 ? Math.round(n) : n.toFixed(1)) + ' ' + u[i]; };
const fnum = (n) => (n || 0).toLocaleString('en-GB');

function fmPane(w) {
  $('#fm-start').hidden = w !== 'start';
  $('#fm-prog').hidden = w !== 'prog';
  $('#fm-view').hidden = w !== 'view';
}
const fmNote = (t) => {
  const n = $('#fm-note');
  if (!n) return;
  n.textContent = t;
  setTimeout(() => { if (n.textContent === t) n.textContent = ''; }, 3500);
};

async function fmStart(msg) {
  FM.root = null; FM.kids.clear(); FM.open.clear();
  fmPane('start');
  let p = { drives: [], places: [] };
  try { p = await api.fmPlaces(); } catch {}
  $('#fm-start').innerHTML = (msg ? '<p class="msg" style="padding:0">' + esc(msg) + '</p>' : '') +
    (p.drives.length ? '<div class="fm-h">drives</div><div class="fm-drives">' + p.drives.map(d =>
      '<button class="fm-drive" data-path="' + esc(d.path) + '"><b>' + esc(d.name) + '</b>' +
      '<div class="fm-bar"><i style="transform:scaleX(' + Math.min(1, d.used / d.size).toFixed(3) + ')"></i></div>' +
      '<span class="mut">' + fsz(d.used) + ' used of ' + fsz(d.size) + '</span></button>').join('') + '</div>' : '') +
    '<div class="fm-h">places</div><div class="fm-places">' + p.places.map(x =>
      '<button class="fm-place" data-path="' + esc(x.path) + '">' + esc(x.name) + '</button>').join('') + '</div>';
}

async function fmLoad(id) { FM.kids.set(id, await api.fmChildren(id)); }

async function fmScan(p) {
  p = (p || '').trim();
  if (!p || FM.busy) return;
  FM.busy = true; FM.root = null; FM.kids.clear(); FM.open.clear();
  $('#fm-path').value = p;
  $('#fm-pt').textContent = 'scanning...'; $('#fm-pc').textContent = '';
  fmPane('prog');
  let r;
  try { r = await api.fmScan(p); } catch { r = { error: 'scan failed' }; }
  FM.busy = false;
  if (r.cancelled) { fmStart(); return; }
  if (r.error) { fmStart(r.error); return; }
  FM.root = r; FM.top = r.top || [];
  FM.open = new Set([r.id]);
  await fmLoad(r.id);
  fmPane('view');
  fmRender();
}

function fmFlat(id, depth, out) {
  const d = FM.kids.get(id);
  if (!d) return;
  for (const r of d.rows) {
    out.push({ ...r, depth, psize: d.size });
    if (r.dir && FM.open.has(r.id)) fmFlat(r.id, depth + 1, out);
  }
}

function fmRow(r, i) {
  const pct = r.psize ? Math.min(1, r.size / r.psize) : 0;
  const sub = r.sub ? '<small>' + esc(r.path.slice(0, Math.max(0, r.path.length - r.name.length - 1))) + '</small>' : '';
  const car = r.dir ? (FM.open.has(r.id) ? '▾' : '▸') : '';
  return '<div class="fm-r' + (r.dir ? ' dir' : '') + (r.other ? ' dim' : '') + '" data-i="' + i + '" style="--d:' + (r.depth || 0) + '">' +
    '<div class="fm-n"><b class="car">' + car + '</b><span>' + esc(r.name) + '</span>' + sub + '</div>' +
    '<div class="fm-pct"><div class="fm-bar"><i style="transform:scaleX(' + pct.toFixed(4) + ')"></i></div><em>' + (pct * 100).toFixed(pct < 0.1 ? 1 : 0) + '%</em></div>' +
    '<span class="v">' + fsz(r.size) + '</span><span class="v mut">' + (r.files != null ? fnum(r.files) : '') + '</span>' +
    '<div class="fm-a">' + (r.other ? '' : '<button data-a="reveal" title="Show in file manager">show</button><button data-a="open" title="Open">open</button><button data-a="trash" title="Move to recycle bin">bin</button>') + '</div></div>';
}

function fmRender() {
  const r0 = FM.root;
  if (!r0) return;
  const list = $('#fm-list'), keep = list.scrollTop;
  $('#fm-sum').innerHTML = '<b>' + esc(r0.name) + '</b><span>' + fsz(r0.size) + '</span><span class="mut">' + fnum(r0.files) + ' files · ' + fnum(r0.dirs) + ' folders' +
    (r0.errors ? ' · ' + fnum(r0.errors) + ' unreadable' : '') + '</span><span class="mut" id="fm-note"></span>';
  const rows = [];
  if (FM.view === 'top') FM.top.forEach(t => rows.push({ name: t.name, path: t.path, size: t.size, dir: false, depth: 0, psize: r0.size, sub: true }));
  else fmFlat(r0.id, 0, rows);
  FM.rows = rows;
  list.innerHTML = rows.map(fmRow).join('') || '<p class="msg">empty</p>';
  list.scrollTop = keep;
}

async function fmToggle(r) {
  if (FM.open.has(r.id)) FM.open.delete(r.id);
  else { FM.open.add(r.id); if (!FM.kids.has(r.id)) await fmLoad(r.id); }
  fmRender();
}

async function fmDoRemove(r, permanent) {
  const res = await (permanent ? api.fmDelete(r.path) : api.fmTrash(r.path));
  if (!res || !res.ok) { fmNote((res && res.error) || 'failed'); return; }
  Object.assign(FM.root, { size: res.size, files: res.files, dirs: res.dirs });
  FM.top = FM.top.filter(t => t.path !== r.path && !(t.path.startsWith(r.path) && (t.path[r.path.length] === '/' || t.path[r.path.length] === BS)));
  await Promise.all([...FM.open].map(fmLoad));
  fmRender();
  fmNote(permanent ? 'deleted' : 'moved to recycle bin');
}

$('#fm-list').addEventListener('click', async (e) => {
  const row = e.target.closest('.fm-r');
  if (!row) return;
  const r = FM.rows[Number(row.dataset.i)];
  if (!r) return;
  const a = e.target.closest('[data-a]');
  if (!a) { if (r.dir) await fmToggle(r); return; }
  const act = a.dataset.a;
  if (act === 'reveal') { api.fmReveal(r.path); return; }
  if (act === 'open') { api.fmOpen(r.path); return; }
  if (FM.armed !== r.path) {
    FM.armed = r.path; a.textContent = 'sure?'; a.classList.add('arm');
    setTimeout(() => { if (FM.armed === r.path) { FM.armed = null; a.textContent = 'bin'; a.classList.remove('arm'); } }, 3000);
    return;
  }
  FM.armed = null;
  fmDoRemove(r, false);
});

const ctxEl = $('#ctx'), propsEl = $('#props');
function ctxClose() { ctxEl.hidden = true; ctxEl.innerHTML = ''; $$('.fm-r.sel').forEach(x => x.classList.remove('sel')); }
function propsClose() { propsEl.hidden = true; }
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.ctx')) ctxClose();
  if (!e.target.closest('.props')) propsClose();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { ctxClose(); propsClose(); } });
window.addEventListener('blur', ctxClose);
$('#fm-list').addEventListener('scroll', ctxClose);

function ctxShow(x, y, items) {
  ctxEl.innerHTML = '';
  for (const it of items) {
    if (it === '-') { ctxEl.appendChild(document.createElement('hr')); continue; }
    const b = document.createElement('button');
    b.innerHTML = '<span>' + esc(it.label) + '</span>';
    if (it.danger) b.classList.add('dng');
    b.onclick = () => {
      if (it.confirm && !b.classList.contains('arm')) { b.classList.add('arm'); b.firstChild.textContent = it.confirm; return; }
      ctxClose(); it.run();
    };
    ctxEl.appendChild(b);
  }
  ctxEl.hidden = false;
  const w = ctxEl.offsetWidth, h = ctxEl.offsetHeight;
  ctxEl.style.left = Math.max(4, Math.min(x, innerWidth - w - 4)) + 'px';
  ctxEl.style.top = Math.max(4, Math.min(y, innerHeight - h - 4)) + 'px';
}

async function fmProps(r) {
  let s = null;
  try { s = await api.fmStat(r.path); } catch {}
  const rows = [['name', r.name], ['path', r.path], ['type', r.dir ? 'folder' : 'file'], ['size', fsz(r.size) + ' (' + fnum(r.size) + ' bytes)']];
  if (r.dir) rows.push(['contains', fnum(r.files) + ' files']);
  if (FM.root && FM.root.size) rows.push(['of scan', (r.size / FM.root.size * 100).toFixed(1) + '%']);
  if (s && !s.error) rows.push(['created', new Date(s.birthtimeMs).toLocaleString('en-GB')], ['modified', new Date(s.mtimeMs).toLocaleString('en-GB')]);
  propsEl.innerHTML = '<div class="pr-t">properties</div>' + rows.map(p => '<div class="pr-r"><span class="mut">' + p[0] + '</span><span>' + esc(p[1]) + '</span></div>').join('');
  propsEl.hidden = false;
}

$('#fm-list').addEventListener('contextmenu', (e) => {
  const row = e.target.closest('.fm-r');
  if (!row) return;
  e.preventDefault();
  const r = FM.rows[Number(row.dataset.i)];
  if (!r || r.other) return;
  ctxClose();
  row.classList.add('sel');
  const items = [{ label: 'Open', run: () => api.fmOpen(r.path) }];
  if (r.dir) items.push(
    { label: FM.open.has(r.id) ? 'Collapse' : 'Expand', run: () => fmToggle(r) },
    { label: 'Scan this folder', run: () => fmScan(r.path) });
  items.push(
    { label: 'Show in file manager', run: () => api.fmReveal(r.path) }, '-',
    { label: 'Copy path', run: () => api.fmCopy(r.path) },
    { label: 'Copy name', run: () => api.fmCopy(r.name) }, '-',
    { label: 'Properties', run: () => fmProps(r) }, '-',
    { label: 'Move to Recycle Bin', danger: true, run: () => fmDoRemove(r, false) },
    { label: 'Delete permanently', danger: true, confirm: 'Click again to delete forever', run: () => fmDoRemove(r, true) });
  ctxShow(e.clientX, e.clientY, items);
});

$('#fm-start').addEventListener('click', (e) => {
  const b = e.target.closest('[data-path]');
  if (b) fmScan(b.dataset.path);
});
$('#fm-scan').onclick = () => fmScan($('#fm-path').value);
$('#fm-path').addEventListener('keydown', (e) => { if (e.key === 'Enter') fmScan(e.target.value); });
$('#fm-home').onclick = () => { if (!FM.busy) fmStart(); };
$('#fm-cancel').onclick = () => api.fmCancel();
$$('[data-fv]').forEach(b => b.addEventListener('click', () => {
  FM.view = b.dataset.fv;
  $$('[data-fv]').forEach(x => x.classList.toggle('on', x === b));
  fmRender();
}));
api.onFmProgress((p) => {
  if (!FM.busy) return;
  $('#fm-pt').textContent = fnum(p.files) + ' files · ' + fsz(p.bytes);
  $('#fm-pc').textContent = p.cur;
});

(async () => { SET = await api.settingsGet(); syncSettingsUi(); loadWeather(); })();

show('home');
pollSpotify();
pollStats();
skyRender(); loadAurora(); loadCalendar(); dlPoll(); clipLoad();
</script>
</body>
</html>
`;