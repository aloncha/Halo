Sugar Plant 3D Conceptual AutoLISP Model
========================================

Files
-----
1. sugar_plant_3d.lsp
   Main AutoLISP script that generates a conceptual 3D sugar process plant.
2. README.txt
   Usage and customization instructions.

Purpose
-------
The script creates an editable conceptual 3D model for AutoCAD or AutoCAD Plant 3D.
It does not create intelligent Plant 3D equipment or pipe objects. It creates simple
AutoCAD 3D solids and text labels using commands such as CYLINDER, BOX, and CONE.

Units
-----
The model uses meters. The script sets INSUNITS to 6 (meters).

How to Run in AutoCAD / AutoCAD Plant 3D
----------------------------------------
1. Open AutoCAD or AutoCAD Plant 3D.
2. Open or create a DWG file.
3. Run APPLOAD.
4. Browse to and load sugar_plant_3d.lsp.
5. At the command line, run:

   SUGARPLANT3D

6. The script will generate the plant model and zoom to extents.

Generated Layers
----------------
- EQUIPMENT: tanks, vessels, crystallizers, centrifuges, dryers, coolers, boiler,
  condenser, and condensate tanks.
- PIPING: reserved for general piping.
- LABEL: equipment labels, process labels, and area labels.
- SUPPORT: simple support blocks under equipment.
- PRODUCT_FLOW: sugar process and molasses flow piping.
- STEAM_CONDENSATE: steam, vapor, and condensate piping.

Main Equipment Included
-----------------------
- TK-301, TK-302, TK-303: vertical tanks, diameter 2 m, height 4 m.
- CR-301, CR-302, CR-303: vertical crystallizer vessels, diameter 2.5 m,
  height 4 m with simple conical tops.
- CF-301, CF-302, CF-303: horizontal centrifuge cylinders, diameter 1.5 m,
  length 2 m.
- DR-301, DR-302, DR-303: horizontal dryer cylinders, diameter 1.2 m,
  length 3 m.
- CL-301, CL-302, CL-303: horizontal cooler cylinders, diameter 1.2 m,
  length 3 m.

BFD Equipment Included
----------------------
- Boiler.
- Condenser.
- Tank Kondensat.
- Tank Pembuangan Kondensat.
- Tank Buffer.
- Proses Pencampuran.
- Proses Pengendapan.
- Evaporator I with 110-120 C label.
- Evaporator II with 85-95 C label.
- Evaporator III with 65-75 C label.
- Final Molasses Tank.
- Intermediate Tank 1 and Intermediate Tank 2 between evaporator stages.

Piping / Flow Included
----------------------
The script creates solid cylindrical pipe segments with a default diameter of 0.20 m
at about z = 2 m for process flow. Major routes include:

- Nira Inlet, Ca(OH)2, and SO2 to Proses Pencampuran.
- Proses Pencampuran to Tank Buffer to Proses Pengendapan.
- Proses Pengendapan to Evaporator I, Intermediate Tank 1, Evaporator II,
  Intermediate Tank 2, Evaporator III, TK-301, CR-301, and CF-301.
- CF-301 to DR-301 to CL-301 to Grade Sugar A.
- CF-301 to TK-302 to CR-302 to CF-302 as Molasses A.
- CF-302 to DR-302 to CL-302 to Grade Sugar B.
- CF-302 to TK-303 to CR-303 to CF-303 as Molasses B.
- CF-303 to DR-303 to CL-303 to Grade Sugar C.
- CF-303 to Final Molasses Tank.
- Boiler to evaporator train as steam.
- Evaporator III to Condenser, Tank Kondensat, and Tank Pembuangan Kondensat.

Layout
------
The model is arranged from left to right:
- Pretreatment area: approximately x = 0 to 25.
- Evaporator area: approximately x = 30 to 58.
- Crystallization area: approximately x = 60 to 104.

Crystallization trains are arranged by y-coordinate:
- A line: y = 0.
- B line: y = -10.
- C line: y = -20.

Customization Notes
-------------------
Open sugar_plant_3d.lsp in a text editor to modify dimensions or coordinates.
Useful values near the start of c:SUGARPLANT3D are:

- pipe-d: default pipe diameter, currently 0.20 m.
- zpipe: process pipe elevation, currently 2.00 m.
- zhc: horizontal equipment center elevation, currently 1.10 m.

Common functions to edit or reuse:

- create-layer: creates and colors AutoCAD layers.
- make-vertical-tank: creates vertical cylindrical tanks.
- make-vessel-with-cone: creates process vessels and crystallizers with conical tops.
- make-horizontal-cylinder: creates centrifuges, dryers, coolers, and exchangers.
- make-box-equipment: creates box equipment such as the boiler.
- make-pipe: creates multi-segment solid cylindrical pipe routes.
- make-label: creates text labels.
- make-support: creates simple support blocks.

Important Limitations
---------------------
- The model is conceptual and based on assumed dimensions because the referenced PDFs
  do not provide complete equipment sizing.
- Piping is represented as simple 3D cylinders, not intelligent Plant 3D pipe objects.
- Labels are ordinary AutoCAD text entities.
- Nozzles, valves, instruments, insulation, steel structures, and detailed supports
  are not modeled.

Recommended Next Steps
----------------------
1. Run the script in a blank DWG and save the result as a concept model.
2. Adjust equipment coordinates and dimensions in sugar_plant_3d.lsp as needed.
3. Convert or redraw selected objects as intelligent Plant 3D equipment/piping if a
   detailed Plant 3D model is required later.
4. Add valves, pumps, instruments, and pipe supports based on project standards.
