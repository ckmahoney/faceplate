# AutoDJ

This module provides a UI for previewing new music.

AutoDJ will send a request to TinPan to write a new song and play it for you!
When you like what you hear, press the "Capture" button to claim it. When you are the first to claim a piece of music, it becomes yours. 



## Animation

The chord progression is visualized as an HTMLCanvas animation. 
Drawing 30fps while also performing WebAudioAPI playback and making calls to m.redraw() can be expensive. 

So, like the Daw, the Canvas runs in its own "thread" and communicates to Mithril through start/stop commands. 

This allows Canvas to update itself as often as it needs without making excessive calls to `m.redraw()`.