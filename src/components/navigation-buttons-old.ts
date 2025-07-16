const template = document.createElement('template');

template.innerHTML = `
    <style>
        .pagination {
            display: flex;
            justify-content: center;
            gap: 4px;
            flex-wrap: wrap;
        }
        .button {
            padding: 8px 16px;
            cursor: pointer;
        }
        .button[disabled] {
            opacity: 0.5;
            cursor: default;
        }
    </style>
    <div class="pagination">
        <button id="prev">Previous</button>
        <button id="next">Next</button>
    </div>
`;

class NavigationButtons extends HTMLElement {
    private shadow!: ShadowRoot;
    private prevBtn: Element | null;
    private nextBtn: Element | null;

    private prevClickHandler = () => {
        this.dispatchEvent(new CustomEvent('page-change', {
            detail: { direction: 'prev' },
            bubbles: true,
            composed: true,
        }));
    };

    private nextClickHandler = () => {
        this.dispatchEvent(new CustomEvent('page-change', {
            detail: { direction: 'next' },
            bubbles: true,
            composed: true,
        }));
    };

    static get observedAttributes() {
        return ['current-page'];
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.appendChild(template.content.cloneNode(true));

        this.prevBtn = this.shadow.querySelector('#prev');
        this.nextBtn = this.shadow.querySelector('#next');

        this.prevBtn?.addEventListener('click', this.prevClickHandler);
        this.nextBtn?.addEventListener('click', this.nextClickHandler);
    }

    attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null) {
        if (name === "current-page") {
            const page = parseInt(newVal ?? '1', 10);
            (this.prevBtn as HTMLButtonElement).disabled = page <= 1;
        }
    }

    disconnectedCallback() {
        this.prevBtn?.removeEventListener('click', this.prevClickHandler);
        this.nextBtn?.removeEventListener('click', this.nextClickHandler);
    }
}

customElements.define('nav-buttons', NavigationButtons);