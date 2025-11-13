### Objects tree

The objects tree is a hierarchical list of all objects within the scene, grouped by folders.
Every node in the objects tree is called a row, so we have object rows and folder rows.

### Objects

Objects are the actors (eg types are rectangles, images, text, pen shape) that are placed on the canvas, think of it as a layer which can only contain 1 thing.

To create an object on the canvas you select an object type from the object tool bar (OTB). By clicking the type icon button, you go into "object creation mode", also the "object type specific" (OTS) menu will appear beneath the OTB.  You draw an object by mouse down on the canvas( the start point), dragging and mouse up (end point) to create. For some object types you can go into "object edit mode" when you double click it (like drawing in the pixel object, or changing polygons in the polygon object, or editing text). The bounding box will dissapear.  You can go back by pressing escape or by clicking the arrow tool (the first button in the OTB).by clicking the arrow tool , You always go to "select mode" (which is the default, idle mode)
When you click on an object in the object tree (or click on it directly in the scene canvas), a bounding box with handlers for manipulation appear around the object, the  (MBB). These manipulation handlers allow the object to
The objects can be ordered in the object list, you can drag object rows up and down the tree, or in and out of folder rows. When an object is selected, either by clicking on in the canvas, or within the object list, the selected object row will show a lock and visibility toggle, and a delete button.

#### Object manipulation menu (OM menu)

align, spacing, selection presets

When an object is selected, the "object type specific" (OTS) menu appears at the top of the canvas. And the generic properties window updates (x, y, width, height, blending, blur, outline,...)
This OTS menu will only show the tools that are specific to that kind of object

##### Pixel object

A pixel object is a special object, you can think of it as a "canvas of pixels". A picture (or better: the pixels the picture is made up out of) is automatically wrapped in a pixel object.
When you select the pixel object (a painting with golden frame icon) from the object tools menu on the left, you have to draw a bounding box like you would draw a rectangle. The rectangle has the same manipulation handlers as any other object, but a the start, it has no "content"(pixels) yet. The picture object off course as already pixels in it. When a pixel object is selected, the OTS menu will whow pixel tools like, airbrush, soft brush, eraser, ... The moment you select one off those, the bounding box dissapears and you can draw pixels on the pixel in "drawing mode". To quit drawing mode, you either press Escape or the arrow tool(the first tool in the pixel OTS menu). Clicking the arrow tool will show the bounding box again. This bounding box has now adapted to the outer boundries of the drawn pixels by default. There is a pixel OST drowdown to show the original bounding box vs the adapted one)
You can also convert any object to a pixel container. You cannot undo this though.

##### Mirror box

You draw the mirror box object creation tool on canvas like a rectangle, in the OTS menu you have checkboxes for vertical and horizontal mirroring, but like any other object, the mirror box can also be rotated. The mirrorbox is invisible when deselected (you have to select it in the objects tree like objects in a mask folder). But every object whose bounding box is within the bounding box of the mirror box, gets mirrored around the mirrorline (the line you see in the middle of the mirrorbox). You can change the intersection magnetism of the mirrorbox in OTS menu. (0 means the object has got to be completely in the bounding box, 100 means just 1 pixels is enough). It doesn't create a second object, it visually just mirrors it

### Folders

Objects can be dragged into folders to organize them in the objects list. you can add a folder by clicking on the add folder button at the top of the list.
All folder rows show a collapse toggle, a visibility toggle, a preview (thumb), a name, and a lock toggle. When a folder is selected, it will additonally show a "add folder" button, and a delete button.
you can drag an object onto a folder row, and it will become nested in that folder. you can also drag an object row above or below a an object that is allready in the folder, this way it will also become nested in that folder.
Dragging and dropping uses "live" preview, so no drop indicators between the rows. When starting to drag, there will always 2 empty rows created (half height), one on top and one at the bottom of the object list, so you can drop them there
The objects that are within a folder have a very clear indentation, so you can see that they are nested. To move an object outside a folder, you have to drag it next to an object row outside that folder, while dragging the indentation will clearly indicate that the object row will "jump" out of the folder.
you can create a folder by clicking on the 'add folder' button, either on a selected folder or the 'add folder button' above the oject tree (the root of the tree is essentially the single root folder (think c: drive))

#### The mask subfolder

When a new folder is created it always comes with a special subfolder as it's first child, called the "mask folder". This folder cannot be deleted, dragged, and cannot be named (it is just called "mask" and has a slight other appearance than the regular folders), you can't add a subfolder to it. The mask subfolder is always an inherent part of any folder. Even the root folder has a mask folder by default.
Every object in the mask folder will be used to mask every other object in it's parent folder (or root folder). So the whole folder basically becomes a mask for all other objects on the same nesting level as that folder. The mask is computed by taking the alpha values of of every combined pixel of the objects.(so if you can see something, it will be used as the mask, but the object could have a gaussian blur so the mask will appear feathered). Every object is colored white by default in a mask folder. So if you drag a pink rectangle with a green outline from outside into a mask folder, both fill and outline will appear white when selected (and in the folder preview). When you drag that purple rectange back outside the mask folder, it "returns" back to it's original color. The mask can also be reversed, then all objects it the mask subfolder will appear black indicating a reverse (so when normal/white, the mask objects will reveal the masked objects with their shape. When black/reversed the mask objects will block the masked objects with their shape). If you click on the canvas, you will always select an object that is masked. To select a masking object (an object within a mask folder), you have to select it in the object list in it's mask subfolder. The moment you select it, the  manipulation handlers appear on the canvas and you can manipulate the masking object, and you start to see the mask object in either white or black. If you select the mask subfolder, all objects within it will appear in white or black, allowing to manipulate the as a group. The moment you deselect them (by clicking on the canvas, or selecting another object), they dissappear again.

You always create an object just above the object that is selected in the object list, or if you have selected a folder, it will be the highest object in that folder. If you have a mask folder or object in that mask folder selected, you will essentially create a mask while you are drawing it. (eg a rectangle)
Mask folders can be exported and put on the marketplace (they are basically stencils)

Double clicking on a row in the object list (object or folder) will toggle rename input
Each row has a small preview. Folders have a preview that is the combination of all their objects. (mask or regular, but in mask, all objects are black/white)

#### Selecting

Selecting a folder (or selecting multiple objects/and or folders with shift or control click) will result in a union selecting on the canvas, so 1 bounding box with manipulation handlers around all selected objects.
Most of the time you will have a folder at the top of the list wich will be used as a mask for the rest of the objects. Objects in a mask subfolder are "special" in the sense that they also appear when selected in the objects tree
The uv wrap and template mask are not part of the object list, but there is a canvas color picker.

##### Selection groups

Every time you use shift, control, or drag a marquee to select multiple objects. You can save that selection group to the "selection group list" in the OM menu by clicking the add to current group button (also in the OM menu). If you select an object that is part of a group, the remove from current group button is enabled.  The selection list is handy for rapid multip selections. An object can only belong to one selection group. you can add a selection group by clicking the plus button above the selection group list. when you hover over an group item in the list, all the objects in that list "light" up a bit. When you click an item, they are all selected. So an item has a hover state, a selected state (when all are selected), and a includes state (this include states in trigger when you select an object that is part of that group, so you can immediately see to which group it belongs)

params into editor (colors, numbers, names, logos) so different variations of a livery can be picked "outside" the editor and exported headless
