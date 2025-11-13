Layers.
alls "layers" are essentially objects, so we are calling them objects instead of layers. you can click on a layer and in the canvas, the handlers for manipulation appear around the object.
The objects can be ordered in the object list, you can drag objects up and down with thee handlers. When a object is selected, either by clicking on in the canvas, or within the object list, the selected object row will show a lock and visibility toggle, and a  delete button.
objects can be dragged into folders to organize them in the objects list. you can add a folder by clicking on the add folder button at the top of the list. 
you can drag an object onto a folder row, and it will become nested in that folder. you can also drag an object row above or below a an object that is allready in the folder, this way it will also become nested in that folder. 
Dragging and dropping uses "live" preview, so no drop indicators between the rows. When starting to drag, there will always 2 empty rows created (half height), one on top and one at the bottom of the object list, so you can drop them there
The objects that are within a folder have a very clear indentation, so you can see that they are nested. To move an object outside a folder, you have to drag it next to an object row outside that folder, while dragging the indentation will clearly indicate that the object row will "jump" out of the folder.
when a folder is selected,  it will show a lock and visibility toggle, and a delete button. But also a mask toggle button. When that mask toggle is on, every object in that folder will be used to mask every other object in the parent folder (or root folder), of the mask folder. So the whole folder basically becomes a mask for all other objects on the same nesting level as that folder. The mask is computed by taking the alpha values of of every combined pixel of the objects.(so if you can see something, it will be used as the mask, but the object could have a gaussian blur so the mask will appear feathered). The mask can also be reversed (0>255 to 255>0). If you click on the canvas, you will always select an object that is masked. To select a masking object (an object within a mask folder), you have to select it in the object list. The moment you select it, the  manipulation handlers appear on the canvas and you can manipulate the masking object (without really seeing it).

You always create an object just above the object that is selected in the object list, or if you have selected a folder, it will be the highest object in that folder. If you have a mask folder or object in that mask folder selected, you will essentially create a mask while you are drawing it. (eg a rectangle)
Mask folders can be exported and put on the marketplace (they are basically stencils)

Double clicking on a row in the object list (object or folder) will toggle rename input
Each row has a small preview. Folders have a preview that is the combination of all their objects. (mask or regular, but in mask, all objects are black/white)

Selecting a folder (or selecting multiple objects/and or folders with shift or control click) will result in a union selecting on the canvas, so 1 bounding box with manipulation handlers around all selected objects.
Most of the time you will have a folder at the top of the list wich will be used as a mask for the rest of the objects.
The uv wrap and template mask are not part of the object list, but there is a canvas color picker
