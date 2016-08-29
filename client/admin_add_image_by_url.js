var Admin_AddImageByUrl = (function (Admin) {
  if(!Admin) {
    console.error('Admin (admin.js) module still not loaded, this is an extension for that.');
  }
  Admin.registerControl('addImageByUrl', function (self) {
    var addImageByUrlButton = self.createDomElement('button', null, 'Add Image By URL');
    addImageByUrlButton.addEventListener('click', function(event) {

      if(!self.getControl('fileList').value) {
        console.log('No file selected.');
        return;
      }

      var editorWindow = self.getControl('editorWindow');
      var imageUrl = prompt('Insert here the URL of the image:');

      if(!imageUrl) {
        console.log('No image URL given.');
        return;
      }

      var stringBefore = editorWindow.value.slice(0, editorWindow.selectionStart);
      var stringAfter = editorWindow.value.slice(editorWindow.selectionEnd, editorWindow.value.length);
      editorWindow.value = stringBefore.concat('<img src="', imageUrl, '">', stringAfter);
    });
    return addImageByUrlButton;
  });
})(Admin);
