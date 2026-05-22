document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initEventListeners();
});

const STORAGE_KEYS = {
  keywords: 'preferredKeywords',
  authors: 'preferredAuthors'
};

function initSettings() {
  loadKeywordPreferences();
  loadAuthorPreferences();
}

function readStoredList(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch (error) {
    console.error(`Failed to parse ${key}:`, error);
    return [];
  }
}

function loadKeywordPreferences() {
  const container = document.getElementById('selectedKeywords');
  container.innerHTML = '';

  const keywords = readStoredList(STORAGE_KEYS.keywords);
  if (keywords.length === 0) {
    showEmptyTagMessage();
    return;
  }

  keywords.forEach(keyword => addKeywordTag(keyword, false));
}

function loadAuthorPreferences() {
  const container = document.getElementById('selectedAuthors');
  container.innerHTML = '';

  const authors = readStoredList(STORAGE_KEYS.authors);
  if (authors.length === 0) {
    showEmptyAuthorMessage();
    return;
  }

  authors.forEach(author => addAuthorTag(author, false));
}

function showEmptyTagMessage() {
  const container = document.getElementById('selectedKeywords');
  if (document.getElementById('emptyTagMessage')) return;

  const emptyMessage = document.createElement('div');
  emptyMessage.id = 'emptyTagMessage';
  emptyMessage.className = 'empty-tag-message';
  emptyMessage.textContent = 'No keywords added yet. Add some keywords below.';
  container.appendChild(emptyMessage);
}

function showEmptyAuthorMessage() {
  const container = document.getElementById('selectedAuthors');
  if (document.getElementById('emptyAuthorMessage')) return;

  const emptyMessage = document.createElement('div');
  emptyMessage.id = 'emptyAuthorMessage';
  emptyMessage.className = 'empty-tag-message';
  emptyMessage.textContent = 'No authors added yet. Add some authors below.';
  container.appendChild(emptyMessage);
}

function hideEmptyTagMessage() {
  document.getElementById('emptyTagMessage')?.remove();
}

function hideEmptyAuthorMessage() {
  document.getElementById('emptyAuthorMessage')?.remove();
}

function getSelectedTagValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  return Array.from(container.querySelectorAll('.category-button'))
    .map(tag => (tag.dataset.value || tag.textContent.replace(/x$/i, '')).trim())
    .filter(Boolean);
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.keywords, JSON.stringify(getSelectedTagValues('selectedKeywords')));
  localStorage.setItem(STORAGE_KEYS.authors, JSON.stringify(getSelectedTagValues('selectedAuthors')));
}

function flashExistingTag(tag) {
  tag.classList.add('tag-highlight');
  setTimeout(() => tag.classList.remove('tag-highlight'), 1000);
}

function createTag(label, onRemove) {
  const tagElement = document.createElement('span');
  tagElement.className = 'category-button tag-appear';
  tagElement.dataset.value = label;
  tagElement.append(document.createTextNode(`${label} `));

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-tag';
  removeButton.type = 'button';
  removeButton.textContent = 'x';
  tagElement.appendChild(removeButton);

  removeButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    tagElement.classList.add('tag-disappear');

    setTimeout(() => {
      tagElement.remove();
      onRemove();
      persistSettings();
    }, 300);
  });

  setTimeout(() => tagElement.classList.remove('tag-appear'), 300);
  return tagElement;
}

function addKeywordTag(keyword, shouldPersist = true) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return;

  const container = document.getElementById('selectedKeywords');
  hideEmptyTagMessage();

  const existingTag = Array.from(container.querySelectorAll('.category-button'))
    .find(tag => (tag.dataset.value || '').toLowerCase() === normalizedKeyword.toLowerCase());

  if (existingTag) {
    flashExistingTag(existingTag);
    return;
  }

  const tagElement = createTag(normalizedKeyword, () => {
    if (container.querySelectorAll('.category-button').length === 0) {
      showEmptyTagMessage();
    }
  });

  container.appendChild(tagElement);
  if (shouldPersist) persistSettings();
}

function addAuthorTag(author, shouldPersist = true) {
  const normalizedAuthor = author.trim();
  if (!normalizedAuthor) return;

  const container = document.getElementById('selectedAuthors');
  hideEmptyAuthorMessage();

  const existingTag = Array.from(container.querySelectorAll('.category-button'))
    .find(tag => (tag.dataset.value || '').toLowerCase() === normalizedAuthor.toLowerCase());

  if (existingTag) {
    flashExistingTag(existingTag);
    return;
  }

  const tagElement = createTag(normalizedAuthor, () => {
    if (container.querySelectorAll('.category-button').length === 0) {
      showEmptyAuthorMessage();
    }
  });

  container.appendChild(tagElement);
  if (shouldPersist) persistSettings();
}

function addCommaSeparatedValues(inputId, addTag) {
  const input = document.getElementById(inputId);
  const value = input.value.trim();
  if (!value) return;

  value.split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(addTag);

  input.value = '';
}

function initEventListeners() {
  document.getElementById('addKeyword').addEventListener('click', () => {
    addCommaSeparatedValues('keywordInput', addKeywordTag);
  });

  document.getElementById('keywordInput').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCommaSeparatedValues('keywordInput', addKeywordTag);
    }
  });

  document.getElementById('addAuthor').addEventListener('click', () => {
    addCommaSeparatedValues('authorInput', addAuthorTag);
  });

  document.getElementById('authorInput').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCommaSeparatedValues('authorInput', addAuthorTag);
    }
  });

  document.getElementById('copyKeywords').addEventListener('click', copyKeywords);
  document.getElementById('copyAuthors').addEventListener('click', copyAuthors);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
}

function copyKeywords() {
  const keywords = getSelectedTagValues('selectedKeywords');
  if (keywords.length === 0) {
    showNotification('No keywords to copy!', 'info');
    return;
  }

  copyToClipboard(keywords.join(','), 'Keywords copied to clipboard!');
}

function copyAuthors() {
  const authors = getSelectedTagValues('selectedAuthors');
  if (authors.length === 0) {
    showNotification('No authors to copy!', 'info');
    return;
  }

  copyToClipboard(authors.join(','), 'Authors copied to clipboard!');
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showNotification(successMessage, 'success'))
      .catch(error => {
        console.error('Failed to copy:', error);
        fallbackCopyText(text, successMessage);
      });
    return;
  }

  fallbackCopyText(text, successMessage);
}

function fallbackCopyText(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
    showNotification(successMessage, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotification('Failed to copy to clipboard', 'info');
  }

  textArea.remove();
}

function saveSettings() {
  persistSettings();
  showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
  localStorage.removeItem(STORAGE_KEYS.keywords);
  localStorage.removeItem(STORAGE_KEYS.authors);

  const selectedKeywordsContainer = document.getElementById('selectedKeywords');
  selectedKeywordsContainer.innerHTML = '';

  const selectedAuthorsContainer = document.getElementById('selectedAuthors');
  selectedAuthorsContainer.innerHTML = '';

  showEmptyTagMessage();
  showEmptyAuthorMessage();
  showNotification('Settings reset to default!', 'info');
}

function showNotification(message, type = 'success') {
  let notification = document.querySelector('.settings-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'settings-notification';
    document.body.appendChild(notification);
  }

  let icon = '';
  let bgColor = 'var(--primary-color)';

  if (type === 'success') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>';
  } else if (type === 'info') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z" fill="currentColor"/></svg>';
    bgColor = '#2563eb';
  }

  notification.innerHTML = `${icon}<span>${message}</span>`;
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '8px';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = bgColor;
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = 'var(--radius-sm)';
  notification.style.boxShadow = 'var(--shadow-md)';
  notification.style.zIndex = '1000';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(20px)';
  notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/YeTianwei/daily-arXiv');
    const data = await response.json();
    document.getElementById('starCount').textContent = data.stargazers_count;
    document.getElementById('forkCount').textContent = data.forks_count;
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    document.getElementById('starCount').textContent = '?';
    document.getElementById('forkCount').textContent = '?';
  }
}
