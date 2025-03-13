import json
import win32clipboard

# Webflow-Compatible JSON Structure with More Metadata
webflow_json = {
    "type": "@webflow/XscpData",
    "payload": {
        "nodes": [
            {
                "_id": "custom-div-123",
                "type": "Block",
                "tag": "div",
                "classes": ["custom-class"],
                "children": ["child-text-456"],
                "data": {
                    "tag": "div",
                    "displayName": "Custom Div"
                }
            },
            {
                "_id": "child-text-456",
                "text": True,
                "v": "Hello, Webflow!"
            }
        ],
        "styles": [
            {
                "_id": "custom-class",
                "type": "class",
                "name": "Custom Class",
                "styleLess": "color: red; font-size: 24px;"
            }
        ],
        "assets": [],
        "ix1": [],
        "ix2": {
            "interactions": [],
            "events": [],
            "actionLists": []
        }
    },
    "meta": {
        "droppedLinks": 0,
        "dynBindRemovedCount": 0,
        "dynListBindRemovedCount": 0,
        "paginationRemovedCount": 0,
        "universalBindingsRemovedCount": 0,
        "unlinkedSymbolCount": 0
    }
}

# 🔥 **Webflow stores JSON inside another JSON as a string!**
webflow_json_string = json.dumps(webflow_json)  # Convert JSON to a string

# 🔥 **Mimicking Webflow's exact structure**
webflow_final_payload = json.dumps({
    "data": {
        "component": {
            "data": webflow_json_string,
            "clipboardFormat": "application/json"
        }
    }
})

def copy_to_clipboard(json_data):
    """ Uses pywin32 to copy JSON to clipboard as structured Webflow data """

    # Open clipboard
    win32clipboard.OpenClipboard()
    
    try:
        # Clear existing clipboard content
        win32clipboard.EmptyClipboard()
        
        # Set clipboard data as Unicode text (Webflow reads it as `application/json`)
        win32clipboard.SetClipboardText(json_data, win32clipboard.CF_UNICODETEXT)
    finally:
        # Close clipboard
        win32clipboard.CloseClipboard()


# Try to copy JSON as structured clipboard data
try:
    copy_to_clipboard(webflow_final_payload)
    print("✅ JSON copied as structured clipboard data! Try pasting in Webflow.")
except Exception as e:
    print(f"❌ Error copying to clipboard: {e}")
