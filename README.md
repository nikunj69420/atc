# Mumbai Approach

A dependency-free HTML/canvas approach-control game centered on VABB Mumbai. Run `npm start`, then open port 3000 in your browser. Run simulation checks with `npm test`.

The radar starts at 125% zoom and includes 28 gameplay waypoints for entry, downwind and final-approach routing. The radar fills the screen; use Traffic to open the optional traffic panel. Left click and drag to pan the map (including while plotting a route). Scroll over the map to zoom around your cursor, use + / − for zoom steps, or click the percentage to reset the view.

Choose easy, medium or hard traffic. Arrivals are yellow, departures blue, and aircraft transferred to tower green. Left click an aircraft, click fixes or arbitrary radar positions, and double click the last point to commit the route. Escape cancels. Right click an aircraft to assign altitude/speed using dropdowns or the mouse wheel; unrestricted restores its default profile. Click outside to dismiss controls.

For runway 27, vector arrivals east of VABB across the dashed localiser, at or below 4,000 ft, between 2 and 25 NM out, with an intercept angle of 60° or less. Issue an ILS clearance before intercept. Once established, the aircraft automatically follows the localiser, descends and slows; right click to transfer to tower. Localiser-only clearance captures heading; altitude and speed remain under your control until ILS is cleared. Departures climb and leave the sector. Maintain either 3 NM lateral or 1,000 ft vertical separation; alerts flag losses. Time controls offer pause and 1×/2×/4× rates.

Airline identifiers (IGO, AIC, AKJ, UAE, ETD, QTR, AXB, SVA) and aircraft types represent real operators. Flight numbers are generated. Performance, geography, fixes, frequencies and procedures are simplified or representative, not current operational data. For entertainment only; not for navigation or controller training. No API keys, backend services or external runtime dependencies are required. Optional Google Fonts fall back to local fonts when offline.

## Sequencing, labels and weather

The collapsible **Final sequence** card orders aircraft established on runway 27 by distance to the threshold, including flights handed to tower. It shows distance remaining, estimated time to touchdown (MM:SS), and spacing behind the preceding aircraft. Gaps below 3 NM turn red; the same spacing appears on the localiser. Click a sequence row to highlight the flight. ILS estimates project staged speed changes; localiser-only estimates are approximate and marked `~`. These are estimates, not landing clearances or wake-turbulence calculations.

Aircraft labels use the compact two-line layout: callsign/type, then current altitude in hundreds of feet, speed in knots and approach/handoff status. `CLR` means cleared, `EST` means established and `TWR` means transferred. Right click either the symbol or its label for altitude/speed assignments and clearances.

Two, three or four simulated storm cells appear at easy, medium or hard workload. Amber/red echoes mark each cell and a dashed ring marks a simplified 3 NM avoidance buffer. Cells drift with simulation time and pause with the game. Aircraft in the buffer receive a proximity warning; penetration of a cell flags a red storm-core warning and logs the event. Vector around the cells; storms do not automatically change aircraft routes. This is fictional weather with simplified avoidance distances, not live meteorological data.

## SIDs and STARs

Open **SID / STAR** in the header, or right click an aircraft and choose **ASSIGN STAR/SID**. Pick a route, preview it on the radar, choose a joining waypoint and clear the selected aircraft. Clicking an aircraft while the procedure panel is open selects it without starting vector plotting. The panel suggests a nearby joining point; select an earlier point to fly the full route. Arrivals accept STARs and departures accept SIDs. Assigned routes remain visible when their aircraft is selected. The controller log and bottom status line show assignment and progress; compact aircraft labels stay unchanged.

Four runway 27 STARs are available: **BETEL 1A**, **GAMMA 1A**, **DOLSI 1A** and **ARION 1A**. Three SIDs are available: **ALFA 1D**, **CORAL 1D** and **FALCO 1D**. These routes and their profiles are fictional procedures built for this game's simplified Mumbai airspace, not published VABB charts.

By default a procedure assigns lateral navigation only. Enable **Follow climb / descent & speed profile** to fly each leg's displayed altitude and speed target when the corresponding control is unrestricted. Explicit altitude/speed commands take priority; selecting unrestricted resumes the active profile. These are simplified leg targets rather than full crossing restrictions. STAR clearance never grants approach clearance: issue localiser or ILS clearance separately. Manual vector routes or **Cancel active procedure** terminate the procedure; an aircraft leaving an automatic profile holds its current altitude and speed unless already assigned values. Departures leave the sector at its boundary.
