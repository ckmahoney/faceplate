# Redraws

Mithril will automatically redraw the application when it sees events triggered on registered Vnodes.

Mithril does not know when to redraw when it comes to promises. Which is fair. 
So they provide an `m.redraw` method to help us manually update the view when a promise result is in a ready-to-render state.

This is the *only* file which is allowed to use the m.redraw method. 
It may pass the redraw function to a child through an attribute; but no other modules are permitted to redraw the application using `m.redraw()`. 