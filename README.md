# Mumbai Approach

A dependency-free HTML/canvas approach-control game centered on VABB Mumbai. Run `npm start`, then open port 3000 in your browser. Run simulation checks with `npm test`.

The radar starts at 125% zoom and includes 24 gameplay waypoints for entry, downwind and final-approach routing. The radar fills the screen; use Traffic to open the optional traffic panel. Left click and drag to pan the map (including while plotting a route). Scroll over the map to zoom around your cursor, use + / − for zoom steps, or click the percentage to reset the view.

Choose easy, medium or hard traffic. Arrivals are yellow, departures blue, and aircraft transferred to tower green. Left click an aircraft, click fixes or arbitrary radar positions, and double click the last point to commit the route. Escape cancels. Right click an aircraft to assign altitude/speed using dropdowns or the mouse wheel; unrestricted restores its default profile. Click outside to dismiss controls.

For runway 27, vector arrivals east of VABB across the dashed localiser, at or below 4,000 ft, between 2 and 25 NM out, with an intercept angle of 60° or less. Issue an ILS clearance before intercept. Once established, the aircraft automatically follows the localiser, descends and slows; right click to transfer to tower. Localiser-only clearance captures heading; altitude and speed remain under your control until ILS is cleared. Departures climb and leave the sector. Maintain either 3 NM lateral or 1,000 ft vertical separation; alerts flag losses. Time controls offer pause and 1×/2×/4× rates.

Airline identifiers (IGO, AIC, AKJ, UAE, ETD, QTR, AXB, SVA) and aircraft types represent real operators. Flight numbers are generated. Performance, geography, fixes, frequencies and procedures are simplified or representative, not current operational data. For entertainment only; not for navigation or controller training. No API keys, backend services or external runtime dependencies are required. Optional Google Fonts fall back to local fonts when offline.

## Sequencing, labels and weather

The collapsible **Final sequence** card orders aircraft established on runway 27 by distance to the threshold, including flights handed to tower. It shows distance remaining, estimated time to touchdown (MM:SS), and spacing behind the preceding aircraft. Gaps below 3 NM turn red; the same spacing appears on the localiser. Click a sequence row to highlight the flight. ILS estimates project staged speed changes; localiser-only estimates are approximate and marked `~`. These are estimates, not landing clearances or wake-turbulence calculations.

Aircraft data blocks show callsign/type, current → assigned altitude in hundreds of feet, current → assigned speed in knots, heading/next waypoint and clearance status. `UNR` means unrestricted, `GS` means automatic ILS descent, `CLR` means cleared, `EST` means established and `TWR` means transferred. Right click either the symbol or its label for controls.

Two, three or four simulated storm cells appear at easy, medium or hard workload. Amber/red echoes mark each cell and a dashed ring marks a simplified 3 NM avoidance buffer. Cells drift with simulation time and pause with the game. Aircraft in the buffer receive a proximity warning; penetration of a cell flags a red storm-core warning and logs the event. Vector around the cells; storms do not automatically change aircraft routes. This is fictional weather with simplified avoidance distances, not live meteorological data.
