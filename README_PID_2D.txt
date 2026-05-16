README_PID_2D.txt
P&ID 2D - Crystallization B/C and Final Molasses Area (Area 302-319)

Files
- crystallization_area_pid_2d.lsp: AutoLISP script that draws the complete conceptual 2D P&ID in model space. The revised script avoids unsafe `(command ...)` calls by using entity creation/table edits and limited `vl-cmdf` calls for AutoCAD-safe operations.
- README_PID_2D.txt: usage notes, lists, assumptions, and references.

1. How to run the script
1) Open AutoCAD Plant 3D 2025 or AutoCAD.
2) Run APPLOAD.
3) Load crystallization_area_pid_2d.lsp.
4) Run command: PIDCRYSTAL2D.
5) The script automatically creates a compact P&ID layout, refreshes reusable 2D block definitions, draws visible process/utility/signal lines, fills line and operating-condition tables, and creates a simple ISO A1 landscape border/title block. If an error occurs, a simple error handler restores CMDECHO/OSMODE and prints a PIDCRYSTAL2D-specific message.

Important limitations
- This is a conceptual educational 2D P&ID drawing.
- It is not a 3D model.
- It does not use CYLINDER, BOX, CONE, SPHERE, 3D solids, or 3D modeling commands.
- It creates manual 2D AutoCAD geometry and reusable block symbols using common 2D entities such as LINE, LWPOLYLINE, CIRCLE, ARC, TEXT, MTEXT, BLOCK, and INSERT.
- The output is not an intelligent AutoCAD Plant 3D database object unless Plant 3D object creation is explicitly added later through supported Plant 3D APIs/workflows.

2. Equipment list
- TK-302: Molasses A Tank, vertical tank, A Molasses Receiver. T = 60 degC assumed, atmospheric/vented, level control required.
- CR-302: Vacuum Crystallizer B, vacuum pan/crystallizer vessel, B Massecuite Crystallization. T = 61-64 degC, P = 0.235-0.25 bar abs, vacuum approx -0.76 to -0.78 bar(g), Brix control approx 88.5 Brix, final tightening approx 93.8 Brix.
- CF-302: Centrifuge B, separator, separates Wet Sugar B and Molasses B.
- DR-302: Dryer B, rotary/sugar dryer, Wet Sugar B Drying. Dryer outlet temperature and moisture are placeholders / verify with plant data.
- CL-302: Cooler B, sugar cooler, Dry Sugar B Cooling. Sugar outlet T = 30-35 degC.
- TK-303: Molasses B Tank, vertical tank, B Molasses Receiver. T = 60-70 degC assumed, atmospheric/vented, level control required.
- CR-303: Vacuum Crystallizer C, vacuum pan/crystallizer vessel, C Massecuite Crystallization. T = 60-67 degC assumed, P = 0.12-0.13 bar abs, vacuum approx -0.88 to -0.89 bar(g), final Brix target = 97.0 Brix placeholder / verify with plant data.
- CF-303: Centrifuge C, separator, separates Wet Sugar C and Final Molasses.
- DR-303: Dryer C, rotary/sugar dryer, Wet Sugar C Drying. Dryer outlet temperature and moisture are placeholders / verify with plant data.
- CL-303: Cooler C, sugar cooler, Dry Sugar C Cooling. Sugar outlet T = 30-35 degC.
- TK-304: Final Molasses Tank, vertical storage tank, Final Molasses Storage. T = 50-60 degC assumed, atmospheric/vented, level control required.

3. Line list S-309 to S-320
- S-309: CF-301 to TK-302, Molasses A, liquid, 60 degC, atmospheric, from upstream centrifuge.
- S-310: TK-302 to CR-302, Molasses A Feed, liquid, 60 degC, 0.235-0.25 bar abs, feed to B crystallizer.
- S-311: CR-302 to CF-302, Massecuite B, slurry, 61-64 degC, 0.235-0.25 bar abs.
- S-312: CF-302 to DR-302, Wet Sugar B, solid/liquid, 60-70 degC assumed, atmospheric, to dryer.
- S-313: DR-302 to CL-302, Dry Sugar B, solid, T = ___ degC, atmospheric, dryer outlet to be verified.
- S-314: CL-302 to outlet, Grade Sugar B, solid, 30-35 degC, atmospheric, product.
- S-315: CF-302 to TK-303, Molasses B, liquid, 60-70 degC assumed, atmospheric, to C stage.
- S-316: TK-303 to CR-303, Molasses B Feed, liquid, 60-70 degC assumed, 0.12-0.13 bar abs, feed to C crystallizer.
- S-317: CR-303 to CF-303, Massecuite C, slurry, 60-67 degC assumed, 0.12-0.13 bar abs.
- S-318: CF-303 to DR-303, Wet Sugar C, solid/liquid, 60-70 degC assumed, atmospheric, to dryer.
- S-319: DR-303 / CL-303 to outlet, Dry Sugar C / Grade Sugar C, solid, 30-35 degC after cooler, atmospheric, product.
- S-320: CF-303 to TK-304 and final outlet, Final Molasses, liquid, 50-60 degC assumed, atmospheric, final by-product.

4. Instrument list
Tank level instruments:
- TK-302: LI-302, LT-302, LIC-302, LSH-302, LSL-302.
- TK-303: LI-303, LT-303, LIC-303, LSH-303, LSL-303.
- TK-304: LI-304, LT-304, LIC-304, LSH-304, LSL-304.

Crystallizer pressure/vacuum instruments:
- CR-302: PI-302, PT-302, PIC-302.
- CR-303: PI-303, PT-303, PIC-303.
- Pressure is shown as absolute pressure. Vacuum service operates below atmospheric pressure.

Temperature instruments:
- CR-302: TI-302, TT-302, TIC-302.
- CR-303: TI-303, TT-303, TIC-303.
- DR-302: TI-312, TT-312.
- CL-302: TI-313.
- DR-303: TI-318, TT-318.
- CL-303: TI-319.

Brix / concentration analysis instruments:
- CR-302: AI-302B, AT-302B, AIC-302B.
- CR-303: AI-303B, AT-303B, AIC-303B.
- Brix is represented as analysis/concentration measurement in ISA 5.1-style tagging. BI/BT/BIC are intentionally not used.

Centrifuge status and motor current:
- CF-302: XI-302 running/status indicator, II-302 motor current indicator.
- CF-303: XI-303 running/status indicator, II-303 motor current indicator.
- AI is intentionally not used for ampere/current indicator to avoid conflict with Analysis Indicator.

5. Valve list
Manual block valves:
- HV-302A before TK-302 inlet.
- HV-302B at TK-302 outlet.
- HV-302C at CR-302 outlet.
- HV-303A before TK-303 inlet.
- HV-303B at TK-303 outlet.
- HV-303C at CR-303 outlet.
- HV-304A before TK-304 inlet.
- HV-304B at TK-304 outlet.

Control valve stations:
- FCV-302 on feed line to CR-302.
- PCV-302 on CR-302 vapor/vacuum line.
- TCV-302 on CR-302 steam/heating vapor line.
- FCV-303 on feed line to CR-303.
- PCV-303 on CR-303 vapor/vacuum line.
- TCV-303 on CR-303 steam/heating vapor line.
- LCV-304 on TK-304 outlet/final molasses line.

Drain, vent, sample, and safety valves/devices:
- DV-302, DV-303, DV-304 at tank low points.
- Additional drains at CR-302 and CR-303 low points.
- VV-302 and VV-303 at crystallizer top/vacuum lines.
- VV-304 at TK-304 vent.
- PSV/Vacuum Breaker protection at CR-302 and CR-303.
- PSV/VV-304 at Final Molasses Tank vent.
- SP-302 on Molasses A line, SP-303 on Molasses B line, SP-304 on Final Molasses line.

6. Control loop list
- TK-302 level / feed: LT-302 -> LIC-302 -> FCV-302/LCV function on TK-302 outlet to CR-302.
- CR-302 feed flow: FT-302 -> FIC-302 -> FCV-302.
- CR-302 vacuum/pressure: PT-302 -> PIC-302 -> PCV-302.
- CR-302 temperature: TT-302 -> TIC-302 -> TCV-302.
- CR-302 Brix: AT-302B -> AIC-302B, with conceptual supervisory setpoint trim to FIC-302. Brix target shown as 88.5 to 93.8 Brix.
- TK-303 level / feed: LT-303 -> LIC-303 -> FCV-303/LCV function on TK-303 outlet to CR-303.
- CR-303 feed flow: FT-303 -> FIC-303 -> FCV-303.
- CR-303 vacuum/pressure: PT-303 -> PIC-303 -> PCV-303.
- CR-303 temperature: TT-303 -> TIC-303 -> TCV-303.
- CR-303 Brix: AT-303B -> AIC-303B, with conceptual supervisory setpoint trim to FIC-303. Final C-pan target shown as 97.0 Brix placeholder / verify with plant data.
- TK-304 final molasses tank level: LT-304 -> LIC-304 -> LCV-304. If converted to on/off duty later, XV-320 can be substituted.

7. Layer explanation
- PID_EQUIPMENT: black equipment outlines, lineweight about 0.30 mm.
- PID_PROCESS_LINE: blue/black main process lines, lineweight about 0.35 mm.
- PID_UTILITY_LINE: cyan/green dashed utility, vapor, vacuum, condensate, air/cooling lines, lineweight about 0.25 mm.
- PID_INSTRUMENT: magenta instrument bubbles and tags, lineweight about 0.18 mm.
- PID_SIGNAL: thin dashed instrument/control signal lines, lineweight about 0.18 mm.
- PID_VALVE: red valve symbols and valve tags.
- PID_TEXT: black annotation text.
- PID_TITLE_BLOCK: grey border/title block.
- PID_BOUNDARY: grey battery limit and off-page connector layer.
- PID_TABLE: line/equipment/instrument/valve/legend/reference tables.
- PID_SAFETY: orange/red safety, drain, vent, sample, PSV, and vacuum breaker symbols.

8. Symbol explanation
Reusable 2D blocks created by the script:
- BLK_PID_VERTICAL_TANK: vertical tank symbol.
- BLK_PID_VACUUM_CRYSTALLIZER: vacuum pan/crystallizer vessel symbol with top connection.
- BLK_PID_CENTRIFUGE: centrifuge/separator symbol.
- BLK_PID_DRYER: rotary/sugar dryer symbol.
- BLK_PID_COOLER: sugar cooler/heat exchanger cooler symbol.
- BLK_PID_MANUAL_VALVE: manual block valve.
- BLK_PID_CONTROL_VALVE: control valve with actuator/bubble.
- BLK_PID_CHECK_VALVE: check valve block is available for optional future pump outlet use.
- BLK_PID_INSTRUMENT_BUBBLE: ISA-style instrument bubble.
- BLK_PID_OFFPAGE_CONNECTOR: off-page connector.
- BLK_PID_FLOW_ARROW: process flow arrow.
- BLK_PID_SAMPLE_POINT: sample point.
- BLK_PID_DRAIN: drain point.
- BLK_PID_VENT: vent point.
- BLK_PID_PSV: pressure safety/relief symbol.
- BLK_PID_VACUUM_BREAKER: vacuum breaker symbol.

9. Operating condition assumption statement
All T, P, vacuum, and Brix values are literature-based assumed operating conditions for a conceptual educational P&ID. They are not final design values. Every such value must be verified with actual plant/process data before engineering design, procurement, construction, or operation.

10. Native Plant 3D intelligence statement
The generated drawing is intended to be opened in AutoCAD Plant 3D 2025 and visually follows AutoCAD Plant 3D P&ID ISO-style conventions, ISA 5.1-style instrument tagging, and ISO 10628-style process representation. However, the script creates manual 2D geometry/blocks and does not create Plant 3D intelligent P&ID database objects, line groups, spec-driven components, or data-manager records.

11. Sources / reference basis named for this conceptual drawing
- John G. Ziegler, Sugar Boiling: The Syrups in the Vacuum Pans.
- Overview of crystallization in vacuum pans in the Colombian sugar industry.
- SASTA paper about strategies to optimise continuous pan performance.
- BMA reference about drying and cooling sugar.
- ISA 5.1 instrumentation symbols and identification.
- ISO 10628 process plant flow diagram representation.
- AutoCAD Plant 3D P&ID ISO-style symbol/palette behavior.
