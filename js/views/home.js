import { h, mount } from '../lib/h.js';

export function renderHome() {
    const content = h('div', { class: 'page-content' }, [
        h('h1', {}, 'Welcome to Your App'),
        h('p', {}, 'This is the home page of your no-framework application.'),
        h('div', { class: 'card' }, [
            h('h2', {}, 'Getting Started'),
            h('p', {}, 'Edit this file to customize your home page.'),
            h('ul', {}, [
                h('li', {}, 'Add new routes in app.js'),
                h('li', {}, 'Create new views in the views/ folder'),
                h('li', {}, 'Use the h() function to create DOM elements'),
                h('li', {}, 'Style your app with CSS variables')
            ])
        ]),
        h('button', { 
            class: 'btn btn-primary',
            onclick: () => alert('Hello from your no-framework app!')
        }, 'Click Me!')
    ]);

    mount(document.getElementById('main-content'), content);
}