const SITE_CONFIG = {
    personal: {
        name: "Robert Lahmann",
        street: "Pfaffstraße 18",
        city: "76227 Karlsruhe",
        country: "Germany",
        email: "tindiequantumworkshop@gmail.com",
        // Fill in once available. Imprint blocks below auto-hide if a value is empty.
        vat: "",        // USt-IdNr (format: "DE123456789"). Required since user is no longer Kleinunternehmer.
        phone: ""       // E.164 or DE-domestic. Second contact channel for §5 TMG.
    },
    company: {
        name: "The Quantum Workshop",
        year: new Date().getFullYear()
    },
    pricing: {
        quantego: {
            systemOne: "20 EUR *",
            systemTwo: "25 EUR *",
            highEnd: "450 EUR *"
        },
        rasqberry: {
            modelOnly: "80 EUR *",
            premium: "450 EUR *"
        }
    }
};

// Central auto-injection script
document.addEventListener('DOMContentLoaded', () => {
    // Helper to replace text content
    const setText = (selector, text) => {
        document.querySelectorAll(selector).forEach(el => el.textContent = text);
    };

    // Helper to replace HTML content (needed for line breaks in address)
    const setHtml = (selector, html) => {
        document.querySelectorAll(selector).forEach(el => el.innerHTML = html);
    };

    // Helper to replace link destinations (href)
    const setHref = (selector, href) => {
        document.querySelectorAll(selector).forEach(el => el.href = href);
    };

    // 1. Inject Copyright/Company info
    setText('.config-company', SITE_CONFIG.company.name);
    setText('.config-year', SITE_CONFIG.company.year);

    // 2. Inject Emails everywhere
    setText('.config-email', SITE_CONFIG.personal.email);

    // 2a. Conditional imprint fields. Each block has class="config-only-if-X"; hide if value empty,
    // otherwise fill the inner .config-X element. Keeps the imprint legally accurate as fields land.
    const conditional = (key, valueSelector = `.config-${key}`) => {
        const value = SITE_CONFIG.personal[key];
        document.querySelectorAll(`.config-only-if-${key}`).forEach(block => {
            if (!value) { block.hidden = true; return; }
            block.hidden = false;
            block.querySelectorAll(valueSelector).forEach(el => el.textContent = value);
        });
    };
    conditional('vat');
    conditional('phone');
    // Phone link: tel: href
    if (SITE_CONFIG.personal.phone) {
        document.querySelectorAll('.config-phone-link').forEach(a => {
            a.href = `tel:${SITE_CONFIG.personal.phone.replace(/[^+\d]/g, '')}`;
        });
    }

    // 3. Inject Full Address into Imprint
    setHtml('.config-address', `
        ${SITE_CONFIG.personal.name}<br>
        ${SITE_CONFIG.personal.street}<br>
        ${SITE_CONFIG.personal.city}<br>
        ${SITE_CONFIG.personal.country}
    `);

    // 4. Construct Order Payload Mailto
    const emailSubject = encodeURIComponent("Order Request & Pricing Inquiry | The Quantum Workshop");

    // Using string template for the pre-filled email body
    const emailBody = encodeURIComponent(
        `Hello,

I would like to request an order or inquire about pricing for the following items. My requested quantities are filled out below:

--- QUANTEGO MODELS ---
System One (49-piece) (${SITE_CONFIG.pricing.quantego.systemOne}): [   ] 
System Two (98-piece) (${SITE_CONFIG.pricing.quantego.systemTwo}): [   ]
System Two High-End (1024-piece) (${SITE_CONFIG.pricing.quantego.highEnd}): [   ]

--- RASQBERRY MODELS ---
3D Model Case Only (${SITE_CONFIG.pricing.rasqberry.modelOnly}): [   ]
Premium with Electronics (${SITE_CONFIG.pricing.rasqberry.premium}): [   ]

* VAT not included

Additional Notes (Shipping Destination, Event Deadlines, etc.):

`
    );

    const mailtoHref = `mailto:${SITE_CONFIG.personal.email}?subject=${emailSubject}&body=${emailBody}`;
    setHref('.config-email-link', mailtoHref);

    // 5. Copy-email affordance for webmail users (mailto: only works with a configured mail client).
    document.querySelectorAll('[data-copy-email]').forEach(btn => {
        const original = btn.textContent;
        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(SITE_CONFIG.personal.email);
                btn.textContent = 'Copied';
            } catch {
                // Fallback for older browsers or insecure contexts: select the address.
                const target = btn.closest('[data-email-target]')?.querySelector('.config-email');
                if (target) {
                    const range = document.createRange();
                    range.selectNodeContents(target);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    btn.textContent = 'Select-copy now';
                }
            }
            setTimeout(() => { btn.textContent = original; }, 1800);
        });
    });

});
