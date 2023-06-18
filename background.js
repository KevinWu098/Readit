chrome.browserAction.onClicked.addListener(function(tab) {
  checkRedditSubreddit(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    checkRedditSubreddit(tab);
  }
});

function checkRedditSubreddit(tab) {
  var currentUrl = tab.url;
  
  // Check if the current page is a Reddit subreddit and if it's set to private
  if (currentUrl.includes('reddit.com') && currentUrl.startsWith('https://www.reddit.com/r/')) {
    var subredditName = currentUrl.split('/')[4];
  
    chrome.tabs.executeScript(tab.id, { file: 'content.js' }, function(result) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
  
      var privateSubreddit = result[0];
  
      if (privateSubreddit) {
        console.log('This subreddit is set to private.');
        checkWaybackUrl(currentUrl);
      } else {
        console.log('This subreddit is not private.');
      }
    });
  } else {
    console.log('This is not a Reddit subreddit page.');
  }
}

function checkWaybackUrl(url) {
  var apiUrl = 'https://archive.org/wayback/available?url=' + encodeURIComponent(url);
  
  fetch(apiUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if ('archived_snapshots' in data && 'closest' in data.archived_snapshots) {
        var waybackLink = data.archived_snapshots.closest.url;
        chrome.tabs.create({ url: waybackLink });
      } else {
        alert('URL not found in the Wayback Machine.');
      }
    })
    .catch(function(error) {
      alert('Error: Unable to connect to the Wayback Machine API.');
      console.error(error);
    });
}