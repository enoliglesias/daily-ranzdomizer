chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id || !tab.url?.includes("meet.google.com")) {
    return;
  }

  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content.css"],
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (err) {
    console.error("[Daily Randomizer] inject failed", err);
  }
});
