const root = document.documentElement;

if (localStorage.getItem('customTitle')) document.title = localStorage.getItem('customTitle');
if (localStorage.getItem('customFavicon')) document.querySelector("link[rel~='icon']").href = localStorage.getItem('customFavicon');
if (localStorage.getItem('backgroundUrl')) root.style.setProperty('--background', `url(${localStorage.getItem('backgroundUrl')})`);
if (localStorage.getItem('theme')) root.style.setProperty('--background-color', localStorage.getItem('theme'));

window.addEventListener('load', () => {
  window.panicKeys = JSON.parse(localStorage.getItem("panicKeys"));
  window.panicUrl = localStorage.getItem("panicURL") || "https://google.com";
  if (window.panicKeys && Array.isArray(window.panicKeys) && window.panicUrl) detectPanicKeys();
});

setTimeout(() => notification(`ChatGPT is now permanently available in the top-right menu! Give it a try.`, "#039dfc"), 2500);

function reloadPage() {
  if (document.getElementById("frame" + currentTab).src != "about:blank") document.getElementById("frame" + currentTab).src = document.getElementById("frame" + currentTab).src;
}

function openApps() {
	addTab();
  runService('helium://apps');
}

function erudaToggle() {
  const iframe = document.getElementById("frame" + currentTab);
  if (!iframe) return;
  const { contentWindow: erudaWindow, contentDocument: erudaDocument } = iframe;
  if (!erudaWindow || !erudaDocument) return;

  if (erudaWindow.eruda?._isInit) {
    erudaWindow.eruda.destroy();
  } else {
    const script = erudaDocument.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = () => {
      if (!erudaWindow) return;
      erudaWindow.eruda.init();
      erudaWindow.eruda.show();
    };
    erudaDocument.head.appendChild(script);
  }
}

function detectPanicKeys() {
  let hitKeys = [];
  let hitKeyRetention = false;

  document.addEventListener("keydown", (e) => {
    if (!window.panicKeys) return;
    if (!hitKeyRetention) {
      hitKeyRetention = true;
      setTimeout(() => {
        hitKeyRetention = false;
        hitKeys = [];
      }, 750);
    }
    hitKeys.push(e.key);
    if (hitKeys.length >= window.panicKeys.length) {
      const hitKeysSet = new Set(hitKeys);
      const panicKeysSet = new Set(window.panicKeys);
      if (new Set([...hitKeysSet].filter((x) => panicKeysSet.has(x))).size === panicKeysSet.size) {
        window.open(window.panicUrl);
      }
    }
  });
}

window.setInterval(checkFocus, 15);

function checkFocus() {
  const iframe = document.getElementById("frame" + currentTab);
  const activeElement = document.activeElement;
  if (activeElement === iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeActiveElement = iframeDoc.activeElement;
    if (!["INPUT", "TEXTAREA", "SELECT"].includes(iframeActiveElement.tagName)) window.focus();
  }
}

let notificationCount = 0;

function notification(message, bgColor) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.backgroundColor = bgColor;

  const text = document.createElement('span');
  text.textContent = message;

  const closeBtn = document.createElement('img');
  closeBtn.className = 'close-btn';
  closeBtn.src = 'assets/closeTabBlack.svg';
  closeBtn.onclick = () => hideNotification(notification);

  notification.appendChild(text);
  notification.appendChild(closeBtn);
  document.body.appendChild(notification);

  notification.style.top = `${25 + (notificationCount * 60)}px`;
  notificationCount++;

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => hideNotification(notification), 3500);
}

function hideNotification(notification) {
  notification.classList.add('hide');
  setTimeout(() => {
    notification.remove();
    notificationCount--;
    repositionNotifications();
  }, 500);
}

function repositionNotifications() {
  const notifications = document.querySelectorAll('.notification');
  notifications.forEach((notif, index) => notif.style.top = `${25 + (index * 60)}px`);
}

async function worker() {
  return await navigator.serviceWorker.register("/sw.js", { scope: "/class" });
}

document.addEventListener("DOMContentLoaded", async () => {
  await worker();
  workerLoaded = true;
});

let currentTab = 0;
let tabs = [{ url: 'about:blank', history: [], currentHistoryIndex: -1 }];
const searchBar = document.getElementById('searchBar');
const urlInput = document.getElementById('searchBar');
const contextMenu = document.getElementById('contextMenu');
const addTabButton = document.querySelector('.add-tab');

document.getElementById("frame" + currentTab).addEventListener('load', () => {
  const currentURL = document.getElementById("frame" + currentTab).contentWindow.location.href;
  if (currentURL && currentURL !== 'about:blank') {
    tabs[currentTab].url = currentURL;
    if (tabs[currentTab].history[tabs[currentTab].currentHistoryIndex] !== currentURL) {
      tabs[currentTab].history.push(currentURL);
      tabs[currentTab].currentHistoryIndex = tabs[currentTab].history.length - 1;
    }
    const globalHistory = JSON.parse(localStorage.getItem('globalHistory')) || [];
    if (!globalHistory.includes(currentURL)) {
      globalHistory.push(currentURL);
      localStorage.setItem('globalHistory', JSON.stringify(globalHistory));
    }
  }
  document.getElementById(currentTab).querySelector('p').textContent = document.getElementById("frame" + currentTab).contentDocument.title;
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById("frame" + currentTab).style.display = 'block';
});

function fullscreen() {
  document.getElementById("frame" + currentTab).requestFullscreen();
}

function loadUrlFromHistory(url) {
  tabs[currentTab].url = url;
  tabs[currentTab].history.push(url);
  tabs[currentTab].currentHistoryIndex = tabs[currentTab].history.length - 1;
  iframe.src = url;
}

async function runService(url) {
    document.getElementById("quote").innerText = quoteText[Math.floor(Math.random() * quoteText.length)];
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById("frame" + currentTab).style.display = 'none';  
  const tab = tabs[currentTab];
  if (url) {
    tab.url = url;
  }
  if (tab.url === 'helium://settings' || tab.url.includes("/subpages/settings/s.html")) {
    urlInput.value = "helium://settings";
    document.getElementById("frame" + currentTab).src = '/subpages/settings/s.html';
  } else if (tab.url === 'helium://gpt' || tab.url.includes("/subpages/gpt/html/index.html")) {
    urlInput.value = "helium://gpt";
    document.getElementById("frame" + currentTab).src = '/subpages/gpt/html/index.html';
  }else if (tab.url === 'helium://apps' || tab.url.includes("/subpages/apps/a.html")) {
    urlInput.value = "helium://apps";
    document.getElementById("frame" + currentTab).src = '/subpages/apps/a.html';
  } else if (tab.url === 'helium://landing' || tab.url.includes("/subpages/landing/l.html")) {
    urlInput.value = "";
    urlInput.placeholder = "Search or enter a URL";
    document.getElementById("frame" + currentTab).src = '/subpages/landing/l.html';
  }else if (!(tab.url) || tab.url == 'about:blank') {
    urlInput.value = "";
    urlInput.placeholder = "Search or enter a URL";
    document.getElementById("frame" + currentTab).src = '/subpages/landing/l.html';
  } else {
    const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
    const searchEngine = localStorage.getItem('searchEngine') || "https://www.google.com/search?q=";
    if (/\/class\//.test(tab.url)) {
      tabs[currentTab].currentHistoryIndex = tabs[currentTab].history.length - 1; 
      let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
      if (await connection.getTransport() !== "/epoxy/index.mjs") {
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
      }
      document.getElementById("frame" + currentTab).src = tab.url;
      urlInput.value = tab.url.includes('/class/') ? __uv$config.decodeUrl(tab.url.split('/class/')[1]) : __uv$config.decodeUrl(tab.url);
    } else {
    if (!/^(https?:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,30}/i.test(tab.url)) {
      tab.url = searchEngine + tab.url;
  }
  else if (!/^(https?:\/\/)/i.test(tab.url)) {
      tab.url = "http://" + tab.url;
  }    
  
  document.getElementById('searchBar').value = tab.url;
tabs[currentTab].currentHistoryIndex = tabs[currentTab].history.length - 1;
    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	  if (await connection.getTransport() !== "/epoxy/index.mjs") {
		  await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	  }
	  document.getElementById("frame" + currentTab).src = __uv$config.prefix + __uv$config.encodeUrl(tab.url);
  }
}
}
searchBar.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    runService(searchBar.value);
    setTimeout(() => {
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
      document.getElementById('suggestionsBackground').style.display = 'none';
      searchBar.style.borderBottomLeftRadius = "3px";
      searchBar.style.borderBottomRightRadius = "3px";
      document.getElementById("searchbarbackground").style.borderBottomRightRadius = "3px";
      document.getElementById("searchbarbackground").style.borderBottomLeftRadius = "3px";
    }, 200);
  }
  
});

function popout() {
  if (tabs[currentTab].url.includes("subpages/landing/l.html") || tabs[currentTab].url.includes("subpages/apps/a.html") || tabs[currentTab].url.includes("subpages/settings/s.html")) {
    notification("You can't pop system pages out.", "#ff9999")
    return;
  }
  var win = window.open("about:blank", "_blank");
  const frame = document.createElement("iframe");
  frame.src = document.getElementById("frame" + currentTab).src;
  win.document.body.appendChild(frame);
  closeTab(currentTab)
  frame.style.cssText =
    "margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1000000; border: none; border-radius: 0;";
}

function selectTab(tabIndex) {
  document.getElementById("frame" + currentTab).style.display='none';
  currentTab = tabIndex;
  document.querySelectorAll('.tab').forEach((tab, index) => {
    tab.classList.toggle('active', index === tabIndex);
  });
  document.getElementById("frame" + currentTab).style.display = 'block';

  if (!document.getElementById("frame" + currentTab).contentWindow.location.href.includes('/subpages/')) {
    document.getElementById('searchBar').value = document.getElementById("frame" + currentTab).contentWindow.location.href.includes('/class/') ? __uv$config.decodeUrl(document.getElementById("frame" + currentTab).contentWindow.location.href.split('/class/')[1]) : __uv$config.decodeUrl(document.getElementById("frame" + currentTab).contentWindow.location.href);
  } else {
    if (document.getElementById("frame" + currentTab).contentWindow.location.href.includes("/subpages/settings/s.html")) {
      urlInput.value = "helium://settings";
    } else if (document.getElementById("frame" + currentTab).contentWindow.location.href.includes("/subpages/gpt/html/index.html")) {
      urlInput.value = "helium://gpt";
    }else if (document.getElementById("frame" + currentTab).contentWindow.location.href.includes("/subpages/apps/a.html")) {
      urlInput.value = "helium://apps";
    } else if (document.getElementById("frame" + currentTab).contentWindow.location.href.includes("/subpages/landing/l.html")) {
      urlInput.value = "";
      urlInput.placeholder = "Search or enter a URL";
    }else if (!(document.getElementById("frame" + currentTab).contentWindow.location.href) || currentURL == 'about:blank') {
      urlInput.value = "";
      urlInput.placeholder = "Search or enter a URL";
      document.getElementById("frame" + currentTab).src = '/subpages/landing/l.html';
    }
  }
}

function addTab() {
  if (tabs.length >= 27) {
    notification('The maximum amount of tabs have been reached.', "#ff9999");
    return;
  }
  const newTabIndex = tabs.length;
  tabs.push({ url: 'helium://landing', history: [], currentHistoryIndex: -1 });

  const newIframe = document.createElement('iframe');
console.log(newIframe);

// Get the parent element
const parentElement = document.getElementById('iframeOverlay');

// Ensure the parent element exists
if (parentElement) {
    newIframe.src = "/subpages/landing/l.html";
    newIframe.id = "frame" + newTabIndex;
    newIframe.style.display = "block"; // Correct way to hide it
    parentElement.appendChild(newIframe); // Actually appends it to the DOM
} else {
    console.error("Parent element 'iframeOverlay' not found.");
}
  
  document.getElementById("frame" + currentTab).style.display = "none";

  const tabBar = document.getElementById('tabBar');
  const newTabButton = document.createElement('button');
  newTabButton.classList.add('tab');
  newTabButton.id = tabs.length - 1;

  const newTabText = document.createElement('p');
  newTabText.id = 'tabText';
  newTabText.textContent = 'New Tab';
  newTabButton.appendChild(newTabText);

  const closeTabButton = document.createElement('img');
  closeTabButton.src = 'assets/closeTab.svg';
  closeTabButton.id = 'closeTab';
  closeTabButton.onclick = (event) => {
    event.stopPropagation();
    closeTab(newTabIndex);
  };
  newTabButton.appendChild(closeTabButton);
  newTabButton.onclick = () => selectTab(newTabIndex);
  tabBar.insertBefore(newTabButton, addTabButton);

  currentTab = newTabIndex;
  document.querySelectorAll('.tab').forEach((tab, index) => {
    tab.classList.toggle('active', index === newTabIndex);
  });

  document.getElementById("frame" + currentTab).addEventListener('load', () => {
    const currentURL = document.getElementById("frame" + currentTab).contentWindow.location.href;
    if (currentURL) {
      tabs[currentTab].url = currentURL;
      if (tabs[currentTab].history[tabs[currentTab].currentHistoryIndex] !== currentURL) {
        tabs[currentTab].history.push(currentURL);
        tabs[currentTab].currentHistoryIndex = tabs[currentTab].history.length - 1;
      }
      const globalHistory = JSON.parse(localStorage.getItem('globalHistory')) || [];
      if (!globalHistory.includes(currentURL)) {
        globalHistory.push(currentURL);
        localStorage.setItem('globalHistory', JSON.stringify(globalHistory));
      }
      if (!currentURL.includes('/subpages/')) {
        document.getElementById('searchBar').value = currentURL.includes('/class/') ? __uv$config.decodeUrl(currentURL.split('/class/')[1]) : __uv$config.decodeUrl(currentURL);
      } else {
        if (currentURL.includes("/subpages/settings/s.html")) {
          urlInput.value = "helium://settings";
        } else if (currentURL.includes("/subpages/gpt/html/index.html")) {
          urlInput.value = "helium://gpt";
        }else if (currentURL.includes("/subpages/apps/a.html")) {
          urlInput.value = "helium://apps";
        } else if (currentURL.includes("/subpages/landing/l.html")) {
          urlInput.value = "";
          urlInput.placeholder = "Search or enter a URL";
        }else if (!(currentURL) || currentURL == 'about:blank') {
          urlInput.value = "";
          urlInput.placeholder = "Search or enter a URL";
          document.getElementById("frame" + currentTab).src = '/subpages/landing/l.html';
        }
      }
    }
    document.getElementById(currentTab).querySelector('p').textContent = document.getElementById("frame" + currentTab).contentDocument.title;
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById("frame" + currentTab).style.display = 'block';
  });
  
}

function navigateBack() {
  const tab = tabs[currentTab];
  if (tab.currentHistoryIndex > 0) {
    tab.currentHistoryIndex--;
    runService(tab.history[tab.currentHistoryIndex]);
  }
}

function navigateForward() {
  const tab = tabs[currentTab];
  if (tab.currentHistoryIndex < tab.history.length - 1) {
    tab.currentHistoryIndex++;
    runService(tab.history[tab.currentHistoryIndex]);
  }
}

function closeTab(tabIndex) {
  const tabBar = document.getElementById('tabBar');
  const allTabs = document.querySelectorAll('.tab');
  if (allTabs.length == 1) {
    notification("You cannot destroy the last tab.", "#ff9999");
    return;
  }
  if (tabIndex < 0 || tabIndex >= allTabs.length) return;
  const tabToRemove = allTabs[tabIndex];
  if (tabToRemove.parentNode === tabBar) {
    tabBar.removeChild(tabToRemove);
    console.log("hello");
  }
  tabs.splice(tabIndex, 1);
  if (currentTab === tabIndex) {
    if (tabIndex > 0) selectTab(tabIndex - 1);
    else if (tabs.length > 0) selectTab(0);
    else {
      iframe.src = '/subpages/landing/l.html';
      urlInput.value = 'helium://landing';
    }
  } else if (currentTab > tabIndex) currentTab--;
  reassignTabIndices(tabIndex);
}

function reassignTabIndices(tabIndex) {
  const allTabs = document.querySelectorAll('.tab');
  allTabs.forEach((tab, index) => {
    if (index > tabIndex) index = index - 1;
    tab.onclick = () => selectTab(index);
    tab.id = index;
    tab.querySelector('#closeTab').onclick = (event) => {
      event.stopPropagation();
      closeTab(index);
    };
  });
}

let ignoreClose = false;


function openHamburgerMenu() {
  const menu = document.getElementById("hamburgerbackground");
  const buttons = document.getElementById('hamburgermenu').querySelectorAll('button');

  if (!menu || !buttons.length) return;

  if (menu.style.display === 'none' || menu.style.display === '') {
      menu.style.display = 'block';
      ignoreClose = true; // Prevent immediate close

      setTimeout(() => {
          ignoreClose = false; // Allow closing after opening animation
          document.getElementById('iframeOverlay').addEventListener('click', closeOnClickOutside);
      }, 50);

      buttons.forEach(button => button.addEventListener('click', closeHamburgerMenu));
  } else {
      closeHamburgerMenu();
  }
}

function closeHamburgerMenu() {
  const menu = document.getElementById("hamburgerbackground");
  if (menu) {
      menu.style.display = 'none';
      document.removeEventListener('click', closeOnClickOutside);
  }
}

function closeOnClickOutside(event) {
  console.log("hello");
  const menu = document.getElementById("hamburgermenu");

  if (ignoreClose) return;

  // `offsetParent !== null` is a reliable check for visibility
  if (menu && menu.offsetParent !== null && !menu.contains(event.target)) {
      closeHamburgerMenu();
  }
}

window.onload = () => runService();

const suggestionsList = document.getElementById('suggestions');
document.getElementById("searchBar").addEventListener("focus", () => {
  document.getElementById("searchBar").select();
  if (!(document.getElementById("searchBar").value.trim() === "")) {
    document.getElementById('suggestionsBackground').style.height = document.getElementById('suggestions').offsetHeight + 'px';
    suggestionsList.style.display = 'block';
    document.getElementById('suggestionsBackground').style.display = 'block';
    searchBar.style.borderBottomLeftRadius = "0px";
    searchBar.style.borderBottomRightRadius = "0px";
    document.getElementById("searchbarbackground").style.borderBottomRightRadius = "0px";
    document.getElementById("searchbarbackground").style.borderBottomLeftRadius = "0px";
    const script = document.createElement('script');
    script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${document.getElementById("searchBar").value.trim()}&callback=handleSuggestions`;
    document.body.appendChild(script);
    setTimeout(() => script.remove(), 1000);
  }
});

document.getElementById("searchBar").addEventListener("blur", () => {
  setTimeout(() => {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    document.getElementById('suggestionsBackground').style.display = 'none';
    searchBar.style.borderBottomLeftRadius = "3px";
    searchBar.style.borderBottomRightRadius = "3px";
    document.getElementById("searchbarbackground").style.borderBottomRightRadius = "3px";
    document.getElementById("searchbarbackground").style.borderBottomLeftRadius = "3px";
  }, 200);
});

searchBar.addEventListener('input', () => {
  const query = document.getElementById("searchBar").value.trim();
  if (query == '') {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = "none";
    document.getElementById('suggestionsBackground').style.display = 'none';
    searchBar.style.borderBottomLeftRadius = "3px";
    searchBar.style.borderBottomRightRadius = "3px";
    document.getElementById("searchbarbackground").style.borderBottomRightRadius = "3px";
    document.getElementById("searchbarbackground").style.borderBottomLeftRadius = "3px";
    return;
  } else {
    document.getElementById('suggestionsBackground').style.height = document.getElementById('suggestions').offsetHeight + 'px';
    suggestionsList.style.display = 'block';
    document.getElementById('suggestionsBackground').style.display = 'block';
    searchBar.style.borderBottomLeftRadius = "0px";
    searchBar.style.borderBottomRightRadius = "0px";
    document.getElementById("searchbarbackground").style.borderBottomRightRadius = "0px";
    document.getElementById("searchbarbackground").style.borderBottomLeftRadius = "0px";
  }
  const script = document.createElement('script');
  script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${query}&callback=handleSuggestions`;
  document.body.appendChild(script);
  setTimeout(() => script.remove(), 1000);
});

function handleSuggestions(data) {
  const suggestions = data[1];
  showSuggestions(suggestions);
}

function showSuggestions(suggestions) {
  let html = '';
  suggestions.forEach(suggestion => html += `<div>${suggestion}</div>`);
  suggestionsList.innerHTML = html;
}

suggestionsList.addEventListener('click', (event) => {
  if (event.target.tagName.toUpperCase() === 'DIV') {
    runService(event.target.textContent);
    suggestionsList.innerHTML = '';
  }
});

function openSettings() {
	addTab();
  runService('helium://settings');
}

function openGPT() {
  runService('helium://gpt')
}

setTimeout(() => {
  try {
    inFrame = window !== top;
  } catch (e) {
    inFrame = true;
  }

  if (!inFrame && localStorage.getItem("autolaunch") === 'on' && !navigator.userAgent.includes('Firefox')) {
    const popup = open('about:blank', '_blank');
    if (!popup || popup.closed) {
      alert('Please allow popups and redirects.');
    } else {
      const doc = popup.document;
      const iframe = doc.createElement('iframe');
      const style = iframe.style;
      const link = doc.createElement('link');

      const name = localStorage.getItem('title') || 'My Drive - Google Drive';
      const icon = localStorage.getItem('favicon') || 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png';

      doc.title = name;
      link.rel = 'icon';
      link.href = icon;

      iframe.src = location.href;
      style.position = 'fixed';
      style.top = style.bottom = style.left = style.right = 0;
      style.border = style.outline = 'none';
      style.width = style.height = '100%';

      doc.head.appendChild(link);
      doc.body.appendChild(iframe);
      location.replace('https://canvas.com/');

      const script = doc.createElement('script');
      script.textContent = `
        window.onbeforeunload = function (event) {
          const confirmationMessage = 'Do you really want to exit Helium?';
          (event || window.event).returnValue = confirmationMessage;
          return confirmationMessage;
        };
      `;
      doc.head.appendChild(script);
    }
  }
}, 200);

if (window.innerWidth <= 600) notification("Some features may not work on smaller screen sizes.", "#db8cff");

setTimeout(console.log.bind(console, "%cHelium", "background: #6C3BAA;color:#FFF;padding:5px;border-radius: 5px;line-height: 26px; font-size:25px;"));
setTimeout(console.log.bind(console, "%cIf you are seeing this, the main script system has loaded.", "background: #6C3BAA;color:#FFF;padding:5px;border-radius: 5px;line-height: 20px; font-size:18px;"));
setTimeout(console.log.bind(console, "%cIf you encounter an error, contact Paxton.", "background: #6C3BAA;color:#FFF;padding:5px;border-radius: 5px;line-height: 20px; font-size:13px;"));

const online = navigator.onLine;
const userAgent = navigator.userAgent;
let browserName;
const diagnosticDomain = window.location.href;

if (userAgent.match(/chrome|chromium|crios/i)) {
  browserName = "Chrome";
} else if (userAgent.match(/firefox|fxios/i)) {
  browserName = "Firefox";
} else if (userAgent.match(/safari/i)) {
  browserName = "Safari";
} else if (userAgent.match(/opr\//i)) {
  browserName = "Opera";
} else if (userAgent.match(/edg/i)) {
  browserName = "Edge";
} else {
  browserName = "Browser not detected!";
}

let quoteText = [
  'Loading...'
]

document.getElementById("quote").innerText = quoteText[Math.floor(Math.random() * quoteText.length)];

setTimeout(console.log.bind(console, `%cInformation:\nOnline: ${online}\nURL: ${diagnosticDomain}\nBrowser: ${browserName}\nUA: ${userAgent}`, "background: grey;color:white;padding:5px;line-height: 15px; border-radius: 5px;font-size:12px;"));


document.addEventListener("DOMContentLoaded", function () {
  function applyIframeFix(iframe) {
      if (!iframe) return;

      iframe.addEventListener("load", function () {
          try {
              const iframeWindow = iframe.contentWindow;
              const iframeDoc = iframe.contentDocument || (iframeWindow ? iframeWindow.document : null);

              if (!iframeWindow || !iframeDoc) return;

              iframeDoc.querySelectorAll("a[target='_blank'], a[target='_top']").forEach(link => {
                  link.addEventListener("click", function (event) {
                      event.preventDefault();
                      addTab();
                      runService(link.href);
                  });
              });

              iframeWindow.open = function (url) {
                  console.log(`Intercepted window.open: ${url}`);
                  addTab();
                  runService(url);
                  return { focus() {}, close() {} }; 
              };

          } catch (error) {
              alert("Cross-origin iframe detected. Cannot modify its content.");
          }
      });
  }

  document.querySelectorAll("iframe").forEach(applyIframeFix);

  new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
              if (node.tagName === "IFRAME") applyIframeFix(node);
          });
      });
  }).observe(document.body, { childList: true, subtree: true });
});



