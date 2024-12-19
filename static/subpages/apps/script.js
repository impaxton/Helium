const root = document.documentElement;
if (localStorage.getItem('theme')) root.style.setProperty('--background-color', localStorage.getItem('theme'));

let apps = [];

function createAppPanel(app) {
    const appPanel = document.createElement('div');
    appPanel.className = 'app-panel';
    appPanel.style.backgroundImage = `url(${app.image})`;

    const titleContainer = document.createElement('div');
    titleContainer.className = 'app-title-container';

    const appTitle = document.createElement('div');
    appTitle.className = 'app-title';
    appTitle.textContent = app.name;

    titleContainer.appendChild(appTitle);
    appPanel.appendChild(titleContainer);

    appPanel.onclick = () => {
        parent.runService(app.url);;
    };

    return appPanel;
}

function loadApps(category) {
    const appPanelContainer = document.getElementById('app-panel-container');
    appPanelContainer.innerHTML = '';
    const filteredApps = category === 'All' 
        ? apps 
        : apps.filter(app => app.category.includes(category) || (app.category.length === 0 && category === 'Other'));
    filteredApps.forEach(app => {
        const appPanel = createAppPanel(app);
        appPanelContainer.appendChild(appPanel);
    });
}

function createCategoryList() {
    const categories = new Set(['All', ...apps.flatMap(app => app.category || 'Other')]);
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category === '' ? 'Other' : category;
        
        if (category === 'All') {
            li.classList.add('selected-category');
        }

        li.onclick = () => {
            document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('selected-category'));
            li.classList.add('selected-category');
            loadApps(category === '' ? 'Other' : category);
        };
        categoryList.appendChild(li);
    });
}

async function initializeApp() {
    try {
        const response = await fetch('./apps.json');
        apps = await response.json();
        createCategoryList();
        loadApps('All');
    } catch (error) {
        console.error('Failed to load apps:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
