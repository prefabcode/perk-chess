chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
          openSettingsModal();
      }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.action === 'openStreamerOverlay') {
    chrome.windows.create({
      url: chrome.runtime.getURL('streamer/overlay.html'),
      type: 'popup',
      width: 1280,
      height: 720,
    });
  }
});