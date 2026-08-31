const customForm = document.querySelector('.js-custom-form');
const totalOutput = document.querySelector('#custom-total');
const priceNode = document.querySelector('[data-base-price]');

function parsePrice(value) {
    return Number(String(value || '0').replace(',', '.'));
}

function formatPrice(value) {
    return value.toFixed(2).replace('.', ',');
}

if (customForm && totalOutput && priceNode) {
    const updateTotal = () => {
        let total = parsePrice(priceNode.dataset.basePrice);
        customForm.querySelectorAll('input:checked').forEach((input) => {
            total += parsePrice(input.dataset.price);
        });
        totalOutput.textContent = formatPrice(total);
    };

    customForm.addEventListener('change', updateTotal);
    updateTotal();
}
