# MissionControl

Mission Control is a web management tool that allows for better quality control of all our BIM Models without the need to open each model one by one, which saves an incredible amount of time, and assures the data integrity and performance stability in the environment. Furthermore, the tool can track the progression of every event and operation that happens in the Model. 

This web application will allow for users to control modeling behaviors following project standard in Revit. Based upon the settings stored in mongoDB by the web UI, the Revit Addin tool will activate or deactivate certain toolsets. 

![](MissionControl_Architecture.png)

# Run it
Install Mongo, NPM, Visual Studio Code, Github Desktop and Fork this repository
Start with "mongod" and then "Npm run serve"

The Clean-up Revit Code is the **View Folder** together with the Keras Python code in order to Prepare the JSON Format.


## Presentations
Here you can have a look of some presentation where mission control appeared.

https://www.youtube.com/watch?v=viwFJINRmqg  AEC Hackathon Winner Bay Area
https://drive.google.com/file/d/1_Fq9QBGr-pz-AxdyE-hiS9W2f-wBEFZz/view?usp=sharing TTCore Hackathon Winner Seattle
https://sfcdug.org/2019/02/24/sfcdug-february-2019-aec-hackathon-winner/ AEC Hackathon Winner Bay Area

## Future Integration
Thanks to the Forge and Design Automation API, Mission Control will be also capable of performing the changes in the BIM environment.
