const ELLIPSIS = -1;

const generatePagination = (currentPage: number, totalPages: number) => {
    const maxBtnNumbersCount = 6;

    if (maxBtnNumbersCount >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftPageNumber = Math.max(currentPage - 1, 1);
    const rightPageNumber = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftEllipsis = leftPageNumber > 2;
    const shouldShowRightEllipsis = rightPageNumber < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        return [1, 2, 3, 4, 5, ELLIPSIS, totalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
        const rightItemCount = maxBtnNumbersCount - 1;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        
        return [firstPageIndex, ELLIPSIS, ...rightRange];
    }

    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        const middleRange = [leftPageNumber, currentPage, rightPageNumber];

        return [firstPageIndex, ELLIPSIS, ...middleRange, ELLIPSIS, lastPageIndex];
    }

    return [];
}

const navTemplate = document.createElement('template');
navTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
        }
        button, .ellipsis {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            font-weight: 500;
            font-size: 0.875rem;
            min-width: 2.5rem;
            height: 2.5rem;
            padding: 0 0.5rem;
            border: 1px solid #d1d5db;
            background-color: #ffffff;
            color: #374151;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        button:hover:not(:disabled) {
            background-color: #f3f4f6;
            border-color: #9ca3af;
        }
        button:disabled {
            color: #9ca3af;
            background-color: #f9fafb;
            cursor: not-allowed;
        }
        button.active {
            background-color: #3b82f6;
            color: #ffffff;
            border-color: #3b82f6;
        }
        .ellipsis {
            border: none;
            background: none;
            cursor: default;
            letter-spacing: 0.1em;
        }
        .arrow {
            width: 1.25rem;
            height: 1.25rem;
        }
    </style>
    <nav class="pagination-container">
        <button id="prev-button" data-page="previous" aria-label="Go to previous page">
            <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
        
        <!-- Page numbers -->
        <span id="page-buttons-container"></span>

        <button id="next-button" data-page="next" aria-label="Go to next page">
            <svg class="arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
        </button>
    </nav>
`;

class NavigationButtons extends HTMLElement {
    private currentPage = 1;
    private totalPages = 1;

    private shadow!: ShadowRoot;
    private pageButtonsContainer: HTMLElement | null;
    private prevButton: HTMLButtonElement | null;
    private nextButton: HTMLButtonElement | null;

    static readonly observedAttributes = ['current-page', 'total-pages'];

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: 'open' });

        this.shadow!.appendChild(navTemplate.content.cloneNode(true));

        this.pageButtonsContainer = this.shadow!.querySelector('#page-buttons-container')!;
        this.prevButton = this.shadow!.querySelector('#prev-button')!;
        this.nextButton = this.shadow!.querySelector('#next-button')!;
    }

    connectedCallback(): void {
        this.shadow.addEventListener('click', this.handlePageClick);
        this.updateInputAttributes();
        this.render();
    };

    disconnectedCallback(): void {
        this.shadow.removeEventListener('click', this.handlePageClick);
    }

    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) return;
        this.updateInputAttributes();
        this.render();
    }

    private updateInputAttributes(): void {
        this.currentPage = parseInt(this.getAttribute('current-page') ?? '1', 10);
        this.totalPages = parseInt(this.getAttribute('total-pages') ?? '1', 10);
    }

    private handlePageClick = (event: Event) => {
        const target = (event.target as HTMLElement).closest('button');

        if (!target || target.disabled) {
            return;
        }

        const pageToGo = target.dataset.page;
        if (!pageToGo) return;

        let newPage: number;

        if (pageToGo === 'previous') {
            newPage = this.currentPage - 1;
        } else if (pageToGo === 'next') {
            newPage = this.currentPage + 1;
        } else {
            newPage = parseInt(pageToGo, 10);
        }

        if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
            this.dispatchEvent(new CustomEvent('page-change', {
                detail: { page: newPage },
                bubbles: true,
                composed: true
            }));
        }
    };

    private render = () => {
        this.prevButton!.disabled = this.currentPage === 1;
        this.nextButton!.disabled = this.currentPage >= this.totalPages;

        const paginationItems = generatePagination(this.currentPage, this.totalPages);

        this.pageButtonsContainer!.innerHTML = '';

        const fragment = document.createDocumentFragment();

        paginationItems.forEach((item) => {
            if (item === ELLIPSIS) {
                const span = document.createElement('span');
                span.className = 'ellipsis';
                span.textContent = '...';

                fragment.appendChild(span);
            }
            else {
                const button = document.createElement('button');
                button.dataset.page = String(item);
                button.textContent = String(item);

                if (item === this.currentPage) {
                    button.className = 'active';
                }

                fragment.appendChild(button);
            }
        });

        this.pageButtonsContainer!.appendChild(fragment);
    };
}

customElements.define('nav-buttons', NavigationButtons);