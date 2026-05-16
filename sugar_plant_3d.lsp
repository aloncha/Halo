;;; sugar_plant_3d.lsp
;;; Conceptual 3D sugar process plant generator for AutoCAD / AutoCAD Plant 3D.
;;; Units: meter. Load with APPLOAD, then run command: SUGARPLANT3D
;;;
;;; The model is intentionally made from editable AutoCAD 3D solids and text.
;;; Change the constants in c:SUGARPLANT3D to adjust equipment dimensions,
;;; plant coordinates, and pipe diameter.

(vl-load-com)

;;; ------------------------------------------------------------
;;; Basic helpers
;;; ------------------------------------------------------------
(defun sp3d-pt (x y z)
  "Return a 3D point list."
  (list x y z)
)

(defun sp3d-set-layer (layer-name)
  "Set the current layer. The layer should already exist."
  (setvar "CLAYER" layer-name)
)

(defun create-layer (layer-name color /)
  "Create a layer when it does not exist, then assign a color index."
  (if (not (tblsearch "LAYER" layer-name))
    (command "_.-LAYER" "_Make" layer-name "_Color" color layer-name "")
    (command "_.-LAYER" "_Color" color layer-name "")
  )
)

(defun sp3d-last-ename ()
  "Return the last created entity name."
  (entlast)
)

(defun sp3d-move-last (from-point to-point)
  "Move the most recently created entity."
  (command "_.MOVE" (sp3d-last-ename) "" from-point to-point)
)

(defun sp3d-rotate-last-y (base-point angle-deg)
  "Rotate the most recently created entity around the world Y axis."
  (command "_.ROTATE3D" (sp3d-last-ename) "" "_Y" base-point angle-deg)
)

(defun sp3d-rotate-last-x (base-point angle-deg)
  "Rotate the most recently created entity around the world X axis."
  (command "_.ROTATE3D" (sp3d-last-ename) "" "_X" base-point angle-deg)
)

;;; ------------------------------------------------------------
;;; Model construction functions requested by user
;;; ------------------------------------------------------------
(defun make-label (text insertion height /)
  "Create readable 3D text label on LABEL layer.
   insertion = '(x y z), height is text height in meters."
  (sp3d-set-layer "LABEL")
  (command "_.TEXT" "_Justify" "_MC" insertion height 0 text)
)

(defun make-support (name center width depth height / x y z p1 p2)
  "Create simple box pedestal/support below equipment.
   center = support center point, width/depth/height are in meters."
  (sp3d-set-layer "SUPPORT")
  (setq x (car center)
        y (cadr center)
        z (caddr center)
        p1 (sp3d-pt (- x (/ width 2.0)) (- y (/ depth 2.0)) z)
        p2 (sp3d-pt (+ x (/ width 2.0)) (+ y (/ depth 2.0)) (+ z height)))
  (command "_.BOX" p1 p2)
  (if name (make-label name (sp3d-pt x y (+ z height 0.25)) 0.25))
)

(defun make-vertical-tank (tag center diameter height / radius x y z)
  "Create a vertical cylindrical tank/vessel standing from floor elevation.
   center = '(x y z-base), diameter and height are in meters."
  (sp3d-set-layer "EQUIPMENT")
  (setq radius (/ diameter 2.0)
        x (car center)
        y (cadr center)
        z (caddr center))
  (command "_.CYLINDER" (sp3d-pt x y z) radius height)
  (make-label tag (sp3d-pt x (+ y radius 1.0) (+ z height 0.55)) 0.45)
  (make-support nil (sp3d-pt x y 0.0) (+ diameter 0.4) (+ diameter 0.4) 0.15)
)

(defun make-vessel-with-cone (tag center diameter height cone-height / radius x y z)
  "Create a vertical process vessel/crystallizer with a cone/dome-like top.
   center = '(x y z-base), diameter/height/cone-height are in meters."
  (sp3d-set-layer "EQUIPMENT")
  (setq radius (/ diameter 2.0)
        x (car center)
        y (cadr center)
        z (caddr center))
  (command "_.CYLINDER" (sp3d-pt x y z) radius height)
  (command "_.CONE" (sp3d-pt x y (+ z height)) radius "_Top" 0.15 cone-height)
  (make-label tag (sp3d-pt x (+ y radius 1.0) (+ z height cone-height 0.55)) 0.45)
  (make-support nil (sp3d-pt x y 0.0) (+ diameter 0.5) (+ diameter 0.5) 0.15)
)

(defun make-horizontal-cylinder (tag center diameter length axis / radius x y z)
  "Create a horizontal cylinder for centrifuge, dryer, cooler, or exchanger.
   center = middle of cylinder, diameter/length are in meters.
   axis = 'X or 'Y. Default is along X."
  (sp3d-set-layer "EQUIPMENT")
  (setq radius (/ diameter 2.0)
        x (car center)
        y (cadr center)
        z (caddr center))
  ;; Use CYLINDER Axis endpoint so the solid is born horizontal and editable.
  (if (= axis 'Y)
    (command "_.CYLINDER" (sp3d-pt x (- y (/ length 2.0)) z) radius "_Axis" (sp3d-pt x (+ y (/ length 2.0)) z))
    (command "_.CYLINDER" (sp3d-pt (- x (/ length 2.0)) y z) radius "_Axis" (sp3d-pt (+ x (/ length 2.0)) y z))
  )
  (make-label tag (sp3d-pt x (+ y radius 1.0) (+ z radius 0.75)) 0.4)
  (make-support nil (sp3d-pt x y 0.0) (+ length 0.3) (+ diameter 0.4) (- z radius))
)

(defun make-box-equipment (tag center length width height / x y z p1 p2)
  "Create a rectangular 3D solid equipment block.
   center = plan center at base elevation, dimensions are in meters."
  (sp3d-set-layer "EQUIPMENT")
  (setq x (car center)
        y (cadr center)
        z (caddr center)
        p1 (sp3d-pt (- x (/ length 2.0)) (- y (/ width 2.0)) z)
        p2 (sp3d-pt (+ x (/ length 2.0)) (+ y (/ width 2.0)) (+ z height)))
  (command "_.BOX" p1 p2)
  (make-label tag (sp3d-pt x (+ y (/ width 2.0) 1.0) (+ z height 0.55)) 0.45)
)

(defun make-pipe-segment (p1 p2 diameter layer-name / len radius)
  "Create one straight solid pipe segment between p1 and p2 as a 3D cylinder."
  (sp3d-set-layer layer-name)
  (setq len (distance p1 p2)
        radius (/ diameter 2.0))
  (if (> len 0.0001)
    ;; AutoCAD CYLINDER Axis endpoint makes a true 3D solid between two points.
    (command "_.CYLINDER" p1 radius "_Axis" p2)
  )
)

(defun make-pipe (points diameter layer-name flow-label label-point / p1 p2)
  "Create solid pipe from a list of 3D points. Each leg is a CYLINDER.
   points = '((x y z) ...), diameter in meters.
   layer-name = PIPING, PRODUCT_FLOW, or STEAM_CONDENSATE."
  (if (> (length points) 1)
    (progn
      (setq p1 (car points))
      (foreach p2 (cdr points)
        (make-pipe-segment p1 p2 diameter layer-name)
        (setq p1 p2)
      )
    )
  )
  (if flow-label
    (make-label flow-label label-point 0.28)
  )
)

;;; ------------------------------------------------------------
;;; Main command
;;; ------------------------------------------------------------
(defun c:SUGARPLANT3D (/ pipe-d zpipe zhc)
  "Generate conceptual 3D sugar plant model using editable 3D solids."
  (setq pipe-d 0.20)  ;; Main editable pipe diameter in meters.
  (setq zpipe 2.00)   ;; Pipe routing elevation in meters.
  (setq zhc 1.10)     ;; Horizontal equipment center elevation in meters.

  (setvar "CMDECHO" 0)
  (setvar "INSUNITS" 6) ;; 6 = meters

  ;; Layer setup: edit colors here if desired.
  (create-layer "EQUIPMENT" 3)
  (create-layer "PIPING" 5)
  (create-layer "LABEL" 2)
  (create-layer "SUPPORT" 8)
  (create-layer "PRODUCT_FLOW" 30)
  (create-layer "STEAM_CONDENSATE" 4)

  ;; Optional cleanup prompt-free: generate into current drawing without deleting existing objects.

  ;; ---------------- Pretreatment and utility area: x 0..25 ----------------
  (make-box-equipment "Boiler" (sp3d-pt 3 8 0) 4.0 2.2 2.4)
  (make-vessel-with-cone "Proses Pencampuran" (sp3d-pt 8 0 0) 2.2 3.0 0.6)
  (make-vertical-tank "Tank Buffer" (sp3d-pt 16 0 0) 2.0 3.5)
  (make-vessel-with-cone "Proses Pengendapan" (sp3d-pt 24 0 0) 2.6 3.6 0.6)
  (make-label "Nira Inlet" (sp3d-pt 0 -1.4 2.6) 0.30)
  (make-label "Ca(OH)2" (sp3d-pt 3 3.2 2.6) 0.30)
  (make-label "SO2" (sp3d-pt 3 -3.2 2.6) 0.30)
  (make-label "Blotong" (sp3d-pt 25 -4.0 2.6) 0.30)

  ;; ---------------- Evaporator area: x 30..50 ----------------
  (make-vessel-with-cone "Evaporator I" (sp3d-pt 34 0 0) 2.4 4.5 0.7)
  (make-label "110-120 C" (sp3d-pt 34 -2.4 3.2) 0.30)
  (make-vertical-tank "Intermediate Tank 1" (sp3d-pt 40 0 0) 1.6 3.0)
  (make-vessel-with-cone "Evaporator II" (sp3d-pt 46 0 0) 2.4 4.3 0.7)
  (make-label "85-95 C" (sp3d-pt 46 -2.4 3.2) 0.30)
  (make-vertical-tank "Intermediate Tank 2" (sp3d-pt 52 0 0) 1.6 3.0)
  (make-vessel-with-cone "Evaporator III" (sp3d-pt 58 0 0) 2.4 4.1 0.7)
  (make-label "65-75 C" (sp3d-pt 58 -2.4 3.2) 0.30)
  (make-horizontal-cylinder "Condenser" (sp3d-pt 47 8 zhc) 1.2 4.0 'X)
  (make-vertical-tank "Tank Kondensat" (sp3d-pt 55 8 0) 1.4 2.5)
  (make-vertical-tank "Tank Pembuangan Kondensat" (sp3d-pt 62 8 0) 1.4 2.5)

  ;; ---------------- Crystallization A/B/C area: x 60..100 ----------------
  ;; A line at y=0
  (make-vertical-tank "TK-301" (sp3d-pt 66 0 0) 2.0 4.0)
  (make-vessel-with-cone "CR-301" (sp3d-pt 74 0 0) 2.5 4.0 0.7)
  (make-horizontal-cylinder "CF-301" (sp3d-pt 82 0 zhc) 1.5 2.0 'X)
  (make-horizontal-cylinder "DR-301" (sp3d-pt 90 0 zhc) 1.2 3.0 'X)
  (make-horizontal-cylinder "CL-301" (sp3d-pt 98 0 zhc) 1.2 3.0 'X)

  ;; B line at y=-10
  (make-vertical-tank "TK-302" (sp3d-pt 66 -10 0) 2.0 4.0)
  (make-vessel-with-cone "CR-302" (sp3d-pt 74 -10 0) 2.5 4.0 0.7)
  (make-horizontal-cylinder "CF-302" (sp3d-pt 82 -10 zhc) 1.5 2.0 'X)
  (make-horizontal-cylinder "DR-302" (sp3d-pt 90 -10 zhc) 1.2 3.0 'X)
  (make-horizontal-cylinder "CL-302" (sp3d-pt 98 -10 zhc) 1.2 3.0 'X)

  ;; C line at y=-20
  (make-vertical-tank "TK-303" (sp3d-pt 66 -20 0) 2.0 4.0)
  (make-vessel-with-cone "CR-303" (sp3d-pt 74 -20 0) 2.5 4.0 0.7)
  (make-horizontal-cylinder "CF-303" (sp3d-pt 82 -20 zhc) 1.5 2.0 'X)
  (make-horizontal-cylinder "DR-303" (sp3d-pt 90 -20 zhc) 1.2 3.0 'X)
  (make-horizontal-cylinder "CL-303" (sp3d-pt 98 -20 zhc) 1.2 3.0 'X)
  (make-vertical-tank "Final Molasses Tank" (sp3d-pt 90 -27 0) 1.8 3.0)

  ;; ---------------- Product/process piping ----------------
  ;; Inlets and pretreatment
  (make-pipe (list (sp3d-pt 0 -1 zpipe) (sp3d-pt 8 -1 zpipe)) pipe-d "PRODUCT_FLOW" "Nira Inlet" (sp3d-pt 4 -1.6 2.45))
  (make-pipe (list (sp3d-pt 3 3 zpipe) (sp3d-pt 8 1 zpipe)) pipe-d "PRODUCT_FLOW" "Ca(OH)2" (sp3d-pt 5.6 2.5 2.45))
  (make-pipe (list (sp3d-pt 3 -3 zpipe) (sp3d-pt 8 -1 zpipe)) pipe-d "PRODUCT_FLOW" "SO2" (sp3d-pt 5.6 -3.0 2.45))
  (make-pipe (list (sp3d-pt 9 0 zpipe) (sp3d-pt 15 0 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 17 0 zpipe) (sp3d-pt 23 0 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 24 -1.5 zpipe) (sp3d-pt 26 -4 zpipe)) pipe-d "PRODUCT_FLOW" "Blotong" (sp3d-pt 27 -4 2.45))

  ;; Evaporation train and syrup to A line
  (make-pipe (list (sp3d-pt 25.5 0 zpipe) (sp3d-pt 33 0 zpipe)) pipe-d "PRODUCT_FLOW" "Thin Syrup" (sp3d-pt 30 0.7 2.45))
  (make-pipe (list (sp3d-pt 35.5 0 zpipe) (sp3d-pt 39.2 0 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 40.8 0 zpipe) (sp3d-pt 44.8 0 zpipe)) pipe-d "PRODUCT_FLOW" "Mid Syrup" (sp3d-pt 43 0.7 2.45))
  (make-pipe (list (sp3d-pt 47.2 0 zpipe) (sp3d-pt 51.2 0 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 52.8 0 zpipe) (sp3d-pt 56.8 0 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 59.2 0 zpipe) (sp3d-pt 65 0 zpipe)) pipe-d "PRODUCT_FLOW" "Thick Syrup" (sp3d-pt 62 0.7 2.45))

  ;; A crystallization/product line
  (make-pipe (list (sp3d-pt 67 0 zpipe) (sp3d-pt 72.8 0 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 75.2 0 zpipe) (sp3d-pt 81 0 zpipe)) pipe-d "PRODUCT_FLOW" "Massecuite A" (sp3d-pt 78 0.7 2.45))
  (make-pipe (list (sp3d-pt 83 0 zpipe) (sp3d-pt 88.5 0 zpipe)) pipe-d "PRODUCT_FLOW" "Wet Sugar A" (sp3d-pt 86 0.7 2.45))
  (make-pipe (list (sp3d-pt 91.5 0 zpipe) (sp3d-pt 96.5 0 zpipe)) pipe-d "PRODUCT_FLOW" "Dry Sugar A" (sp3d-pt 94 0.7 2.45))
  (make-pipe (list (sp3d-pt 99.5 0 zpipe) (sp3d-pt 104 0 zpipe)) pipe-d "PRODUCT_FLOW" "Grade Sugar A" (sp3d-pt 103 0.7 2.45))

  ;; Molasses A to B line
  (make-pipe (list (sp3d-pt 82 -1 zpipe) (sp3d-pt 82 -6 zpipe) (sp3d-pt 66 -6 zpipe) (sp3d-pt 66 -9 zpipe)) pipe-d "PRODUCT_FLOW" "Molasses A" (sp3d-pt 73 -5.4 2.45))
  (make-pipe (list (sp3d-pt 67 -10 zpipe) (sp3d-pt 72.8 -10 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 75.2 -10 zpipe) (sp3d-pt 81 -10 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)

  ;; B product line and molasses B to C
  (make-pipe (list (sp3d-pt 83 -10 zpipe) (sp3d-pt 88.5 -10 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 91.5 -10 zpipe) (sp3d-pt 96.5 -10 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 99.5 -10 zpipe) (sp3d-pt 104 -10 zpipe)) pipe-d "PRODUCT_FLOW" "Grade Sugar B" (sp3d-pt 103 -9.3 2.45))
  (make-pipe (list (sp3d-pt 82 -11 zpipe) (sp3d-pt 82 -16 zpipe) (sp3d-pt 66 -16 zpipe) (sp3d-pt 66 -19 zpipe)) pipe-d "PRODUCT_FLOW" "Molasses B" (sp3d-pt 73 -15.4 2.45))
  (make-pipe (list (sp3d-pt 67 -20 zpipe) (sp3d-pt 72.8 -20 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 75.2 -20 zpipe) (sp3d-pt 81 -20 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)

  ;; C product line and final molasses
  (make-pipe (list (sp3d-pt 83 -20 zpipe) (sp3d-pt 88.5 -20 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 91.5 -20 zpipe) (sp3d-pt 96.5 -20 zpipe)) pipe-d "PRODUCT_FLOW" nil nil)
  (make-pipe (list (sp3d-pt 99.5 -20 zpipe) (sp3d-pt 104 -20 zpipe)) pipe-d "PRODUCT_FLOW" "Grade Sugar C" (sp3d-pt 103 -19.3 2.45))
  (make-pipe (list (sp3d-pt 82 -21 zpipe) (sp3d-pt 82 -27 zpipe) (sp3d-pt 89 -27 zpipe)) pipe-d "PRODUCT_FLOW" "Final Molasses" (sp3d-pt 84 -26.3 2.45))

  ;; ---------------- Steam, vapor, and condensate piping ----------------
  (make-pipe (list (sp3d-pt 5 8 3.0) (sp3d-pt 34 8 3.0) (sp3d-pt 34 1.2 3.0)) pipe-d "STEAM_CONDENSATE" "Steam" (sp3d-pt 18 8.7 3.35))
  (make-pipe (list (sp3d-pt 35.2 1.2 3.2) (sp3d-pt 46 1.2 3.0)) pipe-d "STEAM_CONDENSATE" nil nil)
  (make-pipe (list (sp3d-pt 47.2 1.2 3.0) (sp3d-pt 58 1.2 3.0)) pipe-d "STEAM_CONDENSATE" nil nil)
  (make-pipe (list (sp3d-pt 58 1.2 3.2) (sp3d-pt 58 8 3.2) (sp3d-pt 49 8 2.0)) pipe-d "STEAM_CONDENSATE" "Vapor to Condenser" (sp3d-pt 59 5 3.55))
  (make-pipe (list (sp3d-pt 49 8 1.2) (sp3d-pt 54.3 8 1.2)) pipe-d "STEAM_CONDENSATE" "Condensate" (sp3d-pt 52 8.7 1.65))
  (make-pipe (list (sp3d-pt 55.7 8 1.2) (sp3d-pt 61.3 8 1.2)) pipe-d "STEAM_CONDENSATE" nil nil)

  ;; Visual guide floor grid/area labels.
  (make-label "Pretreatment Area" (sp3d-pt 12 5 0.2) 0.45)
  (make-label "Evaporator Area" (sp3d-pt 46 5 0.2) 0.45)
  (make-label "Crystallization A/B/C Area" (sp3d-pt 82 5 0.2) 0.45)

  (command "_.ZOOM" "_Extents")
  (setvar "CMDECHO" 1)
  (princ "\nSUGARPLANT3D complete: conceptual 3D sugar plant model generated in meters.")
  (princ)
)

(princ "\nLoaded sugar_plant_3d.lsp. Run command SUGARPLANT3D to generate the model.")
(princ)
