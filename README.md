# itc320-a2


This is the final submission for ITC320 Assignment 2.

TASK
Here, you are to create a JavaScript application that animates the provided 3D models. All
models are to be visible as soon as the application is started. The application should load and
display 6 copies of each model.
Each separate rendering of the same object should run a different animation track where
possible. Each of these models contains a different number of bones and animation tracks.
(Please check the number of animation tracks associated with each model. If a model has a
single animation track, it may not be possible to run different animation tracks for that.)
Skeletal animation of the vertex positions should be calculated on the shader and not on the
CPU. Updating of the bone matrices are to be performed on the CPU.
Animations playback at a continuous rate that can be affected by pressing the keys listed below:
• 's' slows the playback rate
• 'x' speeds up the playback rate
• 'n' changes all models to play the next animation track
• 'p' changes all models to play the previous animation track
• 'z' pauses all animations
• '1' Enables picking. The picked model that has the cursor over it should rotate about
the y-axis - this means when the cursor is simply hovering over the model (no click
required)
• '2' Moves the camera to a bird's eye view of all the models
• '3' Moves the camera to the original starting position viewing all the models
When the animation track is changed a blending operation is undertaken so that transition
between animation tracks is not instant but happens over a 4-second interval (relative to the
playback time not real-time). During this blend interval, the ability to change track again is
disabled.
The application should also support moving around the scene in an FPS camera using the keys
'h', 'j', 'k', and 'u' for movements. The camera should turn left, right, up and down appropriately
