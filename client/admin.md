# Admin

Description

Basic frontend application to edit and handle backend files in a given directory
on fileserver, which using a using a HTTP REST API. Provides an extensible interface
to create new controls (for example directory change field) for the developers.

This documentation describes the structure and the way of working of the **admin.js**.
The public interfaces described here, the others are in comments in the js file.

How does it works?

Structure

-   Admin module:
    -   module exports
    -   internal variables
    -   internal control element registrations
    -   AdminPanel prototype
    -   FileServer prototype

The client application name is _Admin_ it provides an _AdminPanel_ instance, which
generate the application into a target DOM element. The application is built up by
_controls_ which are defined by a constructor functions. The constructor functions
can be registered before the AdminPanel instance is created.

An example for _control_ is an editor window which is represented with a textarea DOM
element.

The _controls_'s constructor functions are executed, when a new _AdminPanel_ instance
is created. These functions provides DOM elements with configured event listeners
which gaves the user interface and its business logic. When the DOM elements are
built, the constructor function gets the _AdminPanel_ instance's as a _this_ parameter,
so through possible to reach the instance's interface even from an event listener.

The _AdminPanel_ instance has an interface for all of the _controls_, which can be
interrogated and manipulated by the DOM interface by other _controls_.

The _AdminPanel_ instance also proivdes access to a _FileManager_ instance, which
is responsible for the async HTTP request handling, and gave some basic abstraction
of the files server API. The _FileManager_ methods returns _Promises_ to build
app async control chains.

# registerControl

Register a control tool constructor function with a given name. The element will be built,
when a new AdminPanel instance will be created with the Admin.newAdminPanel() function whithin
the context of the AdminPanel instance.

The constructorFunction must return a fully functioning DOM element with registered
event handlers. This will be shown on the UI, representing the created control.

The constructorFunction gets the created AdminPanel instance as a self parameter,
to be accessible even from inside the event handler.

**Parameters**

-   `controlElementName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the control element, this is the reference for that.
-   `constructorFunction` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The function which builds the control element.


-   Throws **[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)** If the controlElement is already added with the given name.

# registerControl

# Registered internal controls

These names are used for the general control elements shown by default on
on the user interface.

# newAdminPanel

Creates an admin panel instance and interface into a targetDomElement from all
previously registered controls, also displays the interface too. This is the basic
usage of the module.

**Parameters**

-   `target` **DOMElement** The target DOM element to generate the interface.

Returns **[AdminPanel](#adminpanel)** Contructs and returns an AdminPanel instance.

# editorWindow

This is the main editor window where the file content can be shown. A stupid
textarea.

# saveButton

Provides a Save Button, which saves the file selected in the fileList object.

# delimiter

Provides a simple DIV element which creates a new line of tools.

# fileList

Provides a file list element, shows all the files in the base directory in
a simple select. If a file selected it's content is automatically loaded into
the editorWindow control element.

# newFileForm

Provides a text input and a submit to create a new file in the base directory.

# deleteButton

Deletes the given selected file in the fileList control element.

# AdminPanel

Creates a bridge between the FileManager and the ControlElements. Actually build
the admin panel's DOM elements from the module level registered elemetent's constructors
function and add them to the global DOM.

Provides an interface for the control elements and for the fileManager object.

**Parameters**

-   `target` **DOMElement** The target DOM element to generate the Admin Panel to.

## getControl

A previously registered and built control element can be given by its registered
name. The result is a DOM element, possible to reach its state through the DOM
interface.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of control element to receive, the name same as when its registered.

Returns **DOMElement** Returns the built DOM element reference. Able to access its

## updateChildren

Helper function. Update the option tags in a given parentSelectDomElement
which is a select element with the values of a dataArray. The previous content
will be deleted.

**Parameters**

-   `parentSelectDomElement` **DOMElement** The SELECT tag to where inject the new data.
-   `data` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** The new data.

## createDomElement

Helper function to create a DOM element tag tagName. In a propertiesObject
possible to give any property of the element (e.g: {cols: 50} ). Not obligatory
or null can be used instead to skip.

The content variable defines the content of the element. If it is a string,
a simple text nodewill be created inside the element, if it is a DOM element
(for example by another createDomElement function), that element can be added.
The contains variable can be repeated anytime as an argument and even not obligatory.

**Parameters**

-   `name` **\[type]** The tag name of the newly created DOM element.
-   `attributes` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null))]** The attributes of the new DOM element.
-   `element` **\[(DOMEelement | [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))]** Additional DOM elements or strings, will be created as childs.

Returns **\[type]** [description]

# fileManager

**Properties**

-   `fileManager` **[FileManager](#filemanager)** interface to the FileManager instnace related to this adminPanel instance.

# FileManager

The FileManager provides an interface for the backend API. A FileManager
instance is accessible through the AdminPanel instance fileManager property.
General in the control element definitions: self.fileManager.

All methods returns a Promise which package an async XMLHttpRequest call
towards the backend.

Some simple console logging is put here also for debugging,
and demonstrate the possibilities of chaining. But this is for just this demo,
possible to use here some real debugging commands, statistics or background
reporting too.

These functions throws towards the application level the errors without
any modification. The application level's responsibility to decide how to handle
the errors by design.

**Parameters**

-   `homeDirectory` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The home directory, the files are interrogated from here.

## sendRequest

Generates a Promise with a HTTP request with the given HTTP method, resource,
described by path and a given content. Used for general purposes, more
specific usage for the methods above.

This method doesn't catch any error, the errors are packaged in a promise.

**Parameters**

-   `method` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The HTTP method to use in the request, uppercase. (GET, POST, MKCOL, DELETE)
-   `path` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The absolute path to the resource to request.
-   `content`  

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** In a case of successful promise it returns a string with the content of the file.

## udpateFileList

Get the file list of the home directory from the backend. An array will be returned
with the name of the files. Subdirectories also came back but not able distinguish
what is file what is subdir based on the list.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The success promise returns an Array, the list of the files and directories, strings.

## loadContent

Load a given content of a fileName and given back as a string.

**Parameters**

-   `fileName` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The file to interrogate from the backend, relative to the homedir.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The string content of the file in a Success promise.

## deleteFile

Delete a given file from the backend.

**Parameters**

-   `fileName` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the file to delete, relative to homedir.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The success indicated with the result of the promise.

## saveOrCreateFile

Overwrite the given fileName on the backend with the given content, if the
content is null, the file will be empty. If the fileName is not exists it
will be created.

**Parameters**

-   `fileName` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the file to create / overwrite, relative to the current directory.
-   `content` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** The new file content, or can be null, in this case an empty file will be the result.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The success or failure is indicated with the Promise.
