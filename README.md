Admin module learning project
=============================

Description
-----------
This is an output of a learning project by making an extendable frontend
application for a predefined API. Learning project, not able to use in production.

The predefined backend API is a simple file server in Node.js from
[Eloquent Javascript, Chapter 20](http://eloquentjavascript.net/20_node.html#h_LvXChBt2KP).
You can read the details, how it is constructed on the link above and what is the
specification is it.

The frontend application is a simple File Manager interface which able to open a file
from a list of available files on the backend, able to save it, delete it or create
a new one.

The client application also demonstrate how can be extensible this application by
plugins, adding a feature, "Add image by URL" button from a separate JS.

The server subdirectory contains the file server, the client subdirectory contains
a directory, which can be provided by the fileserver on localhost. There are some
regular files on there, but the admin.html contains the application to able to reach
the File Manager application.

Check the documentation of the admin.md of the admin.js file

### Files
* **/client**: Root directory of public files for serving.
  * **admin.html**: The HTML shows the application of the admin panel.
  * **admin.js**: The Admin module.
  * **admin.md**: Developer documentation of the Admin module / admin.js file.
  * **admin_add_image_by_url.js**: Example control to extend the available
    functionality of the main module.
  * ... other files
* **/server**: A simple node.js file server is here
  * **/node_modules**: The related modules needed for the fileserver.
  * **file_server.js**: The fileserver entry (and only) point.
  * **package.json**: The node.js package description of the fileserver.

How to make it work?
--------------------
1. Get node.js ( http://nodejs.org ) and install it.

2. Change to the directory /server and install all Dependencies from package.json.
  `npm install`

2. Change to directory /client

3. Start the fileserver from here, referring to the other JS file. So this will
   be the root directory of the fileserver. The server will be listen to port 8000.
   `$ node ../server/file_server.js`

4. Visit [http://localhost:8000/admin.html](http://localhost:8000/admin.html)
  from your browser.

5. Open the developer console in your browser, to see the javascript log messages
  ( CTRL + SHIFT + I ) in Chrome for example, this is a part of the user interface :),
  (see restriction parts of this document).

Goals
------
* **Module:** Demonstrate to create a module using a Module pattern. Import,
  export, encapsulation.

* **Extendable:** Create a basic interface, possible to extend the module.

* **Promise pattern:** Practice the usage of Promise pattern while accessing a
  time consuming backend resources.

* **Frontend applicaion:** Suit a frontend application to a predefined backend API.

* **Documentation:** Create a developer documentation for this project to practice
  documentation writing. (Overdocumented considering its learning project.)

Restrictions
------------

* Due to the limitation of the file server API, the directories are not easy
  to recognize, so editing those directories where subdirectories are present is
  not really supported.

* Really basic UX. The interface not alert the user if there are unsaved changes and
  performs an other action which destroy these changes. Delete or overwrites the file
  without any warning.

* No real Application level error handling, the log messages from the console gives
  some information to the user.

* The same as with the status messages like 'file saved...' etc. Only the console
  gives feedback for the user of their actions.

* The interface is not nice. Only the basic HTML elements used on its own.

* Not able to select which controls can be viewed and which order, all the registered
  controls will be shown in the order of the registration.

* Lack of security considerations.

* Better module package handling can be useful like CommonJS or AMD.

* The extendable control interface using the simple DOM API, so it is quite dependent
  of the actual DOM implmentation of the other controls.
