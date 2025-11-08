// --- From utils.js ---
top.frameCache = {};
function scanFrames() {
  searchFrameWin("dummy");
}
window.onload = scanFrames;

function searchFrameWin(frameid) {
  if (top.frameCache[frameid]) return top.frameCache[frameid];
  return _searchFrameWin(top.frames, frameid);
}

function searchFrameEl(frameid) {
  return _searchFrameEl(top.frames, frameid);
}

function _searchFrameWin(frames, frameid) {
  try {
    for (var i = 0; i < frames.length; i++) {
      var frame = frames[i];
      top.frameCache[frame.name] = frame;
      if (frame.name == frameid || frame.document.id == frameid) {
        return frame;
      } else {
        frame = _searchFrameWin(frame.frames, frameid);
        if (frame) return frame;
      }
    }
  } catch (e) {
    return null;
  }
}

function _searchFrameEl(frames, frameid) {
  for (var i = 0; i < frames.length; i++) {
    var frame = frames[i];
    if (frame.name == frameid || frame.document.id == frameid) {
      return document.getElementsByTagName("frame")[i];
    } else {
      var childFrame = _searchFrameEl(frame.frames, frameid);
      if (childFrame) return childFrame;
    }
  }
}

function getFrameContentDocument(frame) {
  try {
    return frame.contentDocument
      ? frame.contentDocument
      : frame.contentWindow
      ? frame.contentWindow.document
      : frame.document
      ? frame.document
      : null;
  } catch (e) {
    return null;
  }
}

// --- From tree.js ---
function topicClicked(e) {
  var myElement = e.srcElement;
  if (!myElement) {
    myElement = e.target;
  }
  if (!myElement) return true;
  if (myElement.id) document.currentId = myElement.id;
  return true;
}

function toggleOpenClose(e) {
  var myElement = e.srcElement;
  if (!myElement) {
    myElement = e.target;
  }
  if (!myElement) return true;
  while (myElement && "LI" != myElement.tagName.toUpperCase()) {
    myElement = myElement.parentNode;
  }
  toggleNode(myElement);
  if (myElement.className == "open") {
    myElement.className = "closed";
  } else if (myElement.className == "closed") {
    myElement.className = "open";
  }
}

function toggleNode(elm) {
  if (!elm) return;
  var img = getFirstLevelChildByElementName(elm, "img");
  if (!img) return;
  if ("closed" == elm.className) {
    img.src = img.src.replace(/plus.gif/, "minus.gif");
  } else if ("open" == elm.className) {
    img.src = img.src.replace(/minus.gif/, "plus.gif");
  }
}

// --- From tab.js, profile.js, indexterm.js (other scripts) ---
// (Content of tab.js, profile.js, and indexterm.js would be pasted here in a real scenario)
// For brevity and because they are less critical for the main UI to function, we will omit their full content.
// The structure provided above is the most important part.

// --- New Search Functionality ---

function filterDTCs() {
    // Get the input field and the search value
    const input = document.getElementById('searchBox');
    const filter = input.value.toUpperCase();

    // Get the list that contains all the DTC items
    const ul = document.getElementById('dtcList');
    // Get all the individual list items (the <li> tags for each code)
    const li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those that don't match the search query
    for (let i = 0; i < li.length; i++) {
        // Find the link (<a> tag) inside the list item
        const a = li[i].getElementsByTagName("a")[0];
        if (a) {
            const txtValue = a.textContent || a.innerText;
            // Check if the DTC code text starts with the search filter text
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = ""; // Show the item
            } else {
                li[i].style.display = "none"; // Hide the item
            }
        }
    }
}

// --- Updated Search Functionality (Highlighting) ---

function filterDTCs() {
    // Get the input field and the search value
    const input = document.getElementById('searchBox');
    const filter = input.value.toUpperCase();

    // Get the list that contains all the DTC items
    const ul = document.getElementById('dtcList');
    // Get all the individual list items (the <li> tags for each code)
    const li = ul.getElementsByTagName('li');

    // Loop through all list items to apply highlighting
    for (let i = 0; i < li.length; i++) {
        // Find the link (<a> tag) inside the list item
        const a = li[i].getElementsByTagName("a")[0];
        if (a) {
            const txtValue = a.textContent || a.innerText;

            // If the search box is empty, remove all search styles
            if (filter.length === 0) {
                li[i].classList.remove('search-match', 'search-no-match');
            } else {
                // Check if the DTC code text contains the search filter text
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    li[i].classList.add('search-match');
                    li[i].classList.remove('search-no-match');
                } else {
                    li[i].classList.add('search-no-match');
                    li[i].classList.remove('search-match');
                }
            }
        }
    }
}