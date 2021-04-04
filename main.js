let sheet_id = "ID";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ sheet_id });
});
