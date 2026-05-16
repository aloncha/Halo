README_PID_GRADE_B.txt
P&ID - Grade Sugar B Crystallization Area

How to run
1. Open AutoCAD Plant 3D 2025 or AutoCAD.
2. Run APPLOAD.
3. Load pid_grade_b_302.lsp.
4. Run command PIDGRADEB.

Scope
- Grade B crystallization with Molasses B off-page to Grade C.
- Drawing No: PID-302-B.
- Equipment included: TK-302, CR-302, CF-302, DR-302, CL-302.
- Lines included: S-309 to S-315.

Drawing contents
- Equipment symbols, process lines with flow arrows, utility lines, valves, instrument bubbles, dashed signal/control loops, off-page connectors, title block, legend, equipment list, line list, instrument list, valve list, and operating condition notes.
- Tables are intentionally compact and filled only with rows relevant to this drawing.
- The drawing uses manual 2D symbols in an AutoCAD Plant 3D P&ID ISO-style / ISO 10628-style representation with ISA 5.1-style instrument tags.

Limitations
- 2D P&ID only; no 3D model is created.
- The script does not create native intelligent Plant 3D database objects.
- Do not treat assumed operating values as final design values.

Operating condition basis
- Vacuum pan general range: T = 65-85°C; P = 4-9 inHg abs ≈ 0.135-0.305 bar abs.
- CR-301: T = 65-85°C assumed; P = 0.135-0.305 bar abs assumed; Brix target placeholder / verify.
- CR-302: T = 61-64°C; P = 0.235-0.25 bar abs; vacuum ≈ -0.76 to -0.78 bar(g); Brix = 88.5-93.8.
- CR-303: T = 60-67°C assumed; P = 0.12-0.13 bar abs; vacuum ≈ -0.88 to -0.89 bar(g); Brix target = 97.0 placeholder.
- Sugar cooler outlet: T = 30-35°C.
- Final molasses tank: T = 50-60°C assumed; P = atmospheric / vented.

General note
This P&ID is a conceptual educational drawing. Instrumentation tagging follows ISA 5.1-style conventions. Equipment and line symbols follow AutoCAD Plant 3D P&ID ISO-style / ISO 10628-style representation. Operating values are literature-based assumptions and must be verified with actual plant/process data.

References
- John G. Ziegler, Sugar Boiling: The Syrups in the Vacuum Pans.
- Overview of crystallization in vacuum pans in the Colombian sugar industry.
- SASTA paper about strategies to optimise continuous pan performance.
- BMA reference about drying and cooling sugar.
- ISA 5.1 instrumentation symbols and identification.
- ISO 10628 process plant flow diagram representation.
- AutoCAD Plant 3D P&ID ISO-style symbol/palette behavior.
