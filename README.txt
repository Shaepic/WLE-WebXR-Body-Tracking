Wonderland Engine Body-Tracking by Tristan(Shaepic) based on Wonderland Engine hand-tracking component.

Features:

Rendering of tracked joints.
Rendering of tracked body.
Under-the-hood joint hierarchy remapping/reassembly to meet WebXR specified joint order.
Joint debugger for locating mapping errors. 

Before you start:

It is important to be sure that your app is requesting WebXR body-tracking by enabling the feature request in Wonderland Editor.
To do this, open the project settings tab, then open the 'Runtime' dropdown.
In either the 'Required WebXR Features' or 'Optional WebXR Features' coulomb, check body-tracking(if listed).
If body-tracking is not listed, enter 'body-tracking' in the text field below either coulomb. The coulomb you chose will reflect
weather your app necessitates body-tracking for the experience or if it is simply an added feature.

How-To:

The use of the WLE body-tracking component follows the implementation instructions of all Wonderland Engine custom components.
Simply drag the body-tracking.js file into the desired folder in your Wonderland Editor or to the project folder on your OS.

In the Editor, attach the body-tracking script to either an empty object on the scene(for simple joint tracking) or to the avatar mesh object you want to 
body track.

If you are joint tracking, open the body-tracking component dropdown menu and in the jointObject menu select an object mesh to represent your joint
then in the jointMaterial menu, select a material for your joints.


If you are body tracking, open the body-tracking component dropdown menu and in the bodySkin menu select a skin you would like your body to be 
rendered as.
Your body skin MUST contain all joints listed in the WebXR specified joint list https://github.com/immersive-web/body-tracking/blob/main/index.bs
with the exception of the "root" joint. 

Debugging:

If you run intro joint problems (there can be many if it is your first rig) you may want to use the text object debugger. Simply create a text object
in the scene and position it high enough to list all of the 80+joints in vertically descending order. (you can adjust font size as well)
In your body-tracking component dropdown menu, select the text object in the textObject menu.
If a joint fails to map because of a naming error(or it being null) the debugger will list all valid joints up until the problem joint.

3/31/24