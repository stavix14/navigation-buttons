const template = document.createElement('template');

template.innerHTML = `
    <style>
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        .button {
            padding: 8px 16px;
            cursor: pointer;
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

    static get observedAttributes() {
        return ['current-page'];
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.appendChild(template.content.cloneNode(true));

        this.prevBtn = this.shadow.querySelector('#prev');
        this.nextBtn = this.shadow.querySelector('#next');

        this.prevBtn?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('page-change', {
                detail: { direction: 'prev' },
                bubbles: true,
                composed: true,
            }));
        });

        this.nextBtn?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('page-change', {
                detail: { direction: 'next' },
                bubbles: true,
                composed: true,
            }));
        });
    }

    attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null) {
        if (name === "current-page") {
            const page = isNaN(Number(newVal)) ? 1 : Number(newVal);
            (this.prevBtn as HTMLButtonElement).disabled = page <= 1;
        }
    }
}

customElements.define('nav-buttons', NavigationButtons);